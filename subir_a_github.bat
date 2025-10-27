@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         🚀 SUBIR PROYECTO A GITHUB - AUTOMÁTICO 🚀         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Usuario: moodlejd
echo Repo: pokereport-launcher
echo.
echo ANTES DE CONTINUAR:
echo.
echo ¿Ya creaste el repositorio "pokereport-launcher" en GitHub?
echo.
echo Si NO:
echo   1. Ve a: https://github.com/new
echo   2. Repository name: pokereport-launcher
echo   3. Public (para que todos descarguen)
echo   4. NO marques "Add README" (ya lo tienes)
echo   5. Click "Create repository"
echo.
echo Si SÍ:
echo   Presiona cualquier tecla para continuar
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo SUBIENDO A GITHUB...
echo ════════════════════════════════════════════════════════════════
echo.

echo PASO 1: Inicializando repositorio...
git init

echo.
echo PASO 2: Agregando archivos...
git add .

echo.
echo PASO 3: Creando commit...
git commit -m "Launcher v3.4.0 - UI Profesional Minecraft Style"

echo.
echo PASO 4: Configurando remote...
git branch -M main
git remote add origin https://github.com/moodlejd/pokereport-launcher.git

echo.
echo PASO 5: Subiendo a GitHub...
git push -u origin main

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ CÓDIGO SUBIDO A GITHUB
echo.
echo Tu repositorio:
echo   https://github.com/moodlejd/pokereport-launcher
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo SIGUIENTE PASO: CREAR RELEASE
echo.
echo 1. Ve a: https://github.com/moodlejd/pokereport-launcher/releases/new
echo.
echo 2. Completa:
echo    Tag: v3.4.0
echo    Title: PokeReport Launcher v3.4.0
echo    Description: (Copia el changelog de version.json)
echo.
echo 3. Arrastra el archivo .exe de la carpeta dist/
echo.
echo 4. Click "Publish release"
echo.
echo ¡LISTO! Tu launcher estará disponible para descargar
echo.
pause

