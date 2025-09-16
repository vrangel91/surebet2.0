/**
 * Utilitário para testar o sistema de loader
 * Este arquivo pode ser usado para testar o funcionamento do loader
 */

import store from '@/store'

/**
 * Testar o loader com diferentes cenários
 */
export class LoaderTester {
  /**
   * Teste básico - mostrar e esconder loader
   */
  static async testBasic() {
    console.log('🧪 Testando loader básico...')
    
    store.dispatch('showLoader')
    console.log('✅ Loader ativado')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    store.dispatch('hideLoader')
    console.log('✅ Loader desativado')
  }

  /**
   * Teste com tempo mínimo
   */
  static async testMinimumTime() {
    console.log('🧪 Testando tempo mínimo...')
    
    store.dispatch('showLoader')
    console.log('✅ Loader ativado')
    
    // Esconder imediatamente (deve respeitar tempo mínimo)
    store.dispatch('hideLoader')
    console.log('✅ Loader desativado (com tempo mínimo)')
  }

  /**
   * Teste com múltiplas requisições
   */
  static async testMultipleRequests() {
    console.log('🧪 Testando múltiplas requisições...')
    
    // Simular 3 requisições simultâneas
    store.dispatch('showLoader') // Requisição 1
    store.dispatch('showLoader') // Requisição 2
    store.dispatch('showLoader') // Requisição 3
    
    console.log('✅ 3 requisições iniciadas')
    console.log('📊 Contador de requisições:', store.state.loadingRequests)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Finalizar requisições uma por uma
    store.dispatch('hideLoader') // Requisição 1 finalizada
    console.log('✅ Requisição 1 finalizada')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.dispatch('hideLoader') // Requisição 2 finalizada
    console.log('✅ Requisição 2 finalizada')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.dispatch('hideLoader') // Requisição 3 finalizada
    console.log('✅ Requisição 3 finalizada - Loader deve desaparecer')
  }

  /**
   * Teste de forçar parada
   */
  static async testForceStop() {
    console.log('🧪 Testando forçar parada...')
    
    store.dispatch('showLoader')
    console.log('✅ Loader ativado')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    store.dispatch('forceHideLoader')
    console.log('✅ Loader forçado a parar')
  }

  /**
   * Executar todos os testes
   */
  static async runAllTests() {
    console.log('🚀 Iniciando testes do sistema de loader...')
    
    try {
      await this.testBasic()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await this.testMinimumTime()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await this.testMultipleRequests()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await this.testForceStop()
      
      console.log('🎉 Todos os testes concluídos com sucesso!')
    } catch (error) {
      console.error('❌ Erro durante os testes:', error)
    }
  }

  /**
   * Verificar estado atual do loader
   */
  static getStatus() {
    const state = store.state
    return {
      isLoading: state.isLoading,
      loadingRequests: state.loadingRequests,
      loadingStartTime: state.loadingStartTime,
      elapsedTime: state.loadingStartTime ? Date.now() - state.loadingStartTime : 0
    }
  }
}

// Função para usar no console do navegador
window.testLoader = LoaderTester

console.log('🧪 LoaderTester disponível globalmente como window.testLoader')
console.log('📖 Use: testLoader.runAllTests() para executar todos os testes')
console.log('📊 Use: testLoader.getStatus() para verificar o estado atual')
