import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import SkinViewer from '../components/SkinViewer';
import NewsPanel from '../components/NewsPanel';
import { FiPlay, FiSettings, FiLogOut } from 'react-icons/fi';

/**
 * Componente para mostrar jugadores del servidor en tiempo real
 */
const ServerPlayers = () => {
  const [players, setPlayers] = useState({ online: '?', max: '100' });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        // Aquí iría la consulta real al servidor Minecraft
        // Por ahora, simulamos datos
        setPlayers({ online: '24', max: '100' });
        setIsOnline(true);
      } catch (error) {
        setPlayers({ online: '?', max: '100' });
        setIsOnline(false);
      }
    };

    checkServer();
    // Actualizar cada 30 segundos
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className={`font-bold text-lg ${isOnline ? 'text-white' : 'text-gray-500'}`}>
      {players.online}/{players.max}
    </p>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user, isPremium, logout, config } = useStore();

  const handleLaunch = () => {
    navigate('/launcher');
  };

  const handleSettings = () => {
    navigate('/config');
  };

  const handleLogout = () => {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="w-full h-full p-6 overflow-hidden relative z-10">
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <img 
              src={`${process.env.PUBLIC_URL}/pokeball-icon.png`}
              alt="Pokeball"
              className="w-12 h-12 drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 0 10px rgba(211, 47, 47, 0.6))' }}
            />
            <div>
              <h1 className="text-white font-bold text-3xl">
                ¡Hola, {user?.username}!
              </h1>
              <p className="text-gray-400 text-sm">
                Listo para capturar Pokémon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSettings}
              className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:border-pokemon-blue transition-all"
              title="Configuración"
            >
              <FiSettings className="text-white" size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:border-pokemon-red transition-all"
              title="Cerrar sesión"
            >
              <FiLogOut className="text-white" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Contenido principal */}
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Columna izquierda - Visor 3D y controles */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-8 flex flex-col"
          >
            {/* Visor 3D de skin */}
            <div className="h-[450px] mb-6">
              <SkinViewer
                username={user?.username}
                uuid={user?.uuid}
                isPremium={isPremium}
              />
            </div>

            {/* Información del servidor */}
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    🌐 Servidor PokeReport
                  </h3>
                  <p className="text-gray-400 text-sm">
                    199.127.60.252:25569
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 font-bold text-sm">En línea</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-pokemon-darkest rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Jugadores</p>
                  <ServerPlayers />
                </div>
                <div className="bg-pokemon-darkest rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Versión</p>
                  <p className="text-white font-bold text-sm">Fabric 1.21.1</p>
                </div>
                <div className="bg-pokemon-darkest rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Mods</p>
                  <p className="text-white font-bold text-lg">+120</p>
                </div>
              </div>
            </div>

            {/* Botón de jugar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunch}
              className="w-full bg-gradient-to-r from-pokemon-blue to-pokemon-blue/80 text-white font-bold text-2xl py-5 rounded-2xl flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-pokemon-blue/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <FiPlay size={28} />
              <span className="relative z-10">JUGAR POKEREPORT</span>
            </motion.button>

            <div className="mt-2 text-center text-gray-400 text-sm">
              💾 RAM: {config.ram}GB • 🎮 Fabric 1.21.1 • 📦 +120 Mods
            </div>
          </motion.div>

          {/* Columna derecha - Noticias */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-4"
          >
            <div className="glass rounded-2xl p-6 h-full overflow-hidden">
              <NewsPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;

