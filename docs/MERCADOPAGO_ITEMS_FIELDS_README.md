# Campos Items - Mercado Pago

## Visão Geral

Este documento descreve a implementação dos campos `items.category_id` e `items.description` nos pagamentos do Mercado Pago para melhorar o índice de aprovação e reduzir fraudes.

## Campos Implementados

### 1. `items.category_id`
- **Valor**: `'services'`
- **Descrição**: Categoria do item como serviços
- **Benefício**: Melhora a análise de risco do Mercado Pago

### 2. `items.description`
- **Formato**: `"Acesso VIP ao plano {PLANO} por {DIAS} dias - SureStake"`
- **Exemplo**: `"Acesso VIP ao plano Premium por 30 dias - SureStake"`
- **Benefício**: Descrição detalhada para melhor validação

## Implementação

### 1. Pagamentos com Cartão de Crédito

**Arquivo**: `client/src/views/PlansView.vue`

```javascript
const paymentData = {
  // ... outros campos
  items: [{
    id: order.planId,
    title: order.planName,
    description: `Acesso VIP ao plano ${order.planName} por ${order.planDays} dias - SureStake`,
    category_id: 'services', // Categoria de serviços
    quantity: 1,
    unit_price: order.amount
  }],
  // ... outros campos
}
```

### 2. Pagamentos PIX

**Arquivo**: `config/mercadopago.js`

```javascript
const pixPayment = await this.payment.create({
  body: {
    // ... outros campos
    items: [{
      id: paymentData.planId || 'plan_vip',
      title: paymentData.planName || 'Plano VIP',
      description: `Acesso VIP ao plano ${paymentData.planName || 'VIP'} por ${paymentData.planDays || 30} dias - SureStake`,
      category_id: 'services', // Categoria de serviços
      quantity: 1,
      unit_price: parseFloat(paymentData.amount)
    }],
    // ... outros campos
  }
});
```

### 3. Dados do PIX (Backend)

**Arquivo**: `routes/orders.js`

```javascript
const pixRequestData = {
  amount: parseFloat(amount),
  description: `Plano ${planName} - PIX`,
  externalReference: order.id.toString(),
  planId: planId,        // ✅ Adicionado
  planName: planName,    // ✅ Adicionado
  planDays: planDays,    // ✅ Adicionado
  payer: {
    // ... dados do pagador
  }
};
```

## Estrutura dos Items

### Campos Obrigatórios
- `id`: Identificador único do item (ID do plano)
- `title`: Nome do item (nome do plano)
- `description`: Descrição detalhada do item
- `category_id`: Categoria do item (`'services'`)
- `quantity`: Quantidade (sempre 1)
- `unit_price`: Preço unitário

### Categorias Disponíveis
- `'services'`: Serviços (usado para planos VIP)
- `'digital_goods'`: Bens digitais
- `'physical_goods'`: Bens físicos
- `'tickets'`: Ingressos

## Benefícios

### 1. **Maior Aprovação**
- O Mercado Pago tem mais informações para análise
- Categoria clara do produto/serviço
- Descrição detalhada do que está sendo vendido

### 2. **Redução de Fraudes**
- Validação mais precisa do tipo de transação
- Análise de risco baseada na categoria
- Detecção de padrões suspeitos

### 3. **Melhor Experiência**
- Menos rejeições por falta de informações
- Processamento mais rápido
- Maior confiança do sistema

## Logs e Monitoramento

### Logs de Debug
```javascript
console.log('🔍 Dados para PIX:', {
  // ... outros campos
  items: {
    category_id: 'services',
    description: `Acesso VIP ao plano ${pixRequestData.planName} por ${pixRequestData.planDays} dias - SureStake`
  }
});
```

### Verificação dos Campos
- ✅ `items.category_id` sempre presente
- ✅ `items.description` sempre presente
- ✅ `items.id` baseado no ID do plano
- ✅ `items.title` baseado no nome do plano
- ✅ `items.quantity` sempre 1
- ✅ `items.unit_price` baseado no valor do plano

## Exemplos de Uso

### Plano Básico (7 dias)
```javascript
items: [{
  id: 'basic_7',
  title: 'Plano Básico',
  description: 'Acesso VIP ao plano Básico por 7 dias - SureStake',
  category_id: 'services',
  quantity: 1,
  unit_price: 29.90
}]
```

### Plano Premium (30 dias)
```javascript
items: [{
  id: 'premium_30',
  title: 'Plano Premium',
  description: 'Acesso VIP ao plano Premium por 30 dias - SureStake',
  category_id: 'services',
  quantity: 1,
  unit_price: 99.90
}]
```

## Conformidade

### Requisitos do Mercado Pago
- ✅ Campo `items.category_id` enviado
- ✅ Campo `items.description` enviado
- ✅ Estrutura correta dos items
- ✅ Dados consistentes entre cartão e PIX

### Validação
- ✅ Categoria sempre definida como 'services'
- ✅ Descrição sempre inclui nome do plano e duração
- ✅ ID do item baseado no ID do plano
- ✅ Preço unitário correto

## Troubleshooting

### Items não aparecem no pagamento
1. Verificar se os dados do plano estão sendo passados corretamente
2. Confirmar se o `planId`, `planName` e `planDays` estão definidos
3. Verificar logs do console para debug

### Categoria incorreta
- A categoria está fixa como 'services' (correto para planos VIP)
- Se necessário, pode ser alterada para outras categorias válidas

### Descrição muito longa
- A descrição é limitada a 500 caracteres pelo Mercado Pago
- Formato atual: "Acesso VIP ao plano {PLANO} por {DIAS} dias - SureStake"

## Monitoramento

Para monitorar a eficácia dos campos items:

1. **Logs do Console**: Verificar se os campos estão sendo enviados
2. **Painel Mercado Pago**: Acompanhar relatórios de pagamentos
3. **Taxa de Aprovação**: Monitorar melhorias na aprovação
4. **Relatórios de Fraude**: Verificar redução de falsos positivos

## Conclusão

A implementação dos campos `items.category_id` e `items.description` está completa e funcionando em todos os tipos de pagamento (cartão e PIX). Isso deve resultar em:

- ✅ **Maior índice de aprovação**
- ✅ **Melhor validação de segurança**
- ✅ **Redução de fraudes**
- ✅ **Conformidade total com as recomendações do Mercado Pago**
