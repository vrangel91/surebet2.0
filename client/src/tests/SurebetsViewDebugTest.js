/**
 * Teste de Debug para SurebetsView.vue
 * Execute este script no console do navegador para diagnosticar problemas de atualização
 */

class SurebetsViewDebugger {
  constructor() {
    this.originalConsoleLog = console.log
    this.originalConsoleWarn = console.warn
    this.originalConsoleError = console.error
    this.logs = []
    this.warnings = []
    this.errors = []
    this.startTime = Date.now()
    
    this.setupLogCapture()
    this.startMonitoring()
  }

  setupLogCapture() {
    // Capturar logs do console
    console.log = (...args) => {
      this.logs.push({ type: 'log', time: Date.now() - this.startTime, message: args.join(' ') })
      this.originalConsoleLog.apply(console, args)
    }

    console.warn = (...args) => {
      this.warnings.push({ type: 'warn', time: Date.now() - this.startTime, message: args.join(' ') })
      this.originalConsoleWarn.apply(console, args)
    }

    console.error = (...args) => {
      this.errors.push({ type: 'error', time: Date.now() - this.startTime, message: args.join(' ') })
      this.originalConsoleError.apply(console, args)
    }
  }

  startMonitoring() {
    console.log('🔍 Iniciando monitoramento da SurebetsView...')
    
    // Verificar se a página está carregada
    this.checkPageLoaded()
    
    // Monitorar mudanças nos dados
    this.monitorDataChanges()
    
    // Monitorar timers e intervalos
    this.monitorTimers()
    
    // Monitorar WebSocket
    this.monitorWebSocket()
    
    // Monitorar re-renders
    this.monitorRerenders()
  }

  checkPageLoaded() {
    const surebetsView = document.querySelector('.surebets-container')
    if (surebetsView) {
      console.log('✅ SurebetsView encontrada na página')
    } else {
      console.warn('⚠️ SurebetsView não encontrada na página')
    }
  }

  monitorDataChanges() {
    // Procurar por instância Vue da SurebetsView
    const app = document.querySelector('#app')
    if (app && app.__vue__) {
      const vueApp = app.__vue__
      this.findSurebetsViewInstance(vueApp)
    }
  }

  findSurebetsViewInstance(vueInstance) {
    if (vueInstance.$options.name === 'SurebetsView' || 
        (vueInstance.$options.components && vueInstance.$options.components.SurebetsView)) {
      console.log('✅ Instância SurebetsView encontrada')
      this.monitorVueInstance(vueInstance)
      return
    }

    // Procurar em componentes filhos
    if (vueInstance.$children) {
      vueInstance.$children.forEach(child => {
        this.findSurebetsViewInstance(child)
      })
    }
  }

  monitorVueInstance(instance) {
    // Monitorar mudanças em dados específicos
    const dataToMonitor = ['surebets', 'filteredSurebets', 'paginatedSurebets', 'currentPage', 'isSearching']
    
    dataToMonitor.forEach(prop => {
      if (instance.$data && instance.$data.hasOwnProperty(prop)) {
        const originalValue = instance.$data[prop]
        let changeCount = 0
        
        // Usar Vue.set para monitorar mudanças
        instance.$watch(prop, (newVal, oldVal) => {
          changeCount++
          console.log(`🔄 ${prop} mudou (${changeCount}ª vez):`, {
            old: oldVal,
            new: newVal,
            time: Date.now() - this.startTime
          })
          
          // Verificar se é uma mudança problemática
          if (prop === 'surebets' && Array.isArray(newVal) && newVal.length === 0) {
            console.warn('⚠️ PROBLEMA: surebets ficou vazio!')
          }
          
          if (prop === 'paginatedSurebets' && Array.isArray(newVal) && newVal.length === 0) {
            console.warn('⚠️ PROBLEMA: paginatedSurebets ficou vazio!')
          }
        }, { deep: true })
      }
    })
  }

  monitorTimers() {
    const originalSetInterval = window.setInterval
    const originalSetTimeout = window.setTimeout
    const originalClearInterval = window.clearInterval
    const originalClearTimeout = window.clearTimeout
    
    const activeTimers = new Set()
    const activeIntervals = new Set()
    
    window.setInterval = (fn, delay) => {
      const id = originalSetInterval(fn, delay)
      activeIntervals.add(id)
      console.log(`⏰ setInterval criado: ${delay}ms (ID: ${id})`)
      return id
    }
    
    window.setTimeout = (fn, delay) => {
      const id = originalSetTimeout(fn, delay)
      activeTimers.add(id)
      console.log(`⏱️ setTimeout criado: ${delay}ms (ID: ${id})`)
      return id
    }
    
    window.clearInterval = (id) => {
      activeIntervals.delete(id)
      console.log(`🛑 clearInterval chamado (ID: ${id})`)
      return originalClearInterval(id)
    }
    
    window.clearTimeout = (id) => {
      activeTimers.delete(id)
      console.log(`🛑 clearTimeout chamado (ID: ${id})`)
      return originalClearTimeout(id)
    }
    
    // Monitorar timers ativos periodicamente
    setInterval(() => {
      if (activeIntervals.size > 0) {
        console.log(`📊 Timers ativos: ${activeIntervals.size} intervals, ${activeTimers.size} timeouts`)
      }
    }, 5000)
  }

  monitorWebSocket() {
    const originalWebSocket = window.WebSocket
    
    window.WebSocket = function(url) {
      console.log(`🔌 WebSocket conectando: ${url}`)
      const ws = new originalWebSocket(url)
      
      const originalOnMessage = ws.onmessage
      ws.onmessage = (event) => {
        console.log('📨 WebSocket mensagem recebida:', event.data)
        if (originalOnMessage) {
          originalOnMessage.call(ws, event)
        }
      }
      
      const originalOnOpen = ws.onopen
      ws.onopen = (event) => {
        console.log('✅ WebSocket conectado')
        if (originalOnOpen) {
          originalOnOpen.call(ws, event)
        }
      }
      
      const originalOnClose = ws.onclose
      ws.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', event.code, event.reason)
        if (originalOnClose) {
          originalOnClose.call(ws, event)
        }
      }
      
      const originalOnError = ws.onerror
      ws.onerror = (event) => {
        console.log('💥 WebSocket erro:', event)
        if (originalOnError) {
          originalOnError.call(ws, event)
        }
      }
      
      return ws
    }
  }

  monitorRerenders() {
    let renderCount = 0
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target.classList.contains('surebets-grid')) {
          renderCount++
          console.log(`🔄 Re-render detectado (${renderCount}ª vez):`, {
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length,
            time: Date.now() - this.startTime
          })
        }
      })
    })
    
    const surebetsGrid = document.querySelector('.surebets-grid')
    if (surebetsGrid) {
      observer.observe(surebetsGrid, { childList: true, subtree: true })
      console.log('👀 Monitorando re-renders do grid de surebets')
    }
  }

  generateReport() {
    const report = {
      duration: Date.now() - this.startTime,
      logs: this.logs.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      summary: {
        totalLogs: this.logs.length,
        totalWarnings: this.warnings.length,
        totalErrors: this.errors.length
      }
    }
    
    console.log('📊 === RELATÓRIO DE DEBUG ===')
    console.log(`⏱️ Tempo de monitoramento: ${report.duration}ms`)
    console.log(`📝 Logs capturados: ${report.logs.length}`)
    console.log(`⚠️ Warnings: ${report.warnings.length}`)
    console.log(`💥 Erros: ${report.errors.length}`)
    
    if (this.errors.length > 0) {
      console.log('🚨 ERROS ENCONTRADOS:')
      this.errors.forEach(error => {
        console.log(`  - ${error.time}ms: ${error.message}`)
      })
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS ENCONTRADOS:')
      this.warnings.forEach(warning => {
        console.log(`  - ${warning.time}ms: ${warning.message}`)
      })
    }
    
    return report
  }

  stop() {
    console.log = this.originalConsoleLog
    console.warn = this.originalConsoleWarn
    console.error = this.originalConsoleError
    console.log('🛑 Monitoramento parado')
  }
}

// Instruções de uso
console.log(`
🔍 === DEBUGGER DA SURBETSVIEW ===
Para usar este debugger, execute:

1. const debugger = new SurebetsViewDebugger()
2. Aguarde alguns minutos para coletar dados
3. const report = debugger.generateReport()
4. debugger.stop() // Para parar o monitoramento

O debugger irá:
- Monitorar mudanças nos dados da página
- Capturar logs do console
- Detectar re-renders desnecessários
- Monitorar timers e WebSocket
- Gerar relatório de problemas
`)

// Auto-iniciar se estiver na página de surebets
if (window.location.pathname.includes('surebets') || window.location.pathname.includes('surebet')) {
  console.log('🚀 Auto-iniciando debugger na página de surebets...')
  window.surebetsDebugger = new SurebetsViewDebugger()
}

