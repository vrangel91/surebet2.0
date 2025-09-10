# Script para definir senha do PostgreSQL - EXECUTE COMO ADMINISTRADOR
Write-Host "Definindo senha do PostgreSQL..." -ForegroundColor Yellow

# SENHA DEFINIDA: SureStake2024!
Write-Host "NOVA SENHA: $ure$take2025!" -ForegroundColor Green
Write-Host "ANOTE ESTA SENHA!" -ForegroundColor Red

# Parar o servico PostgreSQL
Write-Host "Parando servico PostgreSQL..." -ForegroundColor Cyan
try {
    Stop-Service -Name "postgresql-x64-16" -Force
    Write-Host "Servico parado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Erro ao parar servico: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Execute este script como Administrador" -ForegroundColor Red
    exit 1
}

# Iniciar PostgreSQL em modo single user
Write-Host "Iniciando PostgreSQL em modo single user..." -ForegroundColor Cyan
$dataDir = "C:\Program Files\PostgreSQL\16\data"
$pgCtl = "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe"

try {
    Start-Process -FilePath $pgCtl -ArgumentList "-D", $dataDir, "-o", "--single --user=postgres", "postgres" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "PostgreSQL iniciado em modo single user" -ForegroundColor Green
} catch {
    Write-Host "Erro ao iniciar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Redefinir senha
Write-Host "Definindo nova senha..." -ForegroundColor Cyan
$sql = "ALTER USER postgres PASSWORD 'SureStake2024!';"
$sqlFile = "$env:TEMP\set_password.sql"
$sql | Out-File -FilePath $sqlFile -Encoding UTF8

try {
    & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f $sqlFile
    Write-Host "Senha definida com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao definir senha: $($_.Exception.Message)" -ForegroundColor Red
}

# Parar PostgreSQL single user
Write-Host "Parando PostgreSQL single user..." -ForegroundColor Cyan
try {
    & $pgCtl -D $dataDir stop
    Write-Host "PostgreSQL single user parado" -ForegroundColor Green
} catch {
    Write-Host "Erro ao parar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
}

# Iniciar servico normalmente
Write-Host "Iniciando servico PostgreSQL..." -ForegroundColor Cyan
try {
    Start-Service -Name "postgresql-x64-16"
    Write-Host "Servico iniciado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Erro ao iniciar servico: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpar arquivo temporario
if (Test-Path $sqlFile) {
    Remove-Item $sqlFile
    Write-Host "Arquivo temporario removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "Processo concluido!" -ForegroundColor Green
Write-Host "NOVA CONFIGURACAO:" -ForegroundColor Cyan
Write-Host "  Usuario: postgres" -ForegroundColor White
Write-Host "  Senha: SureStake2024!" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Atualize o arquivo .env com a nova senha!" -ForegroundColor Red
