# Sistema de Gerenciamento de Pagamentos - Admin

## 📋 Visão Geral

O sistema de gerenciamento de pagamentos no painel administrativo permite que administradores tenham controle total sobre os pagamentos dos usuários, incluindo visualização, aprovação e rejeição de pagamentos.

## 🎯 Funcionalidades

### 1. **Aba de Pagamentos**
- Nova aba "💳 Pagamentos" no painel administrativo
- Lista todos os pagamentos com informações detalhadas
- Filtros avançados para busca e organização

### 2. **Filtros Disponíveis**
- **Busca**: Por usuário, email ou ID do pagamento
- **Plano**: Todos os planos disponíveis (básico, premium, VIP, diários, semanais, etc.)
- **Status**: Aprovado, Pendente, Rejeitado, Cancelado
- **Período**: Hoje, Esta Semana, Este Mês, Este Ano

### 3. **Informações dos Pagamentos**
- Nome e email do usuário
- ID do pagamento
- Plano contratado
- Valor pago
- Método de pagamento
- Status atual
- Data do pagamento
- Data de expiração (se aplicável)

### 4. **Ações Administrativas**
- **Ver Detalhes**: Modal com informações completas
- **Aprovar**: Aprova pagamento e ativa VIP automaticamente
- **Rejeitar**: Rejeita pagamento com justificativa

## 🔧 Implementação Técnica

### Frontend (AdminView.vue)

#### Componentes Adicionados:
```vue
<!-- Nova aba de pagamentos -->
<div v-if="activeTab === 'payments'" class="tab-content">
  <!-- Filtros e lista de pagamentos -->
</div>

<!-- Modal de detalhes -->
<div v-if="showPaymentDetailModal" class="modal-overlay">
  <!-- Detalhes completos do pagamento -->
</div>
```

#### Novos Dados:
```javascript
data() {
  return {
    // Filtros de pagamento
    paymentSearchQuery: '',
    paymentPlanFilter: '',
    paymentStatusFilter: '',
    paymentPeriodFilter: '',
    
    // Estado dos pagamentos
    selectedPayment: null,
    payments: [],
    loadingPayments: false,
    showPaymentDetailModal: false
  }
}
```

#### Novos Métodos:
- `loadPayments()`: Carrega pagamentos da API
- `viewPaymentDetails()`: Abre modal de detalhes
- `approvePayment()`: Aprova pagamento
- `rejectPayment()`: Rejeita pagamento
- `getPaymentStatusText()`: Converte status para texto
- `getPaymentMethodText()`: Converte método para texto
- `getPlanDisplayName()`: Converte ID do plano para nome

### Backend (routes/admin.js)

#### Endpoints Criados:

##### GET `/api/admin/payments`
```javascript
// Busca todos os pagamentos com informações do usuário
router.get('/payments', async (req, res) => {
  // Retorna lista paginada de pagamentos
});
```

##### PATCH `/api/admin/payments/:id/approve`
```javascript
// Aprova pagamento e ativa VIP
router.patch('/payments/:id/approve', async (req, res) => {
  // Atualiza status e ativa VIP do usuário
});
```

##### PATCH `/api/admin/payments/:id/reject`
```javascript
// Rejeita pagamento
router.patch('/payments/:id/reject', async (req, res) => {
  // Atualiza status para rejeitado
});
```

##### GET `/api/admin/payments/stats`
```javascript
// Retorna estatísticas de pagamentos
router.get('/payments/stats', async (req, res) => {
  // Estatísticas por período e status
});
```

## 📊 Estrutura de Dados

### Resposta da API de Pagamentos:
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "user_id": 123,
      "user_name": "João Silva",
      "user_email": "joao@email.com",
      "plan_id": "pre-daily",
      "amount": 29.90,
      "status": "approved",
      "payment_method": "pix",
      "payment_id": "MP123456789",
      "description": "Surebet Pré-Jogo Diário",
      "created_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-16T10:30:00Z"
    }
  ]
}
```

### Estatísticas:
```json
{
  "success": true,
  "stats": {
    "totalPayments": 150,
    "todayPayments": 5,
    "weekPayments": 25,
    "monthPayments": 80,
    "approvedPayments": 120,
    "pendingPayments": 20,
    "rejectedPayments": 10,
    "totalRevenue": 4500.00,
    "todayRevenue": 150.00,
    "weekRevenue": 750.00,
    "monthRevenue": 2400.00
  }
}
```

## 🎨 Estilos CSS

### Classes Principais:
- `.payments-list`: Container da lista
- `.payment-card`: Card individual do pagamento
- `.payment-header`: Cabeçalho com usuário e status
- `.payment-details`: Detalhes do pagamento
- `.payment-actions`: Botões de ação
- `.payment-detail-modal`: Modal de detalhes

### Estados Visuais:
- **Aprovado**: Verde (#28a745)
- **Pendente**: Amarelo (#ffc107)
- **Rejeitado**: Vermelho (#dc3545)
- **Cancelado**: Cinza (#6c757d)

## 🔐 Segurança

### Middleware de Autenticação:
```javascript
// Verifica token JWT
router.use(authenticateToken);

// Verifica se é administrador
router.use(requireAdmin);
```

### Validações:
- Verificação de permissões de admin
- Validação de status do pagamento
- Confirmação antes de aprovar/rejeitar
- Logs de todas as ações administrativas

## 📱 Responsividade

### Breakpoints:
- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Layout adaptado com colunas reduzidas
- **Mobile**: Layout em coluna única com botões empilhados

### Adaptações Mobile:
- Filtros em coluna única
- Botões de ação empilhados
- Modal em tela cheia
- Texto otimizado para touch

## 🧪 Testes

### Script de Teste:
```bash
node test-admin-payments.js
```

### Cenários Testados:
1. Busca de pagamentos
2. Estatísticas
3. Aprovação de pagamento
4. Rejeição de pagamento
5. Tratamento de erros

## 🚀 Como Usar

### 1. Acessar Painel Admin
- Fazer login como administrador
- Navegar para a aba "💳 Pagamentos"

### 2. Filtrar Pagamentos
- Usar campo de busca para encontrar usuários específicos
- Selecionar filtros por plano, status ou período
- Aplicar múltiplos filtros simultaneamente

### 3. Gerenciar Pagamentos
- Clicar em "Ver Detalhes" para informações completas
- Usar "Aprovar" para ativar VIP automaticamente
- Usar "Rejeitar" para negar pagamento

### 4. Monitorar Estatísticas
- Visualizar totais por período
- Acompanhar receita gerada
- Monitorar status dos pagamentos

## 🔄 Integração com Sistema Existente

### Relacionamentos:
- **Payment** ↔ **User**: Um pagamento pertence a um usuário
- **Payment** ↔ **UserVIP**: Pagamento aprovado ativa VIP
- **Payment** ↔ **Plan**: Pagamento está associado a um plano

### Fluxo de Aprovação:
1. Usuário faz pagamento
2. Pagamento fica como "pending"
3. Admin visualiza na aba de pagamentos
4. Admin aprova/rejeita
5. Se aprovado, VIP é ativado automaticamente
6. Usuário recebe notificação

## 📈 Benefícios

### Para Administradores:
- Controle total sobre pagamentos
- Visibilidade completa do fluxo financeiro
- Aprovação/rejeição rápida
- Estatísticas em tempo real

### Para Usuários:
- Processo de pagamento transparente
- Ativação automática do VIP
- Notificações de status
- Suporte administrativo eficiente

### Para o Sistema:
- Auditoria completa de pagamentos
- Logs de todas as ações
- Integração com sistema de VIP
- Escalabilidade para grandes volumes

## 🛠️ Manutenção

### Logs Importantes:
- Aprovações de pagamento
- Rejeições de pagamento
- Erros de API
- Acessos administrativos

### Monitoramento:
- Performance das consultas
- Volume de pagamentos
- Taxa de aprovação
- Tempo de resposta da API

## 🔮 Futuras Melhorias

### Funcionalidades Planejadas:
- Exportação de relatórios
- Notificações em tempo real
- Histórico de alterações
- Aprovação em lote
- Integração com sistemas de pagamento
- Dashboard de métricas avançadas
