/**
 * Sistema de Health Check Avançado
 * Verifica saúde de todos os componentes do sistema
 */

const { sequelize } = require('../config/database');
const { backendCache } = require('./cache');
const { backendRateLimiter } = require('./rateLimiter');
const { systemMonitor } = require('./monitoring');
const { logger } = require('./logger');

class HealthChecker {
  constructor() {
    this.checks = [
      { name: 'database', fn: this.checkDatabase.bind(this) },
      { name: 'cache', fn: this.checkCache.bind(this) },
      { name: 'rateLimiter', fn: this.checkRateLimiter.bind(this) },
      { name: 'monitoring', fn: this.checkMonitoring.bind(this) },
      { name: 'memory', fn: this.checkMemory.bind(this) },
      { name: 'disk', fn: this.checkDisk.bind(this) }
    ];
  }

  /**
   * Executa todos os health checks
   */
  async runAllChecks() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        total: this.checks.length,
        healthy: 0,
        unhealthy: 0,
        warnings: 0
      }
    };

    for (const check of this.checks) {
      try {
        const result = await check.fn();
        results.checks[check.name] = result;
        
        if (result.status === 'healthy') {
          results.summary.healthy++;
        } else if (result.status === 'unhealthy') {
          results.summary.unhealthy++;
          results.status = 'unhealthy';
        } else if (result.status === 'warning') {
          results.summary.warnings++;
          if (results.status === 'healthy') {
            results.status = 'warning';
          }
        }
      } catch (error) {
        results.checks[check.name] = {
          status: 'unhealthy',
          message: error.message,
          error: error.stack
        };
        results.summary.unhealthy++;
        results.status = 'unhealthy';
      }
    }

    return results;
  }

  /**
   * Verifica conexão com banco de dados
   */
  async checkDatabase() {
    try {
      await sequelize.authenticate();
      const [results] = await sequelize.query('SELECT 1 as test');
      
      return {
        status: 'healthy',
        message: 'Conexão com banco de dados OK',
        details: {
          connected: true,
          testQuery: results[0].test === 1
        }
      };
    } catch (error) {
      logger.error('Health check database failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha na conexão com banco de dados',
        error: error.message
      };
    }
  }

  /**
   * Verifica sistema de cache
   */
  async checkCache() {
    try {
      const stats = backendCache.getStats();
      const hitRate = parseFloat(stats.hitRate);
      
      let status = 'healthy';
      let message = 'Sistema de cache funcionando';
      
      if (hitRate < 50) {
        status = 'warning';
        message = 'Hit rate do cache baixo';
      } else if (hitRate < 30) {
        status = 'unhealthy';
        message = 'Hit rate do cache muito baixo';
      }

      return {
        status,
        message,
        details: stats
      };
    } catch (error) {
      logger.error('Health check cache failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha no sistema de cache',
        error: error.message
      };
    }
  }

  /**
   * Verifica rate limiter
   */
  async checkRateLimiter() {
    try {
      const stats = backendRateLimiter.getStats();
      const blockRate = parseFloat(stats.blockRate);
      
      let status = 'healthy';
      let message = 'Rate limiter funcionando';
      
      if (blockRate > 10) {
        status = 'warning';
        message = 'Taxa de bloqueio alta';
      } else if (blockRate > 25) {
        status = 'unhealthy';
        message = 'Taxa de bloqueio muito alta';
      }

      return {
        status,
        message,
        details: stats
      };
    } catch (error) {
      logger.error('Health check rate limiter failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha no rate limiter',
        error: error.message
      };
    }
  }

  /**
   * Verifica sistema de monitoramento
   */
  async checkMonitoring() {
    try {
      const stats = systemMonitor.getSystemStats();
      const alerts = systemMonitor.getActiveAlerts();
      
      let status = 'healthy';
      let message = 'Sistema de monitoramento OK';
      
      if (alerts.length > 5) {
        status = 'warning';
        message = 'Muitos alertas ativos';
      } else if (alerts.length > 10) {
        status = 'unhealthy';
        message = 'Sistema com muitos alertas críticos';
      }

      return {
        status,
        message,
        details: {
          alertsCount: alerts.length,
          systemStats: stats
        }
      };
    } catch (error) {
      logger.error('Health check monitoring failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha no sistema de monitoramento',
        error: error.message
      };
    }
  }

  /**
   * Verifica uso de memória
   */
  async checkMemory() {
    try {
      const used = process.memoryUsage();
      const total = require('os').totalmem();
      const free = require('os').freemem();
      const usedPercent = ((total - free) / total) * 100;
      
      let status = 'healthy';
      let message = 'Uso de memória normal';
      
      if (usedPercent > 80) {
        status = 'warning';
        message = 'Uso de memória alto';
      } else if (usedPercent > 90) {
        status = 'unhealthy';
        message = 'Uso de memória crítico';
      }

      return {
        status,
        message,
        details: {
          usedPercent: usedPercent.toFixed(2),
          heapUsed: Math.round(used.heapUsed / 1024 / 1024),
          heapTotal: Math.round(used.heapTotal / 1024 / 1024),
          external: Math.round(used.external / 1024 / 1024)
        }
      };
    } catch (error) {
      logger.error('Health check memory failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha ao verificar memória',
        error: error.message
      };
    }
  }

  /**
   * Verifica espaço em disco
   */
  async checkDisk() {
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      const freeSpace = require('os').freemem();
      const totalSpace = require('os').totalmem();
      const usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100;
      
      let status = 'healthy';
      let message = 'Espaço em disco OK';
      
      if (usedPercent > 85) {
        status = 'warning';
        message = 'Espaço em disco baixo';
      } else if (usedPercent > 95) {
        status = 'unhealthy';
        message = 'Espaço em disco crítico';
      }

      return {
        status,
        message,
        details: {
          usedPercent: usedPercent.toFixed(2),
          freeSpace: Math.round(freeSpace / 1024 / 1024 / 1024),
          totalSpace: Math.round(totalSpace / 1024 / 1024 / 1024)
        }
      };
    } catch (error) {
      logger.error('Health check disk failed', { error: error.message });
      return {
        status: 'unhealthy',
        message: 'Falha ao verificar disco',
        error: error.message
      };
    }
  }

  /**
   * Executa health check simples (apenas componentes críticos)
   */
  async quickCheck() {
    const criticalChecks = ['database', 'cache', 'memory'];
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    for (const checkName of criticalChecks) {
      const check = this.checks.find(c => c.name === checkName);
      if (check) {
        try {
          const result = await check.fn();
          results.checks[checkName] = result;
          if (result.status === 'unhealthy') {
            results.status = 'unhealthy';
          }
        } catch (error) {
          results.checks[checkName] = {
            status: 'unhealthy',
            message: error.message
          };
          results.status = 'unhealthy';
        }
      }
    }

    return results;
  }
}

// Instância global do health checker
const healthChecker = new HealthChecker();

module.exports = {
  HealthChecker,
  healthChecker
};
