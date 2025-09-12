/**
 * Sistema de Cache de Planos
 * Otimiza verificações de plano para reduzir consultas ao banco
 */

const { logger } = require('./logger');

class PlanCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiration = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos em millisegundos
    this.cleanupInterval = 60 * 1000; // Limpeza a cada 1 minuto
    
    // Iniciar limpeza automática
    this.startCleanup();
    
    logger.info('📦 PlanCache inicializado');
  }

  /**
   * Armazenar dados de plano no cache
   * @param {string} userId - ID do usuário
   * @param {Object} planData - Dados do plano
   * @param {number} ttl - Tempo de vida em millisegundos (opcional)
   */
  set(userId, planData, ttl = null) {
    const expirationTime = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(userId, {
      ...planData,
      cachedAt: Date.now(),
      expiresAt: expirationTime
    });
    
    this.cacheExpiration.set(userId, expirationTime);
    
    logger.debug('📦 Plano armazenado no cache:', {
      userId,
      plan: planData.plan,
      expiresAt: new Date(expirationTime).toISOString()
    });
  }

  /**
   * Recuperar dados de plano do cache
   * @param {string} userId - ID do usuário
   * @returns {Object|null} - Dados do plano ou null se não encontrado/expirado
   */
  get(userId) {
    const cachedData = this.cache.get(userId);
    
    if (!cachedData) {
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > cachedData.expiresAt) {
      this.delete(userId);
      return null;
    }
    
    logger.debug('📦 Plano recuperado do cache:', {
      userId,
      plan: cachedData.plan,
      age: Date.now() - cachedData.cachedAt
    });
    
    return cachedData;
  }

  /**
   * Verificar se existe no cache e não expirou
   * @param {string} userId - ID do usuário
   * @returns {boolean}
   */
  has(userId) {
    return this.get(userId) !== null;
  }

  /**
   * Remover do cache
   * @param {string} userId - ID do usuário
   */
  delete(userId) {
    this.cache.delete(userId);
    this.cacheExpiration.delete(userId);
    
    logger.debug('📦 Plano removido do cache:', { userId });
  }

  /**
   * Invalidar cache para um usuário (útil quando plano é alterado)
   * @param {string} userId - ID do usuário
   */
  invalidate(userId) {
    this.delete(userId);
    logger.info('📦 Cache invalidado para usuário:', { userId });
  }

  /**
   * Limpar cache expirado
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [userId, expirationTime] of this.cacheExpiration.entries()) {
      if (now > expirationTime) {
        this.delete(userId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug('📦 Cache limpo:', { 
        expiredEntries: cleanedCount,
        remainingEntries: this.cache.size 
      });
    }
  }

  /**
   * Iniciar limpeza automática
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Obter estatísticas do cache
   * @returns {Object}
   */
  getStats() {
    return {
      totalEntries: this.cache.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    this.cache.clear();
    this.cacheExpiration.clear();
    logger.info('📦 Cache completamente limpo');
  }

  /**
   * Verificar acesso a funcionalidade específica
   * @param {string} userId - ID do usuário
   * @param {string} feature - Funcionalidade (surebets, valuebets, reports, etc.)
   * @returns {boolean}
   */
  hasFeatureAccess(userId, feature) {
    const cachedData = this.get(userId);
    
    if (!cachedData) {
      return false;
    }
    
    const plan = cachedData.plan || 'basic';
    const isAdmin = cachedData.isAdmin || false;
    
    if (isAdmin) {
      return true;
    }
    
    // Mapeamento de funcionalidades para planos
    const featurePlans = {
      surebets: ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly'],
      
      valuebets: ['vip', 'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly'],
      
      reports: ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
               'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
               'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
               'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
               'full-daily', 'full-weekly', 'full-monthly', 'full-yearly'],
      
      premium: ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
               'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
               'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
               'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
               'full-daily', 'full-weekly', 'full-monthly', 'full-yearly']
    };
    
    const allowedPlans = featurePlans[feature] || [];
    return allowedPlans.includes(plan);
  }

  /**
   * Verificar se é VIP (qualquer plano pago)
   * @param {string} userId - ID do usuário
   * @returns {boolean}
   */
  isVIP(userId) {
    const cachedData = this.get(userId);
    
    if (!cachedData) {
      return false;
    }
    
    const plan = cachedData.plan || 'basic';
    const isAdmin = cachedData.isAdmin || false;
    
    if (isAdmin) {
      return true;
    }
    
    const paidPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                      'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                      'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
                      'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
                      'full-daily', 'full-weekly', 'full-monthly', 'full-yearly'];
    
    return paidPlans.includes(plan);
  }
}

// Instância singleton
const planCache = new PlanCache();

module.exports = { PlanCache, planCache };
