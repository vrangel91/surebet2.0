# 📊 Requisitos de Banco de Dados por Página

## 🔍 Análise Completa das Páginas

### 1. **🔐 LOGIN** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Usuários** (autenticação)
- ✅ **Tokens de autenticação**
- ✅ **Histórico de login**
- ✅ **Bloqueios por tentativas**
- ✅ **Dados "Lembrar-me"**

**Estrutura necessária:**
```sql
-- Tabela principal de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

-- Sessões/tokens
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. **⚙️ CONFIGURAÇÕES** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Configurações de notificações**
- ✅ **Configurações de busca automática**
- ✅ **Configurações de interface**
- ✅ **Configurações de som**
- ✅ **Preferências do usuário**

**Estrutura necessária:**
```sql
-- Configurações dos usuários
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  settings JSONB NOT NULL, -- Armazena todas as configurações
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo do JSONB settings:
{
  "notifications": {
    "sound": true,
    "browser": false,
    "volume": 75
  },
  "search": {
    "autoStart": true,
    "interval": 30
  },
  "interface": {
    "theme": "dark",
    "language": "pt-BR"
  }
}
```

---

### 3. **👑 ADMINISTRAÇÃO** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Lista completa de usuários**
- ✅ **Gerenciamento de usuários (CRUD)**
- ✅ **Tickets de suporte**
- ✅ **Mensagens dos tickets**
- ✅ **Estatísticas de usuários**
- ✅ **Controle de créditos**
- ✅ **Tipos de conta**

**Estrutura necessária:**
```sql
-- Usuários (já definido acima)
-- Tickets de suporte
CREATE TABLE support_tickets (
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

-- Mensagens dos tickets
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id),
  author_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'user', -- 'user' ou 'support'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de ações administrativas
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'user', 'ticket', etc.
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4. **💰 PLANOS** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Planos disponíveis**
- ✅ **Histórico de compras**
- ✅ **Pagamentos**
- ✅ **Status de assinaturas**
- ✅ **Créditos por plano**
- ✅ **Histórico de uso de créditos**

**Estrutura necessária:**
```sql
-- Planos disponíveis
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  credits_per_day INTEGER DEFAULT 1,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assinaturas dos usuários
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES plans(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de pagamentos
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES plans(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de uso de créditos
CREATE TABLE credit_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  credits_used INTEGER DEFAULT 1,
  usage_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. **👥 INDICAÇÕES** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Sistema de afiliados**
- ✅ **Links de referência**
- ✅ **Comissões**
- ✅ **Histórico de indicações**
- ✅ **Pagamentos de comissões**

**Estrutura necessária:**
```sql
-- Sistema de afiliados
CREATE TABLE affiliates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 25.00, -- 25%
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicações realizadas
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER REFERENCES affiliates(id),
  referred_user_id INTEGER REFERENCES users(id),
  commission_amount DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagamentos de comissões
CREATE TABLE commission_payments (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER REFERENCES affiliates(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6. **🆘 SUPORTE** - **CRÍTICO PARA BANCO DE DADOS**

**Dados que precisam ser armazenados:**
- ✅ **Tickets de suporte**
- ✅ **Mensagens dos tickets**
- ✅ **Categorias de tickets**
- ✅ **Prioridades**
- ✅ **Status de tickets**
- ✅ **Histórico de atendimento**

**Estrutura necessária:**
```sql
-- Categorias de tickets
CREATE TABLE ticket_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Tickets (já definido acima na seção Administração)
-- Mensagens dos tickets (já definido acima)

-- Anexos dos tickets
CREATE TABLE ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id),
  message_id INTEGER REFERENCES ticket_messages(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 RESUMO POR PRIORIDADE

### 🔴 **CRÍTICO (Necessita banco de dados imediatamente):**
1. **Login** - Autenticação e segurança
2. **Administração** - Gerenciamento de usuários
3. **Planos** - Sistema de pagamentos
4. **Suporte** - Tickets e atendimento

### 🟡 **IMPORTANTE (Necessita banco de dados em breve):**
5. **Configurações** - Preferências do usuário
6. **Indicações** - Sistema de afiliados

### 🟢 **OPCIONAL (Pode usar localStorage temporariamente):**
- Relatórios (dados de apostas)
- Filtros salvos
- Histórico de navegação

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar primeiro:**
   - Tabela `users` (autenticação)
   - Tabela `support_tickets` (suporte básico)
   - Tabela `plans` (planos básicos)

2. **Implementar segundo:**
   - Sistema de configurações
   - Sistema de afiliados
   - Logs administrativos

3. **Implementar terceiro:**
   - Sistema completo de pagamentos
   - Relatórios avançados
   - Analytics

---

## 💡 RECOMENDAÇÃO TÉCNICA

**Banco de dados recomendado:** PostgreSQL
- Suporte nativo a JSONB
- Transações ACID
- Performance excelente
- Facilidade de backup

**ORM recomendado:** Sequelize
- Compatível com Node.js
- Migrations automáticas
- Validações robustas
- Relacionamentos fáceis
