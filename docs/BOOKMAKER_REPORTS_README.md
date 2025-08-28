# Sistema de Relatórios de Contas de Casas de Apostas

## Visão Geral

O sistema de relatórios de contas permite que os usuários adicionem suas contas de casas de apostas aos relatórios para acompanhamento e análise. Quando uma conta é adicionada aos relatórios, o sistema automaticamente desconta um valor padrão do saldo da conta e registra a transação.

## Funcionalidades

### 1. Adicionar aos Relatórios
- **Localização**: Botão "Adicionar aos Relatórios" em cada card de conta na página de Gerenciamento de Contas
- **Valor Padrão**: R$ 100,00 (configurável)
- **Validações**: 
  - Conta deve estar ativa
  - Deve ter saldo suficiente
  - Não pode resultar em saldo negativo

### 2. Sistema de Transações
- **Tipo**: Ajuste de saldo (`adjustment`)
- **Descrição**: "Adicionado aos relatórios - R$ X,XX"
- **Referência**: `report_addition`
- **Status**: Completo automaticamente

### 3. Armazenamento Local
- **Local**: `localStorage` com chave `bookmaker_accounts_reports`
- **Estrutura**: Array de objetos com informações completas da transação
- **Persistência**: Dados mantidos entre sessões

## Como Usar

### 1. Acessar Gerenciamento de Contas
- Navegue para `/bookmaker-accounts`
- Faça login com conta VIP

### 2. Adicionar Conta aos Relatórios
- Localize a conta desejada
- Clique no botão "Adicionar aos Relatórios"
- Confirme a ação no diálogo
- O sistema irá:
  - Verificar saldo disponível
  - Descontar R$ 100,00
  - Registrar transação
  - Salvar relatório localmente

### 3. Visualizar Relatórios
- Navegue para `/bookmaker-reports`
- Visualize todas as contas adicionadas
- Use filtros para buscar por casa ou status
- Clique em "Ver detalhes" para informações completas

## Estrutura dos Dados

### Relatório no localStorage
```json
{
  "id": 1234567890.123,
  "account_id": 1,
  "bookmaker_name": "Bet365",
  "amount": 100.00,
  "currency": "BRL",
  "date": "2024-01-15T10:30:00.000Z",
  "status": "active",
  "type": "report_addition",
  "description": "Conta adicionada aos relatórios - R$ 100,00",
  "balance_before": 500.00,
  "balance_after": 400.00
}
```

### Transação no Banco
```sql
-- Tabela: transaction_history
INSERT INTO transaction_history (
  user_id, 
  bookmaker_account_id, 
  transaction_type, 
  amount, 
  balance_before, 
  balance_after, 
  description, 
  status, 
  reference_id
) VALUES (
  1, 
  1, 
  'adjustment', 
  100.00, 
  500.00, 
  400.00, 
  'Adicionado aos relatórios - R$ 100,00', 
  'completed', 
  'report_addition'
);
```

## API Endpoints

### Ajustar Saldo da Conta
```
POST /api/bookmaker-accounts/:id/adjust-balance
```

**Body:**
```json
{
  "amount": -100.00,
  "description": "Adicionado aos relatórios - R$ 100,00",
  "type": "report_addition"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Saldo ajustado com sucesso",
  "data": {
    "transaction": { ... },
    "newBalance": 400.00,
    "adjustment": -100.00
  }
}
```

## Validações e Regras

### 1. Validações de Entrada
- Conta deve existir e pertencer ao usuário
- Conta deve estar ativa
- Valor deve ser um número válido
- Novo saldo não pode ser negativo

### 2. Regras de Negócio
- Valor padrão: R$ 100,00
- Apenas contas ativas podem ser adicionadas
- Saldo mínimo necessário: R$ 100,00
- Transação é registrada automaticamente

### 3. Tratamento de Erros
- Saldo insuficiente
- Conta inativa
- Erro de conexão com banco
- Erro de validação

## Interface do Usuário

### 1. Botão "Adicionar aos Relatórios"
- **Estilo**: Gradiente azul (#007bff → #0056b3)
- **Ícone**: SVG de gráfico/relatório
- **Estado**: Desabilitado se conta inativa ou sem saldo
- **Posição**: Terceiro botão no card de conta

### 2. Diálogo de Confirmação
- Mostra valor a ser descontado
- Explica o que será feito
- Requer confirmação explícita
- Botões: Cancelar e Confirmar

### 3. Notificações Toast
- **Sucesso**: Verde com ícone de check
- **Erro**: Vermelho com ícone de alerta
- **Aviso**: Amarelo com ícone de atenção

## Página de Relatórios

### 1. Estatísticas
- Total de relatórios
- Valor total
- Relatórios ativos
- Casas únicas

### 2. Filtros
- Busca por nome da casa
- Filtro por status
- Filtro por moeda

### 3. Lista de Relatórios
- Cards com informações da conta
- Botões de ação (ver detalhes, excluir)
- Layout responsivo

### 4. Modal de Detalhes
- Informações completas da transação
- Saldos antes e depois
- Data e hora da operação
- Tipo e descrição

## Configurações

### 1. Valor Padrão
- **Atual**: R$ 100,00
- **Localização**: Método `addToReports` em `BookmakerAccountsView.vue`
- **Modificação**: Alterar variável `reportAmount`

### 2. Chave do localStorage
- **Atual**: `bookmaker_accounts_reports`
- **Localização**: Método `saveReportToLocalStorage`
- **Modificação**: Alterar string da chave

### 3. Validações
- **Saldo mínimo**: R$ 100,00
- **Status da conta**: Apenas ativas
- **Tipo de transação**: Ajuste

## Manutenção

### 1. Limpeza de Dados
- Relatórios são armazenados localmente
- Não há limpeza automática
- Usuário pode excluir manualmente

### 2. Backup
- Dados são mantidos no localStorage
- Transações são salvas no banco
- Histórico completo preservado

### 3. Auditoria
- Todas as ações são logadas
- Logs incluem detalhes da operação
- Rastreabilidade completa

## Troubleshooting

### 1. Problemas Comuns
- **Botão desabilitado**: Verificar status da conta e saldo
- **Erro de API**: Verificar conexão e permissões
- **Dados não salvos**: Verificar localStorage e permissões

### 2. Logs de Debug
- Console do navegador mostra operações
- Logs incluem timestamps e detalhes
- Útil para identificar problemas

### 3. Validações
- Verificar se conta existe
- Confirmar saldo suficiente
- Validar permissões do usuário

## Futuras Melhorias

### 1. Configurabilidade
- Valor configurável por usuário
- Múltiplos tipos de relatório
- Templates personalizáveis

### 2. Integração
- Exportação para PDF/Excel
- Compartilhamento de relatórios
- Sincronização entre dispositivos

### 3. Análise
- Gráficos de evolução
- Comparativos entre casas
- Relatórios automáticos
