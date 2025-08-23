# Checkout Transparente - Mercado Pago

## Visão Geral

Este documento descreve a implementação do checkout transparente do Mercado Pago para a plataforma SureStake, permitindo que usuários comprem planos VIP diretamente na aplicação.

## Arquitetura do Sistema

### Frontend (Vue.js)
- Formulário de checkout com validação
- Integração com SDK do Mercado Pago
- Processamento de pagamentos em tempo real
- Gerenciamento de estado dos pedidos

### Backend (Node.js)
- API para criação e gerenciamento de pedidos
- Webhooks para notificações do Mercado Pago
- Sistema de ativação de VIP
- Rotina de verificação de validade

## Configuração do Mercado Pago

### Credenciais
```javascript
// Configuração no frontend
mercadopagoConfig: {
  publicKey: 'APP_USR-b493216a-34ea-4dab-98ab-a0d38aa43828',
  accessToken: 'APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918'
}
```

### SDK
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

## Fluxo de Pagamento

### 1. Seleção do Plano
- Usuário escolhe um plano na interface
- Sistema abre modal de checkout
- Dados do usuário são preenchidos automaticamente (se logado)

### 2. Preenchimento do Formulário
- Dados pessoais (nome, email, CPF)
- Dados do cartão (número, validade, CVV)
- Endereço de cobrança (com busca automática de CEP)

### 3. Validação e Processamento
- Validação client-side dos campos
- Criação de pedido no sistema
- Geração de token do cartão via SDK MP
- Processamento do pagamento via API MP

### 4. Ativação do VIP
- Se aprovado: ativação imediata do VIP
- Se pendente: aguarda confirmação
- Se rejeitado: mantém usuário no plano básico

## Estrutura do Banco de Dados

### Tabela: orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  plan_days INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  installments INTEGER DEFAULT 1,
  customer_data JSONB,
  payment_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: user_vip_status
```sql
CREATE TABLE user_vip_status (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  plan_days INTEGER NOT NULL,
  activated_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## APIs do Backend

### 1. Criar Pedido
```javascript
POST /api/orders
{
  "userId": "user123",
  "planId": "pre-monthly",
  "planName": "SUREBET PRÉ JOGO MENSAL",
  "planDays": 30,
  "amount": 147.00,
  "paymentMethod": "credit_card",
  "installments": 1,
  "customerData": {
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "address": {
      "cep": "12345678",
      "street": "Rua das Flores",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP"
    }
  }
}
```

### 2. Atualizar Status do Pedido
```javascript
PATCH /api/orders/:id/status
{
  "status": "approved"
}
```

### 3. Salvar Dados do Pagamento
```javascript
PATCH /api/orders/:id/payment-data
{
  "paymentId": "mp_payment_123",
  "status": "approved",
  "paymentMethod": "master",
  "installments": 1,
  "transactionAmount": 147.00,
  "processedAt": "2024-01-15T10:30:00Z"
}
```

### 4. Ativar VIP
```javascript
POST /api/users/activate-vip
{
  "userId": "user123",
  "planId": "pre-monthly",
  "planDays": 30,
  "activatedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-02-14T10:30:00Z",
  "orderId": 123
}
```

## Webhook do Mercado Pago

### Endpoint
```
POST /api/webhooks/mercadopago
```

### Processamento
```javascript
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (data.type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const payment = await getMercadoPagoPayment(paymentId);
      
      // Atualizar status do pedido
      await updateOrderStatus(payment.external_reference, payment.status);
      
      // Se aprovado, ativar VIP
      if (payment.status === 'approved') {
        await activateUserVIP(payment.external_reference);
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

## Sistema de VIP

### Ativação
- Quando pagamento é aprovado
- Cálculo da data de expiração baseado no plano
- Atribuição do cargo VIP ao usuário
- Se já tinha VIP ativo, somar os dias

### Expiração
- Rotina diária de verificação
- Downgrade automático para plano básico
- Notificação ao usuário
- Atualização do status do plano

### Rotina de Verificação
```javascript
// Executar diariamente às 00:00
const checkVIPExpiration = async () => {
  const expiredVIPs = await getExpiredVIPs();
  
  for (const vip of expiredVIPs) {
    // Remover cargo VIP
    await removeVIPRole(vip.userId);
    
    // Atribuir cargo básico
    await assignBasicRole(vip.userId);
    
    // Atualizar status
    await updateVIPStatus(vip.id, 'expired');
    
    // Notificar usuário
    await notifyUser(vip.userId, 'VIP_EXPIRED');
  }
};
```

## Segurança

### Validações
- Validação client-side dos campos
- Validação server-side dos dados
- Verificação de autenticação
- Rate limiting para APIs

### Criptografia
- Dados sensíveis não são armazenados
- Comunicação HTTPS obrigatória
- Tokens de acesso seguros
- Validação de webhooks

## Testes

### Cartões de Teste
```javascript
// Aprovado
cardNumber: '4509 9535 6623 3704'
expiry: '12/25'
cvv: '123'

// Pendente
cardNumber: '4509 9535 6623 3704'
expiry: '12/25'
cvv: '123'

// Rejeitado
cardNumber: '4509 9535 6623 3704'
expiry: '12/25'
cvv: '123'
```

### Cenários de Teste
1. Pagamento aprovado imediatamente
2. Pagamento pendente de análise
3. Pagamento rejeitado
4. Erro de validação
5. Timeout de conexão
6. Dados inválidos

## Monitoramento

### Logs
- Todas as transações
- Erros de processamento
- Webhooks recebidos
- Ativações de VIP

### Métricas
- Taxa de conversão
- Tempo de processamento
- Erros por tipo
- Status dos pagamentos

## Implementação

### 1. Instalar Dependências
```bash
npm install mercadopago
```

### 2. Configurar Variáveis de Ambiente
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918
MERCADOPAGO_PUBLIC_KEY=APP_USR-b493216a-34ea-4dab-98ab-a0d38aa43828
WEBHOOK_SECRET=your_webhook_secret
```

### 3. Implementar APIs
- Criar rotas para pedidos
- Implementar webhook handler
- Criar sistema de VIP
- Implementar rotina de expiração

### 4. Testar Integração
- Testar com cartões de teste
- Verificar webhooks
- Validar ativação de VIP
- Testar expiração automática

## Troubleshooting

### Problemas Comuns
1. **SDK não carrega**: Verificar conexão com internet
2. **Token não criado**: Validar dados do cartão
3. **Webhook não recebido**: Verificar URL e configuração
4. **VIP não ativado**: Verificar logs de erro

### Debug
- Console do navegador
- Logs do servidor
- Dashboard do Mercado Pago
- Testes de conectividade

## Próximos Passos

1. Implementar backend completo
2. Adicionar sistema de notificações
3. Implementar dashboard de transações
4. Adicionar relatórios financeiros
5. Implementar sistema de reembolso
6. Adicionar múltiplas formas de pagamento
