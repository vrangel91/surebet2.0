# Script para testar conexao com PostgreSQL
Write-Host "Testando conexao com PostgreSQL..." -ForegroundColor Yellow

$passwords = @("postgres", "", "admin", "password", "123456", "postgresql")

foreach ($password in $passwords) {
    Write-Host "Testando senha: '$password'" -ForegroundColor Cyan
    
    if ($password -eq "") {
        $env:PGPASSWORD = ""
    } else {
        $env:PGPASSWORD = $password
    }
    
    try {
        $result = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT version();" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCESSO! Senha encontrada: '$password'" -ForegroundColor Green
            Write-Host "Resultado: $result" -ForegroundColor Green
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
