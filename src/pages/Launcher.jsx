import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import ProgressBar from '../components/ProgressBar';
import { launchMinecraft } from '../utils/minecraftLauncher';

const LAUNCH_MESSAGES = [
  '🎮 Invocando Pikachu...',
  '⚡ Cargando Pokéballs...',
  '🌟 Preparando mods...',
  '📦 Descargando recursos...',
  '🔧 Instalando Fabric...',
  '🎨 Configurando texturas...',
  '🌍 Conectando al servidor...',
  '✨ Casi listo...'
];

const Launcher = () => {
  const navigate = useNavigate();
  const { user, config, setDownloadProgress, setDownloading, setStatus } = useStore();
  const [currentMessage, setCurrentMessage] = useState(LAUNCH_MESSAGES[0]);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isLaunching, setIsLaunching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const launch = async () => {
      setDownloading(true);
      setIsLaunching(true);
      
      try {
        let messageIndex = 0;
        
        // Callback de progreso
        const handleProgress = (progressData) => {
          setProgress(progressData.percent || 0);
          setDownloadProgress(progressData.percent || 0);
          setSpeed(progressData.speed || 0);
          
          // Actualizar mensaje según el tipo
          if (progressData.message) {
            setCurrentMessage(progressData.message);
          } else {
            // Ciclar por los mensajes predeterminados
            messageIndex = (messageIndex + 1) % LAUNCH_MESSAGES.length;
            setCurrentMessage(LAUNCH_MESSAGES[messageIndex]);
          }
        };

        // Lanzar Minecraft con progreso real
        setCurrentMessage('🎮 Iniciando sistema de lanzamiento...');
        
        await launchMinecraft(user, config, handleProgress);
        
        setProgress(100);
        setCurrentMessage('✅ ¡Minecraft iniciado correctamente!');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Volver al home
        navigate('/home');
        
      } catch (err) {
        console.error('Error en lanzamiento:', err);
        setError(err.message || 'Error al iniciar el juego');
        setIsLaunching(false);
      } finally {
        setDownloading(false);
      }
    };

    launch();
  }, [user, config, navigate, setDownloadProgress, setDownloading, setStatus]);

  const handleCancel = () => {
    navigate('/home');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="glass rounded-3xl p-12 border-2 border-pokemon-blue/30">
          {/* Logo animado */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
            className="text-center mb-8"
          >
            <img 
              src="/pokeball-icon.png"
              alt="Loading"
              className="w-32 h-32 mx-auto mb-4 drop-shadow-2xl"
              style={{ 
                filter: 'drop-shadow(0 0 40px rgba(211, 47, 47, 0.8))'
              }}
            />
            <h2 className="text-white font-bold text-3xl mb-2">
              Preparando el juego...
            </h2>
            <p className="text-gray-400">
              Por favor, espera mientras configuramos todo
            </p>
          </motion.div>

          {/* Barra de progreso */}
          <div className="mb-8">
            <ProgressBar
              progress={progress}
              message={currentMessage}
              speed={isLaunching ? speed : 0}
            />
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-pokemon-darkest rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Usuario</p>
              <p className="text-white font-bold truncate">{user?.username}</p>
            </div>
            <div className="bg-pokemon-darkest rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">RAM</p>
              <p className="text-white font-bold">{config.ram}GB</p>
            </div>
            <div className="bg-pokemon-darkest rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Versión</p>
              <p className="text-white font-bold">1.21.1</p>
            </div>
          </div>

          {/* Consejos mientras carga */}
          {isLaunching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="bg-pokemon-blue/10 border border-pokemon-blue/30 rounded-xl p-4 mb-6"
            >
              <p className="text-pokemon-blue text-sm">
                💡 <strong>Consejo:</strong> La primera vez puede tomar hasta 5-10 minutos.
                ¡No cierres el launcher!
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-pokemon-red/10 border border-pokemon-red/30 rounded-xl p-4 mb-6"
            >
              <p className="text-pokemon-red font-bold mb-2">❌ Error</p>
              <p className="text-gray-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Botón cancelar */}
          {!isLaunching && (
            <button
              onClick={handleCancel}
              className="w-full py-4 bg-pokemon-darkest hover:bg-pokemon-darker text-white font-bold rounded-xl transition-colors"
            >
              Volver al inicio
            </button>
          )}
        </div>

        {/* Advertencia */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            Si Minecraft se queda en "No responde", es normal. Espera unos segundos.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Launcher;

