# Sistema de Gerenciamento de Contas de Casas de Apostas

## Visão Geral

O sistema de gerenciamento de contas permite que os usuários cadastrem e gerenciem suas contas em diferentes casas de apostas, controlem saldos e realizem saques fictícios para controle financeiro.

## Funcionalidades

### 1. Cadastro de Contas
- **Nome da Casa de Apostas**: Campo obrigatório para identificar a casa
- **Saldo Inicial**: Valor inicial da conta (opcional)
- **Moeda**: BRL (padrão), USD, EUR
- **Observações**: Campo livre para anotações
- **Status**: Ativa, Inativa, Suspensa

### 2. Gerenciamento de Saldos
- Visualização do saldo atual de cada conta
- Histórico de transações
- Atualização manual de saldos
- Controle de status da conta

### 3. Sistema de Saques (Fictício)
- **Funcionalidade**: Permite simular saques das contas
- **Propósito**: Controle financeiro e planejamento
- **Validação**: Verifica se há saldo suficiente
- **Histórico**: Registra todas as transações

### 4. Histórico de Transações
- **Tipos**: Depósito, Saque, Ajuste
- **Detalhes**: Valor, data/hora, descrição
- **Rastreamento**: Saldo antes e depois de cada transação

## Estrutura do Banco de Dados

### Tabela: `bookmaker_accounts`
```sql
- id (INTEGER, PK, AUTO_INCREMENT)
- user_id (INTEGER, FK para users.id)
- bookmaker_name (STRING, nome da casa)
- balance (DECIMAL(10,2), saldo atual)
- currency (STRING(3), moeda)
- status (ENUM: active, inactive, suspended)
- notes (TEXT, observações)
- last_updated (DATE, última atualização)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `transaction_history`
```sql
- id (INTEGER, PK, AUTO_INCREMENT)
- user_id (INTEGER, FK para users.id)
- bookmaker_account_id (INTEGER, FK para bookmaker_accounts.id)
- transaction_type (ENUM: deposit, withdrawal, adjustment)
- amount (DECIMAL(10,2), valor da transação)
- balance_before (DECIMAL(10,2), saldo anterior)
- balance_after (DECIMAL(10,2), saldo posterior)
- description (TEXT, descrição da transação)
- status (ENUM: completed, pending, failed, cancelled)
- reference_id (STRING, ID de referência)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## API Endpoints

### Contas
- `GET /api/bookmaker-accounts` - Listar contas do usuário
- `POST /api/bookmaker-accounts` - Criar nova conta
- `GET /api/bookmaker-accounts/:id` - Obter detalhes da conta
- `PUT /api/bookmaker-accounts/:id` - Atualizar conta
- `DELETE /api/bookmaker-accounts/:id` - Excluir conta

### Transações
- `POST /api/bookmaker-accounts/:id/withdraw` - Realizar saque
- `POST /api/bookmaker-accounts/:id/deposit` - Realizar depósito
- `GET /api/bookmaker-accounts/:id/transactions` - Histórico de transações

## Instalação e Configuração

### 1. Inicializar Tabelas
```bash
node scripts/init-bookmaker-tables.js
```

### 2. Verificar Rotas
As rotas já estão configuradas no `server.js`:
```javascript
app.use('/api/bookmaker-accounts', bookmakerAccountsRoutes);
```

### 3. Acessar a Interface
A página está disponível em: `/bookmaker-accounts`

## Uso da Interface

### Adicionar Nova Conta
1. Clique em "Adicionar Conta"
2. Preencha o nome da casa de apostas
3. Defina saldo inicial (opcional)
4. Selecione a moeda
5. Adicione observações se necessário
6. Clique em "Criar"

### Gerenciar Conta Existente
- **Editar**: Clique no ícone de edição
- **Excluir**: Clique no ícone de lixeira (apenas se não houver transações)
- **Ver Transações**: Clique em "Ver Transações"
- **Fazer Saque**: Clique em "Saque"

### Realizar Saque
1. Clique em "Saque" na conta desejada
2. Digite o valor do saque
3. Adicione uma descrição (opcional)
4. Confirme o saque

## Validações e Regras

### Criação de Conta
- Nome da casa é obrigatório (mínimo 2 caracteres)
- Não pode existir duas contas com o mesmo nome para o mesmo usuário
- Saldo deve ser um número positivo

### Saques
- Conta deve estar ativa
- Saldo deve ser suficiente
- Valor deve ser maior que zero

### Exclusão de Conta
- Só é permitida se não houver transações associadas
- Protege a integridade do histórico

## Segurança

- Todas as rotas requerem autenticação
- Usuários só podem acessar suas próprias contas
- Validação de dados em todas as operações
- Logs de todas as transações para auditoria

## Monitoramento

### Estatísticas Disponíveis
- Total de contas do usuário
- Saldo total de todas as contas
- Número de contas ativas
- Total de transações realizadas

### Histórico Completo
- Todas as transações são registradas
- Rastreamento de saldos antes e depois
- Timestamps precisos para auditoria

## Considerações Importantes

### Sistema Fictício
- **ATENÇÃO**: Este é um sistema de controle fictício
- Não há integração real com casas de apostas
- Saques são apenas para controle financeiro
- Não gera movimentação real de dinheiro

### Uso Responsável
- Sistema deve ser usado apenas para controle
- Não substitui verificações reais nas casas
- Mantenha saldos atualizados manualmente

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Consulte a documentação da API
3. Entre em contato com o suporte técnico

## Próximas Melhorias

- [ ] Integração com APIs reais de casas de apostas
- [ ] Notificações de transações
- [ ] Relatórios detalhados
- [ ] Exportação de dados
- [ ] Backup automático de transações
