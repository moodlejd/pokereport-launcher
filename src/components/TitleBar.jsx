import React from 'react';
import { FiMinus, FiMaximize2, FiX } from 'react-icons/fi';

const TitleBar = () => {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="h-8 bg-pokemon-darker border-b border-pokemon-blue/30 flex items-center justify-between px-4 drag-region select-none">
      {/* Logo y título */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gradient-to-br from-pokemon-yellow to-pokemon-red rounded-full" />
        <span className="text-white font-bold text-sm tracking-wide">
          POKEREPORT LAUNCHER
        </span>
      </div>

      {/* Controles de ventana */}
      <div className="flex items-center gap-2 no-drag">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          title="Minimizar"
        >
          <FiMinus className="text-white" size={16} />
        </button>
        
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          title="Maximizar"
        >
          <FiMaximize2 className="text-white" size={14} />
        </button>
        
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-pokemon-red rounded transition-colors"
          title="Cerrar"
        >
          <FiX className="text-white" size={18} />
        </button>
      </div>

      <style>{`
        .drag-region {
          -webkit-app-region: drag;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
      `}</style>
    </div>
  );
};

export default TitleBar;

