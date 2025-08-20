# Migração para Banco de Dados

## Situação Atual

Atualmente, o projeto **NÃO está usando banco de dados**. Todos os dados são armazenados no **localStorage** do navegador.

### Dados Removidos (Mocados)

✅ **Removidos os seguintes dados mocados:**

1. **Usuários**:
   - Administrador (admin@surestake.com)
   - Usuário Teste (user@test.com)

2. **Tickets de Suporte**:
   - 3 tickets com mensagens mocadas

### Dados Reais (Mantidos)

✅ **Os seguintes dados são reais e vêm de APIs externas:**

1. **Surebets**: Vêm da API `https://zerolossbet.com/api/fetch_surebets/`
2. **Configurações**: Salvas no localStorage do usuário
3. **Filtros**: Salvos no localStorage do usuário

## Estrutura Atual de Dados

### localStorage Keys Utilizadas

```javascript
// Autenticação
'authToken'           // Token de autenticação
'user'               // Dados do usuário logado

// Dados da aplicação
'users'              // Lista de usuários (agora vazia)
'tickets'            // Tickets de suporte (agora vazio)
'app_settings'       // Configurações da aplicação
'reports_bets'       // Apostas para relatórios

// Filtros salvos
'savedFilters_*'     // Filtros salvos pelo usuário
```

## Como Implementar Banco de Dados

### Opções Recomendadas

1. **SQLite** (Mais simples para começar)
2. **PostgreSQL** (Para produção)
3. **MongoDB** (Se preferir NoSQL)

### Estrutura de Tabelas Sugerida

```sql
-- Usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  account_type VARCHAR(50) DEFAULT 'basic',
  credits INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  last_credit_consumption TIMESTAMP
);

-- Tickets de Suporte
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mensagens dos Tickets
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurações dos Usuários
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Filtros Salvos
CREATE TABLE saved_filters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relatórios de Apostas
CREATE TABLE bet_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bet_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Passos para Implementação

1. **Instalar dependências do banco**
   ```bash
   npm install pg sqlite3 sequelize
   # ou
   npm install mongoose
   ```

2. **Criar arquivo de configuração do banco**
   ```javascript
   // config/database.js
   const { Sequelize } = require('sequelize');
   
   const sequelize = new Sequelize({
     dialect: 'postgres', // ou 'sqlite'
     host: process.env.DB_HOST,
     port: process.env.DB_PORT,
     username: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
   });
   ```

3. **Criar modelos (Models)**
   ```javascript
   // models/User.js
   const { DataTypes } = require('sequelize');
   
   module.exports = (sequelize) => {
     const User = sequelize.define('User', {
       name: DataTypes.STRING,
       email: DataTypes.STRING,
       password_hash: DataTypes.STRING,
       role: DataTypes.STRING,
       account_type: DataTypes.STRING,
       credits: DataTypes.INTEGER,
       status: DataTypes.STRING
     });
     return User;
   };
   ```

4. **Criar rotas da API**
   ```javascript
   // routes/auth.js
   app.post('/api/auth/login', async (req, res) => {
     // Lógica de login com banco
   });
   
   app.post('/api/auth/register', async (req, res) => {
     // Lógica de registro com banco
   });
   ```

5. **Migrar dados existentes**
   ```javascript
   // scripts/migrate.js
   // Script para migrar dados do localStorage para o banco
   ```

### Benefícios da Migração

- ✅ **Persistência real** dos dados
- ✅ **Segurança** melhorada
- ✅ **Escalabilidade** da aplicação
- ✅ **Backup** e recuperação de dados
- ✅ **Múltiplos usuários** simultâneos
- ✅ **Relatórios** e análises avançadas

### Próximos Passos

1. Escolher o banco de dados
2. Configurar o ambiente
3. Criar os modelos
4. Implementar as APIs
5. Migrar dados existentes
6. Testar a aplicação

---

**Nota**: Após implementar o banco de dados, será necessário atualizar o Vuex store para fazer chamadas à API em vez de usar localStorage diretamente.
