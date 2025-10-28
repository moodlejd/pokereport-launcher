/**
 * Script para preparar archivos antes de compilar
 * Copia electron.js y preload.js al build con rutas correctas
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Preparando archivos para build...');

// Leer archivos originales
const mainContent = fs.readFileSync('app/main.js', 'utf8');
const preloadContent = fs.readFileSync('app/preload.js', 'utf8');

// Reemplazar rutas para producción
const mainFixed = mainContent
  // Reemplazar las rutas del splash
  .replace(
    /const splashPath = .*?\n.*?splashWindow\.loadURL\(splashPath\);/s,
    `splashWindow.loadURL(\`file://\${path.join(__dirname, 'splash.html')}\`);`
  )
  // Reemplazar las rutas de la app principal
  .replace(
    /const startURL = .*?\n.*?mainWindow\.loadURL\(startURL\);/s,
    `mainWindow.loadURL(\`file://\${path.join(__dirname, 'index.html')}\`);`
  )
  // Reemplazar NODE_ENV checks
  .replace(/process\.env\.NODE_ENV === 'development'/g, 'false')
  // Quitar DevTools en producción
  .replace(/if \(process\.env\.NODE_ENV === 'development'\) \{[\s\S]*?mainWindow\.webContents\.openDevTools\(\);[\s\S]*?\}/g, '// DevTools disabled in production')
  // Arreglar icono
  .replace(/path\.join\(__dirname, '\.\.\/src\/assets\/icons\/icon\.png'\)/g, `path.join(__dirname, 'pokeball-icon.png')`);

// Crear carpeta build si no existe
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
}

// Guardar archivos
fs.writeFileSync('build/electron.js', mainFixed);
fs.writeFileSync('build/preload.js', preloadContent);

console.log('✅ electron.js preparado');
console.log('✅ preload.js copiado');
console.log('✅ Listo para compilar');

