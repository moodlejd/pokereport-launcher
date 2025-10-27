# 🎮 PokeReport Launcher - Professional Edition

Launcher profesional para Minecraft PokeReport con instalación **100% automática** y **UI espectacular**.

## ✨ Características

- 🎨 **UI Profesional**: Interfaz hermosa estilo TLauncher con fondo épico
- 📰 **Panel de Noticias**: Actualizaciones y noticias en tiempo real
- 🔐 **Dual Login**: Microsoft (premium) + Offline (gratis)
- 📦 **Instalación automática**: Descarga TODO desde GitHub
- 💾 **Sistema de sesiones**: Login una vez, auto-login siempre
- 🧩 **Fabric 1.21.1**: Pre-instalado
- 📁 **Directorio aislado**: No interfiere con otros launchers
- ⚡ **Setup automático**: 0 configuración manual
- 🎭 **Efectos visuales**: Transparencias, bordes de colores, diseño moderno

## ⚡ Instalación

### Requisitos

- Python 3.8+
- Java 17+ (automáticamente detectado)
- 8 GB RAM recomendado

### Instalar Dependencias

```bash
pip install minecraft-launcher-lib customtkinter Pillow requests cryptography
```

**Para login Microsoft** (opcional):
```bash
pip install msal
```

## 🚀 Uso

### Primera Vez

```bash
# Ejecuta:
iniciar.bat

# O:
python pokereport_launcher.py
```

**El launcher AUTOMÁTICAMENTE**:
1. ✅ Descarga estructura base de Minecraft (versions, libraries, assets, config)
2. ✅ Descarga modpack (mods, datapacks, resourcepacks, shaderpacks)
3. ✅ Extrae e instala todo
4. ✅ Detecta Fabric
5. ✅ ¡Listo para jugar!

**Tiempo**: 10-15 minutos (primera vez)

### Pantalla de Login

Elige tu modo:

**👑 Cuenta Premium** (Microsoft):
- Skin oficial
- Servidores oficiales
- Multijugador completo
- Requiere Minecraft comprado

**🎮 Modo Offline**:
- Sin cuenta necesaria
- Acceso inmediato
- Todo el modpack funciona
- Gratis

### Siguientes Veces

```bash
iniciar.bat
```

**Auto-login automático** ✅
- Recuerda tu sesión
- Directo a jugar
- Sin autenticar de nuevo

## 🎨 Interfaz Profesional Nueva

### Pantalla de Login
- 🖼️ **Fondo épico** con imagen de Minecraft (árboles de cerezo)
- 🎯 **Cards modernas** para Premium y Offline
- 💎 **Bordes de colores** temáticos (dorado/verde)
- ✨ **Logo profesional** estilo AAA
- 📊 **Footer informativo** con características

### Pantalla Principal
- 📰 **Panel lateral de noticias** (estilo TLauncher)
- 👤 **Perfil de usuario** con badge de tipo de cuenta
- ✅ **Estado de instalación** con información técnica
- ⚙️ **Configuración visual** de RAM
- 🎮 **Botón JUGAR gigante** y llamativo
- 📱 **Layout de 2 columnas** profesional

### Pantalla de Instalación
- 🔄 **Barra de progreso moderna** con efectos
- 📊 **Panel de detalles técnicos** en tiempo real
- ⚡ **Velocidad de descarga** mostrada
- 💡 **Consejos útiles** durante instalación

### Efectos Visuales
- ✨ Transparencias en containers
- 🎨 Desenfoque suave en fondo
- 🔲 Bordes de colores temáticos
- 📐 Esquinas redondeadas modernas
- 🎭 Hover effects en botones

## 📦 Archivos Descargados

El launcher descarga desde GitHub Releases:

1. **minecraft.zip** (~1-2 GB):
   - Minecraft 1.21.1
   - Fabric loader
   - Libraries
   - Assets
   - Configs base

2. **pokereport-modpack.mrpack** (~500 MB):
   - 60+ mods
   - Datapacks
   - Resource packs
   - Shader packs

**Total descarga**: ~1.5-2.5 GB

## 📁 Directorio de Instalación

```
C:\Users\[USER]\AppData\Roaming\.pokereport\
├── versions/      # Minecraft + Fabric
├── libraries/     # Librerías
├── assets/        # Assets del juego
├── mods/          # 60+ mods instalados
├── config/        # Configuraciones
├── resourcepacks/ # Texture packs
├── shaderpacks/   # Shaders
└── .session       # Sesión guardada (encriptada)
```

## 🔐 Sistema de Sesiones

- ✅ **Primera vez**: Autentícate una sola vez
- ✅ **Siguientes veces**: Auto-login automático
- 💾 **Sesión encriptada**: AES encryption
- 🔄 **Botón logout**: Cambiar de cuenta cuando quieras

## 🏗️ Arquitectura

```
pokereport_launcher.py (765 líneas)
  ├── Dual authentication (Microsoft + Offline)
  ├── Auto-download system
  ├── Session management
  └── UI profesional

auth_microsoft.py (200 líneas)
  └── Microsoft OAuth 2.0

session_manager.py (120 líneas)
  └── Session cache con encriptación
```

**Total: ~1,085 líneas** - Profesional pero simple ✅

## 🎨 Personalización de la UI

### Cambiar Noticias

Edita el array `NOTICIAS` en `pokereport_launcher.py` (líneas 43-64):

```python
NOTICIAS = [
    {
        "titulo": "🎉 Tu título aquí",
        "descripcion": "Descripción de la noticia o actualización",
        "fecha": "27 Oct 2025"
    },
    # Agrega más noticias...
]
```

### Cambiar Fondo

Reemplaza `background.jpg` con tu propia imagen:
- Resolución recomendada: 1920x1080
- Formato: JPG o PNG
- El launcher la ajusta automáticamente

### Cambiar Colores

Busca y reemplaza estos códigos hexadecimales en `pokereport_launcher.py`:

```python
"#3b82f6"  # Azul primario
"#10b981"  # Verde éxito
"#fbbf24"  # Dorado premium
"#ef4444"  # Rojo error
```

## ⚙️ Configuración Microsoft (Opcional)

Para login premium:

1. Registra app en: https://portal.azure.com/
2. Configura Client ID en `auth_microsoft.py` línea 21
3. `pip install msal`

**Sin configurar**: Modo offline funciona perfecto ✅

## 🆘 Solución de Problemas

### Descarga lenta
- Normal en primera instalación (1.5-2.5 GB)
- Verifica conexión a internet

### Minecraft crashea
- Aumenta RAM a 8 GB
- Actualiza drivers gráficos

### Microsoft no funciona
- Usa modo Offline (funciona igual)
- O configura Azure (ver README)

## 📝 Licencia

MIT License

---

**¡Disfruta PokeReport con instalación automática y UI profesional!** 🎮✨

**Versión: 3.2.0 Professional Edition**  
**UI Renovada**: 27 Octubre 2025  
**Características**: Fondo épico • Panel de noticias • Diseño moderno
