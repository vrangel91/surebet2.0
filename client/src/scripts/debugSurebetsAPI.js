/**
 * Script de Debug para API de Surebets
 * Execute este script no console do navegador para diagnosticar problemas
 */

class SurebetsAPIDebugger {
  constructor() {
    this.logs = []
    this.startTime = Date.now()
    this.setupLogging()
  }

  setupLogging() {
    // Capturar logs do console
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      this.logs.push({ type: 'log', time: Date.now() - this.startTime, message: args.join(' ') })
      originalLog.apply(console, args)
    }

    console.warn = (...args) => {
      this.logs.push({ type: 'warn', time: Date.now() - this.startTime, message: args.join(' ') })
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      this.logs.push({ type: 'error', time: Date.now() - this.startTime, message: args.join(' ') })
      originalError.apply(console, args)
    }
  }

  async testAPICall() {
    console.log('🔍 Testando chamada da API /api/surebets...')
    
    try {
      const response = await fetch('/api/surebets')
      console.log('📡 Resposta HTTP:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 Dados recebidos:', data)
      
      // Analisar estrutura dos dados
      this.analyzeDataStructure(data)
      
      return data
    } catch (error) {
      console.error('❌ Erro na chamada da API:', error)
      return null
    }
  }

  analyzeDataStructure(data) {
    console.log('🔍 === ANÁLISE DA ESTRUTURA DE DADOS ===')
    
    if (!data) {
      console.error('❌ Dados são null/undefined')
      return
    }
    
    console.log('📋 Estrutura geral:', {
      hasSuccess: 'success' in data,
      successValue: data.success,
      hasData: 'data' in data,
      dataType: typeof data.data,
      dataKeys: data.data ? Object.keys(data.data) : 'N/A',
      dataLength: data.data ? Object.keys(data.data).length : 'N/A'
    })
    
    if (data.success && data.data) {
      const surebetsData = data.data
      console.log('📊 Dados de surebets:', {
        isObject: typeof surebetsData === 'object',
        isArray: Array.isArray(surebetsData),
        keys: Object.keys(surebetsData),
        firstKey: Object.keys(surebetsData)[0],
        firstValue: surebetsData[Object.keys(surebetsData)[0]]
      })
      
      // Verificar se é um objeto com chaves de surebets
      if (typeof surebetsData === 'object' && !Array.isArray(surebetsData)) {
        const keys = Object.keys(surebetsData)
        console.log(`📈 Total de surebets encontrados: ${keys.length}`)
        
        if (keys.length > 0) {
          const firstKey = keys[0]
          const firstSurebet = surebetsData[firstKey]
          console.log('🔍 Primeira surebet:', {
            key: firstKey,
            value: firstSurebet,
            isArray: Array.isArray(firstSurebet),
            length: Array.isArray(firstSurebet) ? firstSurebet.length : 'N/A'
          })
          
          if (Array.isArray(firstSurebet) && firstSurebet.length > 0) {
            console.log('📋 Estrutura da primeira aposta:', firstSurebet[0])
          }
        }
      }
    }
  }

  async testVueComponent() {
    console.log('🔍 Testando componente Vue...')
    
    // Procurar por instância Vue da SurebetsView
    const app = document.querySelector('#app')
    if (app && app.__vue__) {
      const vueApp = app.__vue__
      this.findSurebetsViewInstance(vueApp)
    } else {
      console.warn('⚠️ Instância Vue não encontrada')
    }
  }

  findSurebetsViewInstance(vueInstance) {
    if (vueInstance.$options.name === 'SurebetsView' || 
        (vueInstance.$options.components && vueInstance.$options.components.SurebetsView)) {
      console.log('✅ Instância SurebetsView encontrada')
      this.analyzeVueInstance(vueInstance)
      return
    }

    // Procurar em componentes filhos
    if (vueInstance.$children) {
      vueInstance.$children.forEach(child => {
        this.findSurebetsViewInstance(child)
      })
    }
  }

  analyzeVueInstance(instance) {
    console.log('🔍 === ANÁLISE DO COMPONENTE VUE ===')
    
    const data = instance.$data
    console.log('📊 Estado do componente:', {
      surebets: data.surebets ? Object.keys(data.surebets).length : 'N/A',
      loading: data.loading,
      isSearching: data.isSearching,
      filteredSurebets: data.filteredSurebets ? data.filteredSurebets.length : 'N/A',
      paginatedSurebets: data.paginatedSurebets ? data.paginatedSurebets.length : 'N/A'
    })
    
    // Verificar computed properties
    if (instance.filteredSurebets) {
      console.log('🔍 filteredSurebets:', instance.filteredSurebets.length)
    }
    
    if (instance.paginatedSurebets) {
      console.log('🔍 paginatedSurebets:', instance.paginatedSurebets.length)
    }
    
    // Verificar se há problemas nos filtros
    console.log('🔍 Filtros ativos:', {
      selectedHouses: data.selectedHouses ? data.selectedHouses.length : 'N/A',
      selectedSports: data.selectedSports ? data.selectedSports.length : 'N/A',
      selectedCurrencies: data.selectedCurrencies ? data.selectedCurrencies.length : 'N/A',
      activeFilter: data.activeFilter,
      minProfit: data.minProfit,
      maxProfit: data.maxProfit
    })
  }

  async runFullDiagnosis() {
    console.log('🚀 Iniciando diagnóstico completo...')
    
    // 1. Testar API
    const apiData = await this.testAPICall()
    
    // 2. Testar componente Vue
    await this.testVueComponent()
    
    // 3. Verificar logs
    this.analyzeLogs()
    
    // 4. Gerar relatório
    this.generateReport(apiData)
  }

  analyzeLogs() {
    console.log('🔍 === ANÁLISE DOS LOGS ===')
    
    const errorLogs = this.logs.filter(log => log.type === 'error')
    const warnLogs = this.logs.filter(log => log.type === 'warn')
    
    if (errorLogs.length > 0) {
      console.log('❌ Erros encontrados:', errorLogs.length)
      errorLogs.forEach(error => {
        console.log(`  - ${error.time}ms: ${error.message}`)
      })
    }
    
    if (warnLogs.length > 0) {
      console.log('⚠️ Warnings encontrados:', warnLogs.length)
      warnLogs.forEach(warn => {
        console.log(`  - ${warn.time}ms: ${warn.message}`)
      })
    }
  }

  generateReport(apiData) {
    console.log('📊 === RELATÓRIO DE DIAGNÓSTICO ===')
    
    const report = {
      duration: Date.now() - this.startTime,
      apiData: apiData ? 'OK' : 'ERRO',
      logs: this.logs.length,
      errors: this.logs.filter(log => log.type === 'error').length,
      warnings: this.logs.filter(log => log.type === 'warn').length
    }
    
    console.log('📋 Resumo:', report)
    
    if (apiData && apiData.success && apiData.data) {
      const surebetsCount = Object.keys(apiData.data).length
      console.log(`✅ API funcionando: ${surebetsCount} surebets encontrados`)
      
      if (surebetsCount > 0) {
        console.log('🔍 Verificando se os dados estão sendo exibidos...')
        
        // Verificar se há cards na página
        const cards = document.querySelectorAll('.surebet-card')
        console.log(`📊 Cards na página: ${cards.length}`)
        
        if (cards.length === 0) {
          console.warn('⚠️ PROBLEMA: API retorna dados mas não há cards na página!')
          console.log('🔍 Possíveis causas:')
          console.log('  - Filtros muito restritivos')
          console.log('  - Problema na paginação')
          console.log('  - Erro no computed filteredSurebets')
          console.log('  - Problema no template v-for')
        }
      }
    } else {
      console.error('❌ PROBLEMA: API não está retornando dados corretamente')
    }
  }
}

// Instruções de uso
console.log(`
🔍 === DEBUGGER DA API DE SURBETS ===
Para usar este debugger, execute:

1. const debugger = new SurebetsAPIDebugger()
2. await debugger.runFullDiagnosis()

O debugger irá:
- Testar a chamada da API /api/surebets
- Analisar a estrutura dos dados retornados
- Verificar o estado do componente Vue
- Identificar problemas na exibição
- Gerar relatório completo
`)

// Auto-iniciar se estiver na página de surebets
if (window.location.pathname.includes('surebets') || window.location.pathname.includes('surebet')) {
  console.log('🚀 Auto-iniciando debugger na página de surebets...')
  window.surebetsAPIDebugger = new SurebetsAPIDebugger()
}

