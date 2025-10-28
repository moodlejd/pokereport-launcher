import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Iniciando launcher...');

  const messages = [
    'Iniciando launcher...',
    'Cargando recursos...',
    'Preparando sistema...',
    'Verificando componentes...',
    'Configurando interfaz...',
    'Casi listo...'
  ];

  useEffect(() => {
    const duration = 5000; // 5 segundos total (más tiempo)
    const steps = 100;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      setProgress(current);

      // Cambiar mensaje cada 16%
      const messageIndex = Math.floor(current / 16.6);
      if (messageIndex < messages.length) {
        setCurrentMessage(messages[messageIndex]);
      }

      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 800); // Pausa extra antes de mostrar login
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro sutil */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Contenido de carga */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-32">
        {/* Logo animado (Pokeball) */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 360]
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }
          }}
          className="mb-12"
        >
          <img 
            src={`${process.env.PUBLIC_URL}/pokeball-icon.png`}
            alt="Loading"
            className="w-40 h-40 drop-shadow-2xl"
            style={{ 
              filter: 'drop-shadow(0 0 40px rgba(211, 47, 47, 0.8))',
              imageRendering: 'auto'
            }}
          />
        </motion.div>

        {/* Mensaje de carga */}
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-2xl font-bold mb-16 drop-shadow-lg"
          style={{
            textShadow: '0 0 20px rgba(211, 47, 47, 0.8), 2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {currentMessage}
        </motion.p>

        {/* Barra de progreso */}
        <div className="w-[500px] mb-4">
          <div className="w-full h-6 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <motion.div
              className="h-full bg-gradient-to-r from-pokemon-red via-pokemon-yellow to-pokemon-red rounded-full relative"
              initial={{ width: '0%' }}
              animate={{ 
                width: `${progress}%`,
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                width: { duration: 0.3 },
                backgroundPosition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }
              }}
              style={{ 
                backgroundSize: '200% 100%'
              }}
            >
              {/* Brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                   style={{
                     animation: 'shine 1.5s ease-in-out infinite'
                   }} />
            </motion.div>
          </div>

          {/* Porcentaje */}
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-white text-lg font-bold drop-shadow-lg"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {progress}%
            </span>
            <span className="text-pokemon-red text-lg font-bold drop-shadow-lg"
                  style={{ textShadow: '0 0 10px rgba(211, 47, 47, 0.8), 2px 2px 4px rgba(0,0,0,0.8)' }}>
              {progress < 100 ? 'CARGANDO...' : '¡LISTO!'}
            </span>
          </div>
        </div>

        {/* Versión */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white text-sm mt-6 drop-shadow font-bold"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
        >
          v1.0.0 • Minecraft 1.21.1 Fabric
        </motion.p>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};

export default LoadingScreen;

