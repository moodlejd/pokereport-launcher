import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
// import TitleBar from './components/TitleBar'; // No necesario sin Electron
import LoadingScreen from './components/LoadingScreen';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import BackgroundEffects from './components/BackgroundEffects';

// Lazy loading de páginas para mejor performance
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Launcher = lazy(() => import('./pages/Launcher'));
const Config = lazy(() => import('./pages/Config'));

// Context para toasts global
export const ToastContext = React.createContext(null);

function App() {
  const { isAuthenticated, login } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Siempre usar BrowserRouter (sin Electron)
  const Router = BrowserRouter;

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Auto-detectar usuario al iniciar
  useEffect(() => {
    const autoDetectUser = async () => {
      if (!isAuthenticated) {
        try {
          // Intentar detectar usuario desde TLauncher
          const response = await fetch('/api/legacy-accounts');
          const data = await response.json();
          
          if (data.accounts && data.accounts.length > 0) {
            const account = data.accounts[0];
            console.log('🔍 Usuario detectado automáticamente:', account.username);
            
            // Auto-login con usuario detectado
            login({
              username: account.username,
              uuid: null,
              skinUrl: null
            }, false);
            
            if (toast) {
              toast.success(`👋 ¡Hola ${account.username}! Detectado automáticamente`);
            }
          }
        } catch (error) {
          console.log('No se pudo detectar usuario automáticamente');
        }
      }
      
      setIsLoading(false);
    };

    setTimeout(autoDetectUser, 1000);
  }, []);

  // Si está cargando, mostrar LoadingScreen
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <ToastContext.Provider value={toast}>
      <Router>
        <div className="w-screen h-screen bg-pokemon-darkest overflow-hidden">
          {/* Toast notifications */}
          <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
          
          {/* Sin barra de título (no hay Electron) */}
          
          {/* Efectos de fondo animados */}
          <BackgroundEffects />

          {/* Contenido principal */}
          <div className="h-full overflow-auto scrollbar-custom">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="loading-spinner"></div>
              </div>
            }>
              <Routes>
                {/* Login inicial */}
                <Route 
                  path="/login" 
                  element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} 
                />
                
                {/* Pantalla principal */}
                <Route 
                  path="/home" 
                  element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
                />
                
                {/* Launcher (cuando se presiona JUGAR) */}
                <Route 
                  path="/launcher" 
                  element={isAuthenticated ? <Launcher /> : <Navigate to="/login" />} 
                />
                
                {/* Configuración */}
                <Route 
                  path="/config" 
                  element={isAuthenticated ? <Config /> : <Navigate to="/login" />} 
                />

                {/* Redirección por defecto */}
                <Route 
                  path="*" 
                  element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} 
                />
              </Routes>
            </Suspense>
          </div>
      </div>
    </Router>
    </ToastContext.Provider>
  );
}

export default App;

