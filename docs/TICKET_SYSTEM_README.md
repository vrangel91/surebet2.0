# 🎫 Sistema de Tickets de Suporte

## 📋 Visão Geral

O sistema de tickets permite que usuários criem solicitações de suporte e que administradores gerenciem essas solicitações de forma eficiente.

## 🏗️ Arquitetura

### Backend
- **Modelos**: `Ticket` e `TicketMessage`
- **API**: `/api/tickets`
- **Banco**: PostgreSQL com Sequelize ORM

### Frontend
- **SupportView**: Interface para usuários criarem e visualizarem seus tickets
- **AdminView**: Painel administrativo para gerenciar todos os tickets

## 🗄️ Estrutura do Banco

### Tabela: `tickets`
```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('financial', 'technical', 'support', 'billing', 'feature', 'other')) NOT NULL DEFAULT 'other',
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('open', 'pending', 'closed')) NOT NULL DEFAULT 'open',
  user_id INTEGER NOT NULL REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `ticket_messages`
```sql
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) CHECK (message_type IN ('user', 'support', 'admin')) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Instalação

### 1. Executar script de inicialização
```bash
node scripts/init-ticket-tables.js
```

### 2. Verificar se as rotas estão registradas
O arquivo `server.js` deve incluir:
```javascript
const ticketsRoutes = require('./routes/tickets');
app.use('/api/tickets', ticketsRoutes);
```

## 📡 Endpoints da API

### GET `/api/tickets`
- **Descrição**: Lista tickets (usuários veem apenas os seus, admins veem todos)
- **Autenticação**: Obrigatória
- **Query Params**: `status`, `priority`, `category`, `search`
- **Resposta**: Lista de tickets com mensagens

### POST `/api/tickets`
- **Descrição**: Cria novo ticket
- **Autenticação**: Obrigatória
- **Body**: `{ title, description, category, priority }`
- **Resposta**: Ticket criado com primeira mensagem

### POST `/api/tickets/:id/messages`
- **Descrição**: Adiciona mensagem ao ticket
- **Autenticação**: Obrigatória
- **Body**: `{ content }`
- **Resposta**: Mensagem criada

### PATCH `/api/tickets/:id/status`
- **Descrição**: Atualiza status do ticket (apenas admin)
- **Autenticação**: Obrigatória + Admin
- **Body**: `{ status }`
- **Resposta**: Confirmação de atualização

### GET `/api/tickets/stats`
- **Descrição**: Estatísticas dos tickets (apenas admin)
- **Autenticação**: Obrigatória + Admin
- **Resposta**: Contadores de tickets por status

## 👥 Funcionalidades por Tipo de Usuário

### Usuário Comum
- ✅ Criar tickets
- ✅ Visualizar seus próprios tickets
- ✅ Adicionar mensagens aos seus tickets
- ✅ Filtrar e buscar seus tickets

### Administrador
- ✅ Todas as funcionalidades de usuário comum
- ✅ Visualizar todos os tickets
- ✅ Responder a qualquer ticket
- ✅ Alterar status dos tickets
- ✅ Ver estatísticas gerais
- ✅ Gerenciar usuários

## 🎨 Interface do Usuário

### SupportView
- **Cards de estatísticas**: Contadores de tickets por status
- **Lista de tickets**: Filtros por status, prioridade e categoria
- **Modal de criação**: Formulário para novo ticket
- **Modal de detalhes**: Visualização completa do ticket e mensagens
- **Sistema de mensagens**: Chat integrado para comunicação

### AdminView
- **Dashboard**: Estatísticas gerais do sistema
- **Aba de usuários**: Gerenciamento completo de usuários
- **Aba de tickets**: Visualização e gerenciamento de todos os tickets
- **Ações administrativas**: Fechar tickets, responder como admin

## 🔄 Fluxo de Funcionamento

### 1. Criação de Ticket
```
Usuário → SupportView → Formulário → API POST /tickets → Banco → Resposta → Lista atualizada
```

### 2. Adição de Mensagem
```
Usuário/Admin → Modal de ticket → Nova mensagem → API POST /tickets/:id/messages → Banco → Ticket atualizado
```

### 3. Gerenciamento Admin
```
Admin → AdminView → Lista de tickets → Ações (fechar, responder) → API → Banco → Interface atualizada
```

## 🎯 Categorias de Tickets

- **financial**: Problemas financeiros, pagamentos
- **technical**: Problemas técnicos, bugs
- **support**: Dúvidas gerais, suporte
- **billing**: Cobrança, faturas
- **feature**: Sugestões, melhorias
- **other**: Outros assuntos

## 🚨 Prioridades

- **low**: Baixa prioridade
- **medium**: Prioridade média (padrão)
- **high**: Alta prioridade
- **urgent**: Urgente, requer atenção imediata

## 📊 Status dos Tickets

- **open**: Aberto, aguardando resposta
- **pending**: Em andamento, sendo atendido
- **closed**: Fechado, resolvido

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Banco de dados (já configurado)
DATABASE_URL=postgresql://user:password@localhost:5432/surebet
```

### Middleware de Autenticação
O sistema usa o middleware `authenticateToken` para proteger todas as rotas e `requireAdmin` para ações administrativas.

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"
```bash
# Executar script de inicialização
node scripts/init-ticket-tables.js
```

### Erro: "ENUM não suportado"
O script de inicialização tentará criar as tabelas manualmente com CHECK constraints.

### Erro: "Token inválido"
Verificar se o usuário está logado e se o token está sendo enviado corretamente.

## 🚀 Próximos Passos

- [ ] Implementar sistema de notificações em tempo real
- [ ] Adicionar sistema de anexos
- [ ] Implementar templates de resposta
- [ ] Sistema de avaliação de atendimento
- [ ] Relatórios e analytics avançados
- [ ] Integração com sistema de email

## 📝 Exemplo de Uso

### Criar Ticket (Frontend)
```javascript
// SupportView.vue
await this.$store.dispatch('createTicket', {
  title: 'Problema com login',
  description: 'Não consigo acessar minha conta',
  category: 'technical',
  priority: 'high'
})
```

### Adicionar Mensagem (Frontend)
```javascript
// SupportView.vue ou AdminView.vue
await this.$store.dispatch('addMessageToTicket', {
  ticketId: 123,
  content: 'Vou verificar o problema'
})
```

### Fechar Ticket (Admin)
```javascript
// AdminView.vue
await axios.patch(`/api/tickets/${ticketId}/status`, {
  status: 'closed'
})
```

## 🤝 Contribuição

Para contribuir com melhorias no sistema de tickets:

1. Criar branch para a feature
2. Implementar mudanças
3. Testar funcionalidades
4. Atualizar documentação
5. Criar pull request

---

**Desenvolvido para o sistema SureStake** 🚀
