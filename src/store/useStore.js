/**
 * Zustand Store - Estado global de la aplicación
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Autenticación
      isAuthenticated: false,
      user: null,
      isPremium: false,
      
      // Configuración
      config: {
        ram: 4,
        language: 'es',
        theme: 'pokemon',
        music: true,
        discord: true
      },
      
      // Estado del launcher
      isDownloading: false,
      downloadProgress: 0,
      currentStatus: 'idle',
      
      // Noticias
      news: [],
      
      /**
       * Acciones de autenticación
       */
      login: (user, isPremium = false) => {
        console.log('[Store] 💾 Login - Usuario:', user.username, 'isPremium:', isPremium);
        
        set({
          isAuthenticated: true,
          user: {
            username: user.username,
            uuid: user.uuid || null,
            skinUrl: user.skinUrl || null,
            accessToken: user.accessToken || null,
            clientToken: user.clientToken || null,
            isPremium: isPremium  // IMPORTANTE: Guardar isPremium dentro del objeto user
          },
          isPremium: isPremium  // También en el root para compatibilidad
        });
        
        console.log('[Store] ✅ Usuario guardado:', {
          username: user.username,
          isPremium: isPremium,
          hasAccessToken: !!user.accessToken,
          hasUuid: !!user.uuid
        });
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          isPremium: false
        });
      },
      
      /**
       * Acciones de configuración
       */
      updateConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig }
        }));
      },
      
      /**
       * Acciones del launcher
       */
      setDownloadProgress: (progress) => {
        set({ downloadProgress: progress });
      },
      
      setDownloading: (isDownloading) => {
        set({ isDownloading });
      },
      
      setStatus: (status) => {
        set({ currentStatus: status });
      },
      
      /**
       * Noticias
       */
      setNews: (news) => {
        set({ news });
      }
    }),
    {
      name: 'pokereport-storage',
      // Solo persistir lo necesario
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        config: state.config
      })
    }
  )
);

