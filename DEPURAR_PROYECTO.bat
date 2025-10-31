@echo off
echo ====================================
echo   DEPURANDO PROYECTO POKEREPORT
echo ====================================
echo.

echo Eliminando archivos de Electron (ya no usados)...
if exist "electron" rmdir /s /q electron
echo - electron/ eliminado

if exist "dist-electron" rmdir /s /q dist-electron
echo - dist-electron/ eliminado

echo.
echo Eliminando carpetas de build/cache...
if exist "node_modules" rmdir /s /q node_modules
echo - node_modules/ eliminado (se reinstala con npm install)

if exist "dist" rmdir /s /q dist
echo - dist/ eliminado (se regenera con npm run build)

if exist "cache" rmdir /s /q cache
echo - cache/ eliminado

if exist "release" rmdir /s /q release
echo - release/ eliminado

if exist "build" rmdir /s /q build
echo - build/ eliminado

echo.
echo Eliminando Python temporal...
if exist "backend\venv" rmdir /s /q backend\venv
echo - backend/venv/ eliminado (se regenera automáticamente)

if exist "backend\__pycache__" rmdir /s /q backend\__pycache__
echo - backend/__pycache__/ eliminado

del /q backend\*.pyc 2>nul
echo - *.pyc eliminados

echo.
echo Eliminando archivos de documentación antigua...
if exist "ESTADO_FINAL_PROYECTO.md" del /q ESTADO_FINAL_PROYECTO.md
if exist "GITHUB_SETUP.md" del /q GITHUB_SETUP.md
if exist "PROYECTO_LIMPIO_LISTO.md" del /q PROYECTO_LIMPIO_LISTO.md
if exist "SOLUCION_DEFINITIVA_EXE.md" del /q SOLUCION_DEFINITIVA_EXE.md
if exist "INSTALL.md" del /q INSTALL.md
if exist "NOTICIAS_CONFIGURACION.md" del /q NOTICIAS_CONFIGURACION.md
echo - Documentación antigua eliminada

echo.
echo Eliminando archivos temporales de configuración...
if exist "news-example.json" del /q news-example.json
echo - news-example.json eliminado

if exist "iniciar_launcher.bat" del /q iniciar_launcher.bat
echo - iniciar_launcher.bat eliminado (usar iniciar_simple.bat)

echo.
echo Eliminando archivos de Python no necesarios...
if exist "backend\app.py" del /q backend\app.py
echo - backend/app.py eliminado (usar app_simple.py)

if exist "backend\requirements.txt" del /q backend\requirements.txt
echo - backend/requirements.txt eliminado (usar requirements_simple.txt)

if exist "backend\test_minecraft.py" del /q backend\test_minecraft.py
if exist "backend\test_simple.py" del /q backend\test_simple.py
if exist "backend\fix_fabric_json.py" del /q backend\fix_fabric_json.py
if exist "backend\fix_aggressive.py" del /q backend\fix_aggressive.py
echo - Scripts de test/fix eliminados (ya no necesarios)

echo.
echo Eliminando archivos de configuración viejos...
if exist "vite.config.js.old" del /q vite.config.js.old
if exist "package.json.backup" del /q package.json.backup
echo - Backups eliminados

echo.
echo ====================================
echo   ARCHIVOS MANTENIDOS (Necesarios)
echo ====================================
echo.
echo BACKEND:
echo - backend/app_simple.py (PRINCIPAL)
echo - backend/requirements_simple.txt
echo.
echo FRONTEND:
echo - src/ (todo React)
echo - public/ (assets)
echo - package.json (sin Electron)
echo - vite.config.js (sin Electron)
echo.
echo EJECUTABLES:
echo - iniciar_simple.bat (PRINCIPAL)
echo - limpiar_proyecto.bat
echo - subir_a_github.bat
echo.
echo DOCUMENTACIÓN:
echo - README.md
echo - PREPARAR_PARA_GITHUB.md
echo - LISTA_FINAL_GITHUB.md
echo - NOTICIAS_GITHUB.md
echo - AZURE_SETUP_DETALLADO.md
echo - RESUMEN_PROYECTO_COMPLETO.md
echo - ARREGLAR_MICROSOFT_AUTH_AHORA.md
echo - LICENSE
echo - .gitignore
echo.
echo ====================================
echo   PROYECTO DEPURADO
echo ====================================
echo.
echo Archivos innecesarios eliminados
echo Proyecto listo para GitHub
echo.
pause
