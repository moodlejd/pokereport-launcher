@echo off
echo ====================================
echo   Subir PokeReport Launcher a GitHub
echo ====================================
echo.

echo Paso 1: Limpiando proyecto...
call limpiar_proyecto.bat

echo.
echo Paso 2: Inicializando Git...
git init

echo.
echo Paso 3: Agregando archivos...
git add .

echo.
echo Paso 4: Creando commit...
git commit -m "🎮 PokeReport Launcher v1.0 - Python + React

Launcher completo migrado de Electron a Python

Características:
- Backend Python estable
- Frontend React hermoso  
- Microsoft Auth con Device Code Flow
- Sistema de skins TLauncher + CustomSkinLoader
- Audio e idioma español automático
- Modpack .mrpack completo
- Username auto-detectado
- Subida de skins personalizadas

Stack:
- Python 3.8+ (backend)
- React 18 (frontend)
- minecraft-launcher-lib
- skinview3d
- CustomSkinLoader"

echo.
echo ====================================
echo   AHORA NECESITAS:
echo ====================================
echo.
echo 1. Ir a https://github.com/new
echo 2. Repository name: pokereport-launcher
echo 3. Description: Launcher profesional para PokeReport Minecraft - Python + React
echo 4. Public
echo 5. NO marcar "Add README"
echo 6. Create repository
echo.
echo 7. Ejecutar estos comandos:
echo.
echo    git remote add origin https://github.com/moodlejd/pokereport-launcher.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ====================================
pause
