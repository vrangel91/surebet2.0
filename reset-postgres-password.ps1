# Script para redefinir senha do PostgreSQL
Write-Host "Redefinindo senha do PostgreSQL..." -ForegroundColor Yellow

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
    & $pgCtl -D $dataDir -o "--single --user=postgres" postgres
    Write-Host "PostgreSQL iniciado em modo single user" -ForegroundColor Green
} catch {
    Write-Host "Erro ao iniciar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Redefinir senha
Write-Host "Redefinindo senha para 'postgres'..." -ForegroundColor Cyan
$sql = "ALTER USER postgres PASSWORD 'postgres';"
$sqlFile = "$env:TEMP\reset_password.sql"
$sql | Out-File -FilePath $sqlFile -Encoding UTF8

try {
    & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f $sqlFile
    Write-Host "Senha redefinida com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao redefinir senha: $($_.Exception.Message)" -ForegroundColor Red
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
Write-Host "Agora voce pode conectar com:" -ForegroundColor Cyan
Write-Host "  Usuario: postgres" -ForegroundColor White
Write-Host "  Senha: postgres" -ForegroundColor White
