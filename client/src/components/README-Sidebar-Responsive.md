# Sidebar Responsivo - Documentação

## Visão Geral

O componente `Sidebar.vue` foi completamente reformulado para ser totalmente responsivo, funcionando perfeitamente em todos os tamanhos de tela e dispositivos.

## Breakpoints

### Desktop (1200px+)
- **Comportamento**: Sidebar fixa na lateral esquerda
- **Largura**: 280px (expandida) / 80px (colapsada)
- **Interação**: Colapsar/expandir com botão toggle
- **Posicionamento**: `position: fixed`

### Laptop (992px - 1199px)
- **Comportamento**: Sidebar fixa na lateral esquerda
- **Largura**: 260px (expandida) / 70px (colapsada)
- **Interação**: Colapsar/expandir com botão toggle
- **Posicionamento**: `position: fixed`

### Tablet (768px - 991px)
- **Comportamento**: Sidebar deslizante (slide-in)
- **Largura**: 240px
- **Interação**: Abrir/fechar com overlay
- **Posicionamento**: `position: fixed` com `transform: translateX(-100%)`

### Mobile Large (481px - 767px)
- **Comportamento**: Sidebar deslizante (slide-in)
- **Largura**: 280px
- **Interação**: Abrir/fechar com overlay
- **Posicionamento**: `position: fixed` com `transform: translateX(-100%)`

### Mobile Small (320px - 480px)
- **Comportamento**: Sidebar deslizante (slide-in)
- **Largura**: 100% (full width)
- **Interação**: Abrir/fechar com overlay
- **Posicionamento**: `position: fixed` com `transform: translateX(-100%)`

## Funcionalidades Responsivas

### 1. Detecção Automática de Tela
```javascript
// O componente detecta automaticamente o tamanho da tela
detectScreenSize() {
  this.windowWidth = window.innerWidth
  
  if (this.windowWidth >= 1200) {
    this.isDesktop = true
    this.isTablet = false
    this.isMobile = false
  } else if (this.windowWidth >= 768) {
    this.isDesktop = false
    this.isTablet = true
    this.isMobile = false
  } else {
    this.isDesktop = false
    this.isTablet = false
    this.isMobile = true
  }
}
```

### 2. Comportamento Adaptativo
- **Desktop**: Colapsar/expandir sidebar
- **Tablet/Mobile**: Abrir/fechar sidebar com overlay

### 3. Overlay Inteligente
- Aparece apenas em tablet e mobile
- Permite fechar a sidebar clicando fora dela
- Transição suave com fade in/out

### 4. Classes CSS Responsivas
```css
/* Classes automáticas baseadas no tamanho da tela */
.sidebar.mobile { /* Estilos específicos para mobile */ }
.sidebar.tablet { /* Estilos específicos para tablet */ }
.sidebar.desktop { /* Estilos específicos para desktop */ }
```

## Uso

### 1. Importar o Componente
```vue
<template>
  <Sidebar 
    :sidebarCollapsed="sidebarCollapsed"
    @toggle-sidebar="handleSidebarToggle"
    @show-notification="handleNotification"
  />
</template>
```

### 2. Controlar Estado
```javascript
export default {
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    }
  }
}
```

### 3. Acessar Métodos Públicos
```javascript
// Abrir sidebar em mobile/tablet
this.$refs.sidebar.openSidebar()

// Fechar sidebar em mobile/tablet
this.$refs.sidebar.closeSidebar()

// Toggle sidebar (comportamento adaptativo)
this.$refs.sidebar.toggleSidebar()
```

## Classes Utilitárias

### Visibilidade por Dispositivo
```css
.hide-mobile     /* Esconder em mobile */
.hide-tablet     /* Esconder em tablet */
.hide-desktop    /* Esconder em desktop */
.show-mobile-only    /* Mostrar apenas em mobile */
.show-tablet-only    /* Mostrar apenas em tablet */
.show-desktop-only   /* Mostrar apenas em desktop */
```

### Exemplo de Uso
```vue
<template>
  <!-- Botão que só aparece em mobile -->
  <button class="show-mobile-only" @click="openSidebar">
    Menu
  </button>
  
  <!-- Conteúdo que some em mobile -->
  <div class="hide-mobile">
    Conteúdo desktop
  </div>
</template>
```

## Eventos

### 1. toggle-sidebar
Emitido quando o estado da sidebar muda
```javascript
// Parâmetros
// - isOpen: boolean (mobile/tablet)
// - isCollapsed: boolean (desktop)
```

### 2. show-notification
Emitido para mostrar notificações
```javascript
// Parâmetros
// - message: string
// - type: 'info' | 'success' | 'warning' | 'error'
```

## Estilos CSS

### Variáveis CSS Responsivas
```css
:root {
  --sidebar-width-desktop: 280px;
  --sidebar-width-desktop-collapsed: 80px;
  --sidebar-width-laptop: 260px;
  --sidebar-width-laptop-collapsed: 70px;
  --sidebar-width-tablet: 240px;
  --sidebar-width-mobile: 280px;
  --sidebar-width-mobile-small: 100%;
}
```

### Transições
```css
.sidebar {
  transition: 
    width 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
}
```

## Melhores Práticas

### 1. Sempre Use o Overlay
```vue
<template>
  <!-- Overlay automático para mobile/tablet -->
  <div 
    v-if="shouldShowOverlay" 
    class="sidebar-overlay" 
    :class="{ show: shouldShowOverlay }"
    @click="closeSidebar"
  ></div>
</template>
```

### 2. Teste em Diferentes Dispositivos
- Use as ferramentas de desenvolvedor do navegador
- Teste em dispositivos reais quando possível
- Verifique a orientação landscape/portrait

### 3. Performance
- O componente usa `transform` para animações (melhor performance)
- Event listeners são removidos no `beforeUnmount`
- Detecção de tela é otimizada com debounce

## Troubleshooting

### Problema: Sidebar não abre em mobile
**Solução**: Verifique se o overlay está sendo renderizado e se o evento `@click` está funcionando

### Problema: Sidebar não colapsa em desktop
**Solução**: Verifique se `shouldBeCollapsed` está retornando o valor correto

### Problema: Layout quebra ao redimensionar
**Solução**: Verifique se o event listener `resize` está funcionando e se `detectScreenSize()` está sendo chamado

## Exemplo Completo

```vue
<template>
  <div class="app">
    <!-- Overlay para mobile/tablet -->
    <div 
      v-if="shouldShowOverlay" 
      class="sidebar-overlay" 
      :class="{ show: shouldShowOverlay }"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @show-notification="handleNotification"
    />

    <!-- Conteúdo principal -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Seu conteúdo aqui -->
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    handleNotification({ message, type }) {
      // Implementar sistema de notificações
      console.log(`${type}: ${message}`)
    }
  }
}
</script>

<style>
.main-content {
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

@media (max-width: 991px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
```

## Conclusão

O Sidebar responsivo agora oferece uma experiência consistente e otimizada em todos os dispositivos, com transições suaves e comportamento adaptativo baseado no tamanho da tela.
