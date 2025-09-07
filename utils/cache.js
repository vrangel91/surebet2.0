/**
 * Sistema de Cache Inteligente para Backend
 * Implementa cache em memória com TTL e invalidação automática
 */

class BackendCache {
  constructor(config = {}) {
    this.cache = new Map();
    this.defaultTTL = config.defaultTTL || 300000; // 5 minutos
    this.maxSize = config.maxSize || 1000; // Máximo 1000 itens
    this.cleanupInterval = config.cleanupInterval || 60000; // Limpeza a cada minuto
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    
    // Iniciar limpeza automática
    this.startCleanup();
  }

  /**
   * Obtém um valor do cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }

  /**
   * Define um valor no cache
   */
  set(key, value, ttl = null) {
    // Verificar limite de tamanho
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt, createdAt: Date.now() });
    this.stats.sets++;
    
    return true;
  }

  /**
   * Remove um item do cache
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  /**
   * Remove o item mais antigo quando o cache está cheio
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Inicia limpeza automática de itens expirados
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Remove itens expirados
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache: Removidos ${cleaned} itens expirados`);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: hitRate.toFixed(2),
      ...this.stats
    };
  }

  /**
   * Cache específico para surebets
   */
  getSurebets(filters = {}) {
    const key = `surebets:${JSON.stringify(filters)}`;
    return this.get(key);
  }

  setSurebets(filters = {}, data, ttl = 30000) { // 30 segundos para surebets
    const key = `surebets:${JSON.stringify(filters)}`;
    return this.set(key, data, ttl);
  }

  /**
   * Cache específico para contas de bookmaker
   */
  getBookmakerAccounts(userId) {
    const key = `bookmaker_accounts:${userId}`;
    return this.get(key);
  }

  setBookmakerAccounts(userId, data, ttl = 60000) { // 1 minuto para contas
    const key = `bookmaker_accounts:${userId}`;
    return this.set(key, data, ttl);
  }

  /**
   * Invalida cache relacionado a um usuário
   */
  invalidateUserCache(userId) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`:${userId}`) || key.includes(`user:${userId}`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log(`🗑️ Cache: Invalidados ${keysToDelete.length} itens do usuário ${userId}`);
  }

  /**
   * Invalida cache de surebets
   */
  invalidateSurebetsCache() {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('surebets:')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log(`🗑️ Cache: Invalidados ${keysToDelete.length} itens de surebets`);
  }
}

// Instância global do cache
const backendCache = new BackendCache({
  defaultTTL: 300000, // 5 minutos
  maxSize: 1000,
  cleanupInterval: 60000 // 1 minuto
});

module.exports = {
  BackendCache,
  backendCache
};
