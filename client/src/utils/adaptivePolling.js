/**
 * Sistema de Polling Adaptativo
 * Ajusta automaticamente o intervalo de polling baseado no número de usuários ativos
 * e na atividade do usuário atual
 */

class AdaptivePolling {
  constructor() {
    this.baseInterval = 300000 // 5 minutos base
    this.minInterval = 60000  // 1 minuto mínimo
    this.maxInterval = 600000 // 10 minutos máximo
    this.currentInterval = this.baseInterval
    this.userActivityThreshold = 30000 // 30 segundos de inatividade
    this.lastActivity = Date.now()
    this.isUserActive = true
    this.connectionQuality = 'good' // good, medium, poor
    this.serverLoad = 'low' // low, medium, high
    this.retryCount = 0
    this.maxRetries = 3
    
    this.setupActivityDetection()
  }

  /**
   * Configura detecção de atividade do usuário
   */
  setupActivityDetection() {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now()
        this.isUserActive = true
        this.updatePollingInterval()
      }, { passive: true })
    })

    // Verificar inatividade periodicamente
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity
      const wasActive = this.isUserActive
      this.isUserActive = timeSinceActivity < this.userActivityThreshold
      
      if (wasActive && !this.isUserActive) {
        console.log('🛌 Usuário inativo detectado, reduzindo frequência de polling')
        this.updatePollingInterval()
      } else if (!wasActive && this.isUserActive) {
        console.log('👤 Usuário ativo detectado, aumentando frequência de polling')
        this.updatePollingInterval()
      }
    }, 10000) // Verificar a cada 10 segundos
  }

  /**
   * Atualiza o intervalo de polling baseado em múltiplos fatores
   */
  updatePollingInterval() {
    let newInterval = this.baseInterval

    // Fator 1: Atividade do usuário
    if (!this.isUserActive) {
      newInterval *= 3 // 3x mais lento quando inativo
    }

    // Fator 2: Qualidade da conexão
    switch (this.connectionQuality) {
      case 'poor':
        newInterval *= 2
        break
      case 'medium':
        newInterval *= 1.5
        break
      case 'good':
      default:
        // Mantém o intervalo base
        break
    }

    // Fator 3: Carga do servidor
    switch (this.serverLoad) {
      case 'high':
        newInterval *= 2.5
        break
      case 'medium':
        newInterval *= 1.5
        break
      case 'low':
      default:
        // Mantém o intervalo base
        break
    }

    // Fator 4: Tentativas de reconexão
    if (this.retryCount > 0) {
      newInterval *= Math.pow(1.5, this.retryCount)
    }

    // Aplicar limites
    newInterval = Math.max(this.minInterval, Math.min(this.maxInterval, newInterval))
    
    // Só atualizar se houver mudança significativa
    if (Math.abs(newInterval - this.currentInterval) > 1000) {
      this.currentInterval = newInterval
      console.log(`🔄 Intervalo de polling ajustado para ${this.currentInterval / 1000}s`)
      return true // Indica que o intervalo mudou
    }
    
    return false
  }

  /**
   * Obtém o intervalo atual de polling
   */
  getCurrentInterval() {
    return this.currentInterval
  }

  /**
   * Atualiza a qualidade da conexão baseada na latência
   */
  updateConnectionQuality(latency) {
    if (latency < 100) {
      this.connectionQuality = 'good'
    } else if (latency < 500) {
      this.connectionQuality = 'medium'
    } else {
      this.connectionQuality = 'poor'
    }
    this.updatePollingInterval()
  }

  /**
   * Atualiza a carga do servidor baseada na resposta
   */
  updateServerLoad(responseTime, errorRate) {
    if (errorRate > 0.1 || responseTime > 2000) {
      this.serverLoad = 'high'
    } else if (errorRate > 0.05 || responseTime > 1000) {
      this.serverLoad = 'medium'
    } else {
      this.serverLoad = 'low'
    }
    this.updatePollingInterval()
  }

  /**
   * Registra uma tentativa de reconexão
   */
  recordRetry() {
    this.retryCount++
    this.updatePollingInterval()
  }

  /**
   * Reseta o contador de tentativas após sucesso
   */
  resetRetryCount() {
    this.retryCount = 0
    this.updatePollingInterval()
  }

  /**
   * Força um intervalo específico (para casos especiais)
   */
  setCustomInterval(interval) {
    this.currentInterval = Math.max(this.minInterval, Math.min(this.maxInterval, interval))
    console.log(`🔄 Intervalo customizado definido para ${this.currentInterval / 1000}s`)
  }

  /**
   * Obtém estatísticas do polling
   */
  getStats() {
    return {
      currentInterval: this.currentInterval,
      isUserActive: this.isUserActive,
      connectionQuality: this.connectionQuality,
      serverLoad: this.serverLoad,
      retryCount: this.retryCount,
      timeSinceLastActivity: Date.now() - this.lastActivity
    }
  }
}

// Instância singleton
export const adaptivePolling = new AdaptivePolling()

// Hook para Vue.js
export function useAdaptivePolling() {
  return {
    getCurrentInterval: () => adaptivePolling.getCurrentInterval(),
    updateConnectionQuality: (latency) => adaptivePolling.updateConnectionQuality(latency),
    updateServerLoad: (responseTime, errorRate) => adaptivePolling.updateServerLoad(responseTime, errorRate),
    recordRetry: () => adaptivePolling.recordRetry(),
    resetRetryCount: () => adaptivePolling.resetRetryCount(),
    setCustomInterval: (interval) => adaptivePolling.setCustomInterval(interval),
    getStats: () => adaptivePolling.getStats()
  }
}
