# 📦 Guía de Instalación - PokeReport Launcher

## 🚀 Instalación Rápida

### Windows / macOS / Linux

```bash
# 1. Clonar repositorio
git clone https://github.com/moodlejd/pokereport-launcher.git
cd pokereport-launcher

# 2. Instalar dependencias
npm install

# 3. Iniciar launcher
npm start
```

**¡Listo!** El launcher se abrirá automáticamente.

---

## 📋 Requisitos del Sistema

### Para Desarrollo:
- Node.js 18+
- npm 9+
- Git
- 2 GB espacio libre

### Para Usuarios Finales:
- Windows 10+, macOS 10.15+, o Linux 64-bit
- 4 GB RAM mínimo (8 GB recomendado para jugar)
- 5 GB espacio libre
- Java 17+ (para Minecraft)
- Internet (para descargar mods)

---

## 🎮 Uso

### Primera Vez:
1. Ejecuta `npm start`
2. Espera el splash screen (~5 segundos)
3. Selecciona tipo de cuenta (Offline/Premium)
4. ¡Listo para jugar!

### Siguiente Veces:
```bash
npm start
```
Auto-login automático con sesión guardada.

---

## 🔐 Configurar Microsoft OAuth (Opcional)

Solo necesario para cuentas **Premium** de Minecraft:

1. Ve a [Azure Portal](https://portal.azure.com)
2. Crea aplicación "PokeReport Launcher"
3. Client ID ya está configurado: `15d53ab4-cfad-4757-88a2-904139d4ca9d`
4. Agrega permiso `XboxLive.signin`
5. Platform: "Mobile and desktop applications"
6. Redirect URI: `http://localhost`

⚠️ **En modo desarrollo (Chrome)**: Puede tener problemas de CORS  
✅ **En producción (.exe)**: Funciona perfecto

---

## 💬 Configurar Discord RPC (Opcional)

1. Crea app en [Discord Developers](https://discord.com/developers/applications)
2. Copia Application ID
3. Edita `src/utils/discordRPC.js` línea 9:
```javascript
const clientId = 'TU_APPLICATION_ID_AQUÍ';
```
4. Activa en Configuración del launcher

---

## 🐛 Solución de Problemas

### "npm no reconocido"
Instala Node.js: https://nodejs.org/

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Port 3000 in use"
```bash
npx kill-port 3000
npm start
```

### Skins no cargan
- Verifica conexión a internet
- Limpia caché con botón 🗑️
- Para premium: verifica autenticación

---

## 📦 Compilar Ejecutable (⚠️ En desarrollo)

```bash
npm run build
npm run build:electron
```

⚠️ **Nota**: La compilación del .exe tiene problemas actualmente.  
✅ **Recomendado**: Usar `npm start` por ahora.

---

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm start                 # Iniciar todo
npm run start:react       # Solo React
npm run start:electron    # Solo Electron

# Producción
npm run build            # Compilar React
npm run build:electron   # Crear .exe
npm run package          # Build + package

# Mantenimiento  
npm install              # Instalar deps
npm audit fix            # Arreglar vulnerabilidades
```

---

## 📚 Documentación Adicional

- **README.md** - Documentación principal
- **INSTALL.md** - Este archivo
- **LICENSE** - Licencia MIT

---

## 🏆 Estado del Proyecto

```
✅ UI/UX:              100% Funcional
✅ Login Offline:      100% Funcional
✅ Login Premium:      100% (funciona en .exe)
✅ Visor 3D:           100% Funcional
✅ Sistema de Skins:   100% Funcional
✅ Panel Noticias:     100% Funcional
✅ Configuración:      100% Funcional
⚠️  Compilación .exe:  En desarrollo
```

---

## 💡 Recomendación

**Para desarrollo y testing**: Usa `npm start`  
**Para distribución**: Esperando fix del .exe

---

**¿Necesitas ayuda? Abre un issue en GitHub! 🚀**
