import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ToastContext } from '../App';
import microsoftAuth from '../utils/microsoftAuthDevice';
import { getSkinUrl } from '../utils/skinAPIFixed';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const toast = useContext(ToastContext);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMsftCode, setShowMsftCode] = useState(false);
  const [deviceCode, setDeviceCode] = useState(null);

  const handleOfflineLogin = async () => {
    if (!username || username.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Obtener skin de TLauncher o fallback a Minotar
      console.log(`🔍 Buscando skin para usuario offline: ${username}`);
      const skinUrl = await getSkinUrl(username, null, false);
      console.log(`✅ Skin encontrada: ${skinUrl}`);

      login({
        username,
        uuid: null,
        skinUrl: skinUrl
      }, false);

      navigate('/home');
    } catch (error) {
      console.error('❌ Error al obtener skin:', error);
      // Fallback: usar Minotar si falla todo
      login({
        username,
        uuid: null,
        skinUrl: `https://minotar.net/skin/${username}`
      }, false);
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Iniciando Device Code Flow...');
      
      // Autenticación con Device Code (como TLauncher)
      const result = await microsoftAuth.loginWithDeviceCode((codeInfo) => {
        // Mostrar el código al usuario
        console.log('📱 Código recibido:', codeInfo.userCode);
        setDeviceCode(codeInfo);
        setShowMsftCode(true);
        
        // Abrir navegador automáticamente
        if (codeInfo.verificationUriComplete) {
          window.open(codeInfo.verificationUriComplete, '_blank');
        } else {
          window.open(codeInfo.verificationUri, '_blank');
        }
        
        if (toast) {
          toast.info(`Código: ${codeInfo.userCode} - Pégalo en el navegador`, 10000);
        }
      });
      
      // Si llega aquí, el login fue exitoso
      console.log('✅ Login Microsoft/Xbox Live completo:', result);
      
      login({
        username: result.username,
        uuid: result.uuid,
        skinUrl: result.skinUrl,
        accessToken: result.accessToken
      }, true);

      if (toast) {
        toast.success(`¡Bienvenido ${result.username}! 👑`);
      }

      setShowMsftCode(false);
      navigate('/home');

    } catch (err) {
      console.error('❌ Error en Microsoft login:', err);
      
      setShowMsftCode(false);
      
      // Mostrar error específico
      let errorMsg = err.message;
      
      if (errorMsg.includes('Minecraft')) {
        errorMsg = '❌ No tienes Minecraft en esta cuenta\n\nNecesitas Minecraft comprado.\nUsa modo Offline si no tienes Premium.';
      } else if (errorMsg.includes('Xbox')) {
        errorMsg = '❌ Error de Xbox Live\n\nCrea un perfil en xbox.com primero\no usa modo Offline.';
      } else if (errorMsg.includes('rechazó') || errorMsg.includes('declined')) {
        errorMsg = '❌ Autenticación cancelada';
      } else if (errorMsg.includes('expiró') || errorMsg.includes('expired')) {
        errorMsg = '❌ Código expirado\n\nIntenta de nuevo.';
      }
      
      setError(errorMsg);
      
      if (toast) {
        toast.error('Error de autenticación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative z-10 overflow-y-auto scrollbar-custom">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full"
      >
        {/* Espacio superior para el logo del fondo */}
        <div className="mb-12 h-32">
          {/* El logo está en el fondo, no agregamos texto aquí */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modo Offline */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-8 border-2 border-pokemon-blue/30 hover:border-pokemon-blue transition-all"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pokemon-blue to-pokemon-blue/50 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                🎮
              </div>
              <h2 className="text-white font-bold text-2xl mb-2">Modo Offline</h2>
              <p className="text-gray-400 text-sm">
                Juega sin cuenta premium
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOfflineLogin()}
                className="w-full px-4 py-3 bg-pokemon-darkest border-2 border-pokemon-blue/30 rounded-lg text-white placeholder-gray-500 focus:border-pokemon-blue focus:outline-none transition-colors"
                disabled={loading}
              />

              {error && (
                <p className="text-pokemon-red text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleOfflineLogin}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Conectando...' : '🎮 Jugar Offline'}
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-blue">✓</span>
                <span>Acceso inmediato</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-blue">✓</span>
                <span>Todos los mods disponibles</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-blue">✓</span>
                <span>Servidor de PokeReport</span>
              </div>
            </div>
          </motion.div>

          {/* Modo Premium */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-8 border-2 border-pokemon-yellow/30 hover:border-pokemon-yellow transition-all"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pokemon-yellow to-pokemon-yellow/50 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl animate-glow">
                👑
              </div>
              <h2 className="text-white font-bold text-2xl mb-2">Cuenta Premium</h2>
              <p className="text-gray-400 text-sm">
                Inicia sesión con Microsoft/Xbox Live
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePremiumLogin}
                disabled={loading}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Conectando...' : '👑 Login con Microsoft'}
              </button>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-xs text-center">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-yellow">★</span>
                <span>Skin oficial sincronizado</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-yellow">★</span>
                <span>Servidores oficiales</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-pokemon-yellow">★</span>
                <span>Multijugador completo</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-pokemon-yellow/10 border border-pokemon-yellow/30 rounded-lg">
              <p className="text-pokemon-yellow text-xs text-center">
                Requiere Minecraft comprado + Azure configurado
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-white font-semibold text-sm drop-shadow-lg">
            PokeReport Launcher © 2025 | Creado con ❤️ por la comunidad
          </p>
        </motion.div>
      </motion.div>

      {/* Modal de código Microsoft */}
      {showMsftCode && deviceCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full border-2 border-pokemon-yellow"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pokemon-yellow to-pokemon-red rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                👑
              </div>
              <h2 className="text-white font-bold text-2xl mb-2">
                Autenticación Microsoft
              </h2>
              <p className="text-gray-400 text-sm">
                Sigue estos pasos para iniciar sesión
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-pokemon-darkest rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">1. Abre esta URL en tu navegador:</p>
                <a
                  href={deviceCode.verificationUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pokemon-blue font-bold text-sm hover:underline break-all"
                >
                  {deviceCode.verificationUri}
                </a>
              </div>

              <div className="bg-pokemon-darkest rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">2. Ingresa este código:</p>
                <div className="bg-pokemon-darker rounded-lg p-4 border-2 border-pokemon-yellow">
                  <p className="text-pokemon-yellow font-bold text-3xl text-center tracking-widest">
                    {deviceCode.userCode}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deviceCode.userCode);
                    if (toast) toast.success('Código copiado');
                  }}
                  className="w-full mt-2 py-2 bg-pokemon-blue/20 hover:bg-pokemon-blue/30 text-pokemon-blue font-bold rounded-lg text-sm transition-colors"
                >
                  📋 Copiar código
                </button>
              </div>

              <div className="bg-pokemon-darkest rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">3. Autoriza PokeReport Launcher</p>
                <p className="text-white text-sm">
                  Haz clic en "Sí" o "Permitir" en la página que se abrió
                </p>
              </div>

              <div className="bg-pokemon-yellow/10 border border-pokemon-yellow/30 rounded-xl p-4">
                <p className="text-pokemon-yellow text-xs text-center">
                  ⏰ El código expira en {Math.floor(deviceCode.expiresIn / 60)} minutos
                </p>
              </div>

              <div className="text-center">
                <div className="loading-spinner mx-auto mb-3"></div>
                <p className="text-white font-semibold text-sm">
                  ⏳ Esperando tu autorización...
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Una vez autorices en el navegador,
                  <br />
                  el launcher continuará automáticamente
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // Cancelar polling
                if (microsoftAuth.cancel) {
                  microsoftAuth.cancel();
                }
                setShowMsftCode(false);
                setLoading(false);
                setError('');
              }}
              className="w-full mt-6 py-3 bg-pokemon-darkest hover:bg-pokemon-darker text-white font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;

