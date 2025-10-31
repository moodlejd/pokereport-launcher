@echo off
echo ====================================
echo   PokeReport Launcher - Python Simple
echo ====================================
echo.

:: Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado
    echo.
    echo Por favor instala Python 3.8+ desde:
    echo https://python.org/downloads
    pause
    exit /b 1
)

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado
    echo.
    echo Por favor instala Node.js desde:
    echo https://nodejs.org
    pause
    exit /b 1
)

:: Instalar dependencias Python (solo 2, sin compilación)
echo 📦 Instalando dependencias Python...
cd backend
pip install -r requirements_simple.txt
cd ..

:: Instalar dependencias React si no existen
if not exist "node_modules\" (
    echo 📦 Instalando dependencias React...
    npm install
)

:: Compilar React para producción
echo 🔧 Compilando React frontend...
call npm run build

echo.
echo 🚀 Iniciando PokeReport Launcher...
echo 🌐 Se abrirá en http://localhost:8000
echo.

:: Ejecutar servidor Python simple
cd backend
python app_simple.py

pause
