import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.js',
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ]),
    renderer()
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/tlauncher-api': {
        target: 'https://tlauncher.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tlauncher-api/, '')
      },
      '/tlauncher-auth': {
        target: 'https://auth.tlauncher.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tlauncher-auth/, '')
      },
      '/littleskin-api': {
        target: 'https://littleskin.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/littleskin-api/, '')
      },
      '/microsoft-oauth': {
        target: 'https://login.microsoftonline.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/microsoft-oauth/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

