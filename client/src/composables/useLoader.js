import { computed } from 'vue'
import { useStore } from 'vuex'

/**
 * Composable para gerenciar o loader global
 * @returns {Object} Objeto com métodos e estado do loader
 */
export function useLoader() {
  const store = useStore()

  // Estado reativo do loader
  const isLoading = computed(() => store.getters.isLoading)

  /**
   * Mostrar o loader
   */
  const showLoader = () => {
    store.dispatch('showLoader')
  }

  /**
   * Esconder o loader
   */
  const hideLoader = () => {
    store.dispatch('hideLoader')
  }

  /**
   * Forçar parada do loader (útil em casos de erro)
   */
  const forceHideLoader = () => {
    store.dispatch('forceHideLoader')
  }

  /**
   * Executar uma função assíncrona com loader automático
   * @param {Function} asyncFunction - Função assíncrona a ser executada
   * @param {Object} options - Opções de configuração
   * @param {boolean} options.showLoader - Se deve mostrar o loader (padrão: true)
   * @param {number} options.minTime - Tempo mínimo de exibição em ms (padrão: 300)
   * @returns {Promise} Promise da função executada
   */
  const withLoader = async (asyncFunction, options = {}) => {
    const { showLoader: shouldShow = true, minTime = 300 } = options
    
    if (shouldShow) {
      showLoader()
    }

    try {
      const result = await asyncFunction()
      return result
    } catch (error) {
      // Em caso de erro, forçar parada do loader
      if (shouldShow) {
        forceHideLoader()
      }
      throw error
    }
  }

  /**
   * Executar múltiplas funções assíncronas com loader
   * @param {Array<Function>} asyncFunctions - Array de funções assíncronas
   * @param {Object} options - Opções de configuração
   * @returns {Promise<Array>} Array com os resultados de todas as funções
   */
  const withLoaderMultiple = async (asyncFunctions, options = {}) => {
    const { showLoader: shouldShow = true } = options
    
    if (shouldShow) {
      showLoader()
    }

    try {
      const results = await Promise.all(asyncFunctions.map(fn => fn()))
      return results
    } catch (error) {
      if (shouldShow) {
        forceHideLoader()
      }
      throw error
    }
  }

  return {
    // Estado
    isLoading,
    
    // Métodos
    showLoader,
    hideLoader,
    forceHideLoader,
    withLoader,
    withLoaderMultiple
  }
}
