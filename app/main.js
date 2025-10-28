/**
 * Electron Main Process
 * Proceso principal de Electron que gestiona las ventanas y eventos del sistema
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let splashWindow;

// Configuración de auto-actualización
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

/**
 * Crear ventana de splash inicial
 */
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Cargar splash desde public en desarrollo
  const splashPath = process.env.NODE_ENV === 'development'
    ? `file://${path.join(__dirname, '../public/splash.html')}`
    : `file://${path.join(__dirname, '../build/splash.html')}`;
  
  splashWindow.loadURL(splashPath);

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

/**
 * Crear ventana principal del launcher
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    frame: false, // Sin barra de título (custom titlebar)
    backgroundColor: '#1a1a2e',
    show: false, // No mostrar hasta que esté listo
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../src/assets/icons/icon.png')
  });

  // Cargar la aplicación React (esperar a que esté lista)
  const startURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startURL);

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
      mainWindow.focus();
    }, 2000); // Aumentado a 2 segundos para mejor transición
  });

  // DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Inicialización de la app
 */
app.whenReady().then(() => {
  createSplash();
  setTimeout(createWindow, 500);
  
  // Verificar actualizaciones
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdates();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Cerrar app cuando todas las ventanas están cerradas
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * IPC Handlers - Comunicación con el renderer
 */

// Control de ventana
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Obtener rutas del sistema
ipcMain.handle('get-app-path', async (event, name) => {
  return app.getPath(name);
});

// Leer archivo de configuración
ipcMain.handle('read-config', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
});

// Guardar configuración
ipcMain.handle('save-config', async (event, config) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

// Seleccionar directorio
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Proxy para peticiones HTTP (evita CORS)
ipcMain.handle('fetch-url', async (event, url) => {
  const { net } = require('electron');
  
  return new Promise((resolve, reject) => {
    const request = net.request({
      url: url,
      method: 'GET'
    });

    request.on('response', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk.toString();
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            // Intentar parsear como JSON
            const json = JSON.parse(data);
            resolve({ success: true, data: json, raw: data });
          } catch (e) {
            // Si no es JSON, devolver raw
            resolve({ success: true, data: null, raw: data });
          }
        } else {
          resolve({ success: false, error: `Status ${response.statusCode}` });
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
});

// Descargar imagen como base64 (para skinview3d sin CORS)
ipcMain.handle('fetch-image-base64', async (event, url) => {
  const { net } = require('electron');
  
  return new Promise((resolve, reject) => {
    const request = net.request({
      url: url,
      method: 'GET'
    });

    request.on('response', (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          const mimeType = response.headers['content-type'] || 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64}`;
          
          resolve({ success: true, dataUrl, size: buffer.length });
        } else {
          resolve({ success: false, error: `Status ${response.statusCode}` });
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
});

// Descargar archivo con progreso
ipcMain.handle('download-file', async (event, { url, destination }) => {
  const { net } = require('electron');
  const request = net.request(url);
  
  return new Promise((resolve, reject) => {
    request.on('response', (response) => {
      const totalBytes = parseInt(response.headers['content-length'] || '0');
      let downloadedBytes = 0;

      const file = fs.createWriteStream(destination);
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        file.write(chunk);
        
        // Enviar progreso al renderer
        const progress = (downloadedBytes / totalBytes) * 100;
        mainWindow.webContents.send('download-progress', {
          url,
          progress,
          downloadedBytes,
          totalBytes
        });
      });

      response.on('end', () => {
        file.end();
        resolve({ success: true, path: destination });
      });

      response.on('error', (error) => {
        file.end();
        reject(error);
      });
    });

    request.on('error', reject);
    request.end();
  });
});

// Auto-actualización eventos
autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-downloaded', info);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('update-download-progress', progressObj);
});

// Instalar actualización
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

console.log('✅ Electron Main Process iniciado');

