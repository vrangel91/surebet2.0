# 🔐 Sistema de Login - ZEROLOSS Surebets

## 📋 Visão Geral

O sistema de login foi implementado com segurança e funcionalidades modernas, incluindo:

- **Autenticação segura** com JWT tokens
- **Proteção de rotas** com guards de navegação
- **Funcionalidade "Lembrar-me"** 
- **Bloqueio por tentativas** de login
- **Validação de formulários** em tempo real
- **Interface responsiva** baseada no design fornecido

## 🚀 Como Usar

### Credenciais de Teste
Para testar o sistema, use as seguintes credenciais:
- **E-mail:** `admin@zeroloss.com`
- **Senha:** `123456`

### Funcionalidades

#### 1. Login
- Validação de e-mail e senha
- Mostrar/ocultar senha
- Checkbox "Lembrar-me"
- Link "Esqueceu sua senha?"

#### 2. Segurança
- **Bloqueio por tentativas:** Após 5 tentativas falhadas, o usuário é bloqueado por 15 minutos
- **Validação de token:** Verificação automática de tokens expirados
- **Logout automático:** Redirecionamento automático em caso de sessão expirada

#### 3. Persistência
- **Token JWT:** Armazenado no localStorage
- **Dados do usuário:** Salvos localmente
- **"Lembrar-me":** E-mail salvo por 7 dias

## 🛠️ Implementação Técnica

### Estrutura de Arquivos

```
src/
├── views/
│   └── LoginView.vue          # Página de login
├── store/
│   └── index.js              # Store Vuex para autenticação
├── router/
│   ├── index.js              # Configuração de rotas
│   └── guards.js             # Guards de proteção
└── utils/
    └── http.js               # Interceptor HTTP
```

### Componentes Principais

#### 1. LoginView.vue
- Interface de login responsiva
- Validação de formulários
- Gerenciamento de estado de loading
- Tratamento de erros

#### 2. Store (Vuex)
- Gerenciamento centralizado de autenticação
- Persistência de dados no localStorage
- Actions para login/logout

#### 3. Router Guards
- `requireAuth`: Protege rotas que precisam de autenticação
- `requireGuest`: Impede usuários logados de acessar login

#### 4. HTTP Interceptor
- Adiciona automaticamente token de autenticação
- Trata erros 401 (Unauthorized)
- Logout automático em caso de sessão expirada

## 🔧 Configuração

### 1. Integração com API Real

Para integrar com sua API real, modifique o método `authenticateUser()` em `LoginView.vue`:

```javascript
async authenticateUser() {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: this.email, 
      password: this.password 
    })
  })
  
  const data = await response.json()
  
  if (response.ok) {
    return {
      success: true,
      token: data.token,
      user: data.user
    }
  } else {
    return {
      success: false,
      message: data.message || 'Erro de autenticação'
    }
  }
}
```

### 2. Validação de Token

Para implementar validação real de token, modifique `utils/http.js`:

```javascript
export async function validateToken() {
  try {
    const response = await fetch('/api/auth/validate', {
      headers: addAuthHeaders()
    })
    return response.ok
  } catch (error) {
    return false
  }
}
```

### 3. Recuperação de Senha

Implemente a funcionalidade de recuperação de senha no método `forgotPassword()`:

```javascript
forgotPassword() {
  // Implementar lógica de recuperação
  this.$router.push('/forgot-password')
}
```

## 🎨 Personalização

### Cores e Estilo
O sistema usa variáveis CSS para fácil personalização:

```scss
:root {
  --accent-primary: #00ff88;    // Cor principal
  --accent-secondary: #00cc6a;  // Cor secundária
  --bg-primary: #1a1a1a;        // Fundo principal
  --text-primary: #ffffff;      // Texto principal
}
```

### Logo
Para alterar o logo, modifique o emoji em `LoginView.vue`:

```html
<span class="logo-icon">🦁</span>  <!-- Altere este emoji -->
```

## 🔒 Segurança

### Medidas Implementadas

1. **Validação de Entrada**
   - Validação de e-mail com regex
   - Verificação de senha mínima (6 caracteres)

2. **Proteção contra Ataques**
   - Bloqueio por tentativas excessivas
   - Timeout de 15 minutos após 5 tentativas

3. **Gerenciamento de Sessão**
   - Tokens JWT para autenticação
   - Logout automático em sessões expiradas
   - Limpeza de dados ao fazer logout

4. **Proteção de Rotas**
   - Guards de navegação
   - Redirecionamento automático

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Deploy

Para fazer deploy:

1. **Build do projeto:**
   ```bash
   npm run build
   ```

2. **Configurar servidor:**
   - Configurar rotas para SPA (Single Page Application)
   - Todas as rotas devem redirecionar para `index.html`

3. **Configurar HTTPS:**
   - Recomendado para produção
   - Necessário para localStorage em alguns navegadores

## 🔧 Troubleshooting

### Problemas Comuns

1. **Token não persiste:**
   - Verificar se localStorage está habilitado
   - Verificar se o domínio tem HTTPS (em produção)

2. **Redirecionamento infinito:**
   - Verificar configuração dos guards de rota
   - Verificar se o store está sendo inicializado corretamente

3. **Erro de compilação:**
   - Verificar se Vuex está instalado: `npm install vuex@next`
   - Verificar se todas as dependências estão instaladas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console do navegador
2. Verificar se todas as dependências estão instaladas
3. Verificar configuração do servidor de desenvolvimento

---

**Desenvolvido para ZEROLOSS Surebets** 🚀
