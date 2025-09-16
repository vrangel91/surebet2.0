/**
 * Cache para Status VIP
 * Evita verificações desnecessárias no banco de dados
 */

const { logger } = require('./logger');

class VIPCache {
  constructor(config = {}) {
    this.cache = new Map();
    this.defaultTTL = config.defaultTTL || 300000; // 5 minutos
    this.maxSize = config.maxSize || 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    // Limpeza automática
    this.startCleanupInterval();
    
    logger.info('VIPCache initialized', {
      defaultTTL: this.defaultTTL,
      maxSize: this.maxSize
    });
  }

  /**
   * Gera chave única para o cache
   */
  generateKey(userId) {
    return `vip_status_${userId}`;
  }

  /**
   * Armazena status VIP no cache
   */
  set(userId, vipStatus, ttl = this.defaultTTL) {
    // Verificar se cache está cheio
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const key = this.generateKey(userId);
    const entry = {
      data: vipStatus,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.totalRequests++;
    
    logger.debug('VIP Cache SET', { 
      userId, 
      hasVIP: vipStatus.hasVIP,
      size: this.cache.size
    });
  }

  /**
   * Recupera status VIP do cache
   */
  get(userId) {
    const key = this.generateKey(userId);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      logger.debug('VIP Cache MISS', { userId });
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug('VIP Cache EXPIRED', { userId });
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    logger.debug('VIP Cache HIT', { 
      userId, 
      accessCount: entry.accessCount,
      hasVIP: entry.data.hasVIP
    });
    
    return entry.data;
  }

  /**
   * Remove entrada mais antiga do cache
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      logger.debug('VIP Cache EVICTED', { key: oldestKey });
    }
  }

  /**
   * Limpa cache expirado
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('VIP Cache CLEANUP', { cleaned, remaining: this.cache.size });
    }
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('VIP Cache CLEARED', { entries: size });
  }

  /**
   * Verifica se status está em cache e válido
   */
  has(userId) {
    const key = this.generateKey(userId);
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Invalida cache para um usuário específico
   */
  invalidate(userId) {
    const key = this.generateKey(userId);
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('VIP Cache INVALIDATED', { userId });
    }
    return deleted;
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(1)}%`
    };
  }

  /**
   * Inicia limpeza automática
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Limpeza a cada minuto
  }
}

// Instância singleton
const vipCache = new VIPCache({
  defaultTTL: 300000, // 5 minutos
  maxSize: 1000
});

module.exports = { VIPCache, vipCache };
