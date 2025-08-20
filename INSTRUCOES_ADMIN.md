# 🔐 INSTRUÇÕES PARA CONFIGURAR POSTGRESQL COMO ADMINISTRADOR

## ⚠️ **IMPORTANTE: Execute como ADMINISTRADOR**

### 🔑 **SENHA A SER DEFINIDA: `SureStake2024!`**

---

## 📋 **PASSO A PASSO:**

### 1. **Abrir PowerShell como Administrador:**
   - Pressione `Windows + X`
   - Selecione "Windows PowerShell (Admin)" ou "Terminal (Admin)"
   - Clique em "Sim" na janela de controle de conta de usuário

### 2. **Navegar para o diretório do projeto:**
   ```powershell
   cd "D:\PROJETOS\boasvindasbotbet"
   ```

### 3. **Executar o script para definir a senha:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File set-postgres-password.ps1
   ```

### 4. **Verificar se funcionou:**
   ```powershell
   $env:PGPASSWORD="$ure$take2025!"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT version();"
   ```

---

## 🚀 **APÓS DEFINIR A SENHA:**

### 5. **Criar o banco de dados:**
   ```powershell
   $env:PGPASSWORD="SureStake2024!"; & "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres -h localhost surestake_db
   ```

### 6. **Inicializar o banco:**
   ```powershell
   npm run init-db
   ```

### 7. **Iniciar o servidor:**
   ```powershell
   npm run dev
   ```

---

## 🔧 **ARQUIVOS CRIADOS:**

- ✅ `.env` - Configurações do ambiente (senha: `SureStake2024!`)
- ✅ `set-postgres-password.ps1` - Script para definir senha (execute como ADMIN)
- ✅ `simple-password-set.ps1` - Script de teste (já executado)
- ✅ `config/database.js` - Configuração do Sequelize

---

## 🐛 **SE NÃO FUNCIONAR:**

1. **Verifique se o PostgreSQL está rodando:**
   ```powershell
   Get-Service -Name "*postgres*"
   ```

2. **Reinicie o serviço:**
   ```powershell
   Restart-Service -Name "postgresql-x64-16"
   ```

3. **Execute novamente como ADMINISTRADOR**

---

## 📝 **RESUMO DAS CONFIGURAÇÕES:**

- **Host:** localhost
- **Porta:** 5432
- **Usuário:** postgres
- **Senha:** `SureStake2024!`
- **Banco:** surestake_db

**⚠️ LEMBRE-SE:** Execute o script `set-postgres-password.ps1` como **ADMINISTRADOR**!
