/**
 * Proxy para desarrollo - Evita CORS
 * Este archivo se carga automáticamente por Create React App
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy para TLauncher
  app.use(
    '/tlauncher-api',
    createProxyMiddleware({
      target: 'https://tlauncher.org',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/tlauncher-api': ''
      },
      onProxyReq: (proxyReq) => {
        console.log('🔄 Proxying:', proxyReq.path);
      },
      onProxyRes: (proxyRes) => {
        // Agregar headers CORS
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = '*';
      }
    })
  );

  // Proxy para TLauncher Auth
  app.use(
    '/tlauncher-auth',
    createProxyMiddleware({
      target: 'https://auth.tlauncher.org',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/tlauncher-auth': ''
      },
      onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );

  // Proxy para LittleSkin
  app.use(
    '/littleskin-api',
    createProxyMiddleware({
      target: 'https://littleskin.cn',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/littleskin-api': ''
      },
      onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );

  // Proxy para Microsoft OAuth (Device Code y Token)
  app.use(
    '/microsoft-oauth',
    createProxyMiddleware({
      target: 'https://login.microsoftonline.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/microsoft-oauth': ''
      },
      onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = '*';
      }
    })
  );
};

