import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const NewsCard = React.memo(({ news, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick && onClick(news)}
      className="glass rounded-xl p-4 mb-3 hover:border-pokemon-yellow hover:shadow-lg hover:shadow-pokemon-yellow/20 transition-all cursor-pointer group"
    >
      {news.image && (
        <div className="relative overflow-hidden rounded-lg mb-3 h-32">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      <div className="flex items-start gap-2 mb-2">
        <span className="text-pokemon-yellow text-2xl group-hover:scale-110 transition-transform">
          {news.icon || '📰'}
        </span>
        <h3 className="text-white font-bold text-base group-hover:text-pokemon-yellow transition-colors flex-1">
          {news.title}
        </h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
        {news.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-pokemon-blue text-xs font-bold">
          {news.date}
        </span>
        
        <span className="text-pokemon-yellow text-xs font-bold group-hover:underline">
          Leer más →
        </span>
      </div>
    </motion.div>
  );
});

NewsCard.displayName = 'NewsCard';

const NewsPanel = React.memo(() => {
  const { news, setNews } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  const defaultNews = [
    {
      title: '🎉 ¡Bienvenido a PokeReport!',
      description: 'Nueva versión del launcher con render 3D de personajes, sistema de skins para Premium y Offline, descarga automática de mods y más funcionalidades profesionales.',
      date: '28 Oct 2025',
      icon: '🎮',
      image: `${process.env.PUBLIC_URL}/background.png`,
      link: 'https://discord.gg/pokereport',
      fullContent: 'El nuevo launcher de PokeReport trae una experiencia completamente renovada con tecnologías modernas como React, Electron y Three.js. Disfruta de un visor 3D de tu personaje, sistema de skins compatible con TLauncher y Mojang, y una interfaz hermosa inspirada en Pokémon.'
    },
    {
      title: '✨ Visor 3D de Skins',
      description: 'Visualiza tu personaje en 3D con rotación automática. Compatible con skins de TLauncher y cuentas premium de Mojang.',
      date: '28 Oct 2025',
      icon: '👤',
      image: `${process.env.PUBLIC_URL}/backgroundseleccioncuenta.png`,
      fullContent: 'El visor 3D utiliza skinview3d para renderizar tu personaje de Minecraft con tu skin personalizada. Funciona con usuarios offline de TLauncher y con cuentas premium de Mojang/Microsoft.'
    },
    {
      title: '🔥 Fabric 1.21.1',
      description: 'Compatibilidad total con la última versión de Minecraft y más de 60 mods optimizados.',
      date: '27 Oct 2025',
      icon: '⚡',
      image: `${process.env.PUBLIC_URL}/fondo2.png`,
      fullContent: 'Fabric 1.21.1 trae mejor rendimiento, compatibilidad con todos los mods del modpack PokeReport, y optimizaciones para jugar sin lag.'
    },
    {
      title: '👑 Soporte Premium',
      description: 'Inicia sesión con tu cuenta Microsoft para skins oficiales, servidores oficiales y multijugador completo.',
      date: '26 Oct 2025',
      icon: '🎨',
      fullContent: 'Con una cuenta premium de Minecraft, podrás disfrutar de tu skin oficial sincronizada, acceso a servidores oficiales, y todas las funciones del juego sin restricciones.'
    }
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Intentar cargar desde API oficial
        const response = await axios.get('https://pokereport.com/api/news.json', {
          timeout: 5000
        });
        setNews(response.data.news || defaultNews);
      } catch (error) {
        console.log('Usando noticias por defecto');
        setNews(defaultNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setNews]);

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
    
    // Si tiene link externo, abrirlo
    if (newsItem.link) {
      window.open(newsItem.link, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <motion.img
          src={`${process.env.PUBLIC_URL}/pokeball-icon.png`}
          alt="News"
          className="w-10 h-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(211, 47, 47, 0.6))' }}
        />
        <div>
          <h2 className="text-white font-bold text-xl">Noticias</h2>
          <p className="text-gray-400 text-xs">Últimas actualizaciones</p>
        </div>
      </motion.div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-custom">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {news.length > 0 ? (
              news.map((item, index) => (
                <NewsCard 
                  key={index} 
                  news={item} 
                  index={index}
                  onClick={handleNewsClick}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-6 text-center"
              >
                <span className="text-4xl mb-2 block">📭</span>
                <p className="text-gray-400">No hay noticias disponibles</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 glass rounded-lg p-3 text-center"
      >
        <a
          href="https://discord.gg/pokereport"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pokemon-blue hover:text-pokemon-yellow transition-colors text-sm font-bold flex items-center justify-center gap-2"
        >
          <span className="text-xl">💬</span>
          Únete a Discord →
        </a>
      </motion.div>

      {/* Modal de noticia completa */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNews(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 max-w-2xl w-full border-2 border-pokemon-yellow max-h-[80vh] overflow-y-auto"
            >
              {selectedNews.image && (
                <div className="relative overflow-hidden rounded-xl mb-6 h-64">
                  <img
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pokemon-darkest via-transparent to-transparent" />
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <span className="text-5xl">{selectedNews.icon || '📰'}</span>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-3xl mb-2">
                    {selectedNews.title}
                  </h2>
                  <p className="text-pokemon-blue text-sm font-bold">
                    {selectedNews.date}
                  </p>
                </div>
              </div>

              <div className="bg-pokemon-darkest rounded-xl p-6 mb-6">
                <p className="text-gray-300 text-base leading-relaxed">
                  {selectedNews.fullContent || selectedNews.description}
                </p>
              </div>

              {selectedNews.link && (
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-gradient-to-r from-pokemon-blue to-pokemon-yellow text-white font-bold text-center rounded-xl hover:shadow-xl hover:shadow-pokemon-blue/50 transition-all mb-4"
                >
                  🎮 Ir a Discord
                </a>
              )}

              <button
                onClick={() => setSelectedNews(null)}
                className="w-full py-3 bg-pokemon-darkest hover:bg-pokemon-darker text-white font-bold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NewsPanel.displayName = 'NewsPanel';

export default NewsPanel;

