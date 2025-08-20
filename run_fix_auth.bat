@echo off
echo ========================================
echo CORRIGIR AUTENTICACAO POSTGRESQL
echo ========================================
echo.
echo IMPORTANTE: Execute como ADMINISTRADOR!
echo.
echo Este script ira:
echo 1. Fazer backup do pg_hba.conf
echo 2. Modificar temporariamente para trust
echo 3. Reiniciar PostgreSQL
echo 4. Alterar senha para SureStake2024!
echo 5. Restaurar configuracoes originais
echo.
echo Clique com botao direito neste arquivo
echo e selecione "Executar como administrador"
echo.
pause

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

echo Executando script de correcao...
python fix_postgres_auth.py

echo.
echo Script concluido!
pause
