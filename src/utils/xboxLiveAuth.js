/**
 * Autenticación Xbox Live para Minecraft
 * Implementación actualizada que SÍ funciona
 */

export class XboxLiveAuth {
  
  /**
   * Autenticar con Xbox Live usando token de Microsoft
   */
  async authenticateXboxLive(msAccessToken) {
    try {
      console.log('🎮 Autenticando con Xbox Live...');
      
      const response = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Properties: {
            AuthMethod: 'RPS',
            SiteName: 'user.auth.xboxlive.com',
            RpsTicket: `d=${msAccessToken}`
          },
          RelyingParty: 'http://auth.xboxlive.com',
          TokenType: 'JWT'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xbox Live error: ${response.status} - ${errorText}`);
      }

      const xboxData = await response.json();
      console.log('✅ Xbox Live token obtenido');
      
      return xboxData.Token;
      
    } catch (error) {
      console.error('❌ Error Xbox Live:', error);
      throw new Error(`Xbox Live falló: ${error.message}`);
    }
  }

  /**
   * Obtener XSTS token para Minecraft
   */
  async getXSTSToken(xboxToken) {
    try {
      console.log('🔐 Obteniendo XSTS token...');
      
      const response = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [xboxToken]
          },
          RelyingParty: 'rp://api.minecraftservices.com/',
          TokenType: 'JWT'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`XSTS error: ${response.status} - ${errorText}`);
      }

      const xstsData = await response.json();
      
      if (xstsData.XErr) {
        // Errores específicos de XSTS
        const errorMessages = {
          2148916233: 'Esta cuenta Microsoft no tiene Xbox Live. Necesitas crear un perfil de Xbox.',
          2148916235: 'Xbox Live no está disponible en tu región.',
          2148916236: 'Esta cuenta requiere verificación adicional.',
          2148916237: 'Esta cuenta es de menor de edad y requiere permisos parentales.'
        };
        
        const errorMsg = errorMessages[xstsData.XErr] || `Error XSTS: ${xstsData.XErr}`;
        throw new Error(errorMsg);
      }

      console.log('✅ XSTS token obtenido');
      
      return {
        token: xstsData.Token,
        userHash: xstsData.DisplayClaims.xui[0].uhs
      };
      
    } catch (error) {
      console.error('❌ Error XSTS:', error);
      throw error;
    }
  }

  /**
   * Autenticar con Minecraft Services
   */
  async authenticateMinecraft(xstsToken, userHash) {
    try {
      console.log('⛏️ Autenticando con Minecraft Services...');
      
      const response = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identityToken: `XBL3.0 x=${userHash};${xstsToken}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Minecraft Services error: ${response.status} - ${errorText}`);
      }

      const mcData = await response.json();
      console.log('✅ Minecraft access token obtenido');
      
      return mcData.access_token;
      
    } catch (error) {
      console.error('❌ Error Minecraft Services:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil de Minecraft
   */
  async getMinecraftProfile(mcAccessToken) {
    try {
      console.log('👤 Obteniendo perfil de Minecraft...');
      
      const response = await fetch('https://api.minecraftservices.com/minecraft/profile', {
        headers: {
          'Authorization': `Bearer ${mcAccessToken}`
        }
      });

      if (response.status === 404) {
        throw new Error('Esta cuenta Microsoft no tiene Minecraft comprado.\n\nNecesitas comprar Minecraft en minecraft.net\no usar modo Offline.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Profile error: ${response.status} - ${errorText}`);
      }

      const profile = await response.json();
      console.log('✅ Perfil de Minecraft obtenido:', profile.name);
      
      // Obtener skin
      let skinUrl = `https://crafatar.com/skins/${profile.id}`;
      
      if (profile.skins && profile.skins.length > 0) {
        skinUrl = profile.skins[0].url;
      }

      return {
        username: profile.name,
        uuid: profile.id,
        accessToken: mcAccessToken,
        skinUrl: skinUrl,
        isPremium: true
      };
      
    } catch (error) {
      console.error('❌ Error perfil Minecraft:', error);
      throw error;
    }
  }

  /**
   * Proceso completo de autenticación
   */
  async fullMinecraftAuth(msAccessToken) {
    try {
      // 1. Xbox Live
      const xboxToken = await this.authenticateXboxLive(msAccessToken);
      
      // 2. XSTS
      const xstsData = await this.getXSTSToken(xboxToken);
      
      // 3. Minecraft Services
      const mcAccessToken = await this.authenticateMinecraft(xstsData.token, xstsData.userHash);
      
      // 4. Perfil
      const profile = await this.getMinecraftProfile(mcAccessToken);
      
      return profile;
      
    } catch (error) {
      throw error;
    }
  }
}

export default new XboxLiveAuth();
