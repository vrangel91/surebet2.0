/**
 * Sistema de Cache para Surebets
 * Cache inteligente com TTL, fallback e compressão
 */

const NodeCache = require('node-cache');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class SurebetsCache {
  constructor(config = {}) {
    this.cache = new NodeCache({
      stdTTL: config.defaultTTL || 60, // 1 minuto por padrão
      checkperiod: config.checkperiod || 30, // Verificar a cada 30 segundos
      useClones: false, // Performance otimizada
      maxKeys: config.maxKeys || 1000, // Máximo de chaves
    });

    this.compressionEnabled = config.compression !== false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      compressions: 0,
      decompressions: 0
    };

    // Configurações de TTL por tipo de dados
    this.ttlConfig = {
      surebets: config.surebetsTTL || 60, // 1 minuto para surebets
      metadata: config.metadataTTL || 300, // 5 minutos para metadados
      fallback: config.fallbackTTL || 30 // 30 segundos para fallback
    };

    console.log('✅ Sistema de Cache Surebets inicializado');
    console.log(`   TTL Surebets: ${this.ttlConfig.surebets}s`);
    console.log(`   Compressão: ${this.compressionEnabled ? 'Ativada' : 'Desativada'}`);
  }

  /**
   * Comprimir dados se necessário
   */
  async compress(data) {
    if (!this.compressionEnabled || !data) return data;
    
    try {
      const jsonString = JSON.stringify(data);
      if (jsonString.length < 1024) return data; // Não comprimir dados pequenos
      
      const compressed = await gzip(jsonString);
      this.stats.compressions++;
      return compressed;
    } catch (error) {
      console.warn('⚠️ Erro ao comprimir dados:', error.message);
      return data;
    }
  }

  /**
   * Descomprimir dados se necessário
   */
  async decompress(data) {
    if (!this.compressionEnabled || !Buffer.isBuffer(data)) return data;
    
    try {
      const decompressed = await gunzip(data);
      this.stats.decompressions++;
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.warn('⚠️ Erro ao descomprimir dados:', error.message);
      return data;
    }
  }

  /**
   * Obter dados do cache
   */
  async get(key) {
    try {
      const cached = this.cache.get(key);
      
      if (cached === undefined) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      
      // Descomprimir se necessário
      const data = await this.decompress(cached.data);
      
      return {
        data,
        timestamp: cached.timestamp,
        ttl: cached.ttl,
        compressed: cached.compressed || false
      };
    } catch (error) {
      this.stats.errors++;
      console.error('❌ Erro ao obter do cache:', error.message);
      return null;
    }
  }

  /**
   * Armazenar dados no cache
   */
  async set(key, data, ttl = null) {
    try {
      const timestamp = Date.now();
      const actualTTL = ttl || this.ttlConfig.surebets;
      
      // Comprimir se necessário
      const compressedData = await this.compress(data);
      const isCompressed = Buffer.isBuffer(compressedData);
      
      const cacheData = {
        data: compressedData,
        timestamp,
        ttl: actualTTL,
        compressed: isCompressed
      };

      this.cache.set(key, cacheData, actualTTL);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('❌ Erro ao armazenar no cache:', error.message);
      return false;
    }
  }

  /**
   * Verificar se chave existe no cache
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Invalidar chave específica
   */
  invalidate(key) {
    return this.cache.del(key);
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    this.cache.flushAll();
    console.log('🧹 Cache limpo');
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const keys = this.cache.keys();
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      keys: keys.length,
      maxKeys: this.cache.options.maxKeys,
      hitRate: `${hitRate}%`,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      errors: this.stats.errors,
      compressions: this.stats.compressions,
      decompressions: this.stats.decompressions,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Obter informações detalhadas de uma chave
   */
  getKeyInfo(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.timestamp;
    const remainingTTL = cached.ttl - (age / 1000);

    return {
      key,
      age: Math.round(age / 1000), // em segundos
      remainingTTL: Math.max(0, Math.round(remainingTTL)), // em segundos
      compressed: cached.compressed || false,
      size: Buffer.isBuffer(cached.data) ? cached.data.length : JSON.stringify(cached.data).length
    };
  }

  /**
   * Cache específico para surebets com fallback
   */
  async getSurebets(filters = {}) {
    const cacheKey = this.generateSurebetsKey(filters);
    const cached = await this.get(cacheKey);
    
    if (cached) {
      console.log(`✅ Cache HIT para surebets: ${cacheKey}`);
      return cached.data;
    }

    console.log(`❌ Cache MISS para surebets: ${cacheKey}`);
    return null;
  }

  /**
   * Armazenar surebets no cache
   */
  async setSurebets(data, filters = {}) {
    const cacheKey = this.generateSurebetsKey(filters);
    const success = await this.set(cacheKey, data, this.ttlConfig.surebets);
    
    if (success) {
      console.log(`💾 Surebets armazenados no cache: ${cacheKey}`);
    }
    
    return success;
  }

  /**
   * Gerar chave única para surebets baseada nos filtros
   */
  generateSurebetsKey(filters = {}) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `surebets:${filterString || 'all'}`;
  }

  /**
   * Cache com fallback para dados antigos
   */
  async getWithFallback(key, fallbackKey, maxAge = 300) {
    // Tentar obter dados principais
    const mainData = await this.get(key);
    if (mainData) return mainData;

    // Tentar obter dados de fallback
    const fallbackData = await this.get(fallbackKey);
    if (fallbackData) {
      const age = (Date.now() - fallbackData.timestamp) / 1000;
      if (age <= maxAge) {
        console.log(`🔄 Usando dados de fallback para: ${key}`);
        return fallbackData;
      }
    }

    return null;
  }

  /**
   * Pré-aquecer cache com dados iniciais
   */
  async preload(data, filters = {}) {
    console.log('🔥 Pré-aquecendo cache...');
    await this.setSurebets(data, filters);
    console.log('✅ Cache pré-aquecido');
  }

  /**
   * Limpar cache expirado manualmente
   */
  cleanup() {
    const keys = this.cache.keys();
    let cleaned = 0;
    
    keys.forEach(key => {
      const info = this.getKeyInfo(key);
      if (info && info.remainingTTL <= 0) {
        this.invalidate(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} chaves expiradas removidas`);
    }
    
    return cleaned;
  }
}

// Instância global do cache
const surebetsCache = new SurebetsCache({
  defaultTTL: 60, // 1 minuto
  surebetsTTL: 60, // 1 minuto para surebets
  metadataTTL: 300, // 5 minutos para metadados
  fallbackTTL: 30, // 30 segundos para fallback
  compression: true, // Ativar compressão
  maxKeys: 1000
});

module.exports = { SurebetsCache, surebetsCache };
