/**
 * Post-build script
 * Copia archivos de Electron y assets a build/
 */

const fs = require('fs-extra');
const path = require('path');

console.log('📦 Post-build: Copiando archivos de Electron...');

try {
  // Lista de archivos a copiar de public/ a build/
  const filesToCopy = [
    'electron.js',
    'preload.js',
    'splash.html',
    'pokeball-icon.png',
    'steve.png',
    'background.png',
    'backgroundseleccioncuenta.png',
    'fondo2.png'
  ];

  filesToCopy.forEach(file => {
    const source = path.join('public', file);
    const dest = path.join('build', file);
    
    if (fs.existsSync(source)) {
      fs.copySync(source, dest);
      console.log(`✅ ${file} copiado`);
    } else {
      console.log(`⚠️ ${file} no encontrado`);
    }
  });

  // Crear package.json mínimo en build/
  const minimalPackage = {
    "name": "pokereport-launcher",
    "version": "1.0.0",
    "main": "electron.js",
    "description": "PokeReport Launcher"
  };
  
  fs.writeFileSync(
    path.join('build', 'package.json'),
    JSON.stringify(minimalPackage, null, 2)
  );
  console.log('✅ package.json creado en build/');

  console.log('✅ Post-build completado exitosamente');
} catch (error) {
  console.error('❌ Error en post-build:', error);
  process.exit(1);
}

