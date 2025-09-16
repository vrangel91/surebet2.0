import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export function usePageLoader(options = {}) {
  const store = useStore()
  
  // Estado local do loader da página
  const pageLoading = ref(false)
  const loadingText = ref(options.text || 'Carregando...')
  
  // Computed para verificar se algum loader está ativo
  const isLoading = computed(() => {
    return store.getters.isLoading || pageLoading.value
  })
  
  // Função para mostrar o loader da página
  const showPageLoader = (text) => {
    if (text) loadingText.value = text
    pageLoading.value = true
  }
  
  // Função para esconder o loader da página
  const hidePageLoader = () => {
    pageLoading.value = false
  }
  
  // Função para executar uma operação com loader
  const withPageLoader = async (operation, text) => {
    try {
      showPageLoader(text)
      const result = await operation()
      return result
    } finally {
      hidePageLoader()
    }
  }
  
  // Função para mostrar o loader global
  const showGlobalLoader = () => {
    store.dispatch('showLoader')
  }
  
  // Função para esconder o loader global
  const hideGlobalLoader = () => {
    store.dispatch('hideLoader')
  }
  
  // Função para executar uma operação com loader global
  const withGlobalLoader = async (operation) => {
    try {
      showGlobalLoader()
      const result = await operation()
      return result
    } finally {
      hideGlobalLoader()
    }
  }
  
  return {
    // Estado
    pageLoading,
    loadingText,
    isLoading,
    
    // Métodos do loader da página
    showPageLoader,
    hidePageLoader,
    withPageLoader,
    
    // Métodos do loader global
    showGlobalLoader,
    hideGlobalLoader,
    withGlobalLoader
  }
}