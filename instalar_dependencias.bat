@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      📦 INSTALADOR DE DEPENDENCIAS - POKEREPORT 📦         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este script instalará todas las librerías necesarias:
echo.
echo   ✅ minecraft-launcher-lib
echo   ✅ customtkinter
echo   ✅ Pillow
echo   ✅ requests
echo   ✅ cryptography
echo   ✅ msal (opcional, para Microsoft login)
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause

echo.
echo 📦 Instalando dependencias...
echo.

python -m pip install --upgrade pip

echo.
echo 1/6 minecraft-launcher-lib...
python -m pip install minecraft-launcher-lib

echo.
echo 2/6 customtkinter...
python -m pip install customtkinter

echo.
echo 3/6 Pillow...
python -m pip install Pillow

echo.
echo 4/6 requests...
python -m pip install requests

echo.
echo 5/6 cryptography...
python -m pip install cryptography

echo.
echo 6/6 msal (opcional)...
python -m pip install msal

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ INSTALACIÓN COMPLETA
echo.
echo Ahora ejecuta:
echo   iniciar.bat
echo.
pause

