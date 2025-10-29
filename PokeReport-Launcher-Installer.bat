@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║    🎮 POKEREPORT LAUNCHER - INSTALADOR AUTOMÁTICO 🎮        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este instalador descargará e instalará TODO automáticamente:
echo.
echo   ✅ Descarga el launcher desde GitHub
echo   ✅ Instala Node.js (si no lo tienes)
echo   ✅ Instala dependencias automáticamente
echo   ✅ Crea acceso directo en escritorio
echo   ✅ Abre el launcher
echo.
echo ⏱️  Tiempo estimado: 5-10 minutos (solo primera vez)
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 1: Verificando Node.js...
echo ════════════════════════════════════════════════════════════════
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO está instalado
    echo.
    echo 📥 Descargando Node.js...
    powershell -Command "Start-Process 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -Wait"
    echo.
    echo ✅ Instala Node.js y ejecuta este instalador de nuevo
    pause
    exit /b 1
) else (
    echo ✅ Node.js está instalado
    node --version
    npm --version
)

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 2: Verificando Git...
echo ════════════════════════════════════════════════════════════════
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git NO está instalado
    echo.
    echo 📥 Descargando Git...
    powershell -Command "Start-Process 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -Wait"
    echo.
    echo ✅ Instala Git y ejecuta este instalador de nuevo
    pause
    exit /b 1
) else (
    echo ✅ Git está instalado
    git --version
)

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 3: Descargando launcher desde GitHub...
echo ════════════════════════════════════════════════════════════════
echo.

set "INSTALL_DIR=%LOCALAPPDATA%\PokeReport-Launcher"

if exist "%INSTALL_DIR%" (
    echo ⚠️  El launcher ya existe en: %INSTALL_DIR%
    echo.
    echo ¿Quieres reinstalarlo? (S/N):
    set /p REINSTALL=
    
    if /i "%REINSTALL%"=="S" (
        echo.
        echo 🗑️  Eliminando instalación anterior...
        rd /s /q "%INSTALL_DIR%"
    ) else (
        echo.
        echo ✅ Usando instalación existente
        goto DEPENDENCIES
    )
)

echo.
echo 📥 Clonando repositorio...
echo 🌐 https://github.com/moodlejd/pokereport-launcher.git
echo.

git clone https://github.com/moodlejd/pokereport-launcher.git "%INSTALL_DIR%"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error descargando el repositorio
    echo.
    echo Verifica tu conexión a internet y que el repositorio sea público
    pause
    exit /b 1
)

echo ✅ Launcher descargado correctamente
echo.

:DEPENDENCIES

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 4: Instalando dependencias...
echo ════════════════════════════════════════════════════════════════
echo.
echo ⏳ Esto puede tomar 3-5 minutos...
echo.

cd /d "%INSTALL_DIR%"
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas correctamente
echo.

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 5: Creando acceso directo en escritorio...
echo ════════════════════════════════════════════════════════════════
echo.

set SCRIPT="%TEMP%\CreatePokeReportShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\PokeReport Launcher.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "cmd.exe" >> %SCRIPT%
echo oLink.Arguments = "/c cd /d ""%INSTALL_DIR%"" && npm start" >> %SCRIPT%
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> %SCRIPT%
echo oLink.IconLocation = "%INSTALL_DIR%\pokemon-icon.ico" >> %SCRIPT%
echo oLink.Description = "PokeReport Launcher Profesional" >> %SCRIPT%
echo oLink.WindowStyle = 7 >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo ✅ Acceso directo creado: %USERPROFILE%\Desktop\PokeReport Launcher.lnk
echo.

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ INSTALACIÓN COMPLETA
echo ════════════════════════════════════════════════════════════════
echo.
echo El PokeReport Launcher está listo para usar.
echo.
echo 📁 Ubicación: %INSTALL_DIR%
echo 🎮 Acceso directo: Escritorio
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ¿Quieres abrir el launcher ahora? (S/N):
set /p OPEN=

if /i "%OPEN%"=="S" (
    echo.
    echo 🚀 Abriendo PokeReport Launcher...
    cd /d "%INSTALL_DIR%"
    start "" cmd /c npm start
) else (
    echo.
    echo Puedes abrirlo desde el acceso directo del escritorio
)

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✨ ¡Disfruta PokeReport! ⚡
echo.
pause

