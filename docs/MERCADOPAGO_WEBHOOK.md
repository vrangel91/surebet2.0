# Configuração do Webhook MercadoPago

## URL do Webhook
```
https://surestake.com.br/webhook
```

## Chave Secreta
```
1be7b91f404f74fed096a02490ed8f0c3b57e603b09bd3f58fec69f11058f1e4
```

## Eventos Configurados
- ✅ Pagamentos
- ✅ Alertas de fraude
- ✅ Reclamações e contestações

## Como Funciona

### 1. Estrutura do Webhook
O MercadoPago envia notificações no seguinte formato:

```json
{
  "type": "payment",
  "action": "payment.created",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2024-01-01T00:00:00.000Z",
  "id": 123456789,
  "live_mode": false,
  "user_id": 123456789
}
```

### 2. Tipos de Eventos Processados

#### Pagamentos (`type: "payment"`)
- `payment.created` - Pagamento criado
- `payment.updated` - Status do pagamento atualizado
- `payment.approved` - Pagamento aprovado

#### Chargebacks (`type: "chargeback"`)
- `chargeback.created` - Chargeback criado
- `chargeback.updated` - Chargeback atualizado

#### Disputas (`type: "dispute"`)
- `dispute.created` - Disputa criada
- `dispute.updated` - Disputa atualizada

### 3. Processamento de Pagamentos

Quando um pagamento é aprovado:

1. **Busca informações do pagamento** no MercadoPago
2. **Verifica o valor** e compara com os planos disponíveis
3. **Identifica o usuário** através do `external_reference`
4. **Ativa o VIP** para o usuário
5. **Registra o pagamento** no banco de dados

### 4. Planos Disponíveis

```javascript
{
  'basic': {
    id: 'basic',
    name: 'Plano Básico',
    days: 30,
    price: 29.90,
    features: ['Acesso a surebets', 'Suporte básico']
  },
  'premium': {
    id: 'premium',
    name: 'Plano Premium',
    days: 30,
    price: 49.90,
    features: ['Acesso a surebets', 'Suporte prioritário', 'Alertas em tempo real']
  },
  'vip': {
    id: 'vip',
    name: 'Plano VIP',
    days: 30,
    price: 99.90,
    features: ['Acesso a surebets', 'Suporte VIP', 'Alertas em tempo real', 'Análises exclusivas']
  }
}
```

### 5. Rotas Disponíveis

#### Webhook Principal
```
POST https://surestake.com.br/webhook
```

#### Webhook Alternativo
```
POST https://surestake.com.br/api/payments/webhook
```

#### Obter Planos
```
GET https://surestake.com.br/api/payments/plans
```

#### Status VIP do Usuário
```
GET https://surestake.com.br/api/payments/vip-status/:userId
```

#### Criar Pedido
```
POST https://surestake.com.br/api/payments/create-order
```

#### Simular Pagamento (para testes)
```
POST https://surestake.com.br/api/payments/simulate-payment
```

### 6. Logs e Monitoramento

Todos os webhooks são logados com:
- Timestamp
- Tipo de evento
- Dados recebidos
- Resultado do processamento
- Erros (se houver)

### 7. Testes

Para testar o webhook localmente:

```bash
node test-mercadopago-webhook.js
```

### 8. Segurança

- ✅ Verificação de assinatura (quando disponível)
- ✅ Validação de dados
- ✅ Logs detalhados
- ✅ Tratamento de erros
- ✅ Rate limiting (se necessário)

### 9. Troubleshooting

#### Webhook não está sendo recebido
1. Verificar se a URL está correta
2. Verificar se o servidor está rodando
3. Verificar logs do servidor
4. Testar com curl ou Postman

#### Pagamento não está ativando VIP
1. Verificar logs do webhook
2. Verificar se o usuário existe
3. Verificar se o valor está correto
4. Verificar se o plano existe

#### Erro de assinatura
1. Verificar se a chave secreta está correta
2. Verificar se o header está sendo enviado
3. Verificar se o payload está correto

### 10. Exemplo de Uso

```javascript
// Criar pedido
const order = await axios.post('/api/payments/create-order', {
  userId: 1,
  planId: 'vip',
  paymentMethod: 'credit_card'
});

// Simular pagamento (para testes)
const payment = await axios.post('/api/payments/simulate-payment', {
  userId: 1,
  planId: 'vip',
  paymentId: 'TEST_PAY_123'
});
```

## Status da Implementação

- ✅ Webhook configurado
- ✅ Processamento de pagamentos
- ✅ Ativação automática de VIP
- ✅ Logs e monitoramento
- ✅ Tratamento de erros
- ✅ Testes implementados
- ✅ Documentação completa
