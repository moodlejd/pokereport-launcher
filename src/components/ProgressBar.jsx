import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, message, speed = 0 }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const formattedSpeed = useMemo(() => {
    if (!speed || Number.isNaN(speed)) return null;
    return `${speed.toFixed(2)} MB/s`;
  }, [speed]);

  return (
    <div className="w-full space-y-3">
      {/* Mensaje de estado */}
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-sm md:text-base truncate">
          {message}
        </span>
        <span className="text-pokemon-yellow font-bold text-sm md:text-base">
          {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-4 md:h-5 bg-pokemon-darkest/80 rounded-xl overflow-hidden border border-pokemon-blue/40 backdrop-blur">
        <motion.div
          className="h-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ ease: 'easeInOut', duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pokemon-blue via-pokemon-yellow/80 to-pokemon-red/80 opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.25)_100%)] animate-[shine_1.4s_linear_infinite]" />
        </motion.div>
      </div>

      {/* Info adicional */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Preparando recursos...</span>
        <span>{formattedSpeed || 'Calculando velocidad...'}</span>
      </div>

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;

