# Migração para Nova Estrutura de Planos

Este documento explica como migrar do sistema antigo (tabela `user_vip`) para a nova estrutura normalizada (relacionamento direto entre `users` e `plans`).

## 🎯 Objetivo

Eliminar a tabela intermediária `user_vip` e criar um relacionamento direto entre usuários e planos através de uma foreign key `plan_id` na tabela `users`.

## 📊 Nova Estrutura

### Tabelas Envolvidas

1. **`users`** - Tabela de usuários
   - Nova coluna: `plan_id` (FK para `plans.id`)
   - Campos relacionados: `is_vip`, `vip_expires_at`, `account_type`

2. **`plans`** - Tabela de planos
   - 20 novos planos organizados em 5 categorias
   - Categorias: Pré-Jogo, Live, Pré+Live, Valuebet, Full
   - Períodos: Diário, Semanal, Mensal, Anual

### Novos Planos

| Categoria | Período | Nome | Preço | Duração |
|-----------|---------|------|-------|---------|
| Pré-Jogo | Diário | Pré-Jogo Diário | R$ 19,90 | 1 dia |
| Pré-Jogo | Semanal | Pré-Jogo Semanal | R$ 39,90 | 7 dias |
| Pré-Jogo | Mensal | Pré-Jogo Mensal | R$ 79,90 | 30 dias |
| Pré-Jogo | Anual | Pré-Jogo Anual | R$ 299,90 | 365 dias |
| Live | Diário | Live Diário | R$ 19,90 | 1 dia |
| Live | Semanal | Live Semanal | R$ 39,90 | 7 dias |
| Live | Mensal | Live Mensal | R$ 79,90 | 30 dias |
| Live | Anual | Live Anual | R$ 299,90 | 365 dias |
| Pré+Live | Diário | Pré+Live Diário | R$ 29,90 | 1 dia |
| Pré+Live | Semanal | Pré+Live Semanal | R$ 59,90 | 7 dias |
| Pré+Live | Mensal | Pré+Live Mensal | R$ 119,90 | 30 dias |
| Pré+Live | Anual | Pré+Live Anual | R$ 399,90 | 365 dias |
| Valuebet | Diário | Valuebet Diário | R$ 19,90 | 1 dia |
| Valuebet | Semanal | Valuebet Semanal | R$ 39,90 | 7 dias |
| Valuebet | Mensal | Valuebet Mensal | R$ 79,90 | 30 dias |
| Valuebet | Anual | Valuebet Anual | R$ 299,90 | 365 dias |
| Full | Diário | Full Diário | R$ 39,90 | 1 dia |
| Full | Semanal | Full Semanal | R$ 79,90 | 7 dias |
| Full | Mensal | Full Mensal | R$ 159,90 | 30 dias |
| Full | Anual | Full Anual | R$ 599,90 | 365 dias |

## 🚀 Como Executar a Migração

### Opção 1: Script Automático (Recomendado)

```bash
cd scripts
node setup-new-plan-structure.js
```

Este script executa todos os passos automaticamente:
1. Adiciona coluna `plan_id` na tabela `users`
2. Atualiza tabela `plans` com os novos planos
3. Migra dados existentes da tabela `user_vip`

### Opção 2: Scripts Individuais

```bash
# Passo 1: Adicionar coluna plan_id
node add-plan-id-to-users.js

# Passo 2: Atualizar tabela plans
node update-plans-table.js

# Passo 3: Migrar dados existentes
node migrate-user-vip-to-plans.js
```

## 🔄 Mapeamento de Planos Antigos

Os planos antigos são mapeados para os novos da seguinte forma:

| Plano Antigo | Novo Plano | Motivo |
|--------------|------------|--------|
| `basic` | `pre-daily` | Mapeamento para pré-jogo diário |
| `premium` | `pre-weekly` | Mapeamento para pré-jogo semanal |
| `vip` | `pre-monthly` | Mapeamento para pré-jogo mensal |
| Outros | Mantidos | Planos já existentes são mantidos |

## 📡 APIs Atualizadas

### Novas Rotas

- `GET /api/users/with-plans` - Lista usuários com planos ativos (substitui `/api/vip/active`)

### APIs Modificadas

- `GET /api/plans` - Agora consulta o banco de dados (não mais hardcoded)
- `GET /api/users` - Inclui dados do plano via JOIN
- `GET /api/users/profile` - Inclui dados do plano via JOIN

## 🎨 Frontend Atualizado

### VIPAdminView.vue

- Removidos dados hardcoded de planos
- Atualizada função `loadActiveVIPs()` para usar `/api/users/with-plans`
- Planos carregados dinamicamente da API

## ✅ Verificações Pós-Migração

1. **Testar APIs:**
   ```bash
   curl http://localhost:3000/api/plans
   curl http://localhost:3000/api/users/with-plans
   ```

2. **Verificar Frontend:**
   - Acessar VIPAdminView
   - Verificar se planos são carregados corretamente
   - Testar funcionalidades de ativação/edição

3. **Verificar Banco de Dados:**
   ```sql
   -- Verificar usuários com planos
   SELECT u.id, u.email, p.display_name, p.category 
   FROM users u 
   JOIN plans p ON u.plan_id = p.id 
   WHERE u.plan_id IS NOT NULL;
   
   -- Verificar contagem de planos
   SELECT category, COUNT(*) as count 
   FROM plans 
   GROUP BY category;
   ```

## 🗑️ Limpeza (Opcional)

Após confirmar que tudo está funcionando:

1. **Backup da tabela antiga:**
   ```sql
   CREATE TABLE user_vip_backup AS SELECT * FROM user_vip;
   ```

2. **Remover tabela antiga:**
   ```sql
   DROP TABLE user_vip;
   ```

## 🚨 Rollback (Se Necessário)

Se algo der errado, você pode reverter:

1. **Restaurar backup da tabela user_vip**
2. **Remover coluna plan_id:**
   ```sql
   ALTER TABLE users DROP COLUMN plan_id;
   ```
3. **Restaurar código anterior das APIs**

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do servidor
2. Verificar logs do banco de dados
3. Testar APIs individualmente
4. Verificar se todos os modelos estão carregados corretamente
