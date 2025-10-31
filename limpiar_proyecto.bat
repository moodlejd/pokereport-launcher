@echo off
echo ====================================
echo   Limpiando Proyecto para GitHub
echo ====================================
echo.

echo Eliminando node_modules...
if exist "node_modules" rmdir /s /q node_modules

echo Eliminando dist...
if exist "dist" rmdir /s /q dist

echo Eliminando cache...
if exist "cache" rmdir /s /q cache

echo Eliminando release...
if exist "release" rmdir /s /q release

echo Eliminando dist-electron...
if exist "dist-electron" rmdir /s /q dist-electron

echo Eliminando venv de Python...
if exist "backend\venv" rmdir /s /q backend\venv

echo Eliminando archivos temporales de Python...
if exist "backend\__pycache__" rmdir /s /q backend\__pycache__
del /q backend\*.pyc 2>nul

echo.
echo ====================================
echo   Proyecto Limpio y Listo
echo ====================================
echo.
echo El proyecto esta listo para subir a GitHub
echo.
echo Proximos pasos:
echo 1. git init
echo 2. git add .
echo 3. git commit -m "Initial commit"
echo 4. git remote add origin https://github.com/TU_USUARIO/pokereport-launcher.git
echo 5. git push -u origin main
echo.
pause
