# 🎮 PokeReport Launcher - Python + React

**Launcher migrado de Electron a Python con la misma interfaz React**

## ✨ ¿Qué cambió?

- ❌ **Eliminado**: Electron (main.js, preload.js, todas las dependencias)
- ✅ **Agregado**: Backend Python con FastAPI
- ✅ **Mantenido**: Toda la interfaz React EXACTAMENTE igual
- ✅ **Mejorado**: Más estable, sin bugs de Electron

## 🚀 Instalación y Uso

### Método Rápido:
```bash
iniciar_launcher.bat
```

### Método Manual:
```bash
# 1. Instalar dependencias Python
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 2. Instalar dependencias React
npm install

# 3. Compilar React
npm run build

# 4. Iniciar backend Python
npm run start:python
```

Se abrirá en: `http://localhost:8000`

## 🔧 ¿Cómo funciona ahora?

### Antes (Electron):
```
React Frontend ↔ IPC ↔ Electron Main ↔ Minecraft
```

### Ahora (Python):
```
React Frontend ↔ HTTP/WebSocket ↔ Python FastAPI ↔ Minecraft
```

## 📁 Nueva Estructura

```
pokereport-launcher/
├── backend/                    # ← NUEVO: Python Backend
│   ├── app.py                 # ← Reemplaza electron/main.js
│   ├── requirements.txt       # ← Dependencias Python
│   └── venv/                  # ← Entorno virtual
├── src/                       # ← IGUAL: React Frontend
│   ├── components/            # ← Sin cambios
│   ├── pages/                 # ← Sin cambios
│   ├── utils/                 # ← Adaptado para APIs
│   └── store/                 # ← Sin cambios
├── public/                    # ← Sin cambios
├── dist/                      # ← Build de React
├── package.json               # ← Limpio (sin Electron)
└── iniciar_launcher.bat       # ← NUEVO: Ejecutor
```

## 🔄 APIs Migradas

Todas las funciones de `electron/main.js` ahora son APIs de Python:

| Electron IPC | Python API | Función |
|-------------|------------|---------|
| `launch-minecraft` | `POST /api/launch-minecraft` | Instalar modpack |
| `start-minecraft-game` | `POST /api/start-minecraft-game` | Lanzar juego |
| `read-config` | `GET /api/read-config` | Leer configuración |
| `save-config` | `POST /api/save-config` | Guardar configuración |
| `fetch-url` | `GET /api/fetch-url/{url}` | Proxy CORS |

## ✅ Funcionalidades Mantenidas

- ✅ **Misma interfaz React** (Login, Home, Launcher, Config)
- ✅ **Mismo sistema de autenticación** (Microsoft + Offline)
- ✅ **Mismo visor 3D de skins** (skinview3d)
- ✅ **Mismo sistema de noticias** (GitHub JSON)
- ✅ **Misma detección de username** (TLauncher + Launcher oficial)
- ✅ **Misma configuración de audio e idioma** (options.txt)
- ✅ **Misma descarga y extracción de .mrpack**
- ✅ **Mismo directorio** (`C:\Users\{usuario}\AppData\Roaming\.pokereport`)

## 🎯 Ventajas sobre Electron

- ✅ **Más estable** - Python maneja mejor los procesos
- ✅ **Sin bugs de assets** - No hay problemas de rutas
- ✅ **Mejor debugging** - Logs más claros
- ✅ **Menor consumo** - Menos overhead que Electron
- ✅ **Más fácil de mantener** - Un solo lenguaje backend
- ✅ **Funciona garantizado** - Sin problemas de compilación

## 🔊 Audio e Idioma

El sistema Python crea automáticamente `options.txt` con:
- ✅ **Idioma español** (`lang:es_es`)
- ✅ **Audio al 100%** (todos los `soundCategory_*:1.0`)
- ✅ **Configuración completa** de gráficos

## 👤 Username Automático

Detecta automáticamente desde:
1. TLauncher (`TlauncherProfiles.json`)
2. Launcher oficial (`launcher_profiles.json`)
3. Fallback a nombre aleatorio

## 🎮 Uso

1. Ejecuta `iniciar_launcher.bat`
2. Se abre en tu navegador
3. **Misma interfaz que antes**
4. Login offline/premium
5. Instalar/Lanzar
6. ¡Jugar con audio e idioma español!

## 🔧 Desarrollo

```bash
# Terminal 1: React dev server
npm run dev

# Terminal 2: Python backend
cd backend
venv\Scripts\activate
python app.py
```

React dev: `http://localhost:5173`
Python API: `http://localhost:8000`

## ✅ Estado

- ✅ **Migración completa** de Electron a Python
- ✅ **Interfaz idéntica** mantenida
- ✅ **Todas las funcionalidades** portadas
- ✅ **Audio e idioma** solucionado definitivamente
- ✅ **Username estable** garantizado

**¡El launcher ahora SÍ funciona al 100%!**
