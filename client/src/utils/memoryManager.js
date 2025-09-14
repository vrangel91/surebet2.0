// Gerenciador de memória para otimizar performance
export class MemoryManager {
  constructor() {
    this.timers = new Set()
    this.observers = new Set()
    this.eventListeners = new Map()
    this.intervals = new Set()
    this.timeouts = new Set()
    this.cleanupCallbacks = new Set()
    
    this.init()
  }

  init() {
    // Limpeza automática quando a página é descarregada
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })

    // Limpeza periódica a cada 5 minutos
    setInterval(() => {
      this.performPeriodicCleanup()
    }, 300000)
  }

  // Registrar timer para limpeza automática
  registerTimer(timer, type = 'interval') {
    if (type === 'interval') {
      this.intervals.add(timer)
    } else if (type === 'timeout') {
      this.timeouts.add(timer)
    }
    
    this.timers.add(timer)
    return timer
  }

  // Registrar observer para limpeza automática
  registerObserver(observer) {
    this.observers.add(observer)
    return observer
  }

  // Registrar event listener para limpeza automática
  registerEventListener(element, event, handler, options = {}) {
    const key = `${element.constructor.name}_${event}`
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set())
    }
    
    this.eventListeners.get(key).add({ element, event, handler, options })
    element.addEventListener(event, handler, options)
    
    return () => this.unregisterEventListener(element, event, handler)
  }

  // Desregistrar event listener
  unregisterEventListener(element, event, handler) {
    const key = `${element.constructor.name}_${event}`
    if (this.eventListeners.has(key)) {
      const listeners = this.eventListeners.get(key)
      listeners.forEach(listener => {
        if (listener.element === element && listener.handler === handler) {
          listener.element.removeEventListener(listener.event, listener.handler, listener.options)
          listeners.delete(listener)
        }
      })
      
      if (listeners.size === 0) {
        this.eventListeners.delete(key)
      }
    }
  }

  // Registrar callback de limpeza
  registerCleanupCallback(callback) {
    this.cleanupCallbacks.add(callback)
    return () => this.cleanupCallbacks.delete(callback)
  }

  // Limpar timer específico
  clearTimer(timer) {
    if (this.intervals.has(timer)) {
      clearInterval(timer)
      this.intervals.delete(timer)
    }
    if (this.timeouts.has(timer)) {
      clearTimeout(timer)
      this.timeouts.delete(timer)
    }
    this.timers.delete(timer)
  }

  // Limpar observer específico
  clearObserver(observer) {
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect()
    }
    this.observers.delete(observer)
  }

  // Limpeza periódica para otimizar memória
  performPeriodicCleanup() {
    console.log('🧹 [MemoryManager] Executando limpeza periódica...')
    
    // Limpar timers órfãos
    this.timers.forEach(timer => {
      if (!this.intervals.has(timer) && !this.timeouts.has(timer)) {
        this.timers.delete(timer)
      }
    })

    // Limpar observers órfãos
    this.observers.forEach(observer => {
      if (!observer || typeof observer.disconnect !== 'function') {
        this.observers.delete(observer)
      }
    })

    // Forçar garbage collection se disponível
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc()
        console.log('🗑️ [MemoryManager] Garbage collection executado')
      } catch (error) {
        console.warn('⚠️ [MemoryManager] Erro ao executar GC:', error)
      }
    }

    console.log(`🧹 [MemoryManager] Limpeza concluída - Timers: ${this.timers.size}, Observers: ${this.observers.size}`)
  }

  // Limpeza completa
  cleanup() {
    console.log('🧹 [MemoryManager] Executando limpeza completa...')

    // Limpar todos os timers
    this.intervals.forEach(timer => clearInterval(timer))
    this.timeouts.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.intervals.clear()
    this.timeouts.clear()

    // Desconectar todos os observers
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
      }
    })
    this.observers.clear()

    // Remover todos os event listeners
    this.eventListeners.forEach((listeners, key) => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options)
      })
    })
    this.eventListeners.clear()

    // Executar callbacks de limpeza
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('❌ [MemoryManager] Erro em callback de limpeza:', error)
      }
    })
    this.cleanupCallbacks.clear()

    console.log('✅ [MemoryManager] Limpeza completa finalizada')
  }

  // Obter estatísticas de memória
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      observers: this.observers.size,
      eventListeners: this.eventListeners.size,
      cleanupCallbacks: this.cleanupCallbacks.size
    }
  }

  // Verificar vazamentos de memória
  checkMemoryLeaks() {
    const stats = this.getStats()
    const warnings = []

    if (stats.timers > 10) {
      warnings.push(`Muitos timers ativos: ${stats.timers}`)
    }

    if (stats.observers > 5) {
      warnings.push(`Muitos observers ativos: ${stats.observers}`)
    }

    if (stats.eventListeners > 20) {
      warnings.push(`Muitos event listeners: ${stats.eventListeners}`)
    }

    if (warnings.length > 0) {
      console.warn('⚠️ [MemoryManager] Possíveis vazamentos de memória detectados:', warnings)
    }

    return {
      stats,
      warnings,
      hasLeaks: warnings.length > 0
    }
  }
}

// Instância global
export const memoryManager = new MemoryManager()

// Utilitário para criar timers com limpeza automática
export function createManagedTimer(callback, interval, options = {}) {
  const timer = setInterval(callback, interval)
  memoryManager.registerTimer(timer, 'interval')
  
  return {
    timer,
    clear: () => memoryManager.clearTimer(timer)
  }
}

// Utilitário para criar timeouts com limpeza automática
export function createManagedTimeout(callback, delay, options = {}) {
  const timer = setTimeout(callback, delay)
  memoryManager.registerTimer(timer, 'timeout')
  
  return {
    timer,
    clear: () => memoryManager.clearTimer(timer)
  }
}

// Utilitário para criar observers com limpeza automática
export function createManagedObserver(callback, options = {}) {
  const observer = new MutationObserver(callback)
  memoryManager.registerObserver(observer)
  
  return {
    observer,
    disconnect: () => memoryManager.clearObserver(observer)
  }
}
