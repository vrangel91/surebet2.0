# 🔐 Sistema de Autenticação - SureStake

## 📋 Visão Geral

Sistema completo de autenticação e gerenciamento de usuários implementado com:
- **PostgreSQL** como banco de dados
- **Sequelize** como ORM
- **JWT** para tokens de autenticação
- **bcryptjs** para hash de senhas
- **Sessões** para controle de login

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
├── config/
│   └── database.js          # Configuração do banco
├── models/
│   ├── index.js             # Associações dos modelos
│   ├── User.js              # Modelo de usuário
│   └── UserSession.js       # Modelo de sessão
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   └── users.js             # Rotas de usuários (admin)
├── utils/
│   └── auth.js              # Utilitários de autenticação
├── scripts/
│   └── init-db.js           # Script de inicialização
└── server.js                # Servidor principal
```

## 🚀 Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Criar arquivo `.env` baseado no `env.example`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=surestake_db
JWT_SECRET=sua_chave_secreta
```

### 3. Inicializar Banco de Dados
```bash
npm run init-db
```

### 4. Iniciar Servidor
```bash
npm run dev
```

## 📊 Modelos de Dados

### Tabela `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  account_type ENUM('basic', 'premium', 'vip') DEFAULT 'basic',
  credits INTEGER DEFAULT 0,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_credit_consumption TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `user_sessions`
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Endpoints da API

### Autenticação (`/api/auth`)

#### POST `/api/auth/login`
**Login de usuário**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Usuário",
    "email": "user@example.com",
    "role": "user",
    "account_type": "basic",
    "credits": 5,
    "status": "active",
    "can_use_system": true
  }
}
```

#### POST `/api/auth/register`
**Registro de novo usuário**
```json
{
  "name": "Novo Usuário",
  "email": "novo@example.com",
  "password": "123456"
}
```

#### POST `/api/auth/logout`
**Logout (requer autenticação)**
```bash
Authorization: Bearer <token>
```

#### GET `/api/auth/verify`
**Verificar token (requer autenticação)**
```bash
Authorization: Bearer <token>
```

#### POST `/api/auth/consume-credit`
**Consumir crédito (requer autenticação)**
```bash
Authorization: Bearer <token>
```

### Usuários (`/api/users`) - Apenas Admin

#### GET `/api/users`
**Listar todos os usuários**
```bash
Authorization: Bearer <admin_token>
```

#### GET `/api/users/:id`
**Buscar usuário por ID**
```bash
Authorization: Bearer <admin_token>
```

#### POST `/api/users`
**Criar novo usuário**
```json
{
  "name": "Usuário",
  "email": "user@example.com",
  "password": "123456",
  "role": "user",
  "account_type": "basic",
  "credits": 0
}
```

#### PUT `/api/users/:id`
**Atualizar usuário**
```json
{
  "name": "Nome Atualizado",
  "email": "novo@email.com",
  "role": "admin",
  "account_type": "premium",
  "credits": 100,
  "status": "active"
}
```

#### PUT `/api/users/:id/password`
**Alterar senha**
```json
{
  "password": "nova_senha"
}
```

#### POST `/api/users/:id/credits`
**Adicionar créditos**
```json
{
  "amount": 10
}
```

#### POST `/api/users/:id/unlock`
**Desbloquear usuário**

#### DELETE `/api/users/:id`
**Deletar usuário**

## 🔒 Segurança

### Recursos de Segurança Implementados

1. **Hash de Senhas**: bcryptjs com salt rounds = 10
2. **Tokens JWT**: Expiração de 7 dias
3. **Sessões**: Controle de sessões ativas no banco
4. **Bloqueio por Tentativas**: 5 tentativas = 15 minutos de bloqueio
5. **Validação de E-mail**: Formato e unicidade
6. **Middleware de Autenticação**: Proteção de rotas
7. **Controle de Acesso**: Roles (user/admin)
8. **Sistema de Créditos**: Controle de uso diário

### Middleware de Autenticação
```javascript
// Proteger rota
app.get('/protected', authenticateToken, (req, res) => {
  // req.user contém dados do usuário
});

// Apenas admin
app.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  // Apenas administradores
});

// Verificar créditos
app.get('/feature', authenticateToken, requireCredits, (req, res) => {
  // Usuário tem créditos suficientes
});
```

## 👤 Usuário Padrão

### Administrador
- **Email**: `admin@surestake.com`
- **Senha**: `123456`
- **Role**: `admin`
- **Créditos**: `999999`
- **Status**: `active`

## 💰 Sistema de Créditos

### Funcionamento
- **1 crédito = 1 dia de uso**
- **Administradores**: Não consomem créditos
- **Usuários**: Consomem 1 crédito por dia
- **Verificação**: Diária (reset à meia-noite)

### Endpoints de Créditos
- `POST /api/auth/consume-credit` - Consumir crédito
- `POST /api/users/:id/credits` - Adicionar créditos (admin)

## 🛠️ Scripts Úteis

### Inicializar Banco
```bash
npm run init-db
```

### Desenvolvimento
```bash
npm run dev          # Servidor + Cliente
npm run server       # Apenas servidor
npm run client       # Apenas cliente
```

### Produção
```bash
npm run build        # Build do cliente
npm start           # Servidor de produção
```

## 📝 Exemplos de Uso

### Login com JavaScript
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: '123456'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

### Requisição Autenticada
```javascript
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### Verificar Token
```javascript
const response = await fetch('/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.status === 401) {
  // Token inválido, fazer logout
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente
```env
NODE_ENV=production
JWT_SECRET=chave_super_secreta_muito_longa
DB_HOST=seu_host
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_forte
DB_NAME=surestake_prod
```

### Segurança em Produção
1. **Alterar JWT_SECRET**
2. **Usar HTTPS**
3. **Configurar firewall**
4. **Backup regular do banco**
5. **Monitoramento de logs**

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```
❌ Erro ao conectar com banco de dados
```
**Solução**: Verificar configurações no `.env`

### Token Inválido
```
❌ Token inválido
```
**Solução**: Fazer logout e login novamente

### Usuário Bloqueado
```
❌ Conta bloqueada. Tente novamente em X minutos.
```
**Solução**: Aguardar ou admin desbloquear

### Créditos Insuficientes
```
❌ Créditos insuficientes
```
**Solução**: Comprar mais créditos ou aguardar próximo dia

---

## ✅ Status da Implementação

- ✅ **Autenticação completa**
- ✅ **Sistema de usuários**
- ✅ **Controle de acesso**
- ✅ **Sistema de créditos**
- ✅ **Segurança implementada**
- ✅ **API documentada**
- ✅ **Scripts de inicialização**

**Próximo passo**: Integrar com o frontend Vue.js
