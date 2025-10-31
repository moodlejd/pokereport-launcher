/**
 * Autenticación Microsoft simplificada para Python backend
 * Sin dependencias complejas de MSAL
 */

class SimpleMicrosoftAuth {
  constructor() {
    this.clientId = '15d53ab4-cfad-4757-88a2-904139d4ca9d';
    this.redirectUri = 'http://localhost:8000'; // URI que necesitas registrar en Azure
    this.scopes = ['User.Read', 'offline_access']; // Xbox Live ya no disponible
  }

  /**
   * Iniciar autenticación con popup
   */
  async loginWithPopup() {
    try {
      console.log('🔐 Iniciando autenticación Microsoft...');
      
      // Crear URL de autorización
      const authUrl = this.buildAuthUrl();
      console.log('🌐 URL de autorización:', authUrl);
      
      // Abrir popup
      const popup = window.open(
        authUrl,
        'microsoft-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Popup bloqueado. Permite popups para este sitio.');
      }
      
      // Esperar respuesta del popup
      const result = await this.waitForPopupResult(popup);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Procesar código de autorización
      return await this.processAuthCode(result.code);
      
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  }

  /**
   * Construir URL de autorización
   */
  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      response_mode: 'query',
      state: this.generateState()
    });

    return `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${params}`;
  }

  /**
   * Esperar resultado del popup
   */
  async waitForPopupResult(popup) {
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Popup cerrado por el usuario'));
        }
      }, 1000);

      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        
        if (event.data.type === 'auth-error') {
          reject(new Error(event.data.error));
        } else if (event.data.type === 'auth-success') {
          resolve({ code: event.data.code });
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Timeout después de 5 minutos
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error('Timeout en autenticación'));
      }, 300000);
    });
  }

  /**
   * Procesar código de autorización
   */
  async processAuthCode(code) {
    try {
      console.log('🔄 Procesando código de autorización...');
      
      // Intercambiar código por token
      const tokenResponse = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          code: code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      console.log('✅ Token de Microsoft obtenido');
      
      // Autenticar con Xbox Live y Minecraft
      const { XboxLiveAuth } = await import('./xboxLiveAuth');
      const xboxAuth = new XboxLiveAuth();
      
      return await xboxAuth.fullMinecraftAuth(tokenData.access_token);
      
    } catch (error) {
      console.error('❌ Error procesando código:', error);
      throw error;
    }
  }

  /**
   * Versión simplificada - solo obtener info básica del usuario
   */
  async getBasicUserInfo(accessToken) {
    try {
      // Obtener info básica del usuario Microsoft
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const userInfo = await response.json();
      
      // Para Minecraft necesitaríamos Xbox Live, pero como no está disponible,
      // solo devolvemos info básica y sugerimos usar modo offline
      throw new Error('Microsoft Auth requiere Xbox Live API que ya no está disponible.\n\nUsa modo Offline que funciona perfectamente.');
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar estado para seguridad
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Crear página de callback para el popup
const createCallbackPage = () => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Autenticación Microsoft</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #4bb4e9, #fdd835);
          color: white;
        }
        .container { 
          background: rgba(0,0,0,0.8); 
          padding: 30px; 
          border-radius: 15px; 
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎮 PokeReport Launcher</h2>
        <p>Procesando autenticación...</p>
        <div id="status">⏳ Espera un momento...</div>
      </div>
      
      <script>
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          document.getElementById('status').innerHTML = '❌ Error: ' + error;
          window.opener.postMessage({ error: error }, '*');
        } else if (code) {
          document.getElementById('status').innerHTML = '✅ Código recibido, procesando...';
          window.opener.postMessage({ code: code }, '*');
        } else {
          document.getElementById('status').innerHTML = '❌ No se recibió código';
          window.opener.postMessage({ error: 'No code received' }, '*');
        }
      </script>
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
};

// Exportar instancia
const microsoftAuth = new SimpleMicrosoftAuth();

export default {
  async loginWithRedirect(onCodeReceived) {
    try {
      console.log('🚀 Iniciando Microsoft Auth...');
      return await microsoftAuth.loginWithPopup();
    } catch (error) {
      console.error('❌ Microsoft Auth error:', error);
      throw new Error(`Error en autenticación Microsoft: ${error.message}`);
    }
  }
};
