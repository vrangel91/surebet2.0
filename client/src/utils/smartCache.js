/**
 * Sistema de Cache Inteligente
 * Gerencia cache de dados com invalidação automática e sincronização entre usuários
 */

class SmartCache {
  constructor() {
    this.cache = new Map()
    this.cacheTimestamps = new Map()
    this.subscribers = new Set()
    this.maxCacheAge = 30000 // 30 segundos
    this.cleanupInterval = 60000 // Limpeza a cada minuto
    this.version = 1
    
    this.startCleanup()
  }

  /**
   * Inicia limpeza automática do cache
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Limpa entradas expiradas do cache
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.maxCacheAge) {
        this.cache.delete(key)
        this.cacheTimestamps.delete(key)
        cleaned++
      }
    }
    
    // Cache limpo
  }

  /**
   * Obtém dados do cache se válidos
   */
  get(key) {
    const timestamp = this.cacheTimestamps.get(key)
    const now = Date.now()
    
    if (!timestamp || (now - timestamp) > this.maxCacheAge) {
      this.cache.delete(key)
      this.cacheTimestamps.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  /**
   * Armazena dados no cache
   */
  set(key, data, customAge = null) {
    const age = customAge || this.maxCacheAge
    this.cache.set(key, data)
    this.cacheTimestamps.set(key, Date.now())
    
    // Notificar subscribers
    this.notifySubscribers(key, data)
    
    // Dados armazenados no cache
  }

  /**
   * Verifica se uma chave existe e é válida
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key) {
    this.cache.delete(key)
    this.cacheTimestamps.delete(key)
    // Entrada removida do cache
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear()
    this.cacheTimestamps.clear()
    // Cache completamente limpo
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    
    for (const timestamp of this.cacheTimestamps.values()) {
      if (now - timestamp > this.maxCacheAge) {
        expiredEntries++
      } else {
        validEntries++
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxAge: this.maxCacheAge,
      subscribers: this.subscribers.size
    }
  }

  /**
   * Adiciona um subscriber para notificações de mudanças
   */
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Notifica todos os subscribers sobre mudanças
   */
  notifySubscribers(key, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(key, data)
      } catch (error) {
        // Erro ao notificar subscriber
      }
    })
  }

  /**
   * Cache específico para surebets com lógica especial
   */
  setSurebets(surebets, metadata = {}) {
    const cacheKey = 'surebets_data'
    const cacheData = {
      data: surebets,
      metadata: {
        timestamp: Date.now(),
        version: this.version,
        ...metadata
      }
    }
    
    this.set(cacheKey, cacheData, 15000) // 15 segundos para surebets
  }

  /**
   * Obtém surebets do cache
   */
  getSurebets() {
    const cached = this.get('surebets_data')
    return cached ? cached.data : null
  }

  /**
   * Cache para contas de bookmaker (dados mais estáveis)
   */
  setBookmakerAccounts(accounts) {
    this.set('bookmaker_accounts', accounts, 60000) // 1 minuto
  }

  /**
   * Obtém contas de bookmaker do cache
   */
  getBookmakerAccounts() {
    return this.get('bookmaker_accounts')
  }

  /**
   * Cache para configurações do usuário
   */
  setUserSettings(settings) {
    this.set('user_settings', settings, 300000) // 5 minutos
  }

  /**
   * Obtém configurações do usuário do cache
   */
  getUserSettings() {
    return this.get('user_settings')
  }

  /**
   * Invalida cache baseado em padrões
   */
  invalidatePattern(pattern) {
    let invalidated = 0
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.delete(key)
        invalidated++
      }
    }
    
    // Cache invalidado
    return invalidated
  }

  /**
   * Força atualização de dados específicos
   */
  forceRefresh(key) {
    this.delete(key)
    // Forçando atualização
  }
}

// Instância singleton
export const smartCache = new SmartCache()

// Hook para Vue.js
export function useSmartCache() {
  return {
    get: (key) => smartCache.get(key),
    set: (key, data, age) => smartCache.set(key, data, age),
    has: (key) => smartCache.has(key),
    delete: (key) => smartCache.delete(key),
    clear: () => smartCache.clear(),
    getStats: () => smartCache.getStats(),
    subscribe: (callback) => smartCache.subscribe(callback),
    
    // Métodos específicos
    setSurebets: (surebets, metadata) => smartCache.setSurebets(surebets, metadata),
    getSurebets: () => smartCache.getSurebets(),
    setBookmakerAccounts: (accounts) => smartCache.setBookmakerAccounts(accounts),
    getBookmakerAccounts: () => smartCache.getBookmakerAccounts(),
    setUserSettings: (settings) => smartCache.setUserSettings(settings),
    getUserSettings: () => smartCache.getUserSettings(),
    
    // Utilitários
    invalidatePattern: (pattern) => smartCache.invalidatePattern(pattern),
    forceRefresh: (key) => smartCache.forceRefresh(key)
  }
}
