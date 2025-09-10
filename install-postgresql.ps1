# Script para instalar PostgreSQL no Windows
Write-Host "Instalando PostgreSQL..." -ForegroundColor Green

# URL do instalador do PostgreSQL
$postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.5-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

Write-Host "Baixando PostgreSQL..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $postgresUrl -OutFile $installerPath
    Write-Host "Download concluido!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao baixar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Instalando PostgreSQL..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Durante a instalacao:" -ForegroundColor Yellow
Write-Host "   - Defina a senha do usuario 'postgres' como 'postgres'" -ForegroundColor Cyan
Write-Host "   - Mantenha a porta padrao 5432" -ForegroundColor Cyan
Write-Host "   - Instale em C:\Program Files\PostgreSQL\15" -ForegroundColor Cyan
Write-Host ""

# Instalar PostgreSQL silenciosamente
try {
    Start-Process -FilePath $installerPath -ArgumentList "--unattendedmodeui minimal --mode unattended --superpassword postgres --serverport 5432 --servicename postgresql-x64-15" -Wait
    Write-Host "PostgreSQL instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro durante a instalacao: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Adicionar PostgreSQL ao PATH
$postgresPath = "C:\Program Files\PostgreSQL\15\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$postgresPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$postgresPath", "Machine")
    Write-Host "PostgreSQL adicionado ao PATH" -ForegroundColor Green
}

Write-Host ""
Write-Host "Instalacao concluida!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Reinicie o terminal para atualizar o PATH" -ForegroundColor White
Write-Host "   2. Execute: npm run init-db" -ForegroundColor White
Write-Host "   3. Execute: npm run dev" -ForegroundColor White
Write-Host ""

# Limpar arquivo temporario
if (Test-Path $installerPath) {
    Remove-Item $installerPath
    Write-Host "Arquivo temporario removido" -ForegroundColor Green
}
