# Guia de Testes do Sistema de Autenticação

## 🧪 Cenários de Teste

### 1. Teste de Usuário Não Autenticado

#### 1.1 Tentativa de Acesso a Rota VIP
- **Ação**: Usuário não logado tenta acessar `/` (SurebetsView)
- **Resultado Esperado**: 
  - Redirecionado para `/plans`
  - `localStorage.redirectAfterUpgrade` contém `/`
  - Console mostra: `🚫 Rota VIP acessada sem permissão: /`

#### 1.2 Tentativa de Acesso a Rota Admin
- **Ação**: Usuário não logado tenta acessar `/admin`
- **Resultado Esperado**:
  - Redirecionado para `/plans`
  - `localStorage.redirectAfterUpgrade` contém `/admin`
  - Console mostra: `🚫 Rota admin acessada sem permissão: /admin`

#### 1.3 Tentativa de Acesso a Rota Auth
- **Ação**: Usuário não logado tenta acessar `/referrals`
- **Resultado Esperado**:
  - Redirecionado para `/login`
  - `localStorage.redirectAfterLogin` contém `/referrals`
  - Console mostra: `🚫 Rota protegida acessada sem autenticação: /referrals`

### 2. Teste de Usuário Básico (Auth)

#### 2.1 Acesso a Rota Auth
- **Ação**: Usuário logado (básico) acessa `/referrals`
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresAuth="true"`
  - Página carrega normalmente

#### 2.2 Tentativa de Acesso a Rota VIP
- **Ação**: Usuário logado (básico) tenta acessar `/`
- **Resultado Esperado**:
  - Redirecionado para `/plans`
  - `localStorage.redirectAfterUpgrade` contém `/`
  - Console mostra: `🚫 Rota VIP acessada sem permissão: /`

#### 2.3 Tentativa de Acesso a Rota Admin
- **Ação**: Usuário logado (básico) tenta acessar `/admin`
- **Resultado Esperado**:
  - Redirecionado para `/plans`
  - `localStorage.redirectAfterUpgrade` contém `/admin`
  - Console mostra: `🚫 Rota admin acessada sem permissão: /admin`

### 3. Teste de Usuário VIP

#### 3.1 Acesso a Rota VIP
- **Ação**: Usuário VIP acessa `/` (SurebetsView)
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresVIP="true"`
  - Página carrega normalmente

#### 3.2 Acesso a Rota Auth
- **Ação**: Usuário VIP acessa `/referrals`
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresAuth="true"`
  - Página carrega normalmente

#### 3.3 Tentativa de Acesso a Rota Admin
- **Ação**: Usuário VIP tenta acessar `/admin`
- **Resultado Esperado**:
  - Redirecionado para `/plans`
  - `localStorage.redirectAfterUpgrade` contém `/admin`
  - Console mostra: `🚫 Rota admin acessada sem permissão: /admin`

### 4. Teste de Usuário Admin

#### 4.1 Acesso a Rota Admin
- **Ação**: Usuário admin acessa `/admin`
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresAdmin="true"`
  - Página carrega normalmente

#### 4.2 Acesso a Rota VIP
- **Ação**: Usuário admin acessa `/` (SurebetsView)
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresVIP="true"`
  - Página carrega normalmente

#### 4.3 Acesso a Rota Auth
- **Ação**: Usuário admin acessa `/referrals`
- **Resultado Esperado**:
  - Acesso permitido
  - RouteGuard valida `requiresAuth="true"`
  - Página carrega normalmente

### 5. Teste de Redirecionamento Inteligente

#### 5.1 Redirecionamento Após Login
- **Cenário**: Usuário tenta acessar `/referrals` → redirecionado para `/login` → faz login
- **Resultado Esperado**:
  - Após login, redirecionado para `/referrals`
  - `localStorage.redirectAfterLogin` é limpo

#### 5.2 Redirecionamento Após Upgrade
- **Cenário**: Usuário básico tenta acessar `/` → redirecionado para `/plans` → faz upgrade
- **Resultado Esperado**:
  - Após upgrade, redirecionado para `/`
  - `localStorage.redirectAfterUpgrade` é limpo

### 6. Teste de Páginas Públicas

#### 6.1 Acesso a PlansView
- **Ação**: Usuário não logado acessa `/plans`
- **Resultado Esperado**:
  - Acesso permitido
  - Sem redirecionamento
  - Página carrega normalmente

#### 6.2 Acesso a LoginView
- **Ação**: Usuário não logado acessa `/login`
- **Resultado Esperado**:
  - Acesso permitido
  - Sem redirecionamento
  - Página carrega normalmente

## 🔍 Verificações no Console

### Logs de Navegação
```
🔄 Navegação: / → /referrals
🚫 Rota protegida acessada sem autenticação: /referrals
```

### Logs de Guards
```
🔒 Verificando acesso VIP para: /surebets
✅ Acesso VIP autorizado para: viniciius@live.com
```

### Logs de Store
```
🔐 Login realizado para: viniciius@live.com
🔑 Token atualizado no store
```

## 📱 Testes de Responsividade

### 1. Mobile (320px - 768px)
- **RouteGuard**: Deve se adaptar ao tamanho da tela
- **Mensagens**: Texto deve ser legível
- **Botões**: Tamanho adequado para touch

### 2. Tablet (768px - 1024px)
- **Layout**: Deve manter proporções adequadas
- **Navegação**: Sidebar deve funcionar corretamente

### 3. Desktop (1024px+)
- **Layout**: Deve usar todo o espaço disponível
- **Sidebar**: Deve expandir/colapsar corretamente

## 🚨 Cenários de Erro

### 1. Token Expirado
- **Ação**: Usuário com token expirado tenta acessar rota protegida
- **Resultado Esperado**:
  - Redirecionado para `/login`
  - Mensagem de sessão expirada
  - Token removido do store

### 2. Usuário Removido
- **Ação**: Usuário logado é removido do sistema
- **Resultado Esperado**:
  - Redirecionado para `/login`
  - Mensagem de conta inválida
  - Estado limpo

### 3. Permissões Alteradas
- **Ação**: Usuário VIP é rebaixado para básico
- **Resultado Esperado**:
  - Redirecionado para `/plans`
  - Mensagem de upgrade necessário
  - Estado atualizado

## 📊 Métricas de Teste

### Performance
- **Tempo de resposta**: < 100ms para verificações de auth
- **Renderização**: < 200ms para RouteGuard
- **Redirecionamento**: < 50ms

### Usabilidade
- **Feedback visual**: Mensagens claras e visíveis
- **Navegação**: Redirecionamentos intuitivos
- **Responsividade**: Funciona em todos os dispositivos

### Segurança
- **Proteção**: Nenhuma rota protegida acessível sem permissão
- **Validação**: Estado sempre verificado
- **Isolamento**: Usuários não podem acessar dados de outros

## 🎯 Checklist de Testes

### Funcionalidade
- [ ] Todas as rotas protegidas funcionam corretamente
- [ ] Redirecionamentos inteligentes funcionam
- [ ] RouteGuard exibe mensagens corretas
- [ ] Logs aparecem no console

### Usabilidade
- [ ] Mensagens são claras e informativas
- [ ] Botões de ação funcionam corretamente
- [ ] Layout se adapta a diferentes tamanhos
- [ ] Navegação é intuitiva

### Segurança
- [ ] Usuários não podem acessar rotas não autorizadas
- [ ] Estado é validado em tempo real
- [ ] Tokens são verificados corretamente
- [ ] Permissões são respeitadas

### Performance
- [ ] Verificações são rápidas
- [ ] Não há travamentos
- [ ] Memória é gerenciada corretamente
- [ ] Redirecionamentos são instantâneos

---

**Status**: ✅ **GUIA DE TESTES COMPLETO**
**Última Atualização**: Dezembro 2024
**Versão**: 1.0.0
