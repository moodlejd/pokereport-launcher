# 🎮 PokeReport Launcher - Edición Profesional

Launcher moderno y profesional para el servidor de Minecraft PokeReport, construido con **React**, **Electron** y **Three.js**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Minecraft](https://img.shields.io/badge/minecraft-1.21.1-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## ✨ Características

- 🎨 **UI Profesional** - Interfaz hermosa inspirada en Pokémon y Minecraft
- 👤 **Render 3D** - Visualización 3D de tu skin con skinview3d
- 🔐 **Dual Login** - Soporte para cuentas Premium (Microsoft) y Offline
- 🎨 **Sistema de Skins** - Compatible con TLauncher y Mojang/Microsoft
- 📰 **Panel de Noticias** - Noticias en tiempo real con modal expandible
- ⚙️ **Configuración Avanzada** - RAM, Discord RPC
- 🔍 **Buscador de Skins** - Valida skins de cualquier usuario
- 💬 **Discord Rich Presence** - Muestra tu actividad en Discord
- 🔄 **Auto-actualización** - Sistema integrado de actualizaciones
- ✨ **Animaciones** - Transiciones suaves con Framer Motion

---

## 🚀 Inicio Rápido

### **Método 1: Instalador Automático** (Recomendado) ⭐

1. Descarga el proyecto (ZIP o git clone)
2. Ejecuta: **`INSTALAR_LAUNCHER.bat`**
3. Sigue las instrucciones
4. ¡Listo! Se crea acceso directo en escritorio

**Siguientes veces:**
- Doble click en: **`PokeReport Launcher`** (escritorio)

---

### **Método 2: Manual**

```bash
# Instalar Node.js desde: https://nodejs.org

# Clonar repositorio
git clone https://github.com/moodlejd/pokereport-launcher.git
cd pokereport-launcher

# Instalar dependencias
npm install

# Iniciar launcher
npm start
```

---

## 🎯 Uso

### Login
- **🎮 Modo Offline**: Ingresa tu username y juega inmediatamente
- **👑 Cuenta Premium**: Inicia sesión con Microsoft (requiere Minecraft comprado)

### Visor 3D
- Renderiza tu personaje en 3D con tu skin
- Busca skins de cualquier usuario (Premium/Offline toggle)
- Limpia caché con el botón 🗑️

### Panel de Noticias
- Click en cualquier noticia para ver detalles
- Auto-actualización cada 5 minutos
- Links a Discord integrados

### Configuración
- Ajusta RAM asignada (2-16 GB)
- Activa/desactiva Discord RPC
- Selecciona directorio personalizado de Minecraft

---

## 📂 Estructura del Proyecto

```
pokereport-launcher/
├── app/                    # Electron (main process)
│   ├── main.js            # Proceso principal
│   └── preload.js         # Preload script
├── src/                    # React app
│   ├── components/        # Componentes UI
│   ├── pages/             # Páginas
│   ├── store/             # Estado global (Zustand)
│   ├── utils/             # Utilidades
│   └── hooks/             # Custom hooks
├── public/                 # Assets públicos
├── scripts/                # Scripts de build
├── package.json
└── README.md
```

---

## 🔧 Desarrollo

```bash
# Desarrollo (React + Electron)
npm start

# Solo React
npm run start:react

# Solo Electron
npm run start:electron

# Build de producción
npm run build

# Crear ejecutable
npm run build:electron
```

---

## 🎨 APIs de Skins Configuradas

### Para usuarios Offline (TLauncher):
- **TLauncher Direct**: `tlauncher.org/catalog/nickname/download/`
- **TLauncher ElyBy API**: `auth.tlauncher.org/skin/profile/texture/login/`
- **LittleSkin**: `littleskin.cn/csl/`
- **Minotar, MC-Heads, Visage** (fallbacks)

### Para usuarios Premium:
- **Crafatar**: Skins oficiales de Mojang por UUID
- **MC-Heads**: Alternativa confiable
- **Mojang API**: Fuente oficial directa

---

## 🔐 Microsoft OAuth

### Configuración:
1. Registrar app en [Azure Portal](https://portal.azure.com)
2. Client ID ya configurado: `15d53ab4-cfad-4757-88a2-904139d4ca9d`
3. Permisos: `XboxLive.signin`
4. ⚠️ **Nota**: Funciona en .exe, en desarrollo puede tener CORS

Ver `INSTALL.md` para guía completa.

---

## 💬 Discord Rich Presence

Para habilitar:
1. Crear app en [Discord Developers](https://discord.com/developers/applications)
2. Copiar Application ID
3. Actualizar `src/utils/discordRPC.js` línea 9
4. Activar en Configuración del launcher

---

## 🐛 Solución de Problemas

### El launcher no inicia
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Skins no cargan
- Para offline: Verificar username existe en TLauncher
- Para premium: Verificar autenticación Microsoft
- Limpiar caché con botón 🗑️ en el visor

### CORS errors en desarrollo
- Normal en modo desarrollo
- Se resuelve automáticamente en producción (.exe)
- Proxy configurado en `src/setupProxy.js`

---

## 📦 Distribución

### Crear ejecutable:
```bash
npm run build
npm run build:electron
```

**Resultado**: `dist/PokeReport Launcher Setup 1.0.0.exe`

⚠️ **Nota actual**: El .exe tiene problemas de compilación (trabajo en progreso).  
✅ **Recomendado**: Usar `npm start` para desarrollo por ahora.

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 🎮 Créditos

- **Servidor**: PokeReport - 199.127.60.252:25569
- **Minecraft**: 1.21.1 Fabric + 120 mods
- **Desarrollado con**: React, Electron, Three.js, skinview3d
- **Comunidad**: PokeReport Team

---

## 📞 Contacto

- Discord: [discord.gg/pokereport](https://discord.gg/pokereport)
- GitHub: [@moodlejd](https://github.com/moodlejd)

---

**🎉 ¡Atrapa, entrena y juega! ⚡**

*Launcher profesional nivel AAA para la mejor experiencia de PokeReport*
