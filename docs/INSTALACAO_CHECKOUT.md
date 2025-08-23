# Guia de Instalação - Checkout Transparente

## 📋 Pré-requisitos

- Node.js 16+ instalado
- PostgreSQL 12+ instalado e rodando
- Conta no Mercado Pago com credenciais de produção
- Acesso ao servidor para configuração de webhooks

## 🚀 Instalação

### 1. Instalar Dependências

```bash
# No diretório raiz do projeto
npm install

# Dependências específicas para o checkout
npm install mercadopago pg express-rate-limit cors helmet
```

### 2. Configurar Banco de Dados

```bash
# Criar banco de dados
createdb surestake

# Executar script de inicialização
node scripts/init-vip-tables.js
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar arquivo .env com suas configurações
nano .env
```

**Configurações obrigatórias:**
```env
# Banco de dados
DATABASE_URL=postgresql://username:password@localhost:5432/surestake

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918
MERCADOPAGO_PUBLIC_KEY=APP_USR-b493216a-34ea-4dab-98ab-a0d38aa43828
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui

# JWT
JWT_SECRET=seu_jwt_secret_aqui
```

### 4. Configurar Rotas no Servidor

Adicionar as rotas no `server.js`:

```javascript
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');

// ... outras configurações ...

app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
```

### 5. Configurar Webhook no Mercado Pago

1. Acesse o [Dashboard do Mercado Pago](https://www.mercadopago.com.br/developers/panel)
2. Vá em "Configurações" > "Webhooks"
3. Adicione uma nova URL de webhook:
   - **URL**: `https://seudominio.com/api/orders/webhook/mercadopago`
   - **Eventos**: `payment`
   - **Versão da API**: `v1`

## 🧪 Testes

### 1. Testar Conexão com Banco

```bash
# Verificar se as tabelas foram criadas
psql -d surestake -c "\dt"
```

### 2. Testar APIs

```bash
# Testar criação de pedido
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "userId": "test123",
    "planId": "pre-monthly",
    "planName": "SUREBET PRÉ JOGO MENSAL",
    "planDays": 30,
    "amount": 147.00,
    "paymentMethod": "credit_card",
    "installments": 1
  }'
```

### 3. Testar Checkout no Frontend

1. Iniciar o servidor de desenvolvimento
2. Acessar a página de planos
3. Selecionar um plano
4. Preencher formulário de checkout
5. Usar cartões de teste do Mercado Pago

## 🔧 Configurações Adicionais

### 1. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de checkout. Tente novamente em 15 minutos.'
});

app.use('/api/orders', checkoutLimiter);
```

### 2. Validação de Webhook

```javascript
// Adicionar no webhook handler
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  
  // Implementar verificação de assinatura
  if (!verifySignature(signature, payload)) {
    return res.status(401).json({ error: 'Assinatura inválida' });
  }
  
  next();
};
```

### 3. Logs de Transação

```javascript
// Adicionar logging automático
const logTransaction = async (orderId, action, details) => {
  await pool.query(`
    INSERT INTO system_logs (level, category, message, order_id, metadata)
    VALUES ($1, $2, $3, $4, $5)
  `, ['info', 'transaction', action, orderId, JSON.stringify(details)]);
};
```

## 📊 Monitoramento

### 1. Logs do Sistema

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Buscar erros
grep "ERROR" logs/app.log
```

### 2. Dashboard do Mercado Pago

- Acesse o dashboard para ver transações
- Monitore webhooks recebidos
- Verifique relatórios de pagamento

### 3. Métricas do Banco

```sql
-- Usuários VIP ativos
SELECT COUNT(*) FROM user_vip_status WHERE status = 'active';

-- Pedidos por status
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- Receita mensal
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as revenue
FROM orders 
WHERE status = 'approved'
GROUP BY month
ORDER BY month DESC;
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Webhook não recebido**
   - Verificar URL configurada
   - Verificar logs do servidor
   - Testar conectividade

2. **Erro de autenticação**
   - Verificar token do Mercado Pago
   - Verificar permissões da conta
   - Verificar ambiente (sandbox/produção)

3. **Erro de banco de dados**
   - Verificar conexão
   - Verificar se tabelas existem
   - Verificar permissões do usuário

### Comandos de Debug

```bash
# Verificar status do banco
pg_isready -h localhost -p 5432

# Verificar tabelas
psql -d surestake -c "\dt+"

# Verificar logs
journalctl -u surestake -f

# Testar conexão com Mercado Pago
curl -H "Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN" \
  https://api.mercadopago.com/v1/payments/search
```

## 🔒 Segurança

### 1. Validações

- Validar todos os dados de entrada
- Sanitizar dados antes de salvar
- Implementar rate limiting
- Validar assinatura de webhooks

### 2. Criptografia

- Usar HTTPS em produção
- Não armazenar dados sensíveis
- Usar variáveis de ambiente
- Implementar JWT seguro

### 3. Auditoria

- Logar todas as transações
- Monitorar tentativas de fraude
- Implementar alertas automáticos
- Backup regular dos dados

## 📈 Próximos Passos

1. **Implementar notificações por email**
2. **Adicionar dashboard de transações**
3. **Implementar sistema de reembolso**
4. **Adicionar múltiplas formas de pagamento**
5. **Implementar relatórios financeiros**
6. **Adicionar sistema de cupons**
7. **Implementar assinaturas recorrentes**

## 📞 Suporte

- **Documentação**: [docs/CHECKOUT_TRANSPARENTE_README.md](CHECKOUT_TRANSPARENTE_README.md)
- **Issues**: Criar issue no repositório
- **Mercado Pago**: [Suporte para desenvolvedores](https://www.mercadopago.com.br/developers/support)

---

**⚠️ Importante**: Sempre teste em ambiente de desenvolvimento antes de usar em produção!
