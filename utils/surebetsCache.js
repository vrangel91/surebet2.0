/**
 * Sistema de Cache para Surebets no Backend
 * Otimiza performance e reduz carga na API externa
 */

const { logger } = require('./logger')

class SurebetsCache {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 1000
    this.defaultTTL = config.defaultTTL || 30000 // 30 segundos
    this.compressionEnabled = config.compressionEnabled || true
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      lastCleanup: Date.now()
    }
    
    // Iniciar limpeza automática
    this.startCleanupInterval()
    
    logger.info('SurebetsCache initialized', {
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
      compressionEnabled: this.compressionEnabled
    })
  }

  /**
   * Gera chave única para o cache
   */
  generateKey(params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key]
        }
        return result
      }, {})
    
    return JSON.stringify(sortedParams)
  }

  /**
   * Comprime dados se necessário
   */
  compress(data) {
    if (!this.compressionEnabled || !data) return data
    
    try {
      // Em produção, usar biblioteca de compressão como zlib
      return JSON.stringify(data)
    } catch (error) {
      logger.warn('Compression error', { error: error.message })
      return data
    }
  }

  /**
   * Descomprime dados se necessário
   */
  decompress(data) {
    if (!this.compressionEnabled || typeof data !== 'string') return data
    
    try {
      return JSON.parse(data)
    } catch (error) {
      logger.warn('Decompression error', { error: error.message })
      return data
    }
  }

  /**
   * Armazena dados no cache
   */
  set(key, data, ttl = this.defaultTTL) {
    // Verificar se cache está cheio
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const compressedData = this.compress(data)
    const entry = {
      data: compressedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: JSON.stringify(compressedData).length
    }

    this.cache.set(key, entry)
    this.stats.totalRequests++
    
    logger.debug('Cache SET', { 
      key: key.substring(0, 50) + '...', 
      size: this.cache.size,
      maxSize: this.maxSize,
      dataSize: entry.size
    })
  }

  /**
   * Recupera dados do cache
   */
  get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      logger.debug('Cache MISS', { key: key.substring(0, 50) + '...' })
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      logger.debug('Cache EXPIRED', { key: key.substring(0, 50) + '...' })
      return null
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    const decompressedData = this.decompress(entry.data)
    logger.debug('Cache HIT', { 
      key: key.substring(0, 50) + '...', 
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp
    })
    
    return decompressedData
  }

  /**
   * Remove entrada mais antiga do cache
   */
  evictOldest() {
    let oldestKey = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      logger.debug('Cache EVICTED', { key: oldestKey.substring(0, 50) + '...' })
    }
  }

  /**
   * Limpa cache expirado
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0
    let totalSize = 0

    for (const [key, entry] of this.cache.entries()) {
      totalSize += entry.size
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.info('Cache CLEANUP', { 
        cleaned, 
        remaining: this.cache.size,
        totalSize: Math.round(totalSize / 1024) + 'KB'
      })
    }

    this.stats.lastCleanup = now
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    logger.info('Cache CLEARED', { entries: size })
  }

  /**
   * Verifica se dados estão em cache e válidos
   */
  has(key) {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : 0

    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(1)}%`,
      totalSize: Math.round(totalSize / 1024) + 'KB',
      avgEntrySize: this.cache.size > 0 ? Math.round(totalSize / this.cache.size) : 0
    }
  }

  /**
   * Retorna informações detalhadas do cache
   */
  getInfo() {
    const entries = []
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key: key.substring(0, 100) + (key.length > 100 ? '...' : ''),
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        size: entry.size
      })
    }

    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.lastAccessed - a.lastAccessed)
    }
  }

  /**
   * Inicia limpeza automática
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup()
    }, 60000) // Limpeza a cada minuto
  }

  /**
   * Otimiza cache removendo entradas menos acessadas
   */
  optimize() {
    const entries = Array.from(this.cache.entries())
    const sortedEntries = entries.sort((a, b) => a[1].accessCount - b[1].accessCount)
    
    // Remover 20% das entradas menos acessadas
    const toRemove = Math.floor(sortedEntries.length * 0.2)
    let removed = 0
    
    for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
      this.cache.delete(sortedEntries[i][0])
      removed++
    }
    
    if (removed > 0) {
      logger.info('Cache OPTIMIZED', { removed, remaining: this.cache.size })
    }
  }
}

// Instância singleton
const surebetsCache = new SurebetsCache({
  maxSize: 1000,
  defaultTTL: 30000, // 30 segundos
  compressionEnabled: true
})

module.exports = { SurebetsCache, surebetsCache }
