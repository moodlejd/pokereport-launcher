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
        // Main process
        entry: 'electron/main.js',
      },
      {
        // Preload script
        entry: 'electron/preload.js',
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  base: './',
  build: {
    outDir: 'dist-react',
    emptyOutDir: true,
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

