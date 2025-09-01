# Sistema de Autenticação - SureStake

## Visão Geral

O sistema de autenticação do SureStake foi implementado com múltiplas camadas de proteção para garantir que apenas usuários autorizados possam acessar as funcionalidades da aplicação.

## Arquitetura

### 1. Guards de Rota (Router Guards)

#### Guards Globais
- **`router.beforeEach`**: Middleware global que verifica todas as rotas antes da navegação
- **Metadados de rota**: Cada rota possui metadados que definem os requisitos de acesso

#### Tipos de Proteção
- **`requiresAuth`**: Requer apenas autenticação (usuário logado)
- **`requiresVIP`**: Requer autenticação + conta VIP/Premium
- **`requiresAdmin`**: Requer autenticação + permissões de administrador
- **`requiresGuest`**: Requer que o usuário NÃO esteja autenticado (páginas de login)

### 2. Store Vuex (Gerenciamento de Estado)

#### Estado de Autenticação
```javascript
state: {
  authToken: null,           // JWT token
  user: null,                // Dados do usuário
  isAuthenticated: false,    // Status de autenticação
}
```

#### Getters Principais
```javascript
getters: {
  isAuthenticated: state => state.isAuthenticated,
  currentUser: state => state.user,
  isAdmin: state => state.user?.is_admin === true,
  isVIP: state => {
    if (!state.user) return false
    if (state.user.is_admin === true) return true
    if (state.user.is_vip === true) return true
    return ['premium', 'vip'].includes(state.user.accountType)
  }
}
```

### 3. Componente RouteGuard

Componente reutilizável que pode ser usado em qualquer página para proteção adicional:

```vue
<template>
  <RouteGuard :requiresVIP="true">
    <!-- Conteúdo protegido -->
  </RouteGuard>
</template>

<script>
import RouteGuard from '../components/RouteGuard.vue'

export default {
  components: {
    RouteGuard
  }
}
</script>
```

## Configuração de Rotas

### Exemplo de Rota Protegida
```javascript
{
  path: '/admin',
  name: 'admin',
  component: AdminView,
  meta: { requiresAdmin: true }  // Requer permissões de admin
}
```

### Rotas Disponíveis
- **`/`** - Dashboard principal (requiresVIP)
- **`/reports`** - Relatórios (requiresVIP)
- **`/admin`** - Painel administrativo (requiresAdmin)
- **`/settings`** - Configurações (requiresAdmin)
- **`/referrals`** - Sistema de referências (requiresAuth)
- **`/support`** - Suporte (requiresAuth)
- **`/ranking`** - Ranking (requiresAuth)
- **`/guide`** - Guia (requiresAuth)
- **`/plans`** - Planos (público)
- **`/login`** - Login (requiresGuest)

## Fluxo de Autenticação

### 1. Login
1. Usuário acessa `/login`
2. Preenche credenciais
3. Sistema valida com backend
4. Token JWT é armazenado
5. Dados do usuário são salvos no store
6. Redirecionamento baseado no tipo de conta

### 2. Proteção de Rotas
1. Usuário tenta acessar rota protegida
2. Guard global verifica metadados da rota
3. Se não autorizado, redireciona para login/planos
4. Rota original é salva para redirecionamento após autenticação

### 3. Redirecionamento Inteligente
- **Após login**: Usuário é redirecionado para a rota que tentou acessar
- **Após upgrade**: Usuário é redirecionado para a rota VIP que tentou acessar

## Implementação em Componentes

### Usando RouteGuard
```vue
<template>
  <RouteGuard :requiresVIP="true" customMessage="Esta funcionalidade requer conta VIP">
    <div class="vip-content">
      <!-- Conteúdo exclusivo para VIPs -->
    </div>
  </RouteGuard>
</template>
```

### Verificação Programática
```javascript
computed: {
  canAccessFeature() {
    return this.$store.getters.isVIP
  }
},

methods: {
  handleProtectedAction() {
    if (!this.canAccessFeature) {
      this.$router.push('/plans')
      return
    }
    // Executa ação protegida
  }
}
```

## Níveis de Acesso

### 1. Básico (Basic)
- Acesso limitado
- Redirecionado para `/plans` após login
- Pode acessar páginas públicas

### 2. Premium/VIP
- Acesso completo ao sistema
- Redirecionado para `/` após login
- Pode acessar todas as funcionalidades

### 3. Administrador
- Acesso total + painel administrativo
- Pode gerenciar usuários e configurações
- Acesso a todas as rotas

## Segurança

### 1. Armazenamento Seguro
- Token JWT armazenado no localStorage
- Dados sensíveis não são expostos
- Logout limpa todos os dados

### 2. Validação de Token
- Verificação automática de autenticação
- Redirecionamento automático para login se token inválido
- Logs de tentativas de acesso não autorizado

### 3. Proteção de Rotas
- Múltiplas camadas de verificação
- Guards globais + metadados de rota
- Componente RouteGuard para proteção adicional

## Logs e Monitoramento

### Console Logs
- ✅ Acesso autorizado
- 🚫 Tentativas de acesso negado
- 🔄 Redirecionamentos
- 🔍 Verificações de status

### Exemplo de Log
```
✅ Acesso VIP autorizado para: user@example.com Rota: /reports
🚫 Tentativa de acesso VIP negada para usuário: basic@example.com Nível: basic Rota: /reports
🔄 Redirecionando para rota de upgrade: /reports
```

## Tratamento de Erros

### 1. Token Expirado
- Usuário é automaticamente deslogado
- Redirecionado para página de login
- Mensagem de sessão expirada

### 2. Acesso Negado
- Redirecionamento para página apropriada
- Mensagem explicativa do motivo
- Botões de ação (login, upgrade, voltar)

### 3. Rotas Não Encontradas
- Redirecionamento para dashboard
- Log de tentativa de acesso

## Personalização

### Mensagens Customizadas
```vue
<RouteGuard 
  :requiresVIP="true" 
  customMessage="Esta funcionalidade premium requer uma conta VIP ativa"
>
  <!-- Conteúdo -->
</RouteGuard>
```

### Estilos Customizados
O componente RouteGuard usa variáveis CSS para estilização:
- `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`
- `--primary-color`, `--border-color`

## Manutenção

### Adicionando Nova Rota Protegida
1. Adicionar metadados na configuração da rota
2. Implementar guard específico se necessário
3. Testar fluxo de autenticação

### Modificando Níveis de Acesso
1. Atualizar getters no store
2. Verificar guards existentes
3. Testar todas as rotas afetadas

### Debugging
- Verificar console logs
- Usar Vue DevTools para inspecionar store
- Verificar localStorage para dados de autenticação

## Exemplos de Uso

### Página VIP Simples
```vue
<template>
  <RouteGuard :requiresVIP="true">
    <div class="vip-page">
      <h1>Conteúdo VIP</h1>
      <!-- Conteúdo exclusivo -->
    </div>
  </RouteGuard>
</template>
```

### Página com Múltiplos Níveis
```vue
<template>
  <div>
    <!-- Conteúdo básico para todos -->
    <div class="basic-content">
      <h1>Bem-vindo!</h1>
    </div>
    
    <!-- Conteúdo VIP -->
    <RouteGuard :requiresVIP="true">
      <div class="vip-content">
        <h2>Funcionalidades VIP</h2>
      </div>
    </RouteGuard>
    
    <!-- Conteúdo Admin -->
    <RouteGuard :requiresAdmin="true">
      <div class="admin-content">
        <h2>Painel Administrativo</h2>
      </div>
    </RouteGuard>
  </div>
</template>
```

## Conclusão

O sistema de autenticação do SureStake oferece:
- **Segurança robusta** com múltiplas camadas de proteção
- **Flexibilidade** para diferentes níveis de acesso
- **Experiência do usuário** com redirecionamentos inteligentes
- **Manutenibilidade** com código limpo e bem estruturado
- **Monitoramento** completo com logs detalhados

Este sistema garante que apenas usuários autorizados possam acessar as funcionalidades da aplicação, mantendo a segurança e a integridade da plataforma.
