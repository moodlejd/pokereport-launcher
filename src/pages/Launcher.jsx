import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import ProgressBar from '../components/ProgressBar';
import { launchMinecraft, startMinecraftGame } from '../utils/minecraftLauncher';

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
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const lastUpdateRef = useRef({ time: 0, percent: 0 });
  const launchedRef = useRef(false); // Prevenir doble ejecución

  useEffect(() => {
    // Prevenir ejecución múltiple
    if (launchedRef.current) {
      console.warn('[Launcher React] ⚠️ useEffect ya ejecutado, cancelando duplicado');
      return;
    }
    
    launchedRef.current = true;
    console.log('[Launcher React] 🚀 Iniciando lanzamiento (primera vez)');
    
    const launch = async () => {
      setDownloading(true);
      setIsLaunching(true);
      
      try {
        let messageIndex = 0;
        
        // Callback de progreso
        const handleProgress = (progressData = {}) => {
          const percent = Math.max(0, Math.min(100, progressData.percent ?? 0));
          const now = Date.now();
          const last = lastUpdateRef.current;
          const shouldUpdate =
            now - last.time > 120 ||
            Math.abs(percent - last.percent) >= 1 ||
            percent >= 99.5;

          if (shouldUpdate) {
            lastUpdateRef.current = { time: now, percent };
            setProgress(percent);
            setDownloadProgress(percent);

            const bytesPerSecond = progressData.speed || 0;
            const mbps = bytesPerSecond > 0 ? bytesPerSecond / (1024 * 1024) : 0;
            setSpeed(mbps);

            if (progressData.message) {
              setCurrentMessage(progressData.message);
              messageIndex = 0;
            } else {
              messageIndex = (messageIndex + 1) % LAUNCH_MESSAGES.length;
              setCurrentMessage(LAUNCH_MESSAGES[messageIndex]);
            }
          }
        };

        // Preparar Minecraft (descargar e instalar)
        setCurrentMessage('🎮 Preparando Minecraft...');
        
        await launchMinecraft(user, config, handleProgress);
        
        setProgress(100);
        setDownloadProgress(100);
        setCurrentMessage('✅ ¡Todo listo para jugar!');
        setIsReady(true);
        setIsLaunching(false);
        
      } catch (err) {
        console.error('Error en lanzamiento:', err);
        setError(err.message || 'Error al iniciar el juego');
        setIsLaunching(false);
      } finally {
        setDownloading(false);
      }
    };

    launch();
    
    // Cleanup: resetear ref si el componente se desmonta
    return () => {
      launchedRef.current = false;
    };
  }, []); // Dependencias vacías - solo ejecutar UNA vez

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
              src="./pokeball-icon.png"
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

          {/* Botones */}
          {isReady ? (
            <div className="space-y-3">
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (isGameStarting || hasGameStarted) return;
                  // Lanzar Minecraft sin cerrar el launcher
                  try {
                    console.log('[React] 🚀 Lanzando Minecraft con datos:');
                    console.log('[React]   - user:', JSON.stringify(user, null, 2));
                    console.log('[React]   - config:', JSON.stringify(config, null, 2));
                    
                    setIsGameStarting(true);
                    setCurrentMessage('🎮 Lanzando Minecraft...');
                    setStatus('Lanzando Minecraft...');

                    const result = await startMinecraftGame(user, config);
                    
                    console.log('[React] 📨 Respuesta recibida:', result);
                    
                    if (result.success) {
                      console.log('✅ Minecraft iniciado, manteniendo launcher abierto.');
                      setCurrentMessage('✅ Minecraft se está iniciando. Mantén este launcher abierto para monitorear.');
                      setStatus('Minecraft ejecutándose');
                      setHasGameStarted(true);
                    } else {
                      console.error('❌ Error al lanzar:', result.error);
                      setCurrentMessage(`❌ Error al lanzar: ${result.error}`);
                      setStatus(`Error: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('❌ Error al lanzar Minecraft:', error);
                    setCurrentMessage(`❌ Error al lanzar: ${error.message}`);
                    setStatus(`Error: ${error.message}`);
                  }
                  setIsGameStarting(false);
                }}
                className={`w-full py-5 bg-gradient-to-r from-pokemon-blue via-pokemon-yellow to-pokemon-blue bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] text-white font-bold text-xl rounded-xl transition-all shadow-lg shadow-pokemon-blue/50 ${
                  isGameStarting || hasGameStarted ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isGameStarting || hasGameStarted}
              >
                {hasGameStarted ? '🎮 Minecraft en ejecución' : isGameStarting ? '⏳ Lanzando...' : '🎮 JUGAR MINECRAFT'}
              </motion.button>
              <button
                onClick={handleCancel}
                className="w-full py-3 bg-pokemon-darkest hover:bg-pokemon-darker text-gray-400 hover:text-white font-semibold rounded-xl transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          ) : !isLaunching && error && (
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

