<template>
  <div id="app">
    <!-- Loading após login -->
    <LoginLoading :isVisible="showLoginLoading" />
    
    <router-view />
    <!-- Botão flutuante do guia interativo - aparece em todas as páginas -->
    <FloatingGuideButton />
  </div>
</template>

<script>
import { useTheme } from './composables/useTheme'
import LoginLoading from './components/LoginLoading.vue'
import FloatingGuideButton from './components/FloatingGuideButton.vue'

export default {
  name: 'App',
  components: {
    LoginLoading,
    FloatingGuideButton
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
    const { loadTheme, applyTheme } = useTheme()
    
    // Inicializar tema
    loadTheme()
    applyTheme('dark') // Tema padrão
    
    return {}
  }
}
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow: auto; /* Permite scroll na aplicação */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: auto;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

html {
  transition: background-color 0.3s ease;
}
</style>
