@echo off
chcp 65001 >nul
setlocal EnableExtensions

cd /d "%~dp0"

echo ============================================
echo   SUBIR CAMBIOS A GITHUB
echo   soniqueteflamenco (Landing)
echo ============================================
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Esta carpeta no es un repositorio Git.
    exit /b 1
)

echo [OK] Repositorio Git verificado (soniqueteflamenco).
echo [INFO] Videos y blobs pesados desacoplados en media_base fuera de Git.
echo.

if exist "scripts\sync_media.js" (
    node scripts\sync_media.js
)
echo.

echo Cambios detectados:
echo.
git status -s
echo.

set "MSG=%~1"
if "%MSG%"=="" (
    set "MSG=Actualizacion automatica soniqueteflamenco"
)

echo Mensaje:
echo %MSG%
echo.

echo Anadiendo cambios...
git add -A
if errorlevel 1 (
    echo [ERROR] git add ha fallado.
    exit /b 4
)

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo [INFO] No hay cambios nuevos para guardar.
    goto COMPROBAR_REMOTO
)

echo.
echo Creando commit...
git commit -m "%MSG%"
if errorlevel 1 (
    echo [ERROR] No se pudo crear el commit.
    exit /b 6
)

:COMPROBAR_REMOTO
echo.
echo Comprobando GitHub (https://github.com/jigomez-gr/soniqueteflamenco.git)...
git fetch origin
if errorlevel 1 (
    echo [ERROR] No se pudo acceder a GitHub.
    exit /b 7
)

echo.
echo Subiendo a GitHub (origin main)...
echo.
git push origin main
if errorlevel 1 (
    echo.
    echo [ERROR] El push ha fallado.
    exit /b 9
)

echo.
git status --short
echo.
echo ============================================
echo   SUBIDA CORRECTA A SONIQUETEFLAMENCO
echo ============================================
echo.
exit /b 0
