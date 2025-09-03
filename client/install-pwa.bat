@echo off
echo ========================================
echo    Instalador PWA - SureStake
echo ========================================
echo.

echo [1/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo [2/4] Gerando icones PWA...
call node scripts/generate-pwa-icons.js
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar icones
    pause
    exit /b 1
)

echo [3/4] Construindo projeto...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir projeto
    pause
    exit /b 1
)

echo [4/4] Configuracao PWA concluida!
echo.
echo ========================================
echo    PWA Configurado com Sucesso!
echo ========================================
echo.
echo Proximos passos:
echo 1. Converta os arquivos SVG para PNG em client/public/img/
echo 2. Teste a instalacao do PWA no navegador
echo 3. Verifique se o Service Worker esta funcionando
echo.
echo Para testar localmente:
echo   npm run serve
echo.
pause
