@echo off
echo ========================================
echo Script para configurar PostgreSQL
echo ========================================
echo.

echo Verificando se Python esta instalado...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao esta instalado!
    echo Instale Python de: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python encontrado!
echo.

echo Instalando dependencias...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas com sucesso!
echo.

echo Executando script Python...
python set_postgres_password.py

echo.
echo Script concluido!
pause
