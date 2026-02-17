@echo off
TITLE Sistema de Gestion de Inventario - Iniciando...
COLOR 0A

echo =====================================================
echo    INICIANDO SISTEMA DE GESTION DE INVENTARIO
echo =====================================================
echo.

REM --- Paso 1: Asegurar que estamos en el directorio correcto ---
REM "%~dp0" se refiere a la ruta del directorio donde se encuentra este archivo .bat
cd /d "%~dp0"
echo [INFO] Directorio de trabajo establecido: %CD%
echo.

REM --- Paso 2: Verificar si Docker esta corriendo ---
echo [INFO] Verificando estado de Docker...
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [ERROR] Docker no esta ejecutandose.
    echo Por favor, inicia Docker Desktop y vuelve a intentar.
    echo.
    pause
    EXIT /B 1
)
echo [OK] Docker esta activo.
echo.

REM --- Paso 3: Levantar los servicios con Docker Compose ---
echo [INFO] Construyendo e iniciando contenedores...
echo Esto puede tardar unos minutos la primera vez.
echo.

REM Usamos --build para asegurar que si cambiaste codigo, se actualice la imagen
REM Usamos -d (detached) para que corra en segundo plano y no bloquee esta ventana
docker-compose up --build -d

IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [ERROR] Hubo un problema al iniciar los contenedores.
    echo Revisa los logs de Docker para mas detalles.
    pause
    EXIT /B 1
)

REM --- Finalizacion ---
CLS
echo =====================================================
echo       SISTEMA INICIADO CORRECTAMENTE
echo =====================================================
echo.
echo Los servicios estan corriendo en segundo plano.
echo.
echo [FRONTEND] Accede aqui:  http://localhost:5173
REM NOTA: Si tu puerto frontend en docker-compose.yml no es 5173, cambialo en la linea de arriba.
echo [BACKEND] API activa en puerto 5000 (uso interno)
echo [DB] Base de datos PostgreSQL activa
echo.
echo Puedes cerrar esta ventana.
echo =====================================================
timeout /t 10 >nul