@echo off
chcp 65001 >nul
title PokeReport Launcher
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           🎮 POKEREPORT LAUNCHER - INICIANDO 🎮             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⚡ Iniciando launcher...
echo.

cd /d "%~dp0"
call npm start

if errorlevel 1 (
    echo.
    echo ❌ Error al iniciar el launcher
    echo.
    echo Verifica que las dependencias estén instaladas.
    echo Ejecuta: INSTALAR_LAUNCHER.bat
    echo.
    pause
)

