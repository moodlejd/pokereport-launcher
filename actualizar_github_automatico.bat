@echo off
echo ====================================
echo   ACTUALIZAR GITHUB - VERSION PYTHON
echo ====================================
echo.
echo ATENCION: Esto reemplazara completamente el repositorio existente:
echo https://github.com/moodlejd/pokereport-launcher
echo.
echo La version antigua de Electron sera eliminada.
echo La nueva version Python sera subida.
echo.
echo Presiona Ctrl+C para cancelar
pause

echo.
echo Inicializando Git...
git init

echo.
echo Agregando todos los archivos...
git add .

echo.
echo Creando commit...
git commit -m "🎮 PokeReport Launcher v2.0 - Python + React

MIGRACION COMPLETA DE ELECTRON A PYTHON

ELIMINADO:
- Electron y todas sus dependencias
- electron/main.js, electron/preload.js
- Plugins de Vite para Electron
- node_modules de Electron
- Bugs de audio, idioma, assets

AGREGADO:
- Backend Python simple (app_simple.py)
- Solo 2 dependencias Python
- Microsoft Auth con Device Code Flow
- CustomSkinLoader integrado
- Sistema multi-ubicacion para skins
- Auto-deteccion de username
- Arreglo automatico de Fabric JSON

MEJORADO:
- Audio: TODOS los volumenes al 100%%
- Idioma: Español automatico
- Skins: TLauncher + Custom + Upload
- Estabilidad: Sin crashes
- Instalacion: 3 comandos

FUNCIONALIDADES 100%%:
✅ Login Offline/Premium
✅ Visor 3D de skins
✅ Noticias desde GitHub
✅ Modpack .mrpack completo
✅ Lanzamiento de Minecraft
✅ Username automatico

STACK:
- Python 3.8+ (backend)
- React 18 (frontend)
- minecraft-launcher-lib 6.2
- skinview3d
- CustomSkinLoader

INSTALACION USUARIOS:
git clone https://github.com/moodlejd/pokereport-launcher.git
cd pokereport-launcher
iniciar_simple.bat"

echo.
echo Conectando al repositorio remoto...
git remote add origin https://github.com/moodlejd/pokereport-launcher.git 2>nul
git remote set-url origin https://github.com/moodlejd/pokereport-launcher.git

echo.
echo Estableciendo rama main...
git branch -M main

echo.
echo ====================================
echo   LISTO PARA SUBIR
echo ====================================
echo.
echo El siguiente comando REEMPLAZARA todo el contenido del repo con la version Python.
echo.
echo Comando a ejecutar:
echo git push -f origin main
echo.
echo Presiona Ctrl+C para cancelar o
pause

echo.
echo Subiendo a GitHub...
git push -f origin main

echo.
echo ====================================
echo   ACTUALIZACION COMPLETA
echo ====================================
echo.
echo Repositorio actualizado exitosamente:
echo https://github.com/moodlejd/pokereport-launcher
echo.
echo PROXIMOS PASOS:
echo 1. Ve a GitHub y verifica que todo este correcto
echo 2. Actualiza la descripcion del repo
echo 3. Agrega topics: minecraft, python, react, launcher, cobblemon
echo 4. Crea un nuevo Release v2.0
echo.
pause
