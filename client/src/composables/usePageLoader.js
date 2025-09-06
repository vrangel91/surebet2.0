import { ref, computed } from 'vue'

/**
 * Composable para gerenciar loader dentro de páginas
 * @param {Object} options - Opções de configuração
 * @param {string} options.text - Texto padrão do loader
 * @param {string} options.size - Tamanho do loader (small, medium, large)
 * @param {string} options.position - Posição do loader (center, top, bottom)
 * @returns {Object} Objeto com estado e métodos do loader
 */
export function usePageLoader(options = {}) {
  const {
    text = 'Carregando...',
    size = 'medium',
    position = 'center'
  } = options

  // Estado reativo do loader
  const isLoading = ref(false)
  const loaderText = ref(text)
  const loaderSize = ref(size)
  const loaderPosition = ref(position)

  /**
   * Mostrar o loader
   * @param {Object} config - Configuração do loader
   * @param {string} config.text - Texto personalizado
   * @param {string} config.size - Tamanho personalizado
   * @param {string} config.position - Posição personalizada
   */
  const showLoader = (config = {}) => {
    if (config.text) loaderText.value = config.text
    if (config.size) loaderSize.value = config.size
    if (config.position) loaderPosition.value = config.position
    isLoading.value = true
  }

  /**
   * Esconder o loader
   */
  const hideLoader = () => {
    isLoading.value = false
  }

  /**
   * Executar uma função assíncrona com loader automático
   * @param {Function} asyncFunction - Função assíncrona a ser executada
   * @param {Object} config - Configuração do loader
   * @returns {Promise} Promise da função executada
   */
  const withLoader = async (asyncFunction, config = {}) => {
    showLoader(config)
    
    try {
      const result = await asyncFunction()
      return result
    } catch (error) {
      hideLoader()
      throw error
    } finally {
      // Pequeno delay para evitar flicker
      setTimeout(() => {
        hideLoader()
      }, 100)
    }
  }

  /**
   * Executar múltiplas funções assíncronas com loader
   * @param {Array<Function>} asyncFunctions - Array de funções assíncronas
   * @param {Object} config - Configuração do loader
   * @returns {Promise<Array>} Array com os resultados de todas as funções
   */
  const withLoaderMultiple = async (asyncFunctions, config = {}) => {
    showLoader(config)
    
    try {
      const results = await Promise.all(asyncFunctions.map(fn => fn()))
      return results
    } catch (error) {
      hideLoader()
      throw error
    } finally {
      setTimeout(() => {
        hideLoader()
      }, 100)
    }
  }

  // Computed para props do componente
  const loaderProps = computed(() => ({
    isLoading: isLoading.value,
    text: loaderText.value,
    size: loaderSize.value,
    position: loaderPosition.value
  }))

  return {
    // Estado
    isLoading: computed(() => isLoading.value),
    loaderText: computed(() => loaderText.value),
    loaderSize: computed(() => loaderSize.value),
    loaderPosition: computed(() => loaderPosition.value),
    loaderProps,
    
    // Métodos
    showLoader,
    hideLoader,
    withLoader,
    withLoaderMultiple
  }
}
