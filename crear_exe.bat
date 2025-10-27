@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      📦 CREAR EJECUTABLE .EXE DEL LAUNCHER 📦              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este script creará un archivo .exe del launcher
echo.
echo Requisitos:
echo   • PyInstaller instalado
echo.
pause

echo.
echo 📦 Instalando PyInstaller...
python -m pip install pyinstaller

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 🔨 Creando ejecutable...
echo.

pyinstaller --onefile --windowed ^
--name "PokeReport-Launcher" ^
--add-data "background.jpg;." ^
--add-data "fondo2.png;." ^
--add-data "auth_microsoft.py;." ^
--add-data "session_manager.py;." ^
--add-data "download_optimizer.py;." ^
--hidden-import=minecraft_launcher_lib ^
--hidden-import=customtkinter ^
--hidden-import=PIL ^
--hidden-import=requests ^
--hidden-import=cryptography ^
--hidden-import=msal ^
--clean ^
pokereport_launcher.py

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ EJECUTABLE CREADO
echo.
echo Ubicación:
echo   dist\PokeReport-Launcher.exe
echo.
echo Tamaño: ~50-80 MB (incluye todo)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 📦 PARA DISTRIBUIR:
echo.
echo Comparte SOLO el archivo:
echo   PokeReport-Launcher.exe
echo.
echo Los usuarios solo ejecutan el .exe y listo!
echo.
pause

