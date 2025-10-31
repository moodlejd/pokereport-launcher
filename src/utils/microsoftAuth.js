/**
 * Sistema de Autenticación Microsoft OAuth 2.0 para Minecraft
 * Usando MSAL Browser + Electron integration
 */

import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

// Sin Electron, usar directo
const MICROSOFT_OAUTH_BASE = 'https://login.microsoftonline.com/consumers/oauth2/v2.0';

// Configuración de Azure AD
// IMPORTANTE: Necesitas registrar tu app en https://portal.azure.com
const MSAL_CONFIG = {
  auth: {
    clientId: '15d53ab4-cfad-4757-88a2-904139d4ca9d', // Client ID de Azure
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin // Dinámico según donde corre
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

// Scopes para autenticación
// XboxLive.signin a veces no está disponible, así que usamos scopes alternativos
const SCOPES = [
  'XboxLive.signin',
  'offline_access'
].filter(Boolean);

class MicrosoftAuthService {
  constructor() {
    this.msalInstance = new PublicClientApplication(MSAL_CONFIG);
    this.initialized = false;
  }

  /**
   * Inicializar MSAL
   */
  async initialize() {
    if (!this.initialized) {
      await this.msalInstance.initialize();
      this.initialized = true;
      console.log('✅ MSAL inicializado');
    }
  }

  /**
   * Login con Microsoft - Device Code Flow manual (sin MSAL)
   */
  async loginWithRedirect(onCodeReceived) {
    try {
      console.log('🔐 Iniciando Microsoft Login...');

      // Usar Device Code Flow directo (funciona en navegador y Electron)
      return await this.loginWithDeviceCodeDirect(onCodeReceived);

    } catch (error) {
      console.error('❌ Error en Microsoft OAuth:', error);
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  }

  /**
   * Device Code Flow directo (sin MSAL, sin Electron)
   * Funciona en cualquier navegador
   */
  async loginWithDeviceCodeDirect(onCodeReceived) {
    try {
      console.log('🔐 Iniciando Device Code Flow...');

      // 1. Obtener código de dispositivo (usando proxy en desarrollo)
      const deviceCodeUrl = `${MICROSOFT_OAUTH_BASE}/devicecode`;
      
      const params = new URLSearchParams({
        client_id: MSAL_CONFIG.auth.clientId,
        scope: SCOPES.join(' ')
      });

      console.log('📡 Solicitando código a Microsoft...');

      const codeResponse = await fetch(deviceCodeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const codeData = await codeResponse.json();
      
      if (!codeData || codeData.error) {
        throw new Error(codeData.error_description || 'No se pudo obtener código');
      }

      console.log('✅ Código obtenido:', codeData.user_code);
      console.log('🌐 URL:', codeData.verification_uri);

      // 2. Mostrar código al usuario
      if (onCodeReceived) {
        onCodeReceived({
          userCode: codeData.user_code,
          verificationUri: codeData.verification_uri,
          verificationUriComplete: codeData.verification_uri_complete,
          message: codeData.message,
          expiresIn: codeData.expires_in
        });
      }

      // 3. Polling para obtener el token (usando proxy en desarrollo)
      const tokenUrl = `${MICROSOFT_OAUTH_BASE}/token`;
      const pollInterval = (codeData.interval || 5) * 1000; // ms
      const expiresAt = Date.now() + (codeData.expires_in * 1000);

      console.log('⏳ Esperando autorización del usuario...');

      while (Date.now() < expiresAt) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        const tokenParams = new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          client_id: MSAL_CONFIG.auth.clientId,
          device_code: codeData.device_code
        });

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: tokenParams.toString()
        });

        const tokenResult = await tokenResponse.json();

        // Token obtenido
        if (tokenResult.access_token) {
          console.log('✅ Access token obtenido');
          return await this.authenticateMinecraft({ accessToken: tokenResult.access_token });
        }

        // Error (que no sea "esperando")
        if (tokenResult.error && tokenResult.error !== 'authorization_pending') {
          throw new Error(tokenResult.error_description || tokenResult.error);
        }

        // Aún esperando
        console.log('⏳ Polling... (esperando autorización)');
      }

      throw new Error('Timeout: El código expiró sin ser autorizado');

    } catch (error) {
      console.error('❌ Error en Device Code Flow:', error);
      throw error;
    }
  }

  /**
   * Device Code Flow usando el proxy de Electron
   */
  async loginWithDeviceCodeElectron(onCodeReceived) {
    try {
      console.log('🔐 Iniciando Device Code Flow via Electron...');

      // Obtener código de dispositivo (POST request)
      const deviceCodeUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode`;
      
      const params = new URLSearchParams({
        client_id: MSAL_CONFIG.auth.clientId,
        scope: SCOPES.join(' ')
      });

      // Hacer POST request
      const codeResponse = await fetch(deviceCodeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const codeResult = await codeResponse.json();
      
      if (!codeResult || codeResult.error) {
        throw new Error(codeResult.error_description || 'No se pudo obtener código');
      }

      const codeData = codeResult;
      console.log('📋 Código de dispositivo:', codeData.user_code);

      // Mostrar código al usuario
      if (onCodeReceived) {
        onCodeReceived({
          userCode: codeData.user_code,
          verificationUri: codeData.verification_uri,
          message: codeData.message,
          expiresIn: codeData.expires_in
        });
      }

      // Polling para esperar la autorización
      const tokenUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/token`;
      const pollInterval = codeData.interval || 5;
      const expiresAt = Date.now() + (codeData.expires_in * 1000);

      while (Date.now() < expiresAt) {
        await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));

        const tokenParams = new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          client_id: MSAL_CONFIG.auth.clientId,
          device_code: codeData.device_code
        });

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: tokenParams.toString()
        });

        const tokenResult = await tokenResponse.json();

        if (tokenResult.access_token) {
          console.log('✅ Token obtenido');
          return await this.authenticateMinecraft({ accessToken: tokenResult.access_token });
        }

        // Si hay error pero no es "authorization_pending", lanzar
        if (tokenResult.error && tokenResult.error !== 'authorization_pending') {
          throw new Error(tokenResult.error_description || tokenResult.error);
        }

        console.log('⏳ Esperando autorización...');
      }

      throw new Error('Timeout: El código expiró');

    } catch (error) {
      console.error('❌ Error en Device Code Flow:', error);
      throw error;
    }
  }

  /**
   * Login con Microsoft usando Popup
   * (Más visual pero puede bloquearse)
   */
  async loginWithPopup() {
    await this.initialize();

    try {
      console.log('🔐 Iniciando Popup Login...');

      const loginRequest = {
        scopes: SCOPES,
        prompt: 'select_account'
      };

      const response = await this.msalInstance.loginPopup(loginRequest);
      
      console.log('✅ Autenticación Microsoft exitosa');
      console.log('👤 Usuario:', response.account.username);

      return await this.authenticateMinecraft(response);

    } catch (error) {
      console.error('❌ Error en Microsoft OAuth:', error);
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  }

  /**
   * Autenticar con Minecraft usando el token de Microsoft
   * Flujo: Microsoft → Xbox Live → XSTS → Minecraft
   */
  async authenticateMinecraft(msalResponse) {
    try {
      const msToken = msalResponse.accessToken;

      console.log('🎮 Paso 1/4: Autenticando con Xbox Live...');
      
      // 1. Xbox Live Authentication
      const xblResponse = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Properties: {
            AuthMethod: 'RPS',
            SiteName: 'user.auth.xboxlive.com',
            RpsTicket: `d=${msToken}`
          },
          RelyingParty: 'http://auth.xboxlive.com',
          TokenType: 'JWT'
        })
      });

      if (!xblResponse.ok) {
        throw new Error('Xbox Live auth failed');
      }

      const xblData = await xblResponse.json();
      const xblToken = xblData.Token;
      const userHash = xblData.DisplayClaims.xui[0].uhs;

      console.log('✅ Xbox Live autenticado');
      console.log('🎮 Paso 2/4: Obteniendo XSTS token...');

      // 2. XSTS Authentication
      const xstsResponse = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [xblToken]
          },
          RelyingParty: 'rp://api.minecraftservices.com/',
          TokenType: 'JWT'
        })
      });

      if (!xstsResponse.ok) {
        const errorData = await xstsResponse.json();
        
        // Errores comunes
        if (errorData.XErr === 2148916233) {
          throw new Error('Esta cuenta no tiene Xbox Live. Necesitas una cuenta Microsoft con Xbox.');
        } else if (errorData.XErr === 2148916238) {
          throw new Error('Esta cuenta es menor de edad. Necesita permiso parental.');
        }
        
        throw new Error(`XSTS auth failed: ${errorData.Message || 'Unknown error'}`);
      }

      const xstsData = await xstsResponse.json();
      const xstsToken = xstsData.Token;

      console.log('✅ XSTS token obtenido');
      console.log('🎮 Paso 3/4: Autenticando con Minecraft...');

      // 3. Minecraft Authentication
      const mcResponse = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identityToken: `XBL3.0 x=${userHash};${xstsToken}`
        })
      });

      if (!mcResponse.ok) {
        throw new Error('Minecraft auth failed');
      }

      const mcData = await mcResponse.json();
      const mcAccessToken = mcData.access_token;

      console.log('✅ Minecraft token obtenido');
      console.log('🎮 Paso 4/4: Obteniendo perfil de Minecraft...');

      // 4. Get Minecraft Profile
      const profileResponse = await fetch('https://api.minecraftservices.com/minecraft/profile', {
        headers: {
          'Authorization': `Bearer ${mcAccessToken}`
        }
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          throw new Error('Esta cuenta Microsoft no tiene Minecraft. Necesitas comprar Minecraft en minecraft.net');
        }
        throw new Error('No se pudo obtener el perfil de Minecraft');
      }

      const profileData = await profileResponse.json();

      console.log('✅ Perfil obtenido');
      console.log('👤 Username:', profileData.name);
      console.log('🆔 UUID:', profileData.id);

      // Construir URL de skin (Crafatar es el más confiable)
      const skinUrl = `https://crafatar.com/skins/${profileData.id}`;

      return {
        username: profileData.name,
        uuid: profileData.id,
        accessToken: mcAccessToken,
        skinUrl: skinUrl,
        skins: profileData.skins || []
      };

    } catch (error) {
      console.error('❌ Error en autenticación Minecraft:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay sesión activa
   */
  async getActiveAccount() {
    await this.initialize();
    
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      return accounts[0];
    }
    return null;
  }

  /**
   * Logout (cerrar sesión)
   */
  async logout() {
    await this.initialize();
    
    const currentAccount = await this.getActiveAccount();
    if (currentAccount) {
      await this.msalInstance.logoutPopup({
        account: currentAccount
      });
      console.log('✅ Sesión de Microsoft cerrada');
    }
  }
}

// Instancia global
export const microsoftAuth = new MicrosoftAuthService();

export default microsoftAuth;

