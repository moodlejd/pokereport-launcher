@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           🔧 CONFIGURAR GIT - PASO A PASO 🔧               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este script te ayudará a configurar Git
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 1: Verificar si Git está instalado
echo ════════════════════════════════════════════════════════════════
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git NO está instalado
    echo.
    echo 📥 Descargando Git...
    start https://git-scm.com/download/win
    echo.
    echo Instala Git y ejecuta este script de nuevo
    pause
    exit /b 1
) else (
    echo ✅ Git está instalado
    git --version
)

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 2: Configurar identidad de Git
echo ════════════════════════════════════════════════════════════════
echo.
echo Ingresa tu nombre (ej: Juan Pérez):
set /p GIT_NAME=

echo.
echo Ingresa tu email de GitHub:
set /p GIT_EMAIL=

git config --global user.name "%GIT_NAME%"
git config --global user.email "%GIT_EMAIL%"

echo.
echo ✅ Git configurado correctamente
echo.

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 3: Inicializar repositorio
echo ════════════════════════════════════════════════════════════════
echo.

git init
echo ✅ Repositorio inicializado

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ GIT CONFIGURADO
echo.
echo Ahora necesitas:
echo   1. Crear repositorio en GitHub.com
echo   2. Ejecutar: subir_a_github.bat
echo.
pause

