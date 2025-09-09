import { ref, computed } from 'vue'

export function useLoadingStates() {
  // Estados de loading granulares
  const loadingStates = ref({
    initial: false,
    refresh: false,
    filter: false,
    pagination: false,
    data: false
  })
  
  // Computed para estado geral de loading
  const isLoading = computed(() => {
    return Object.values(loadingStates.value).some(state => state)
  })
  
  // Computed para loading específico
  const isInitialLoading = computed(() => loadingStates.value.initial)
  const isRefreshing = computed(() => loadingStates.value.refresh)
  const isFiltering = computed(() => loadingStates.value.filter)
  const isPaginating = computed(() => loadingStates.value.pagination)
  const isProcessingData = computed(() => loadingStates.value.data)
  
  // Métodos para controlar estados
  function setLoading(type, value) {
    if (loadingStates.value.hasOwnProperty(type)) {
      loadingStates.value[type] = value
    }
  }
  
  function startLoading(type) {
    setLoading(type, true)
  }
  
  function stopLoading(type) {
    setLoading(type, false)
  }
  
  function stopAllLoading() {
    Object.keys(loadingStates.value).forEach(key => {
      loadingStates.value[key] = false
    })
  }
  
  // Métodos específicos
  function startInitialLoading() {
    startLoading('initial')
  }
  
  function stopInitialLoading() {
    stopLoading('initial')
  }
  
  function startRefresh() {
    startLoading('refresh')
  }
  
  function stopRefresh() {
    stopLoading('refresh')
  }
  
  function startFiltering() {
    startLoading('filter')
  }
  
  function stopFiltering() {
    stopLoading('filter')
  }
  
  function startPagination() {
    startLoading('pagination')
  }
  
  function stopPagination() {
    stopLoading('pagination')
  }
  
  function startDataProcessing() {
    startLoading('data')
  }
  
  function stopDataProcessing() {
    stopLoading('data')
  }
  
  // Método para executar operação com loading
  async function withLoading(type, operation) {
    try {
      startLoading(type)
      const result = await operation()
      return result
    } finally {
      stopLoading(type)
    }
  }
  
  return {
    // Estado
    loadingStates,
    
    // Computed
    isLoading,
    isInitialLoading,
    isRefreshing,
    isFiltering,
    isPaginating,
    isProcessingData,
    
    // Métodos gerais
    setLoading,
    startLoading,
    stopLoading,
    stopAllLoading,
    
    // Métodos específicos
    startInitialLoading,
    stopInitialLoading,
    startRefresh,
    stopRefresh,
    startFiltering,
    stopFiltering,
    startPagination,
    stopPagination,
    startDataProcessing,
    stopDataProcessing,
    
    // Método utilitário
    withLoading
  }
}
