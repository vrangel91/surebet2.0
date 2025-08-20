# Script simplificado para definir senha do PostgreSQL
Write-Host "Tentando definir senha do PostgreSQL..." -ForegroundColor Yellow

# Tentar conectar usando diferentes metodos
$passwords = @("", "postgres", "admin", "password")

foreach ($password in $passwords) {
    Write-Host "Testando senha: '$password'" -ForegroundColor Cyan
    
    if ($password -eq "") {
        $env:PGPASSWORD = ""
    } else {
        $env:PGPASSWORD = $password
    }
    
    try {
        $result = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "ALTER USER postgres PASSWORD 'SureStake2024!';" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCESSO! Senha alterada para: SureStake2024!" -ForegroundColor Green
            break
        } else {
            Write-Host "Falhou com senha: '$password'" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erro com senha '$password': $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Teste concluido!" -ForegroundColor Yellow
Write-Host "Se nenhuma senha funcionou, execute o script set-postgres-password.ps1 como ADMINISTRADOR" -ForegroundColor Red
