import React from 'react';

const ProgressBar = ({ progress, message, speed }) => {
  return (
    <div className="w-full">
      {/* Mensaje de estado */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold text-sm">{message}</span>
        <span className="text-pokemon-blue font-bold text-sm">{Math.round(progress)}%</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-3 bg-pokemon-darkest rounded-full overflow-hidden border border-pokemon-blue/30">
        <div
          className="h-full bg-gradient-to-r from-pokemon-blue via-pokemon-yellow to-pokemon-blue bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite] transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* Info adicional */}
      {speed && (
        <div className="mt-2 text-gray-400 text-xs text-right">
          {speed > 0 ? `${speed.toFixed(2)} MB/s` : 'Calculando...'}
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

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

