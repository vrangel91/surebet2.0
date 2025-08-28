# Sistema VIP - Documentação Completa

## 📋 Visão Geral

O sistema VIP implementado oferece controle completo sobre planos de assinatura (Basic, Premium, VIP) com gerenciamento automático de datas de início, fim, renovação e expiração.

## 🏗️ Arquitetura

### Modelos

#### UserVIP
- **Tabela**: `user_vip`
- **Propósito**: Armazenar informações de assinatura VIP dos usuários
- **Campos principais**:
  - `user_id`: ID do usuário
  - `plan_id`: ID do plano (basic, premium, vip)
  - `plan_name`: Nome do plano
  - `plan_days`: Duração em dias
  - `data_inicio`: Data/hora de ativação
  - `data_fim`: Data/hora de expiração (calculada automaticamente)
  - `status`: Status do VIP (ativo, inativo, expirado, cancelado)
  - `auto_renew`: Renovação automática
  - `amount`: Valor pago
  - `payment_method`: Método de pagamento

### Serviços

#### VIPService
Classe principal que gerencia todas as operações VIP:

- `activateVIP()`: Ativar VIP para usuário
- `checkVIPStatus()`: Verificar status VIP
- `renewVIP()`: Renovar VIP existente
- `cancelVIP()`: Cancelar VIP
- `getVIPHistory()`: Obter histórico VIP
- `processExpiredVIPs()`: Processar VIPs expirados
- `getVIPStatistics()`: Obter estatísticas
- `canAccessVIP()`: Verificar acesso VIP
- `migrateFromOldTable()`: Migrar dados antigos

### Middlewares

#### vipMiddleware.js
Middlewares para controle de acesso:

- `requireVIP()`: Requer acesso VIP
- `requirePremium()`: Requer Premium ou superior
- `requirePlan(plan)`: Requer plano específico
- `optionalVIP()`: Adiciona informações VIP sem bloquear
- `requireActiveVIP()`: Requer VIP ativo (não expirado)

## 🔗 APIs

### Endpoints Principais

#### Ativação e Renovação
```
POST /api/vip/activate
POST /api/vip/renew/:userId
```

#### Verificação de Status
```
GET /api/vip/status/:userId
GET /api/vip/my-status
POST /api/vip/check-access
```

#### Histórico e Estatísticas
```
GET /api/vip/history/:userId
GET /api/vip/my-history
GET /api/vip/statistics (admin)
```

#### Administração
```
PATCH /api/vip/cancel/:userId (admin)
POST /api/vip/process-expired (admin)
GET /api/vip/active (admin)
GET /api/vip/expiring-soon (admin)
POST /api/vip/migrate (admin)
```

## 🚀 Instalação e Configuração

### 1. Inicializar Sistema
```bash
node init-vip-system.js
```

### 2. Executar Testes
```bash
node test-vip-system.js
```

### 3. Scripts Disponíveis
```bash
# Inicializar tabela VIP
node scripts/init-user-vip-table.js

# Inicializar sistema completo
node init-vip-system.js

# Executar testes
node test-vip-system.js
```

## 📊 Funcionalidades

### ✅ Controle de Datas
- **data_inicio**: Data/hora da ativação
- **data_fim**: Calculada automaticamente (data_inicio + plan_days)
- **Verificação automática**: Status muda para 'expirado' quando data_fim < data_atual

### ✅ Status Automático
- **ativo**: VIP válido
- **inativo**: VIP desativado manualmente
- **expirado**: VIP expirou automaticamente
- **cancelado**: VIP cancelado por admin

### ✅ Renovação Inteligente
- **Renovação existente**: Adiciona dias à data_fim atual
- **Novo VIP**: Cria novo registro se não há VIP ativo
- **Auto-renew**: Suporte para renovação automática

### ✅ Histórico Completo
- Todas as operações são registradas
- Paginação para grandes volumes
- Informações de pagamento e método

### ✅ Processamento Automático
- Verificação automática de expiração
- Atualização de status em massa
- Notificações de expiração (preparado)

### ✅ Estatísticas Detalhadas
- VIPs ativos
- Expirando em breve
- Expirados hoje
- Criados este mês
- Total de usuários VIP

## 🔐 Controle de Acesso

### Hierarquia de Planos
```
basic (0) < premium (1) < vip (2) < admin (3)
```

### Middlewares de Acesso
```javascript
// Requer VIP
app.use('/api/vip-feature', requireVIP);

// Requer Premium ou superior
app.use('/api/premium-feature', requirePremium);

// Requer plano específico
app.use('/api/vip-only', requirePlan('vip'));

// Adiciona informações VIP sem bloquear
app.use('/api/public', optionalVIP);
```

## 📈 Exemplos de Uso

### Ativar VIP
```javascript
const result = await VIPService.activateVIP(userId, {
  plan_id: 'premium',
  plan_name: 'Premium Mensal',
  plan_days: 30,
  payment_method: 'pix',
  amount: 29.90,
  auto_renew: true
});
```

### Verificar Status
```javascript
const status = await VIPService.checkVIPStatus(userId);
if (status.hasVIP && !status.vipStatus.isExpired) {
  // Usuário tem VIP ativo
  console.log(`Dias restantes: ${status.vipStatus.daysRemaining}`);
}
```

### Renovar VIP
```javascript
const result = await VIPService.renewVIP(userId, {
  plan_id: 'vip',
  plan_name: 'VIP Trimestral',
  plan_days: 90,
  amount: 99.90
});
```

### Processar VIPs Expirados
```javascript
const result = await VIPService.processExpiredVIPs();
console.log(`${result.expiredCount} VIPs processados`);
```

## 🔄 Migração de Dados

O sistema inclui migração automática da tabela antiga `user_vip_status`:

```javascript
const result = await VIPService.migrateFromOldTable();
console.log(`${result.migratedCount} VIPs migrados`);
```

## 📊 Monitoramento

### Estatísticas em Tempo Real
```javascript
const stats = await VIPService.getVIPStatistics();
console.log(`VIPs ativos: ${stats.statistics.activeVIPs}`);
console.log(`Expirando em 7 dias: ${stats.statistics.expiringSoon}`);
```

### VIPs que Expiram em Breve
```javascript
// Endpoint: GET /api/vip/expiring-soon?days=7
// Retorna VIPs que expiram nos próximos 7 dias
```

## 🛠️ Manutenção

### Cron Jobs Recomendados
```javascript
// Processar VIPs expirados diariamente às 00:00
cron.schedule('0 0 * * *', async () => {
  await VIPService.processExpiredVIPs();
});

// Verificar VIPs que expiram em 7 dias
cron.schedule('0 9 * * *', async () => {
  // Enviar notificações de expiração
});
```

### Backup e Recuperação
- Backup da tabela `user_vip` diariamente
- Backup da tabela `users` (campo `is_vip` e `account_type`)
- Logs de todas as operações VIP

## 🚨 Tratamento de Erros

### Erros Comuns
- **Usuário não encontrado**: 404
- **VIP já ativo**: Renovação automática
- **VIP expirado**: Status atualizado automaticamente
- **Acesso negado**: 403 com detalhes do plano requerido

### Logs
Todas as operações são logadas com:
- Timestamp
- Usuário
- Operação
- Resultado
- Erros (se houver)

## 🔮 Próximos Passos

### Funcionalidades Planejadas
1. **Notificações**: Email/SMS para expiração
2. **Webhooks**: Integração com gateways de pagamento
3. **Interface Admin**: Dashboard para gerenciar VIPs
4. **Relatórios**: Relatórios detalhados de receita
5. **Promoções**: Códigos de desconto e promoções
6. **Trial**: Período de teste gratuito

### Melhorias Técnicas
1. **Cache**: Redis para consultas frequentes
2. **Queue**: Processamento assíncrono de renovações
3. **Audit**: Log detalhado de todas as mudanças
4. **API Rate Limiting**: Proteção contra abuso
5. **WebSocket**: Notificações em tempo real

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Executar testes: `node test-vip-system.js`
3. Verificar status: `GET /api/vip/statistics`
4. Consultar documentação da API

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Autor**: Sistema SureStake
