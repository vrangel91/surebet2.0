/**
 * Sistema de Rate Limiting no Cliente
 * Controla a frequência de requisições para evitar sobrecarga do servidor
 */

class RateLimiter {
  constructor() {
    this.requests = new Map() // key -> { count, resetTime }
    this.defaultLimits = {
      '/api/surebets': { max: 12, window: 60000 }, // 12 req/min
      '/api/bookmaker-accounts': { max: 6, window: 60000 }, // 6 req/min
      '/api/user-settings': { max: 3, window: 60000 }, // 3 req/min
      '/api/notifications': { max: 10, window: 60000 }, // 10 req/min
    }
    this.backoffMultiplier = 1.5
    this.maxBackoff = 30000 // 30 segundos máximo
  }

  /**
   * Verifica se uma requisição pode ser feita
   */
  canMakeRequest(endpoint) {
    const limit = this.defaultLimits[endpoint] || { max: 10, window: 60000 }
    const now = Date.now()
    const key = endpoint
    
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 0, resetTime: now + limit.window })
      return true
    }
    
    const requestData = this.requests.get(key)
    
    // Reset se a janela expirou
    if (now >= requestData.resetTime) {
      requestData.count = 0
      requestData.resetTime = now + limit.window
    }
    
    return requestData.count < limit.max
  }

  /**
   * Registra uma requisição
   */
  recordRequest(endpoint) {
    const limit = this.defaultLimits[endpoint] || { max: 10, window: 60000 }
    const key = endpoint
    
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 1, resetTime: Date.now() + limit.window })
    } else {
      const requestData = this.requests.get(key)
      const now = Date.now()
      
      // Reset se a janela expirou
      if (now >= requestData.resetTime) {
        requestData.count = 1
        requestData.resetTime = now + limit.window
      } else {
        requestData.count++
      }
    }
  }

  /**
   * Obtém o tempo de espera até a próxima requisição permitida
   */
  getWaitTime(endpoint) {
    const limit = this.defaultLimits[endpoint] || { max: 10, window: 60000 }
    const key = endpoint
    
    if (!this.requests.has(key)) {
      return 0
    }
    
    const requestData = this.requests.get(key)
    const now = Date.now()
    
    if (now >= requestData.resetTime) {
      return 0
    }
    
    const remainingRequests = limit.max - requestData.count
    if (remainingRequests > 0) {
      return 0
    }
    
    return requestData.resetTime - now
  }

  /**
   * Obtém estatísticas de rate limiting
   */
  getStats() {
    const stats = {}
    const now = Date.now()
    
    for (const [endpoint, requestData] of this.requests.entries()) {
      const limit = this.defaultLimits[endpoint] || { max: 10, window: 60000 }
      
      stats[endpoint] = {
        current: requestData.count,
        limit: limit.max,
        resetIn: Math.max(0, requestData.resetTime - now),
        canMakeRequest: this.canMakeRequest(endpoint)
      }
    }
    
    return stats
  }

  /**
   * Limpa dados expirados
   */
  cleanup() {
    const now = Date.now()
    
    for (const [key, requestData] of this.requests.entries()) {
      if (now >= requestData.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Aplica backoff exponencial em caso de erro
   */
  applyBackoff(endpoint) {
    const key = `${endpoint}_backoff`
    const now = Date.now()
    
    if (!this.requests.has(key)) {
      this.requests.set(key, { 
        count: 1, 
        resetTime: now + 1000, // 1 segundo inicial
        backoffLevel: 1 
      })
    } else {
      const backoffData = this.requests.get(key)
      const backoffTime = Math.min(
        1000 * Math.pow(this.backoffMultiplier, backoffData.backoffLevel),
        this.maxBackoff
      )
      
      backoffData.count++
      backoffData.resetTime = now + backoffTime
      backoffData.backoffLevel++
    }
  }

  /**
   * Reseta backoff após sucesso
   */
  resetBackoff(endpoint) {
    const key = `${endpoint}_backoff`
    this.requests.delete(key)
  }

  /**
   * Verifica se está em período de backoff
   */
  isInBackoff(endpoint) {
    const key = `${endpoint}_backoff`
    const backoffData = this.requests.get(key)
    
    if (!backoffData) {
      return false
    }
    
    const now = Date.now()
    return now < backoffData.resetTime
  }

  /**
   * Obtém tempo restante do backoff
   */
  getBackoffTime(endpoint) {
    const key = `${endpoint}_backoff`
    const backoffData = this.requests.get(key)
    
    if (!backoffData) {
      return 0
    }
    
    const now = Date.now()
    return Math.max(0, backoffData.resetTime - now)
  }
}

// Instância singleton
export const rateLimiter = new RateLimiter()

// Hook para Vue.js
export function useRateLimiter() {
  return {
    canMakeRequest: (endpoint) => rateLimiter.canMakeRequest(endpoint),
    recordRequest: (endpoint) => rateLimiter.recordRequest(endpoint),
    getWaitTime: (endpoint) => rateLimiter.getWaitTime(endpoint),
    getStats: () => rateLimiter.getStats(),
    cleanup: () => rateLimiter.cleanup(),
    applyBackoff: (endpoint) => rateLimiter.applyBackoff(endpoint),
    resetBackoff: (endpoint) => rateLimiter.resetBackoff(endpoint),
    isInBackoff: (endpoint) => rateLimiter.isInBackoff(endpoint),
    getBackoffTime: (endpoint) => rateLimiter.getBackoffTime(endpoint)
  }
}

// Interceptor para axios
export function createRateLimitInterceptor() {
  return {
    request: (config) => {
      const endpoint = config.url
      
      // Verificar se pode fazer a requisição
      if (!rateLimiter.canMakeRequest(endpoint)) {
        const waitTime = rateLimiter.getWaitTime(endpoint)
        console.warn(`⏳ Rate limit atingido para ${endpoint}. Aguardando ${waitTime}ms`)
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(config)
          }, waitTime)
        })
      }
      
      // Verificar backoff
      if (rateLimiter.isInBackoff(endpoint)) {
        const backoffTime = rateLimiter.getBackoffTime(endpoint)
        console.warn(`⏳ Backoff ativo para ${endpoint}. Aguardando ${backoffTime}ms`)
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(config)
          }, backoffTime)
        })
      }
      
      return config
    },
    
    response: (response) => {
      const endpoint = response.config.url
      rateLimiter.recordRequest(endpoint)
      rateLimiter.resetBackoff(endpoint)
      return response
    },
    
    error: (error) => {
      const endpoint = error.config?.url
      if (endpoint && error.response?.status >= 500) {
        rateLimiter.applyBackoff(endpoint)
        console.warn(`⚠️ Erro do servidor para ${endpoint}, aplicando backoff`)
      }
      return Promise.reject(error)
    }
  }
}
