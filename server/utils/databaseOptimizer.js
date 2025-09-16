/**
 * Otimizador de Banco de Dados
 * Implementa connection pooling e otimizações de consultas
 */

const { sequelize } = require('../config/database');
const { logger } = require('./logger');

class DatabaseOptimizer {
  constructor() {
    this.connectionPool = null;
    this.queryCache = new Map();
    this.slowQueries = [];
    this.queryStats = {
      total: 0,
      slow: 0,
      errors: 0,
      avgTime: 0
    };
  }

  /**
   * Inicializa otimizações do banco
   */
  async initialize() {
    try {
      // Configurar connection pooling
      await this.configureConnectionPool();
      
      // Criar índices otimizados (desabilitado temporariamente)
      // await this.createOptimizedIndexes();
      
      // Configurar query monitoring
      this.setupQueryMonitoring();
      
      logger.info('Database optimizer initialized');
    } catch (error) {
      logger.error('Failed to initialize database optimizer', { error: error.message });
      throw error;
    }
  }

  /**
   * Configura connection pooling
   */
  async configureConnectionPool() {
    try {
      // Configurações otimizadas para connection pooling
      const poolConfig = {
        max: 20, // Máximo de conexões
        min: 5,  // Mínimo de conexões
        acquire: 30000, // Tempo para adquirir conexão
        idle: 10000,    // Tempo de idle
        evict: 1000,    // Intervalo de eviction
        handleDisconnects: true
      };

      // Aplicar configurações ao Sequelize
      sequelize.options.pool = poolConfig;
      
      logger.info('Connection pool configured', poolConfig);
    } catch (error) {
      logger.error('Failed to configure connection pool', { error: error.message });
      throw error;
    }
  }

  /**
   * Cria índices otimizados
   */
  async createOptimizedIndexes() {
    try {
      const indexes = [
        // Índices para surebets
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surebets_sport ON surebets(sport)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surebets_created_at ON surebets(created_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surebets_profit ON surebets(profit)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surebets_composite ON surebets(sport, profit, created_at)',
        
        // Índices para usuários
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)',
        
        // Índices para bookmaker accounts
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmaker_accounts_user_id ON bookmaker_accounts(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmaker_accounts_bookmaker ON bookmaker_accounts(bookmaker)',
        
        // Índices para transações
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id ON transaction_history(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_at ON transaction_history(created_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_type ON transaction_history(type)'
      ];

      for (const indexQuery of indexes) {
        try {
          await sequelize.query(indexQuery);
          logger.debug('Index created', { query: indexQuery });
        } catch (error) {
          if (!error.message.includes('already exists')) {
            logger.warn('Failed to create index', { query: indexQuery, error: error.message });
          }
        }
      }
      
      logger.info('Optimized indexes created');
    } catch (error) {
      logger.error('Failed to create indexes', { error: error.message });
      throw error;
    }
  }

  /**
   * Configura monitoramento de consultas
   */
  setupQueryMonitoring() {
    // Hook para monitorar consultas lentas
    sequelize.addHook('beforeQuery', (options) => {
      options.startTime = Date.now();
    });

    sequelize.addHook('afterQuery', (options) => {
      const duration = Date.now() - options.startTime;
      this.queryStats.total++;
      this.queryStats.avgTime = (this.queryStats.avgTime + duration) / 2;
      
      if (duration > 1000) { // Consultas > 1 segundo
        this.queryStats.slow++;
        this.slowQueries.push({
          query: options.sql || 'Unknown query',
          duration,
          timestamp: new Date().toISOString()
        });
        
        logger.warn('Slow query detected', {
          duration,
          query: options.sql ? options.sql.substring(0, 100) + '...' : 'Unknown query'
        });
      }
    });
  }

  /**
   * Executa consulta otimizada com cache
   */
  async executeOptimizedQuery(query, params = [], options = {}) {
    const cacheKey = `${query}:${JSON.stringify(params)}`;
    const cacheTTL = options.cacheTTL || 30000; // 30 segundos padrão
    
    // Verificar cache
    if (options.useCache && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTTL) {
        logger.cache('HIT', 'database_query', true, { query: query.substring(0, 50) });
        return cached.data;
      }
    }
    
    const startTime = Date.now();
    
    try {
      const result = await sequelize.query(query, {
        replacements: params,
        type: sequelize.QueryTypes.SELECT,
        ...options
      });
      
      const duration = Date.now() - startTime;
      
      // Armazenar no cache se habilitado
      if (options.useCache) {
        this.queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        logger.cache('SET', 'database_query', null, { query: query.substring(0, 50) });
      }
      
      logger.performance('Database query', duration, {
        query: query.substring(0, 50),
        rows: result.length
      });
      
      return result;
    } catch (error) {
      this.queryStats.errors++;
      logger.error('Database query failed', {
        query: query.substring(0, 50),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Busca surebets otimizada
   */
  async getSurebetsOptimized(filters = {}) {
    const whereClause = this.buildWhereClause(filters);
    
    const query = `
      SELECT 
        s.*,
        b1.name as bookmaker1_name,
        b2.name as bookmaker2_name
      FROM surebets s
      LEFT JOIN bookmakers b1 ON s.bookmaker1 = b1.id
      LEFT JOIN bookmakers b2 ON s.bookmaker2 = b2.id
      ${whereClause}
      ORDER BY s.profit DESC
      LIMIT 100
    `;
    
    return this.executeOptimizedQuery(query, [], {
      useCache: true,
      cacheTTL: 30000
    });
  }

  /**
   * Constrói cláusula WHERE otimizada
   */
  buildWhereClause(filters) {
    const conditions = [];
    
    if (filters.sport) {
      conditions.push('s.sport = :sport');
    }
    
    if (filters.minProfit) {
      conditions.push('s.profit >= :minProfit');
    }
    
    if (filters.maxProfit) {
      conditions.push('s.profit <= :maxProfit');
    }
    
    if (filters.dateFrom) {
      conditions.push('s.created_at >= :dateFrom');
    }
    
    if (filters.dateTo) {
      conditions.push('s.created_at <= :dateTo');
    }
    
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Limpa cache de consultas
   */
  clearQueryCache() {
    this.queryCache.clear();
    logger.info('Query cache cleared');
  }

  /**
   * Obtém estatísticas de consultas
   */
  getQueryStats() {
    return {
      ...this.queryStats,
      cacheSize: this.queryCache.size,
      slowQueriesCount: this.slowQueries.length,
      recentSlowQueries: this.slowQueries.slice(-10)
    };
  }

  /**
   * Otimiza consultas lentas
   */
  optimizeSlowQueries() {
    const recommendations = [];
    
    for (const slowQuery of this.slowQueries) {
      const query = slowQuery.query.toLowerCase();
      
      if (query.includes('select *')) {
        recommendations.push({
          query: slowQuery.query.substring(0, 100),
          issue: 'SELECT * detected',
          recommendation: 'Use specific columns instead of SELECT *'
        });
      }
      
      if (query.includes('order by') && !query.includes('limit')) {
        recommendations.push({
          query: slowQuery.query.substring(0, 100),
          issue: 'ORDER BY without LIMIT',
          recommendation: 'Add LIMIT clause to ORDER BY queries'
        });
      }
      
      if (query.includes('like') && query.includes('%')) {
        recommendations.push({
          query: slowQuery.query.substring(0, 100),
          issue: 'LIKE with leading wildcard',
          recommendation: 'Consider full-text search or indexed columns'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Executa limpeza de manutenção
   */
  async performMaintenance() {
    try {
      // Limpar cache antigo
      this.clearQueryCache();
      
      // Limpar consultas lentas antigas
      this.slowQueries = this.slowQueries.slice(-100);
      
      // Resetar estatísticas
      this.queryStats = {
        total: 0,
        slow: 0,
        errors: 0,
        avgTime: 0
      };
      
      logger.info('Database maintenance completed');
    } catch (error) {
      logger.error('Database maintenance failed', { error: error.message });
    }
  }
}

// Instância global do otimizador
const databaseOptimizer = new DatabaseOptimizer();

module.exports = {
  DatabaseOptimizer,
  databaseOptimizer
};
