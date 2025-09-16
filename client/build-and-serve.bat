@echo off
echo 🚀 Construindo projeto SureStake...
echo.

REM Construir o projeto
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro na construção do projeto
    pause
    exit /b 1
)

echo ✅ Projeto construído com sucesso!
echo.

REM Entrar na pasta dist
cd dist

echo 🌐 Iniciando servidor na porta 8080...
echo 📱 Acesse: http://localhost:8080
echo 🔌 Certifique-se de que o backend está rodando na porta 3000
echo.

REM Iniciar servidor
npx serve -s . -p 8080

pause
