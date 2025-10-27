@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           🔄 RESTAURAR INSTALACIÓN ANTERIOR 🔄            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script restaura tu instalación anterior de .pokereport
echo.

set POKEREPORT_DIR=%APPDATA%\.pokereport
set BACKUP_DIR=%APPDATA%\.pokereport_backup

if not exist "%BACKUP_DIR%" (
    echo ❌ No hay backup para restaurar
    pause
    exit /b 1
)

echo ✅ Backup encontrado
echo.
echo ¿Restaurar backup? (S/N):
set /p CONFIRM=

if /i not "%CONFIRM%"=="S" (
    echo Cancelado
    pause
    exit /b 0
)

echo.
echo 🔄 Restaurando...

if exist "%POKEREPORT_DIR%" (
    rd /s /q "%POKEREPORT_DIR%"
)

ren "%BACKUP_DIR%" .pokereport

echo ✅ Restauración completada
echo.
pause

