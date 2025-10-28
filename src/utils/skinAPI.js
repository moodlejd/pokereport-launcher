/**
 * API de Skins de Minecraft
 * Maneja la obtención de skins tanto para cuentas Premium como No-Premium
 */

/**
 * URLs de servicios de skins
 */
const SKIN_SERVICES = {
  // Premium (por UUID)
  premium: [
    {
      name: 'Crafatar',
      url: (uuid) => `https://crafatar.com/skins/${uuid}`,
      timeout: 5000
    },
    {
      name: 'MC-Heads',
      url: (uuid) => `https://mc-heads.net/skin/${uuid}`,
      timeout: 5000
    },
    {
      name: 'Mojang API',
      url: async (uuid) => {
        // Primero obtener el perfil
        const profileRes = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        const profile = await profileRes.json();
        
        if (profile.properties) {
          const textureProperty = profile.properties.find(p => p.name === 'textures');
          if (textureProperty) {
            const textureData = JSON.parse(atob(textureProperty.value));
            return textureData.textures.SKIN.url;
          }
        }
        throw new Error('No skin found in profile');
      },
      timeout: 8000
    }
  ],
  
  // No-Premium (por username)
  offline: [
    {
      name: 'TLauncher Direct PNG',
      url: (username) => `/tlauncher-api/catalog/nickname/download/tlauncher_${username}.png`,
      timeout: 5000
    },
    {
      name: 'TLauncher ElyBy API',
      url: async (username) => {
        try {
          // Usar proxy local de React (setupProxy.js)
          const apiUrl = `/tlauncher-auth/skin/profile/texture/login/${username}`;
          console.log('🔍 TLauncher ElyBy API (via proxy):', apiUrl);
          
          const response = await fetch(apiUrl);
          const data = await response.json();
          
          console.log('📦 Respuesta TLauncher:', data);
          
          if (data.SKIN && data.SKIN.url) {
            // Convertir la URL a usar el proxy también
            let skinUrl = data.SKIN.url;
            
            // Si la URL es de auth.tlauncher.org, usar proxy
            if (skinUrl.includes('auth.tlauncher.org')) {
              skinUrl = skinUrl.replace('http://auth.tlauncher.org', '/tlauncher-auth');
              skinUrl = skinUrl.replace('https://auth.tlauncher.org', '/tlauncher-auth');
            }
            
            console.log('✅ TLauncher Skin (via proxy):', skinUrl);
            return skinUrl;
          }
        } catch (e) {
          console.log('❌ TLauncher ElyBy API error:', e);
        }
        
        throw new Error('TLauncher API no disponible');
      },
      timeout: 8000
    },
    {
      name: 'LittleSkin CustomSkinAPI',
      url: async (username) => {
        // LittleSkin usa CustomSkinAPI
        if (window.electronAPI && window.electronAPI.fetchUrl) {
          try {
            const apiUrl = `https://littleskin.cn/csl/${username}.json`;
            console.log('🔍 Consultando LittleSkin API:', apiUrl);
            
            const result = await window.electronAPI.fetchUrl(apiUrl);
            
            if (result.success && result.data) {
              console.log('📦 Respuesta LittleSkin:', result.data);
              
              // Formato CustomSkinAPI: { "skin": "abc123.png", "skins": {...} }
              if (result.data.skin) {
                const skinUrl = `https://littleskin.cn/csl/textures/${result.data.skin}`;
                console.log('✅ Skin URL de LittleSkin:', skinUrl);
                return skinUrl;
              }
              
              // Formato alternativo con "skins" object
              if (result.data.skins && result.data.skins.default) {
                const skinUrl = `https://littleskin.cn/csl/textures/${result.data.skins.default}`;
                console.log('✅ Skin URL de LittleSkin (skins):', skinUrl);
                return skinUrl;
              }
            }
          } catch (e) {
            console.log('❌ LittleSkin API error:', e);
          }
        }
        throw new Error('API no disponible');
      },
      timeout: 8000
    },
    {
      name: 'Minotar',
      url: (username) => `https://minotar.net/skin/${username}`,
      timeout: 5000
    },
    {
      name: 'MC-Heads',
      url: (username) => `https://mc-heads.net/skin/${username}`,
      timeout: 5000
    },
    {
      name: 'Crafatar Username',
      url: (username) => `https://crafatar.com/skins/${username}`,
      timeout: 5000
    },
    {
      name: 'Visage',
      url: (username) => `https://visage.surgeplay.com/skin/${username}`,
      timeout: 5000
    }
  ],
  
  // Fallback final
  fallback: '/assets/skins/steve.png'
};

/**
 * Obtener skin con reintentos y múltiples servicios
 */
export const getSkinUrl = async (username, uuid = null, isPremium = false) => {
  console.log(`🎨 Obteniendo skin para: ${username} | UUID: ${uuid} | Premium: ${isPremium}`);

  // Seleccionar servicios según el tipo de cuenta
  let services;
  
  if (isPremium && uuid) {
    // Si tiene UUID, usar APIs premium
    services = SKIN_SERVICES.premium;
  } else if (isPremium && !uuid) {
    // Premium pero sin UUID - usar Minotar primero (consulta Mojang por username)
    services = [
      {
        name: 'Minotar (Premium)',
        url: (username) => `https://minotar.net/skin/${username}`,
        timeout: 5000
      },
      {
        name: 'Crafatar (Username)',
        url: (username) => `https://crafatar.com/skins/${username}`,
        timeout: 5000
      },
      {
        name: 'MC-Heads (Username)',
        url: (username) => `https://mc-heads.net/skin/${username}`,
        timeout: 5000
      }
    ];
  } else {
    // Offline - usar TLauncher y similares
    services = SKIN_SERVICES.offline;
  }

  const identifier = isPremium && uuid ? uuid : username;

  // Intentar cada servicio en orden
  for (const service of services) {
    try {
      console.log(`🔍 Intentando servicio: ${service.name}`);
      
      let url;
      if (typeof service.url === 'function') {
        url = await Promise.race([
          service.url(identifier),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), service.timeout)
          )
        ]);
      } else {
        url = service.url;
      }

      console.log(`📡 URL obtenida: ${url}`);

      // Verificar que la URL responde
      // Usar proxy de Electron si está disponible, sino fetch normal
      let isValid = false;
      
      if (window.electronAPI && window.electronAPI.fetchUrl && url.includes('auth.tlauncher')) {
        // Para TLauncher, ya tenemos la URL validada del proxy
        isValid = true;
      } else {
        // Para otros servicios, verificar con fetch
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(url, { 
            signal: controller.signal,
            mode: 'no-cors' // Cambiar a no-cors para evitar CORS
          });

          clearTimeout(timeoutId);
          isValid = true; // Si no da error, asumimos que es válida
        } catch (fetchError) {
          console.log(`⚠️ Fetch falló para ${service.name}:`, fetchError.message);
          isValid = false;
        }
      }

      if (isValid) {
        console.log(`✅ Skin encontrada en ${service.name}: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ ${service.name} falló:`, error.message);
      continue;
    }
  }

  // Si ningún servicio funcionó, usar fallback
  console.log(`⚠️ Usando skin por defecto (Steve)`);
  return SKIN_SERVICES.fallback;
};

/**
 * Obtener UUID desde username (para cuentas offline que quieran usar skin de TLauncher)
 */
export const getUUIDFromUsername = async (username) => {
  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.id;
    }
  } catch (error) {
    console.log('No se pudo obtener UUID desde username:', error);
  }
  
  return null;
};

/**
 * Descargar y cachear skin localmente
 */
export const downloadSkin = async (url, username) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download');
    
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    console.log(`✅ Skin descargada para ${username}`);
    return objectUrl;
  } catch (error) {
    console.error('Error descargando skin:', error);
    return null;
  }
};

/**
 * API completa de skins con caché y cancelación
 */
export class SkinManager {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async getSkin(username, uuid = null, isPremium = false) {
    const cacheKey = uuid || username;
    
    // Cancelar petición anterior para este username si existe
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🚫 Cancelando petición anterior para: ${cacheKey}`);
      this.pendingRequests.get(cacheKey).cancelled = true;
    }
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Skin desde caché: ${cacheKey}`);
      return this.cache.get(cacheKey);
    }

    // Crear objeto de control para esta petición
    const requestControl = { cancelled: false };
    this.pendingRequests.set(cacheKey, requestControl);

    // Obtener URL de la skin
    const skinUrl = await getSkinUrl(username, uuid, isPremium);
    
    // Verificar si la petición fue cancelada
    if (requestControl.cancelled) {
      console.log(`🚫 Petición cancelada para: ${cacheKey}`);
      return null;
    }
    
    // Intentar descargar y cachear
    const downloadedUrl = await downloadSkin(skinUrl, username);
    const finalUrl = downloadedUrl || skinUrl;
    
    // Guardar en caché solo si no fue cancelada
    if (!requestControl.cancelled) {
      this.cache.set(cacheKey, finalUrl);
      console.log(`💾 Skin guardada en caché: ${cacheKey}`);
    }
    
    // Limpiar pending request
    this.pendingRequests.delete(cacheKey);
    
    return finalUrl;
  }

  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🗑️ Caché limpiado');
  }
}

// Instancia global
export const skinManager = new SkinManager();

