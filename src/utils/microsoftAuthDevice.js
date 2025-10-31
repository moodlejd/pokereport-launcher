/**
 * Microsoft Auth con Device Code Flow
 * Más simple y confiable - como TLauncher
 */

import xboxLiveAuth from './xboxLiveAuth';

class DeviceCodeAuth {
  constructor() {
    this.clientId = '15d53ab4-cfad-4757-88a2-904139d4ca9d';
    this.scope = 'XboxLive.signin offline_access';
    this.pollInterval = null;
  }

  /**
   * Iniciar Device Code Flow
   */
  async loginWithDeviceCode(onCodeReceived) {
    try {
      console.log('🔐 Iniciando Device Code Flow...');
      
      // 1. Solicitar device code
      const deviceCodeData = await this.requestDeviceCode();
      
      console.log('📱 Device Code obtenido:', deviceCodeData.user_code);
      
      // 2. Mostrar código al usuario
      if (onCodeReceived) {
        onCodeReceived({
          userCode: deviceCodeData.user_code,
          verificationUri: deviceCodeData.verification_uri,
          verificationUriComplete: deviceCodeData.verification_uri_complete || deviceCodeData.verification_uri,
          expiresIn: deviceCodeData.expires_in,
          interval: deviceCodeData.interval
        });
      }
      
      // 3. Esperar autorización del usuario
      const tokenData = await this.pollForToken(
        deviceCodeData.device_code,
        deviceCodeData.interval || 5
      );
      
      console.log('✅ Token de Microsoft obtenido');
      
      // 4. Autenticar con Xbox Live y Minecraft
      const minecraftAuth = await xboxLiveAuth.fullMinecraftAuth(tokenData.access_token);
      
      return minecraftAuth;
      
    } catch (error) {
      console.error('❌ Error en Device Code Flow:', error);
      throw error;
    }
  }

  /**
   * Solicitar device code a Microsoft (via Python backend para evitar CORS)
   */
  async requestDeviceCode() {
    try {
      const response = await fetch('/api/microsoft-device-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          scope: this.scope
        })
      });

      if (!response.ok) {
        throw new Error(`Error solicitando device code: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo device code');
      }

      return result;
      
    } catch (error) {
      throw new Error(`Error obteniendo device code: ${error.message}`);
    }
  }

  /**
   * Esperar a que el usuario autorice (polling)
   */
  async pollForToken(deviceCode, interval) {
    return new Promise((resolve, reject) => {
      const maxAttempts = 60; // 5 minutos máximo
      let attempts = 0;

      const poll = async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          clearInterval(this.pollInterval);
          reject(new Error('Timeout: No se autorizó en 5 minutos'));
          return;
        }

        try {
          const response = await fetch('/api/microsoft-poll-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              client_id: this.clientId,
              device_code: deviceCode
            })
          });

          const data = await response.json();

          if (data.error) {
            if (data.error === 'authorization_pending') {
              // Usuario aún no ha autorizado, seguir esperando
              console.log('⏳ Esperando autorización del usuario...');
              return;
            } else if (data.error === 'authorization_declined') {
              clearInterval(this.pollInterval);
              reject(new Error('El usuario rechazó la autorización'));
              return;
            } else if (data.error === 'expired_token') {
              clearInterval(this.pollInterval);
              reject(new Error('El código expiró. Intenta de nuevo.'));
              return;
            } else {
              clearInterval(this.pollInterval);
              reject(new Error(data.error_description || data.error));
              return;
            }
          }

          // ¡Token obtenido!
          clearInterval(this.pollInterval);
          resolve(data);
          
        } catch (error) {
          console.error('Error en polling:', error);
        }
      };

      // Ejecutar inmediatamente y luego cada intervalo
      poll();
      this.pollInterval = setInterval(poll, interval * 1000);
    });
  }

  /**
   * Cancelar polling
   */
  cancel() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

const deviceCodeAuth = new DeviceCodeAuth();

export default {
  async loginWithDeviceCode(onCodeReceived) {
    return await deviceCodeAuth.loginWithDeviceCode(onCodeReceived);
  },
  
  cancel() {
    deviceCodeAuth.cancel();
  }
};
