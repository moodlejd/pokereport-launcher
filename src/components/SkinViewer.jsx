import React, { useEffect, useState, useRef, useContext } from 'react';
import { getSkinUrl, clearSkinCache } from '../utils/skinAPIFixed';
import { ToastContext } from '../App';
import steveSkin from '@/assets/skins/steve.png';

/**
 * Visor de skin 3D usando skinview3d (librería especializada)
 * Memoizado para mejor performance
 */
const SkinViewer = React.memo(({ username: initialUsername, uuid: initialUuid, isPremium: initialIsPremium }) => {
  const toast = useContext(ToastContext);
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const [skinUrl, setSkinUrl] = useState(null);
  const [isLoadingSkin, setIsLoadingSkin] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchIsPremium, setSearchIsPremium] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(initialUsername);
  const [currentUuid, setCurrentUuid] = useState(initialUuid);
  const [currentIsPremium, setCurrentIsPremium] = useState(initialIsPremium);

  // Cargar librería skinview3d
  useEffect(() => {
    const loadSkinView3D = async () => {
      try {
        const skinview3d = await import('skinview3d');
        
        if (canvasRef.current && !viewerRef.current) {
          // Crear el visor 3D
          const viewer = new skinview3d.SkinViewer({
            canvas: canvasRef.current,
            width: canvasRef.current.offsetWidth,
            height: canvasRef.current.offsetHeight,
            skin: skinUrl || steveSkin
          });

          // Configuración del visor
          viewer.autoRotate = true;
          viewer.autoRotateSpeed = 0.5;
          viewer.zoom = 0.7;
          
          // Animación (si está disponible)
          try {
            viewer.animation = new skinview3d.IdleAnimation();
          } catch (e) {
            console.log('Animación no disponible');
          }

          viewerRef.current = viewer;
        }
      } catch (error) {
        console.error('Error cargando skinview3d:', error);
      }
    };

    loadSkinView3D();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          console.log('Error disposing viewer');
        }
      }
    };
  }, []);

  // Actualizar skin cuando cambie
  useEffect(() => {
    const loadSkinToViewer = async () => {
      if (viewerRef.current && skinUrl) {
        console.log('🎨 Actualizando skin a:', skinUrl);
        
        try {
          // Si es blob, validarlo primero
          if (skinUrl.startsWith('blob:')) {
            console.log('🔍 Validando blob...');
            const response = await fetch(skinUrl);
            const blob = await response.blob();
            
            if (blob.size === 0 || !blob.type.includes('image')) {
              throw new Error('Blob inválido o corrupto');
            }
            console.log(`✅ Blob válido (${(blob.size / 1024).toFixed(1)} KB)`);
          }
          
          // Si es una URL externa y tenemos Electron, descargar via proxy
          if (skinUrl.startsWith('http') && window.electronAPI && window.electronAPI.fetchImageAsBase64) {
            console.log('📥 Descargando skin via Electron (evitar CORS)...');
            const result = await window.electronAPI.fetchImageAsBase64(skinUrl);
            
            if (result.success) {
              console.log(`✅ Skin descargada (${(result.size / 1024).toFixed(1)} KB)`);
              await viewerRef.current.loadSkin(result.dataUrl);
              return; // Salir exitosamente
            } else {
              throw new Error('No se pudo descargar via Electron');
            }
          }
          
          // URL local, blob o sin Electron - cargar directo
          await viewerRef.current.loadSkin(skinUrl);
          console.log('✅ Skin cargada correctamente');
          
          // Notificación de éxito
          if (toast && currentUsername !== initialUsername) {
            toast.success(`Skin de ${currentUsername} cargada`);
          }
          
        } catch (error) {
          console.error('❌ Error cargando skin:', error);
          console.log('🔄 Intentando con skin por defecto (Steve)...');
          
          // Notificación de error
          if (toast) {
            toast.warning(`No se pudo cargar skin de ${currentUsername}, usando Steve`);
          }
          
          // Fallback a Steve
          try {
            await viewerRef.current.loadSkin(steveSkin);
            console.log('✅ Steve cargado como fallback');
          } catch (steveError) {
            console.error('❌ No se pudo cargar ni Steve:', steveError);
            if (toast) {
              toast.error('Error cargando modelo 3D');
            }
          }
        }
      }
    };
    
    loadSkinToViewer();
  }, [skinUrl]);

  // Cargar skin según username/uuid
  const loadSkin = async (username, uuid, isPremium) => {
    if (!username) return;
    
    setIsLoadingSkin(true);
    
    try {
      console.log('🎮 Cargando skin para:', { username, uuid, isPremium });
      
      const url = await getSkinUrl(username, uuid, isPremium);
      
      if (url) {
        console.log('✅ URL de skin obtenida:', url);
        setSkinUrl(url);
      } else {
        console.log('⚠️ No hay skin, usando Steve por defecto');
        setSkinUrl(steveSkin);
      }
    } catch (error) {
      console.error('❌ Error obteniendo skin:', error);
      setSkinUrl(steveSkin);
    } finally {
      setIsLoadingSkin(false);
    }
  };

  // Cargar skin inicial cuando se monta el componente o cambian los props
  useEffect(() => {
    console.log('🎨 Props recibidos:', { initialUsername, initialUuid, initialIsPremium });
    
    if (initialUsername) {
      // Limpiar caché anterior
      clearSkinCache();
      
      console.log('🎨 Cargando skin inicial:', initialUsername);
      setCurrentUsername(initialUsername);
      setCurrentUuid(initialUuid);
      setCurrentIsPremium(initialIsPremium);
      setSkinUrl(null); // Limpiar skin anterior
      
      // Cargar después de un pequeño delay
      setTimeout(() => {
        loadSkin(initialUsername, initialUuid, initialIsPremium);
      }, 500);
    }
  }, [initialUsername, initialUuid, initialIsPremium]);

  // Cargar skin cuando cambia el username actual
  useEffect(() => {
    if (currentUsername && currentUsername.trim()) {
      // Delay para evitar múltiples peticiones rápidas
      const timer = setTimeout(() => {
        loadSkin(currentUsername, currentUuid, currentIsPremium);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentUsername, currentUuid, currentIsPremium]);

  // Reintentar carga si no hay skin después de 3 segundos
  useEffect(() => {
    if (!skinUrl && currentUsername && !isLoadingSkin) {
      console.log('⚠️ No hay skin, reintentando en 3 segundos...');
      const retryTimer = setTimeout(() => {
        console.log('🔄 Reintentando carga de skin...');
        clearSkinCache();
        loadSkin(currentUsername, currentUuid, currentIsPremium);
      }, 3000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [skinUrl, currentUsername, isLoadingSkin]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      // Limpiar caché de la skin anterior antes de buscar
      clearSkinCache();
      
      setCurrentUsername(searchUsername.trim());
      setCurrentUuid(null);
      setCurrentIsPremium(searchIsPremium); // Usar el tipo seleccionado
      setSearchUsername(''); // Limpiar input
    }
  };

  const handleClearCache = () => {
    skinManager.clearCache();
    console.log('🗑️ Caché limpiado - recargando skin...');
    // Recargar skin actual
    if (currentUsername) {
      setSkinUrl(null); // Limpiar skin actual primero
      setTimeout(() => {
        loadSkin(currentUsername, currentUuid, currentIsPremium);
      }, 100);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-pokemon-darker to-pokemon-darkest rounded-2xl border-2 border-pokemon-blue/30 overflow-hidden relative flex flex-col">
      {/* Buscador de skins */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="🔍 Buscar skin por username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/60 backdrop-blur-sm border-2 border-pokemon-blue/50 rounded-lg text-white placeholder-gray-400 focus:border-pokemon-blue focus:outline-none text-sm font-semibold"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-pokemon-blue hover:bg-pokemon-blue/80 text-white font-bold rounded-lg transition-colors"
            >
              🔍
            </button>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-4 py-2 bg-pokemon-red hover:bg-pokemon-red/80 text-white font-bold rounded-lg transition-colors"
              title="Limpiar caché de skins"
            >
              🗑️
            </button>
          </form>
          
          {/* Toggle Premium/Offline */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearchIsPremium(false)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !searchIsPremium 
                  ? 'bg-pokemon-blue text-white' 
                  : 'bg-black/40 text-gray-400 hover:bg-black/60'
              }`}
            >
              🎮 TLauncher/Offline
            </button>
            <button
              type="button"
              onClick={() => setSearchIsPremium(true)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                searchIsPremium 
                  ? 'bg-pokemon-yellow text-pokemon-dark' 
                  : 'bg-black/40 text-gray-400 hover:bg-black/60'
              }`}
            >
              👑 Premium/Mojang
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de tipo de cuenta */}
      <div className="absolute top-16 left-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full mt-2">
        <span className={`text-xs font-bold ${currentIsPremium ? 'text-pokemon-yellow' : 'text-pokemon-blue'}`}>
          {currentIsPremium ? '👑 PREMIUM' : '🎮 OFFLINE'}
        </span>
      </div>

      {/* Username actual */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <div className="inline-block bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/20">
          <span className="text-white font-bold text-xl drop-shadow-lg">{currentUsername}</span>
        </div>
      </div>

      {/* Canvas 3D */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* Loading overlay */}
      {isLoadingSkin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-white font-bold">Cargando skin...</p>
          </div>
        </div>
      )}
    </div>
  );
});

SkinViewer.displayName = 'SkinViewer';

export default SkinViewer;
