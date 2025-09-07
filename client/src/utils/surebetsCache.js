/**
 * Sistema de Cache para Surebets no Frontend
 * Evita chamadas desnecessárias à API quando usuários navegam entre páginas
 */

class SurebetsCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 50 // Máximo de 50 entradas no cache
    this.defaultTTL = 5 * 60 * 1000 // 5 minutos
    this.compressionEnabled = true
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    }
  }

  /**
   * Gera chave única para o cache baseada nos parâmetros
   */
  generateKey(params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
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
      // Simulação de compressão - em produção usar LZ-string ou similar
      return JSON.stringify(data)
    } catch (error) {
      console.warn('Erro na compressão:', error)
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
      console.warn('Erro na descompressão:', error)
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
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)
    this.stats.totalRequests++
    
    console.log(`📦 Cache SET: ${key} (${this.cache.size}/${this.maxSize})`)
  }

  /**
   * Recupera dados do cache
   */
  get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      console.log(`❌ Cache MISS: ${key}`)
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      console.log(`⏰ Cache EXPIRED: ${key}`)
      return null
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    const decompressedData = this.decompress(entry.data)
    console.log(`✅ Cache HIT: ${key} (acessos: ${entry.accessCount})`)
    
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
      console.log(`🗑️ Cache EVICTED: ${oldestKey}`)
    }
  }

  /**
   * Limpa cache expirado
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache CLEANUP: ${cleaned} entradas removidas`)
    }
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear()
    console.log('🗑️ Cache CLEARED')
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

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(1)}%`
    }
  }

  /**
   * Retorna informações detalhadas do cache
   */
  getInfo() {
    const entries = []
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        size: JSON.stringify(entry.data).length
      })
    }

    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.lastAccessed - a.lastAccessed)
    }
  }
}

// Instância singleton
const surebetsCache = new SurebetsCache()

// Limpeza automática a cada 2 minutos
setInterval(() => {
  surebetsCache.cleanup()
}, 2 * 60 * 1000)

export default surebetsCache
