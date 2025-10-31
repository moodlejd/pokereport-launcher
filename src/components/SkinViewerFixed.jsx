import React, { useEffect, useState, useRef } from 'react';
import { getSkinUrl } from '../utils/skinAPIFixed';
import steveSkin from '@/assets/skins/steve.png';

/**
 * Visor de skin 3D SIMPLIFICADO y FUNCIONAL
 */
const SkinViewerFixed = ({ username, uuid, isPremium }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const [skinUrl, setSkinUrl] = useState(steveSkin);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar skin cuando cambien los props
  useEffect(() => {
    if (username) {
      loadSkinForUser(username, uuid, isPremium);
    }
  }, [username, uuid, isPremium]);

  // Inicializar viewer 3D cuando se cargue la skin
  useEffect(() => {
    if (skinUrl && canvasRef.current) {
      initializeSkinViewer();
    }
  }, [skinUrl]);

  const loadSkinForUser = async (user, userUuid, premium) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🎨 Cargando skin para ${user} (Premium: ${premium})`);
      
      const url = await getSkinUrl(user, userUuid, premium);
      
      if (url) {
        console.log(`✅ Skin obtenida: ${url}`);
        setSkinUrl(url);
      } else {
        console.log('⚠️ No se encontró skin, usando Steve');
        setSkinUrl(steveSkin);
      }
      
    } catch (error) {
      console.error('❌ Error cargando skin:', error);
      setSkinUrl(steveSkin);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSkinViewer = async () => {
    if (!canvasRef.current || !skinUrl) return;

    try {
      // Limpiar viewer anterior
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          console.log('Error limpiando viewer anterior:', e);
        }
        viewerRef.current = null;
      }

      // Importar skinview3d dinámicamente
      const { SkinViewer } = await import('skinview3d');
      
      console.log('🎨 Inicializando SkinViewer con skin:', skinUrl);
      
      // Crear nuevo viewer con configuración básica
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 300,
        height: 400,
        skin: skinUrl,
        model: 'default' // Modelo por defecto
      });

      // Configurar controles básicos
      if (viewer.controls) {
        viewer.controls.enableRotate = true;
        viewer.controls.enableZoom = true;
        viewer.controls.enablePan = false;
      }
      
      // Auto-rotación suave
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.5; // Más lento
      
      // Sin animaciones complejas por ahora
      console.log('✅ SkinViewer inicializado sin animaciones');
      
      viewerRef.current = viewer;
      
      // Forzar render
      if (viewer.render) {
        viewer.render();
      }
      
      console.log('✅ Skin Viewer 3D completamente inicializado');
      
    } catch (error) {
      console.error('❌ Error inicializando SkinViewer:', error);
      setError(`Error: ${error.message}`);
    }
  };

  const handleRefresh = () => {
    if (username) {
      setSkinUrl(steveSkin); // Reset temporal
      loadSkinForUser(username, uuid, isPremium);
    }
  };

  const handleUploadSkin = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        setIsLoading(true);
        
        // Leer archivo como base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64 = event.target.result;
            
            // Subir al backend
            const response = await fetch('/api/upload-custom-skin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: username,
                skin: base64
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              console.log('✅ Skin personalizada subida');
              alert('✅ Skin personalizada guardada!\n\nSe usará en Minecraft con CustomSkinLoader.');
              
              // Recargar skin
              handleRefresh();
            } else {
              alert(`❌ Error: ${result.error}`);
            }
          } catch (error) {
            console.error('Error subiendo skin:', error);
            alert(`❌ Error subiendo skin: ${error.message}`);
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('Error leyendo archivo:', error);
        setIsLoading(false);
      }
    };
    
    input.click();
  };

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">
          🎨 Visor 3D
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleUploadSkin}
            disabled={isLoading}
            className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:border-pokemon-yellow transition-all disabled:opacity-50"
            title="Subir skin personalizada"
          >
            📤
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:border-pokemon-blue transition-all disabled:opacity-50"
            title="Refrescar skin"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Canvas del visor 3D */}
      <div className="flex-1 flex items-center justify-center bg-pokemon-darkest rounded-xl relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="loading-spinner mb-2"></div>
              <p className="text-sm">Cargando skin...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
            <div className="text-white text-center p-4">
              <p className="text-sm">❌ {error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 bg-pokemon-blue rounded text-xs"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full"
          style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Info del usuario */}
      <div className="mt-4 text-center">
        <p className="text-white font-semibold">{username || 'Sin usuario'}</p>
        <p className="text-gray-400 text-sm">
          {isPremium ? '👑 Premium' : '🎮 Offline'}
        </p>
        {uuid && (
          <p className="text-gray-500 text-xs font-mono">
            {uuid.slice(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default SkinViewerFixed;
