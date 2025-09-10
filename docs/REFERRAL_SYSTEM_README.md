# Sistema de Referências - Documentação Completa

## Visão Geral

O sistema de referências permite que usuários ganhem comissões ao indicar novos usuários para a plataforma. Cada indicação bem-sucedida gera uma comissão de 25% sobre o valor do plano contratado pelo usuário indicado.

## Funcionalidades Principais

### 1. Códigos de Referência Únicos
- Cada usuário recebe automaticamente um código de referência único de 8 caracteres
- Códigos são gerados automaticamente no formato: `ABC12345`
- Códigos são únicos e não podem ser duplicados

### 2. Sistema de Indicações
- Usuários podem compartilhar seu link de afiliado
- Link formatado: `http://surestake.net.br/registro?referer_id=ABC12345`
- Sistema rastreia automaticamente quem indicou quem

### 3. Comissões
- **Taxa de comissão**: 25% sobre o valor do plano
- **Exemplo**: Se um usuário indicado contratar um plano de R$ 100,00, o indicador recebe R$ 25,00
- Comissões são creditadas automaticamente no saldo do usuário

### 4. Gestão de Saldo
- Saldo de comissões é exibido em tempo real
- Usuários podem solicitar saques de qualquer valor disponível
- Sistema de saque via PIX (em desenvolvimento)

## Estrutura do Banco de Dados

### Tabela: users
```sql
-- Colunas existentes...
referral_code VARCHAR(8) UNIQUE,           -- Código único de referência
referred_by INTEGER REFERENCES users(id),  -- ID do usuário que indicou
commission_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL  -- Saldo de comissões
```

### Índices de Performance
```sql
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_commission_balance ON users(commission_balance);
```

## APIs do Backend

### 1. Status de Referências
```http
GET /api/referrals/my-status
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "referralData": {
    "referralCode": "ABC12345",
    "commissionBalance": 125.50,
    "totalEarned": 250.00,
    "referredUsers": [
      {
        "id": 123,
        "name": "João Silva",
        "planValue": 100.00,
        "commission": 25.00,
        "joinedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "affiliateLink": "http://surestake.net.br/registro?referer_id=ABC12345"
  }
}
```

### 2. Solicitar Saque
```http
POST /api/referrals/withdraw
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Saque solicitado com sucesso",
  "newBalance": 25.50,
  "withdrawalAmount": 100.00
}
```

### 3. Histórico de Saques
```http
GET /api/referrals/history
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "withdrawals": []
}
```

## Frontend - ReferralsView.vue

### Componentes Principais

#### 1. Cards de Informação
- **Saldo de Comissões**: Exibe valor disponível para saque
- **Total Ganho**: Mostra valor total ganho com indicações
- **Usuários Indicados**: Contador de usuários referidos

#### 2. Seção "Indique e Ganhe"
- Link de afiliado copiável
- Descrição do programa de indicações
- Botão para copiar link

#### 3. Tabela de Usuários Indicados
- Lista todos os usuários referidos
- Valor dos planos contratados
- Comissões geradas por cada indicação
- Data de cadastro

#### 4. Modais
- **Modal de Saque**: Permite definir valor do saque
- **Modal de Sucesso**: Confirma operações realizadas

### Estados da Interface

#### Loading State
- Spinner animado durante carregamento
- Mensagem informativa

#### Estados dos Botões
- **Saque**: Desabilitado se saldo = 0 ou durante processamento
- **Copiar Link**: Feedback visual quando copiado
- **Ver Histórico**: Funcionalidade em desenvolvimento

## Fluxo de Funcionamento

### 1. Cadastro de Usuário
```
Usuário A se cadastra → Sistema gera código único ABC12345
```

### 2. Indicação
```
Usuário A compartilha link → Usuário B clica e se cadastra
Sistema detecta referer_id → Associa B ao usuário A
```

### 3. Contratação de Plano
```
Usuário B contrata plano de R$ 100,00 → Sistema calcula comissão
Comissão = R$ 100,00 × 25% = R$ 25,00
Saldo de A é atualizado: +R$ 25,00
```

### 4. Saque
```
Usuário A solicita saque de R$ 50,00 → Sistema valida saldo
Saldo atualizado: -R$ 50,00 → Saque processado via PIX
```

## Segurança e Validações

### Backend
- Autenticação obrigatória para todas as rotas
- Validação de valores de saque
- Verificação de saldo disponível
- Sanitização de dados de entrada

### Frontend
- Validação de formulários
- Estados de loading para evitar duplo clique
- Feedback visual para todas as ações
- Tratamento de erros da API

## Configuração e Instalação

### 1. Executar Script de Inicialização
```bash
node scripts/init-referral-system.js
```

### 2. Verificar Rotas no Servidor
```javascript
// server.js
const referralsRoutes = require('./routes/referrals');
app.use('/api/referrals', referralsRoutes);
```

### 3. Verificar Modelo de Usuário
```javascript
// models/User.js
referral_code: DataTypes.STRING(8),
referred_by: DataTypes.INTEGER,
commission_balance: DataTypes.DECIMAL(10, 2)
```

## Testes e Validação

### 1. Testar API de Status
```bash
curl -H "Authorization: Bearer {token}" \
     https://surestake.com.br/api/referrals/my-status
```

### 2. Testar Solicitação de Saque
```bash
curl -X POST \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"amount": 50.00}' \
     https://surestake.com.br/api/referrals/withdraw
```

### 3. Verificar Banco de Dados
```sql
-- Verificar usuários com códigos de referência
SELECT id, username, referral_code, commission_balance 
FROM users 
WHERE referral_code IS NOT NULL;

-- Verificar indicações
SELECT u1.username as indicador, u2.username as indicado
FROM users u1
JOIN users u2 ON u1.id = u2.referred_by;
```

## Próximas Implementações

### 1. Sistema de Pagamento PIX
- Integração com gateway de pagamento
- Processamento automático de saques
- Notificações de status de pagamento

### 2. Histórico Detalhado
- Tabela de histórico de saques
- Filtros por período e status
- Exportação de relatórios

### 3. Dashboard Administrativo
- Visão geral de todas as indicações
- Estatísticas de comissões
- Gestão de usuários e códigos

### 4. Notificações
- Email de confirmação de comissão
- Notificação de saque processado
- Lembretes de saldo disponível

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Código Duplicado
```
Error: duplicate key value violates unique constraint "users_referral_code_key"
```
**Solução**: Executar script de inicialização para regenerar códigos

#### 2. Colunas Não Encontradas
```
Error: column "referral_code" does not exist
```
**Solução**: Verificar se script de inicialização foi executado

#### 3. Erro de Referência Circular
```
Error: insert or update on table "users" violates foreign key constraint
```
**Solução**: Verificar se referred_by aponta para usuário válido

### Logs e Debug
```javascript
// Habilitar logs detalhados
console.log('Referral data:', referralData);
console.log('User associations:', user.referredUsers);
```

## Suporte e Contato

Para dúvidas ou problemas com o sistema de referências:
- Verificar logs do servidor
- Executar testes de conectividade
- Consultar documentação da API
- Abrir issue no repositório do projeto

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Desenvolvedor**: Sistema SureStake

