@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        🎮 POKEREPORT LAUNCHER - AUTOMÁTICO 🎮             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este launcher es COMPLETAMENTE AUTOMÁTICO:
echo.
echo ✅ Instala Fabric 1.21.1 automáticamente
echo ✅ Descarga el modpack PokeReport automáticamente
echo ✅ Usa directorio personalizado: .pokereport
echo ✅ Todo listo en una sola ejecución
echo.
echo Primera vez: 15-20 minutos (descarga todo)
echo Veces siguientes: Instantáneo
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

python pokereport_launcher.py

if errorlevel 1 pause
