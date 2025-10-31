/**
 * Sistema de Skins MEJORADO para Python backend
 * Funciona mejor con usuarios no-premium
 */

import steveSkin from '@/assets/skins/steve.png';

/**
 * Servicios de skins optimizados
 */
const SKIN_SERVICES = {
  // Para usuarios Premium (con UUID)
  premium: [
    {
      name: 'Crafatar',
      url: (uuid) => `https://crafatar.com/skins/${uuid}`,
      timeout: 3000
    },
    {
      name: 'MC-Heads',
      url: (uuid) => `https://mc-heads.net/skin/${uuid}`,
      timeout: 3000
    }
  ],
  
  // Para usuarios No-Premium (por username) - TLAUNCHER PRIMERO
  offline: [
    {
      name: 'TLauncher Proxy',
      url: (username) => `/tlauncher-api/catalog/nickname/download/tlauncher_${username}.png`,
      timeout: 5000,
      priority: 1  // PRIMERO - TLauncher
    },
    {
      name: 'CustomSkinLoader Local',
      url: (username) => `/api/custom-skin/${username}`,
      timeout: 2000,
      priority: 2  // Skins subidas por usuario
    },
    {
      name: 'Crafatar (by name)',
      url: (username) => `https://crafatar.com/skins/${username}`,
      timeout: 3000,
      priority: 3
    },
    {
      name: 'MC-Heads (by name)',
      url: (username) => `https://mc-heads.net/skin/${username}`,
      timeout: 3000,
      priority: 4
    },
    {
      name: 'Minotar (Fallback)',
      url: (username) => `https://minotar.net/skin/${username}`,
      timeout: 3000,
      priority: 5  // ÚLTIMO - solo si todo falla
    }
  ]
};

class SkinAPI {
  constructor() {
    this.cache = new Map();
    this.activeRequests = new Map();
  }

  /**
   * Obtener skin con sistema mejorado
   */
  async getSkin(username, uuid = null, isPremium = false) {
    console.log(`🎨 Obteniendo skin para: ${username} | UUID: ${uuid} | Premium: ${isPremium}`);
    
    // Limpiar caché si se solicita
    const cacheKey = `${username}-${uuid}-${isPremium}`;
    
    // Cancelar petición anterior si existe
    if (this.activeRequests.has(username)) {
      console.log(`🚫 Cancelando petición anterior para: ${username}`);
      this.activeRequests.get(username).abort();
    }
    
    // Crear nuevo AbortController
    const controller = new AbortController();
    this.activeRequests.set(username, controller);
    
    try {
      let skinUrl = null;
      
      // Determinar qué servicios usar
      const services = isPremium && uuid ? SKIN_SERVICES.premium : SKIN_SERVICES.offline;
      
      // Ordenar por prioridad si existe
      const sortedServices = services.sort((a, b) => (a.priority || 999) - (b.priority || 999));
      
      // Intentar cada servicio
      for (const service of sortedServices) {
        try {
          console.log(`🔍 Intentando servicio: ${service.name}`);
          
          let url;
          if (typeof service.url === 'function') {
            url = service.url(isPremium && uuid ? uuid : username);
          } else {
            url = service.url;
          }
          
          // Si es una promesa (URL dinámica), resolverla
          if (url instanceof Promise) {
            url = await url;
          }
          
          console.log(`📡 URL obtenida: ${url}`);
          
          // Intentar descargar
          const response = await fetch(url, {
            signal: controller.signal,
            timeout: service.timeout || 5000
          });
          
          if (response.ok) {
            const blob = await response.blob();
            
            // Verificar que es una imagen válida
            if (blob.size > 100 && blob.type.startsWith('image/')) {
              skinUrl = URL.createObjectURL(blob);
              console.log(`✅ Skin encontrada en ${service.name}: ${url}`);
              break;
            } else {
              console.log(`❌ ${service.name}: Respuesta inválida (${blob.size} bytes)`);
            }
          } else {
            console.log(`❌ ${service.name}: HTTP ${response.status}`);
          }
          
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log(`🚫 Petición cancelada para: ${username}`);
            return null;
          }
          console.log(`❌ ${service.name} falló: ${error.message}`);
          continue;
        }
      }
      
      // Si no se encontró skin, usar Steve por defecto
      if (!skinUrl) {
        console.log(`⚠️ No se encontró skin para ${username}, usando Steve`);
        skinUrl = steveSkin;
      }
      
      // Guardar en caché
      this.cache.set(cacheKey, skinUrl);
      console.log(`💾 Skin guardada en caché: ${username}`);
      
      return skinUrl;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`🚫 Petición cancelada para: ${username}`);
        return null;
      }
      console.error('Error descargando skin:', error);
      return steveSkin; // Fallback a Steve
    } finally {
      this.activeRequests.delete(username);
    }
  }

  /**
   * Limpiar caché
   */
  clearCache() {
    console.log('🗑️ Caché limpiado');
    // Limpiar URLs de blob para liberar memoria
    for (const url of this.cache.values()) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    this.cache.clear();
  }

  /**
   * Obtener skin desde caché
   */
  getCachedSkin(username, uuid = null, isPremium = false) {
    const cacheKey = `${username}-${uuid}-${isPremium}`;
    return this.cache.get(cacheKey) || null;
  }
}

// Instancia única
const skinAPI = new SkinAPI();

/**
 * Función principal para obtener skin
 */
export const getSkinUrl = async (username, uuid = null, isPremium = false) => {
  if (!username) {
    console.warn('⚠️ Username vacío, usando Steve');
    return steveSkin;
  }
  
  try {
    return await skinAPI.getSkin(username, uuid, isPremium);
  } catch (error) {
    console.error('Error obteniendo skin:', error);
    return steveSkin;
  }
};

/**
 * Limpiar caché de skins
 */
export const clearSkinCache = () => {
  skinAPI.clearCache();
};

export default skinAPI;
