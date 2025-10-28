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
        discord: true,
        minecraftDir: null
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
        set({
          isAuthenticated: true,
          user: {
            username: user.username,
            uuid: user.uuid || null,
            skinUrl: user.skinUrl || null,
            isPremium
          },
          isPremium
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

