import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiCalendar, FiX } from 'react-icons/fi';

const NewsPanel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  // Noticias por defecto si no se pueden cargar desde la API
  const defaultNews = [
    {
      id: 1,
      title: "¡Bienvenido a PokeReport!",
      description: "Explora el mundo de Pokémon en Minecraft con más de 120 mods. Captura, entrena y batalla con tus Pokémon favoritos.",
      image: "./background.png",
      date: "2025-01-30",
      link: "https://discord.gg/njfPQMAhQV"
    },
    {
      id: 2,
      title: "Launcher migrado a Python",
      description: "Nueva versión más estable con backend Python. Audio e idioma español garantizados.",
      image: "./fondo2.png",
      date: "2025-01-29",
      link: "#"
    },
    {
      id: 3,
      title: "Mega Evoluciones Disponibles",
      description: "Más de 50 mega evoluciones con efectos visuales mejorados y nuevas habilidades especiales.",
      image: "./pokeball-icon.png",
      date: "2025-01-25",
      link: "https://discord.gg/njfPQMAhQV"
    }
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Cargar noticias desde GitHub
      const response = await fetch('/api/fetch-url/raw.githubusercontent.com/moodlejd/pokereport-news/main/news.json');
      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setNews(result.data);
      } else {
        throw new Error('No se pudieron cargar noticias desde la API');
      }
    } catch (err) {
      console.warn('Usando noticias por defecto', err.message);
      setNews(defaultNews);
    } finally {
      setLoading(false);
    }
  };

  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
  };

  const closeModal = () => {
    setSelectedNews(null);
  };

  const handleNewsClick = (newsItem) => {
    if (newsItem.link && newsItem.link !== '#') {
      // Abrir enlace externo
      window.open(newsItem.link, '_blank');
    } else {
      openNewsModal(newsItem);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          📰 Noticias del Servidor
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            📰 Noticias del Servidor
          </h3>
          <button
            onClick={fetchNews}
            className="text-pokemon-blue hover:text-white transition-colors text-sm"
            title="Actualizar noticias"
          >
            🔄
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-custom">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-pokemon-darker rounded-xl p-4 hover:bg-pokemon-dark transition-colors cursor-pointer border border-pokemon-blue/20 hover:border-pokemon-blue/50"
              onClick={() => handleNewsClick(item)}
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.image || "https://via.placeholder.com/60x60/4bb4e9/ffffff?text=📰"}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "./pokeball-icon.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-pokemon-blue text-xs flex items-center gap-1">
                      <FiCalendar size={10} />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {item.link && item.link !== '#' && (
                      <FiExternalLink className="text-gray-500" size={12} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            💡 Haz clic en una noticia para más detalles
          </p>
        </div>
      </div>

      {/* Modal de noticia */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-pokemon-blue"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-2xl">{selectedNews.title}</h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:border-pokemon-red transition-all"
                >
                  <FiX className="text-white" size={20} />
                </button>
              </div>

              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-pokemon-blue text-sm">
                  <FiCalendar />
                  <span>{new Date(selectedNews.date).toLocaleDateString('es-ES')}</span>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {selectedNews.description}
                </p>

                {selectedNews.link && selectedNews.link !== '#' && (
                  <button
                    onClick={() => window.open(selectedNews.link, '_blank')}
                    className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
                  >
                    <FiExternalLink />
                    Más Información
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsPanel;