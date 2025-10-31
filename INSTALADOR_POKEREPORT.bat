@echo off
setlocal EnableDelayedExpansion
title PokeReport Launcher - Instalador Automatico

:: Configuracion
set "REPO_URL=https://github.com/moodlejd/pokereport-launcher.git"
set "INSTALL_DIR=%USERPROFILE%\PokeReport-Launcher"
set "DESKTOP=%USERPROFILE%\Desktop"

color 0B
cls
echo.
echo     ========================================
echo       POKEREPORT LAUNCHER - INSTALADOR
echo     ========================================
echo.
echo     Launcher profesional para Minecraft
echo     Python + React
echo.
echo     Este instalador:
echo     - Descarga el launcher desde GitHub
echo     - Instala Python (si necesario)
echo     - Instala Node.js (si necesario)
echo     - Instala Git (si necesario)
echo     - Configura todo automaticamente
echo     - Crea acceso directo en escritorio
echo.
echo     ========================================
echo.
pause

:: Verificar Git
echo [1/5] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo *** Git no encontrado ***
    echo.
    echo Descargando Git...
    echo Por favor instala Git desde: https://git-scm.com/download/win
    echo.
    echo Presiona cualquier tecla cuando Git este instalado...
    pause
    
    git --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Git aun no esta instalado
        pause
        exit /b 1
    )
)
echo OK - Git instalado

:: Verificar Python
echo [2/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo *** Python no encontrado ***
    echo.
    echo Descargando Python...
    echo Por favor instala Python 3.8+ desde: https://python.org/downloads
    echo IMPORTANTE: Marca "Add Python to PATH" durante instalacion
    echo.
    echo Presiona cualquier tecla cuando Python este instalado...
    pause
    
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Python aun no esta instalado
        pause
        exit /b 1
    )
)
echo OK - Python instalado

:: Verificar Node.js
echo [3/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo *** Node.js no encontrado ***
    echo.
    echo Descargando Node.js...
    echo Por favor instala Node.js desde: https://nodejs.org
    echo.
    echo Presiona cualquier tecla cuando Node.js este instalado...
    pause
    
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Node.js aun no esta instalado
        pause
        exit /b 1
    )
)
echo OK - Node.js instalado

:: Clonar repositorio
echo [4/5] Descargando launcher...
if exist "%INSTALL_DIR%" (
    echo.
    echo El launcher ya esta instalado en:
    echo %INSTALL_DIR%
    echo.
    echo Deseas:
    echo 1 - Actualizar (git pull)
    echo 2 - Reinstalar (eliminar y clonar de nuevo)
    echo 3 - Cancelar
    echo.
    set /p "opcion=Selecciona (1/2/3): "
    
    if "!opcion!"=="1" (
        echo Actualizando...
        cd "%INSTALL_DIR%"
        git pull
    ) else if "!opcion!"=="2" (
        echo Eliminando instalacion anterior...
        rmdir /s /q "%INSTALL_DIR%"
        echo Clonando repositorio...
        git clone %REPO_URL% "%INSTALL_DIR%"
    ) else (
        echo Instalacion cancelada
        pause
        exit /b 0
    )
) else (
    echo Clonando repositorio...
    git clone %REPO_URL% "%INSTALL_DIR%"
)

if %errorlevel% neq 0 (
    echo ERROR: No se pudo descargar el launcher
    pause
    exit /b 1
)

echo OK - Launcher descargado

:: Crear acceso directo
echo [5/5] Creando acceso directo en escritorio...

set "SHORTCUT=%DESKTOP%\PokeReport Launcher.bat"
(
echo @echo off
echo cd "%INSTALL_DIR%"
echo call iniciar_simple.bat
) > "%SHORTCUT%"

echo OK - Acceso directo creado

:: Mensaje final
cls
echo.
echo     ========================================
echo       INSTALACION COMPLETADA
echo     ========================================
echo.
echo     Launcher instalado en:
echo     %INSTALL_DIR%
echo.
echo     Acceso directo creado en escritorio:
echo     PokeReport Launcher.bat
echo.
echo     ========================================
echo       COMO USAR
echo     ========================================
echo.
echo     OPCION 1: Doble click en el acceso directo del escritorio
echo               "PokeReport Launcher.bat"
echo.
echo     OPCION 2: Ejecutar desde la carpeta de instalacion:
echo               %INSTALL_DIR%\iniciar_simple.bat
echo.
echo     ========================================
echo       ACTUALIZACIONES
echo     ========================================
echo.
echo     Para actualizar el launcher a nuevas versiones:
echo     1. Ejecuta este instalador de nuevo
echo     2. Selecciona opcion 1 (Actualizar)
echo.
echo     ========================================
echo.
echo     Deseas iniciar el launcher ahora? (S/N)
set /p "iniciar=Respuesta: "

if /i "!iniciar!"=="S" (
    echo.
    echo Iniciando PokeReport Launcher...
    cd "%INSTALL_DIR%"
    call iniciar_simple.bat
) else (
    echo.
    echo Para iniciar mas tarde, usa el acceso directo del escritorio.
    echo.
    pause
)

exit /b 0
