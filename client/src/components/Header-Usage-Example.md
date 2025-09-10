# 📱 Como Usar o Componente Header

## 🚀 Importação e Uso

### 1. **Importar o componente:**
```javascript
import Header from '../components/Header.vue'
```

### 2. **Registrar nos componentes:**
```javascript
components: {
  Header,
  // ... outros componentes
}
```

### 3. **Usar no template:**
```vue
<template>
  <div class="page-container">
    <!-- Header Global -->
    <Header />
    
    <!-- Conteúdo da página -->
    <main class="main-content">
      <!-- Seu conteúdo aqui -->
    </main>
  </div>
</template>
```

## 📋 Exemplo Completo

```vue
<template>
  <div class="page-container">
    <!-- Header Global -->
    <Header />
    
    <!-- Sidebar (se aplicável) -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <header class="content-header">
        <h1>Título da Página</h1>
        <p>Descrição da página</p>
      </header>
      
      <!-- Conteúdo específico da página -->
      <div class="page-content">
        <!-- Seu conteúdo aqui -->
      </div>
    </main>
  </div>
</template>

<script>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

export default {
  name: 'MinhaPagina',
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 0; /* Ajuste conforme necessário */
  
  /* Se tiver sidebar, ajuste o margin-left */
  &.with-sidebar {
    margin-left: 280px; /* Largura da sidebar */
  }
}

.content-header {
  margin-bottom: 24px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.page-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
}
</style>

## 🎯 Funcionalidades do Header

### **Modal de Usuário:**
- **Informações básicas:** Nome, status, avatar
- **Badge Premium:** Se o usuário for premium
- **Status VIP:** Informações sobre dados VIP
- **Ações:** Perfil, Configurações, Logout

### **Navegação:**
- **Logo/Título:** SureStake
- **Ícone de usuário:** Clicável para abrir modal
- **Responsivo:** Adapta-se a diferentes tamanhos de tela

### **Interações:**
- **Clique no usuário:** Abre modal
- **Clique fora:** Fecha modal
- **Tecla ESC:** Fecha modal
- **Hover effects:** Feedback visual

## 🔧 Personalização

### **Cores e Estilos:**
O Header usa as variáveis CSS do tema:
```scss
--bg-secondary: #2d2d2d
--border-primary: #404040
--accent-primary: #00ff88
--text-primary: #ffffff
--text-secondary: #b0b0b0
```

### **Modificar o título:**
```vue
<!-- No Header.vue -->
<h1 class="app-title">{{ appTitle }}</h1>

<script>
export default {
  data() {
    return {
      appTitle: 'Meu App' // Personalizar aqui
    }
  }
}
</script>
```

### **Adicionar mais ações:**
```vue
<!-- No modal do Header.vue -->
<div class="user-actions">
  <button class="action-btn profile-btn" @click="goToProfile">
    <i class="bi bi-person"></i>
    Perfil
  </button>
  
  <!-- Nova ação -->
  <button class="action-btn help-btn" @click="showHelp">
    <i class="bi bi-question-circle"></i>
    Ajuda
  </button>
  
  <button class="action-btn logout-btn" @click="logout">
    <i class="bi bi-box-arrow-right"></i>
    Sair
  </button>
</div>
```

## 📱 Responsividade

O Header é totalmente responsivo:
- **Desktop:** Largura total, altura 60px
- **Mobile:** Largura total, altura 56px
- **Modal:** Adapta-se ao tamanho da tela
- **Breakpoint:** 768px

## 🎨 Integração com Sidebar

Se sua página tiver sidebar, o Header se integra perfeitamente:
- **Sem sidebar:** Conteúdo ocupa toda a largura
- **Com sidebar:** Conteúdo se ajusta automaticamente
- **Sidebar colapsada:** Header permanece fixo

## ⚡ Performance

- **Lazy loading:** Modal só é renderizado quando necessário
- **Event listeners:** Gerenciados corretamente no lifecycle
- **CSS otimizado:** Sem animações pesadas
- **Responsivo:** Sem JavaScript desnecessário
