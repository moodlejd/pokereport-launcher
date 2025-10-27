# 🎮 PokeReport Launcher - Professional Edition v3.4

Launcher profesional para Minecraft PokeReport con **instalación 100% automática** y **UI espectacular estilo Minecraft**.

## ✨ Características

- 🎨 **UI Profesional** - Diseño minimalista con fondos espectaculares
- 🖼️ **Multi-Background** - Fondos diferentes para cada pantalla
- 📰 **Panel de Noticias** - Sistema de noticias integrado
- 🔐 **Dual Login** - Microsoft (premium) + Cuenta No-Premium
- 📦 **Instalación automática** - Descarga TODO desde GitHub
- 💾 **Sistema de sesiones** - Login una vez, auto-login siempre
- 🧩 **Fabric 1.21.1** - Pre-instalado automáticamente
- 📁 **Directorio aislado** - No interfiere con otros launchers
- ⚡ **Descarga robusta** - 3 reintentos automáticos, validación completa

## 🖼️ Fondos Personalizados

### Pantalla de Login
- **background.jpg** - Imagen con logo integrado
- Fondo al 100% de brillo y saturación

### Pantalla Principal  
- **fondo2.png** - Fondo épico para juego
- Cards transparentes sobre el fondo
- 95% del fondo visible

## ⚡ Instalación

### Requisitos
- Python 3.8+ (NO usar versión de Microsoft Store)
- Java 17+
- 8 GB RAM recomendado

### Instalar Dependencias

```bash
pip install -r requirements.txt
```

O ejecuta:
```bash
instalar_dependencias.bat
```

**Para login Microsoft** (opcional):
```bash
pip install msal
```

## 🚀 Uso

### Primera Vez

```bash
iniciar.bat
```

**El launcher automáticamente:**
1. ✅ Crea carpeta `.pokereport` en AppData\Roaming
2. ✅ Descarga minecraft.zip (1752 MB) desde GitHub
3. ✅ Extrae e instala Minecraft base
4. ✅ Instala Fabric 1.21.1
5. ✅ Descarga e instala modpack (60+ mods)
6. ✅ ¡Listo para jugar!

**Tiempo**: 10-15 minutos (primera vez)

### Siguientes Veces

**Auto-login automático** ✅
- Recuerda tu sesión
- Directo a jugar
- Sin autenticar de nuevo

## 📦 Archivos del Proyecto

### Código Principal (4 archivos):
- `pokereport_launcher.py` - Launcher principal (1170 líneas)
- `auth_microsoft.py` - Autenticación Microsoft
- `session_manager.py` - Gestión de sesiones
- `download_optimizer.py` - Sistema de descarga robusto

### Recursos Visuales (2 archivos):
- `background.jpg` - Fondo pantalla de login
- `fondo2.png` - Fondo pantalla principal

### Ejecución:
- `iniciar.bat` - Ejecutar launcher
- `probar_desde_cero.bat` - Probar instalación limpia
- `restaurar_backup.bat` - Restaurar instalación anterior

### Configuración:
- `requirements.txt` - Dependencias Python
- `instalar_dependencias.bat` - Instalador automático

### Documentación:
- `README.md` - Documentación principal
- `LEEME.txt` - Guía en español
- `LICENSE` - Licencia MIT

## 🎨 Características de la UI

### Pantalla de Login
- Logo integrado en background
- Cards transparentes con solo bordes
- Colores Minecraft (dorado/verde)
- Fondo 100% visible

### Pantalla Principal
- Fondo épico completamente visible
- Noticias flotando a la derecha
- Botón PLAY centrado
- RAM configurable abajo
- Diseño minimalista

## 🔧 Sistema de Descarga Robusto

- ✅ **3 reintentos automáticos** si falla
- ✅ **Validación de archivos** (tamaño, integridad)
- ✅ **Velocidad en tiempo real** (MB/s)
- ✅ **Mensajes de error claros** con soluciones
- ✅ **Compatible con GitHub Releases**

## 🔐 Sistema de Sesiones

- ✅ Primera vez: Autentícate una sola vez
- ✅ Siguientes veces: Auto-login automático
- ✅ Sesión encriptada: AES encryption
- ✅ Botón logout: Cambiar de cuenta cuando quieras

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

## 🎨 Personalización

### Cambiar Fondos
Reemplaza los archivos:
- `background.jpg` (1100x700 recomendado)
- `fondo2.png` (1100x700 recomendado)

### Cambiar Noticias
Edita el array `NOTICIAS` en `pokereport_launcher.py` (líneas 42-63):

```python
NOTICIAS = [
    {
        "titulo": "🎉 Tu título aquí",
        "descripcion": "Descripción de la noticia",
        "fecha": "27 Oct 2025"
    }
]
```

### Cambiar Colores
Busca y reemplaza en `pokereport_launcher.py`:
```python
"#7ED321"  # Verde Minecraft
"#FFD700"  # Dorado
"#228B22"  # Verde bosque
```

## 🆘 Solución de Problemas

### Python de Microsoft Store
Si las carpetas no se crean o desaparecen:
1. Desinstala Python de Microsoft Store
2. Descarga Python de https://www.python.org/
3. Instala con "Add to PATH" ✅

### Descarga lenta
- Normal en primera instalación (1.7 GB)
- El sistema reintenta automáticamente
- Verifica conexión a internet

### Minecraft crashea
- Aumenta RAM a 8 GB
- Actualiza drivers gráficos
- Actualiza Java

## 📝 Licencia

MIT License

---

**¡Disfruta PokeReport con launcher profesional nivel AAA!** 🎮✨

**Versión**: 3.4.0 - Minecraft Style Edition  
**UI**: Minimalista con fondos espectaculares  
**Estado**: ✅ **LISTO PARA DISTRIBUIR**

