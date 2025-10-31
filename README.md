# 🎮 PokeReport Launcher - Python + React

<div align="center">

**Launcher profesional para el servidor de Minecraft PokeReport**

[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.1-green?style=for-the-badge&logo=minecraft)](https://minecraft.net)
[![Fabric](https://img.shields.io/badge/Fabric-Incluido-blue?style=for-the-badge)](https://fabricmc.net)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)

</div>

---

## ✨ Características

- 🐍 **Backend Python** - Más estable que Electron
- ⚛️ **Frontend React** - Interfaz moderna y hermosa
- 🎨 **CustomSkinLoader** - Skins personalizadas + TLauncher
- 🔐 **Microsoft Auth** - Device Code Flow (como TLauncher)
- 🎮 **Auto-detección** - Username desde TLauncher automáticamente
- 🔊 **Audio garantizado** - Todos los volúmenes al 100%
- 🌍 **Idioma español** - Configurado automáticamente
- 📦 **Modpack .mrpack** - Descarga e instalación automática
- 📤 **Subir skins** - Sistema integrado para skins personalizadas

---

## 🚀 Instalación Rápida

### **Requisitos:**
- Python 3.8+ ([Descargar](https://python.org/downloads))
- Node.js 16+ ([Descargar](https://nodejs.org))
- Java 17+ ([Descargar](https://adoptium.net))

### **Instalar y Ejecutar:**

```bash
# 1. Clonar repositorio
git clone https://github.com/moodlejd/pokereport-launcher.git
cd pokereport-launcher

# 2. Ejecutar launcher
iniciar_simple.bat
```

**¡Eso es todo!** Se abrirá automáticamente en `http://localhost:8000`

---

## 🎯 ¿Cómo Funciona?

### **Flujo:**
```
React Frontend → Python Backend → minecraft-launcher-lib → Minecraft
```

### **Primer inicio:**
1. Ejecuta `iniciar_simple.bat`
2. Instala dependencias Python (solo 2)
3. Compila React
4. Inicia servidor en `http://localhost:8000`
5. **¡Listo para jugar!**

### **Siguientes veces:**
```bash
iniciar_simple.bat
```

---

## 🎨 Sistema de Skins

### **Prioridades para No-Premium:**
1. **TLauncher Auth API** - Tu skin de TLauncher
2. **CustomSkinLoader Local** - Skins subidas
3. **Otras APIs** - Crafatar, MC-Heads, etc.

### **Subir Skin Personalizada:**
1. Click en **📤** en el visor 3D
2. Selecciona tu `.png` de skin
3. Se guarda en `CustomSkinLoader/LocalSkin/skins/`
4. **¡Listo!** Se usa en Minecraft y en el visor

---

## 🔐 Microsoft Authentication

### **Device Code Flow:**
1. Click en **"👑 Login con Microsoft"**
2. Se muestra código (ej: `AB12-CD34`)
3. Se abre microsoft.com/devicelogin
4. Pega el código y autoriza
5. **¡Listo!** Login automático

### **Requisitos:**
- ✅ Minecraft comprado en cuenta Microsoft
- ✅ Azure configurado (ver `AZURE_SETUP_DETALLADO.md`)

**O usa modo Offline** - funciona igual de bien.

---

## 📂 Estructura del Proyecto

```
pokereport-launcher/
├── backend/                    # Python Backend
│   ├── app_simple.py          # Servidor HTTP + APIs
│   ├── requirements_simple.txt # Solo 2 dependencias
│   ├── fix_fabric_json.py     # Arregla JSON de Fabric
│   └── test_minecraft.py      # Diagnóstico
├── src/                       # React Frontend
│   ├── components/            # Componentes UI
│   │   ├── SkinViewerFixed.jsx
│   │   ├── NewsPanel.jsx
│   │   └── ...
│   ├── pages/                 # Páginas
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── Launcher.jsx
│   │   └── Config.jsx
│   └── utils/                 # Utilidades
│       ├── skinAPIFixed.js
│       ├── microsoftAuthDevice.js
│       ├── xboxLiveAuth.js
│       └── minecraftLauncher.js
├── public/                    # Assets
│   ├── background.png
│   ├── pokeball-icon.png
│   └── auth-callback.html
├── iniciar_simple.bat         # Ejecutor principal
├── package.json               # Dependencias React (sin Electron)
└── README.md
```

---

## 🛠️ Desarrollo

### **Modo desarrollo:**

```bash
# Terminal 1: React dev server
npm run dev

# Terminal 2: Python backend
cd backend
python app_simple.py
```

**React**: `http://localhost:5173`
**Python API**: `http://localhost:8000`

---

## 📦 Dependencias

### **Python (2 dependencias):**
```
minecraft-launcher-lib==6.2
requests==2.31.0
```

### **React:**
```
react, react-dom, react-router-dom
framer-motion, skinview3d, three
zustand, axios
```

---

## 🎮 Servidor PokeReport

**IP**: `199.127.60.252:25569`
**Versión**: Minecraft 1.21.1 (Fabric)
**Mods**: +120 (Cobblemon, estructuras, NPCs, etc.)

---

## 🔧 Solución de Problemas

### **Skin no carga:**
1. Click en **📤** para subir skin personalizada
2. O verifica que tengas skin en TLauncher

### **Microsoft Auth falla:**
1. Verifica Azure configurado
2. O usa modo Offline

### **Minecraft no inicia:**
1. Verifica Java instalado: `java -version`
2. Ejecuta `backend/test_minecraft.py` para diagnóstico

---

## 📝 Licencia

MIT License - Ver [LICENSE](./LICENSE)

---

## 👥 Créditos

- **Desarrollador**: Playanza
- **Tecnologías**: Python, React, minecraft-launcher-lib, skinview3d
- **Servidor**: PokeReport Team

---

## 💬 Soporte

- 💬 **Discord**: [https://discord.gg/njfPQMAhQV](https://discord.gg/njfPQMAhQV)
- 🐛 **Issues**: [GitHub Issues](../../issues)

---

<div align="center">

**Hecho con ❤️ para la comunidad de PokeReport**

⭐ **¡Dale una estrella si te gusta!** ⭐

</div>