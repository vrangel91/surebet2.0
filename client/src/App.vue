<template>
  <div id="app">
    <!-- Loading após login -->
    <LoginLoading :isVisible="showLoginLoading" />
    <!-- 🔄 Loader global - apenas para área de conteúdo -->
    <LoaderOverlay :content-only="true" />
    <router-view />
    <!-- Botão flutuante do guia interativo - aparece em todas as páginas -->
    <FloatingGuideButton />
    <!-- Componentes PWA -->
    <PWAUpdateNotification />
  </div>
</template>
<script>
import { useTheme } from './composables/useTheme'
import LoginLoading from './components/LoginLoading.vue'
import FloatingGuideButton from './components/FloatingGuideButton.vue'
import LoaderOverlay from './components/LoaderOverlay.vue'
import PWAUpdateNotification from './components/PWAUpdateNotification.vue'
export default {
  name: 'App',
  components: {
    LoginLoading,
    FloatingGuideButton,
    LoaderOverlay,
    PWAUpdateNotification
  },
  data() {
    return {
      showLoginLoading: false
    }
  },
  watch: {
    '$route'(to, from) {
      // Mostrar loading quando navegar para dashboard após login
      if (from.path === '/login' && to.path === '/') {
        this.showLoginLoading = true
        // Esconder loading após 2 segundos
        setTimeout(() => {
          this.showLoginLoading = false
        }, 2000)
      }
    }
  },
  setup() {
    const { loadTheme, applyTheme, currentTheme } = useTheme()
    // Inicializar tema
    loadTheme()
    // Aplicar tema carregado (não forçar dark)
    applyTheme(currentTheme.value)
    return {}
  }
}
</script>
<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh; /* Mudar de height: 100vh para min-height: 100vh */
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden; /* Apenas esconder scroll horizontal */
  overflow-y: auto; /* Permitir scroll vertical quando necessário */
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  height: 100%;
  min-height: 100vh; /* Garantir altura mínima */
  overflow-x: hidden; /* Apenas esconder scroll horizontal */
  overflow-y: auto; /* Permitir scroll vertical quando necessário */
}
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh; /* Garantir altura mínima */
  overflow-x: hidden; /* Apenas esconder scroll horizontal */
  overflow-y: auto; /* Permitir scroll vertical quando necessário */
}
html {
  transition: background-color 0.3s ease;
  min-height: 100vh; /* Garantir altura mínima */
}

/* Correções específicas para mobile */
@media (max-width: 1023px) {
  body {
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
  }
  
  #app {
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
  }
}

/* Correções para telas muito pequenas */
@media (max-width: 480px) {
  body {
    font-size: 14px; /* Reduzir tamanho da fonte base */
    -webkit-text-size-adjust: 100%; /* Evitar zoom automático no iOS */
    -ms-text-size-adjust: 100%;
  }
  
  #app {
    min-height: 100vh;
    height: auto; /* Permitir altura dinâmica */
    width: 100%;
    max-width: 100vw; /* Evitar overflow horizontal */
  }
  
  /* Corrigir problemas de viewport em iOS */
  @supports (-webkit-touch-callout: none) {
    body {
      -webkit-overflow-scrolling: touch;
    }
  }
}

/* Correções específicas para problemas de layout em mobile */
@media (max-width: 768px) {
  /* Evitar que elementos saiam da tela */
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* Corrigir problemas de flexbox em mobile */
  .flex {
    flex-wrap: wrap;
  }
  
  /* Corrigir problemas de grid em mobile */
  .grid {
    grid-template-columns: 1fr !important;
    gap: 1rem;
  }
}
</style>