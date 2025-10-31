@echo off
echo ====================================
echo   ACTUALIZAR REPO GITHUB EXISTENTE
echo ====================================
echo.

echo Este script actualizara el repositorio existente:
echo https://github.com/moodlejd/pokereport-launcher
echo.
echo Reemplazara la version Electron con la nueva version Python
echo.
pause

echo.
echo Paso 1: Clonando repositorio existente...
git clone https://github.com/moodlejd/pokereport-launcher.git temp-repo
cd temp-repo

echo.
echo Paso 2: Eliminando TODO el contenido antiguo...
git rm -rf .
git commit -m "🗑️ Eliminar version antigua de Electron"

echo.
echo Paso 3: Copiando archivos nuevos de Python...
xcopy /E /I /Y ..\backend ..\temp-new\backend
xcopy /E /I /Y ..\src ..\temp-new\src
xcopy /E /I /Y ..\public ..\temp-new\public
copy /Y ..\.gitignore ..\temp-new\
copy /Y ..\package.json ..\temp-new\
copy /Y ..\vite.config.js ..\temp-new\
copy /Y ..\postcss.config.js ..\temp-new\
copy /Y ..\tailwind.config.js ..\temp-new\
copy /Y ..\index.html ..\temp-new\
copy /Y ..\README.md ..\temp-new\
copy /Y ..\LICENSE ..\temp-new\
copy /Y ..\iniciar_simple.bat ..\temp-new\
copy /Y ..\*.md ..\temp-new\

echo.
echo Paso 4: Moviendo archivos al repo...
xcopy /E /I /Y ..\temp-new\* .

echo.
echo Paso 5: Haciendo commit de la nueva version...
git add .
git commit -m "🎮 PokeReport Launcher v2.0 - Migrado a Python + React

CAMBIOS MAYORES:
- ❌ Eliminado Electron (problemas de audio/idioma)
- ✅ Backend Python estable
- ✅ Mismo frontend React hermoso
- ✅ Audio e idioma español garantizados
- ✅ Microsoft Auth con Device Code Flow
- ✅ Sistema de skins mejorado (TLauncher + CustomSkinLoader)
- ✅ Username auto-detectado
- ✅ minecraft-launcher-lib funcionando
- ✅ Subida de skins personalizadas

STACK TECNOLOGICO:
- Python 3.8+ (backend HTTP simple)
- React 18 (frontend)
- minecraft-launcher-lib 6.2
- skinview3d
- CustomSkinLoader

INSTALACION:
Solo 2 dependencias Python (sin compilación)
iniciar_simple.bat - ¡Eso es todo!

MIGRACION COMPLETA:
- Todos los archivos de Electron eliminados
- Misma interfaz React mantenida
- Mejoras significativas en estabilidad
- Sin bugs de assets/rutas de Electron"

echo.
echo Paso 6: Subiendo a GitHub...
git push origin main

echo.
echo ====================================
echo   ACTUALIZACION COMPLETA
echo ====================================
echo.
echo El repositorio ha sido actualizado con la version Python
echo https://github.com/moodlejd/pokereport-launcher
echo.
echo Limpiando archivos temporales...
cd ..
rmdir /s /q temp-repo
rmdir /s /q temp-new

echo.
echo LISTO!
pause
