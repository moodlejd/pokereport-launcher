"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Control de ventana
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  // Sistema de archivos
  getAppPath: (name) => ipcRenderer.invoke("get-app-path", name),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  // Configuración
  readConfig: () => ipcRenderer.invoke("read-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
  // Peticiones HTTP (proxy para evitar CORS)
  fetchUrl: (url) => ipcRenderer.invoke("fetch-url", url),
  // Descargar imagen como base64 (para evitar CORS en skinview3d)
  fetchImageAsBase64: (url) => ipcRenderer.invoke("fetch-image-base64", url),
  // Descargas
  downloadFile: (url, destination) => ipcRenderer.invoke("download-file", { url, destination }),
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (event, data) => callback(data));
  },
  // Actualizaciones
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", (event, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", (event, info) => callback(info));
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on(
      "update-download-progress",
      (event, progress) => callback(progress)
    );
  },
  installUpdate: () => ipcRenderer.send("install-update"),
  // Info del sistema
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
console.log("✅ Preload script cargado");
