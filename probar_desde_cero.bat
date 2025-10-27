@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🧪 PROBAR LAUNCHER DESDE CERO 🧪                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script:
echo   1. Renombra .pokereport a .pokereport_backup
echo   2. Lanza el launcher
echo   3. El launcher descargará TODO desde GitHub
echo.
echo ⚠️  Tu .minecraft de TLauncher NO se toca
echo ✅ Solo afecta .pokereport (launcher)
echo.
echo ════════════════════════════════════════════════════════════
echo.

set POKEREPORT_DIR=%APPDATA%\.pokereport
set BACKUP_DIR=%APPDATA%\.pokereport_backup

echo 📁 Verificando directorios...
echo.

if exist "%POKEREPORT_DIR%" (
    echo ✅ .pokereport existe
    echo.
    echo ¿Renombrar a .pokereport_backup para prueba limpia? (S/N):
    set /p CONFIRM=
    
    if /i "%CONFIRM%"=="S" (
        echo.
        echo 🔄 Renombrando...
        
        if exist "%BACKUP_DIR%" (
            echo ⚠️  .pokereport_backup ya existe
            echo ¿Eliminar backup anterior? (S/N):
            set /p DELETE_OLD=
            
            if /i "%DELETE_OLD%"=="S" (
                rd /s /q "%BACKUP_DIR%"
            ) else (
                echo Operación cancelada
                pause
                exit /b 1
            )
        )
        
        ren "%POKEREPORT_DIR%" .pokereport_backup
        echo ✅ Renombrado a .pokereport_backup
    ) else (
        echo Operación cancelada
        pause
        exit /b 0
    )
) else (
    echo ✅ .pokereport no existe (prueba limpia)
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 INICIANDO LAUNCHER (PRUEBA DESDE CERO)
echo.
echo El launcher ahora descargará TODO desde GitHub:
echo   📥 minecraft.zip (~1-2 GB)
echo   📥 pokereport-modpack.mrpack (~500 MB)
echo.
echo ⏰ Tiempo: 10-15 minutos
echo.
pause

python pokereport_launcher.py

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo Prueba completada.
echo.
echo Para restaurar instalación anterior:
echo   1. Elimina: %POKEREPORT_DIR%
echo   2. Renombra: .pokereport_backup a .pokereport
echo.
pause

