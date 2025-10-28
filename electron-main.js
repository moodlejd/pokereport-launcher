/**
 * Electron Main Process - Versión para producción
 * Este archivo se usa tanto en desarrollo como en producción
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let splashWindow;

/**
 * Crear ventana de splash
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

  const splashPath = isDev
    ? `file://${path.join(__dirname, 'public/splash.html')}`
    : `file://${path.join(__dirname, '../build/splash.html')}`;

  splashWindow.loadURL(splashPath);
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

/**
 * Crear ventana principal
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    frame: false,
    backgroundColor: '#1a1a2e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'app/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    },
    icon: path.join(__dirname, isDev ? 'public/pokeball-icon.png' : '../build/pokeball-icon.png')
  });

  // Cargar React
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log('Loading URL:', startURL);
  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
      mainWindow.focus();
    }, 2000);
  });

  // DevTools solo en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplash();
  setTimeout(createWindow, 500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('get-app-path', async (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('read-config', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  return null;
});

ipcMain.handle('save-config', async (event, config) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Proxy HTTP para evitar CORS
ipcMain.handle('fetch-url', async (event, url) => {
  const { net } = require('electron');
  return new Promise((resolve, reject) => {
    const request = net.request({ url, method: 'GET' });
    request.on('response', (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk.toString(); });
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            resolve({ success: true, data: JSON.parse(data), raw: data });
          } catch (e) {
            resolve({ success: true, data: null, raw: data });
          }
        } else {
          resolve({ success: false, error: `Status ${response.statusCode}` });
        }
      });
    });
    request.on('error', reject);
    request.end();
  });
});

// Descargar imagen como base64
ipcMain.handle('fetch-image-base64', async (event, url) => {
  const { net } = require('electron');
  return new Promise((resolve, reject) => {
    const request = net.request({ url, method: 'GET' });
    request.on('response', (response) => {
      const chunks = [];
      response.on('data', (chunk) => { chunks.push(chunk); });
      response.on('end', () => {
        if (response.statusCode === 200) {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          const mimeType = response.headers['content-type'] || 'image/png';
          resolve({ success: true, dataUrl: `data:${mimeType};base64,${base64}`, size: buffer.length });
        } else {
          resolve({ success: false, error: `Status ${response.statusCode}` });
        }
      });
    });
    request.on('error', reject);
    request.end();
  });
});

console.log('✅ Electron Main Process iniciado');

