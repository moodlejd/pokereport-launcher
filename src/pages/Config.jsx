import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { FiChevronLeft } from 'react-icons/fi';

const Config = () => {
  const navigate = useNavigate();
  const { config, updateConfig } = useStore();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    const { minecraftDir, ...configToPersist } = localConfig;
    updateConfig(configToPersist);
    navigate('/home');
  };

  return (
    <div className="w-full h-full p-6 overflow-auto relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/home')}
            className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:border-pokemon-blue transition-all"
          >
            <FiChevronLeft className="text-white" size={24} />
          </button>
          <div>
            <h1 className="text-white font-bold text-3xl">Configuración</h1>
            <p className="text-gray-400 text-sm">Personaliza tu experiencia</p>
          </div>
        </motion.div>

        {/* Secciones de configuración */}
        <div className="space-y-6">
          {/* Rendimiento */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-bold text-xl mb-4">
              ⚡ Rendimiento
            </h2>

            <div className="space-y-4">
              {/* RAM */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 font-semibold">
                    💾 RAM Asignada
                  </label>
                  <span className="text-pokemon-blue font-bold text-lg">
                    {localConfig.ram}GB
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={localConfig.ram}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, ram: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-pokemon-darkest rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4bb4e9 0%, #4bb4e9 ${
                      ((localConfig.ram - 2) / 14) * 100
                    }%, #1a1a2e ${((localConfig.ram - 2) / 14) * 100}%, #1a1a2e 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2GB</span>
                  <span>Recomendado: 6-8GB</span>
                  <span>16GB</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Opciones adicionales */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-bold text-xl mb-4">
              🎮 Opciones Adicionales
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-pokemon-darkest rounded-lg cursor-pointer hover:bg-pokemon-darker transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-white font-semibold">Discord Rich Presence</p>
                    <p className="text-gray-400 text-xs">Mostrar estado en Discord</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.discord}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, discord: e.target.checked })
                  }
                  className="w-6 h-6 accent-pokemon-blue"
                />
              </label>
            </div>
          </motion.div>

          {/* Directorio del juego */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-bold text-xl mb-3">
              📂 Carpeta del juego
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              El launcher instala Minecraft, los mods y todos los recursos en
              una carpeta dedicada ubicada en <span className="text-pokemon-blue font-semibold">%APPDATA%/.pokereport</span>.
              Si ya existe, se reutiliza automáticamente para mantener tus datos
              y evitar descargas innecesarias.
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => navigate('/home')}
              className="flex-1 py-4 bg-pokemon-darkest hover:bg-pokemon-darker text-white font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 btn-primary"
            >
              💾 Guardar Cambios
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Config;

