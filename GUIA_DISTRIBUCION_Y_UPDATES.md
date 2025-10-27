# 📦 Guía de Distribución y Actualizaciones Automáticas

## 🎯 Opción 1: Distribuir como .EXE (Recomendado)

### Paso 1: Crear el .EXE

```bash
# Ejecuta:
crear_exe.bat
```

Esto creará:
```
dist/PokeReport-Launcher.exe  (50-80 MB)
```

### Paso 2: Subir a GitHub Releases

1. **Crea un repositorio en GitHub:**
   - Ve a: https://github.com/new
   - Nombre: `pokereport-launcher`
   - Visibilidad: Public (para que todos descarguen)
   - Crea el repo

2. **Sube el .exe:**
   ```bash
   # En la carpeta del proyecto:
   git init
   git add .
   git commit -m "Launcher v3.4.0"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/pokereport-launcher.git
   git push -u origin main
   ```

3. **Crear Release:**
   - Ve a tu repo en GitHub
   - Click en "Releases" → "Create a new release"
   - Tag: `v3.4.0`
   - Title: `PokeReport Launcher v3.4.0`
   - Description: Copia el changelog de `version.json`
   - Arrastra `PokeReport-Launcher.exe` a "Attach binaries"
   - Click "Publish release"

### Paso 3: Compartir

Comparte este link:
```
https://github.com/TU_USUARIO/pokereport-launcher/releases/latest
```

**Los usuarios:**
1. Descargan `PokeReport-Launcher.exe`
2. Ejecutan
3. ¡Listo! Todo automático

---

## 🔄 Opción 2: Distribuir como Python (Más flexible)

### Archivos a compartir:

```
pokereport-launcher.zip conteniendo:
├── pokereport_launcher.py
├── auth_microsoft.py
├── session_manager.py
├── download_optimizer.py
├── background.jpg
├── fondo2.png
├── iniciar.bat
├── instalar_dependencias.bat
├── requirements.txt
├── README.md
└── LEEME.txt
```

### Los usuarios:
1. Extraen el ZIP
2. Ejecutan `instalar_dependencias.bat`
3. Ejecutan `iniciar.bat`
4. ¡Funciona!

---

## ⚡ Sistema de Actualizaciones Automáticas

### Configuración Inicial

1. **Edita `updater.py` línea 14:**
```python
self.version_url = "https://raw.githubusercontent.com/TU_USUARIO/pokereport-launcher/main/version.json"
```

2. **Edita `version.json` línea 3:**
```json
"download_url": "https://github.com/TU_USUARIO/pokereport-launcher/releases/latest/download/PokeReport-Launcher.exe"
```

3. **Sube `version.json` a tu repo** (rama main)

### Integrar al Launcher

En `pokereport_launcher.py`, después de línea 40 agrega:

```python
# Verificar actualizaciones
from updater import Updater
CURRENT_VERSION = "3.4.0"
```

Y en `__init__` del launcher:

```python
# Verificar updates
try:
    updater = Updater(CURRENT_VERSION)
    update_info = updater.check_update()
    
    if update_info and update_info['update_available']:
        result = messagebox.askyesno(
            "Actualización Disponible",
            f"🆕 Nueva versión: {update_info['latest_version']}\n\n"
            f"Novedades:\n" + "\n".join(update_info['changelog']) + "\n\n"
            f"¿Descargar ahora?"
        )
        if result:
            import webbrowser
            webbrowser.open(update_info['download_url'])
except:
    pass  # No crítico si falla
```

---

## 🌐 Dónde Alojar los Archivos

### GitHub Releases (GRATIS y Recomendado)

**Ventajas:**
- ✅ Gratis
- ✅ Ilimitado ancho de banda
- ✅ CDN rápido global
- ✅ Control de versiones
- ✅ Changelog integrado

**Qué subir:**

1. **Rama Main:**
   - Código fuente completo
   - `version.json` ← **IMPORTANTE** (para verificar updates)
   - README.md
   - requirements.txt

2. **Releases (Binarios):**
   - `PokeReport-Launcher.exe` (el .exe)
   - `minecraft.zip` (1.7 GB)
   - `pokereport-modpack.mrpack` (500 MB)

**URLs resultantes:**
```
Launcher:
https://github.com/TU_USUARIO/pokereport-launcher/releases/latest/download/PokeReport-Launcher.exe

Minecraft:
https://github.com/TU_USUARIO/pokereport-launcher/releases/download/v3.4.0/minecraft.zip

Modpack:
https://github.com/TU_USUARIO/pokereport-launcher/releases/download/v3.4.0/pokereport-modpack.mrpack
```

---

## 🔄 Proceso de Actualización

### Cuando hagas cambios:

1. **Modifica el código**
2. **Actualiza versión:**
   - En `version.json`: `"version": "3.5.0"`
   - En `pokereport_launcher.py`: `CURRENT_VERSION = "3.5.0"`

3. **Actualiza changelog** en `version.json`

4. **Crea nuevo .exe:**
   ```bash
   crear_exe.bat
   ```

5. **Sube a GitHub:**
   ```bash
   git add .
   git commit -m "v3.5.0 - Nuevas mejoras"
   git push
   ```

6. **Crea nuevo Release:**
   - GitHub → Releases → New release
   - Tag: `v3.5.0`
   - Sube el nuevo .exe
   - Publish

7. **¡Listo!** Los usuarios recibirán notificación de update

---

## 🎯 Alternativas a GitHub

### Opción 2: Google Drive
- Sube el .exe
- Comparte link público
- **Límite:** Cuota de descargas diarias

### Opción 3: MediaFire
- Gratis hasta 10 GB
- Sin límite de descargas
- **Contras:** Ads para usuarios

### Opción 4: Servidor propio
- Control total
- Sin límites
- **Costo:** Hosting mensual

---

## 📊 Comparación

| Opción | Costo | Límites | Velocidad | Recomendado |
|--------|-------|---------|-----------|-------------|
| **GitHub Releases** | 🆓 | ∞ | ⚡⚡⚡ | ✅ **SÍ** |
| Google Drive | 🆓 | ~100 desc/día | ⚡⚡ | ⚠️ |
| MediaFire | 🆓 | ∞ | ⚡ | ⚠️ |
| Servidor Propio | 💰 | ∞ | ⚡⚡⚡ | Solo si tienes |

---

## 🚀 Distribución Recomendada

### Para empezar (FÁCIL):

1. **Crea repo en GitHub**
2. **Sube todo el código**
3. **Crea Release con el .exe**
4. **Comparte el link de GitHub**

### Link de descarga:
```
https://github.com/TU_USUARIO/pokereport-launcher/releases/latest
```

**Los usuarios:**
1. Click en el link
2. Descargan .exe
3. Ejecutan
4. ¡Funciona!

---

## 📝 Resumen Rápido

### Para crear .exe:
```bash
crear_exe.bat
```

### Para publicar:
1. Sube código a GitHub
2. Crea Release
3. Adjunta .exe
4. Comparte link

### Para actualizar:
1. Modifica código
2. Actualiza version.json
3. Crea nuevo .exe
4. Crea nuevo Release
5. Los usuarios ven notificación automática

---

**¿Quieres que te ayude a configurar el repo en GitHub o prefieres crear el .exe primero?** 🎯

