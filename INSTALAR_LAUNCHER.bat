@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      🎮 POKEREPORT LAUNCHER - INSTALADOR AUTOMÁTICO 🎮      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este instalador:
echo   ✅ Verifica Node.js
echo   ✅ Instala dependencias
echo   ✅ Crea acceso directo
echo   ✅ Abre el launcher
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
    echo 📥 Abriendo página de descarga...
    start https://nodejs.org/
    echo.
    echo Instala Node.js y ejecuta este instalador de nuevo
    pause
    exit /b 1
) else (
    echo ✅ Node.js está instalado
    node --version
)

echo.
echo ════════════════════════════════════════════════════════════════
echo PASO 2: Instalando dependencias...
echo ════════════════════════════════════════════════════════════════
echo.
echo ⏳ Esto puede tomar 2-5 minutos...
echo.

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
echo PASO 3: Creando acceso directo...
echo ════════════════════════════════════════════════════════════════
echo.

set SCRIPT="%TEMP%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\PokeReport Launcher.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%CD%\INICIAR_LAUNCHER.bat" >> %SCRIPT%
echo oLink.WorkingDirectory = "%CD%" >> %SCRIPT%
echo oLink.IconLocation = "%CD%\pokemon-icon.ico" >> %SCRIPT%
echo oLink.Description = "PokeReport Launcher Profesional" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo ✅ Acceso directo creado en el escritorio
echo.

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ INSTALACIÓN COMPLETA
echo ════════════════════════════════════════════════════════════════
echo.
echo El launcher está listo para usar.
echo.
echo Encontrarás el acceso directo en tu escritorio:
echo   🎮 PokeReport Launcher
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ¿Quieres abrir el launcher ahora? (S/N):
set /p OPEN=

if /i "%OPEN%"=="S" (
    echo.
    echo 🚀 Abriendo launcher...
    start "" "%CD%\INICIAR_LAUNCHER.bat"
) else (
    echo.
    echo Puedes abrirlo cuando quieras desde el acceso directo del escritorio
)

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ ¡Listo para jugar PokeReport!
echo.
pause

