/**
 * Sistema de Monitoramento em Tempo Real
 * Monitora performance, erros e alertas do sistema
 */

const os = require('os');
const { backendCache } = require('./cache');
const { backendRateLimiter } = require('./rateLimiter');

class SystemMonitor {
  constructor(config = {}) {
    this.alerts = [];
    this.metrics = {
      cpu: [],
      memory: [],
      requests: [],
      errors: [],
      responseTime: []
    };
    this.thresholds = {
      cpu: config.cpuThreshold || 80, // 80%
      memory: config.memoryThreshold || 85, // 85%
      errorRate: config.errorRateThreshold || 5, // 5%
      responseTime: config.responseTimeThreshold || 1000 // 1 segundo
    };
    this.interval = config.interval || 10000; // 10 segundos
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Inicia o monitoramento
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('📊 Sistema de monitoramento iniciado');
    
    this.intervalId = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
    }, this.interval);
  }

  /**
   * Para o monitoramento
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('⏹️ Sistema de monitoramento parado');
  }

  /**
   * Coleta métricas do sistema
   */
  collectMetrics() {
    const now = Date.now();
    
    // CPU
    const cpuUsage = this.getCPUUsage();
    this.metrics.cpu.push({ timestamp: now, value: cpuUsage });
    
    // Memória
    const memoryUsage = this.getMemoryUsage();
    this.metrics.memory.push({ timestamp: now, value: memoryUsage });
    
    // Manter apenas últimas 100 medições
    this.cleanupMetrics();
  }

  /**
   * Obtém uso de CPU
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return 100 - Math.round((totalIdle / totalTick) * 100);
  }

  /**
   * Obtém uso de memória
   */
  getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return Math.round((usedMem / totalMem) * 100);
  }

  /**
   * Registra uma requisição
   */
  recordRequest(responseTime, success = true) {
    const now = Date.now();
    
    this.metrics.requests.push({
      timestamp: now,
      responseTime,
      success
    });
    
    this.metrics.responseTime.push({
      timestamp: now,
      value: responseTime
    });
    
    if (!success) {
      this.metrics.errors.push({
        timestamp: now,
        responseTime
      });
    }
  }

  /**
   * Verifica alertas
   */
  checkAlerts() {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(60000); // Último minuto
    
    // Verificar CPU
    if (recentMetrics.cpu.length > 0) {
      const avgCpu = recentMetrics.cpu.reduce((sum, m) => sum + m.value, 0) / recentMetrics.cpu.length;
      if (avgCpu > this.thresholds.cpu) {
        this.createAlert('HIGH_CPU', `CPU alto: ${avgCpu.toFixed(1)}%`, 'warning');
      }
    }
    
    // Verificar memória
    if (recentMetrics.memory.length > 0) {
      const avgMemory = recentMetrics.memory.reduce((sum, m) => sum + m.value, 0) / recentMetrics.memory.length;
      if (avgMemory > this.thresholds.memory) {
        this.createAlert('HIGH_MEMORY', `Memória alta: ${avgMemory.toFixed(1)}%`, 'warning');
      }
    }
    
    // Verificar taxa de erro
    if (recentMetrics.requests.length > 0) {
      const errorRate = (recentMetrics.errors.length / recentMetrics.requests.length) * 100;
      if (errorRate > this.thresholds.errorRate) {
        this.createAlert('HIGH_ERROR_RATE', `Taxa de erro alta: ${errorRate.toFixed(1)}%`, 'error');
      }
    }
    
    // Verificar tempo de resposta
    if (recentMetrics.responseTime.length > 0) {
      const avgResponseTime = recentMetrics.responseTime.reduce((sum, m) => sum + m.value, 0) / recentMetrics.responseTime.length;
      if (avgResponseTime > this.thresholds.responseTime) {
        this.createAlert('SLOW_RESPONSE', `Resposta lenta: ${avgResponseTime.toFixed(0)}ms`, 'warning');
      }
    }
  }

  /**
   * Cria um alerta
   */
  createAlert(type, message, severity = 'info') {
    const alert = {
      id: Date.now(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Log do alerta
    const emoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ALERTA: ${message}`);
    
    // Manter apenas últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Obtém métricas recentes
   */
  getRecentMetrics(timeMs) {
    const cutoff = Date.now() - timeMs;
    
    return {
      cpu: this.metrics.cpu.filter(m => m.timestamp > cutoff),
      memory: this.metrics.memory.filter(m => m.timestamp > cutoff),
      requests: this.metrics.requests.filter(m => m.timestamp > cutoff),
      errors: this.metrics.errors.filter(m => m.timestamp > cutoff),
      responseTime: this.metrics.responseTime.filter(m => m.timestamp > cutoff)
    };
  }

  /**
   * Limpa métricas antigas
   */
  cleanupMetrics() {
    const cutoff = Date.now() - 300000; // 5 minutos
    
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key].filter(m => m.timestamp > cutoff);
    });
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats() {
    const recentMetrics = this.getRecentMetrics(60000); // Último minuto
    
    const stats = {
      timestamp: new Date().toISOString(),
      system: {
        cpu: this.getCPUUsage(),
        memory: this.getMemoryUsage(),
        uptime: process.uptime(),
        platform: os.platform(),
        arch: os.arch()
      },
      performance: {
        totalRequests: this.metrics.requests.length,
        recentRequests: recentMetrics.requests.length,
        errorRate: recentMetrics.requests.length > 0 
          ? (recentMetrics.errors.length / recentMetrics.requests.length) * 100 
          : 0,
        avgResponseTime: recentMetrics.responseTime.length > 0
          ? recentMetrics.responseTime.reduce((sum, m) => sum + m.value, 0) / recentMetrics.responseTime.length
          : 0
      },
      cache: backendCache.getStats(),
      rateLimiter: backendRateLimiter.getStats(),
      alerts: {
        total: this.alerts.length,
        unresolved: this.alerts.filter(a => !a.resolved).length,
        recent: this.alerts.filter(a => Date.now() - new Date(a.timestamp).getTime() < 300000).length
      }
    };
    
    return stats;
  }

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts() {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve um alerta
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alerta resolvido: ${alert.message}`);
    }
  }

  /**
   * Middleware para registrar requisições
   */
  requestMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const success = res.statusCode < 400;
        
        this.recordRequest(responseTime, success);
      });
      
      next();
    };
  }
}

// Instância global do monitor
const systemMonitor = new SystemMonitor({
  cpuThreshold: 80,
  memoryThreshold: 85,
  errorRateThreshold: 5,
  responseTimeThreshold: 1000,
  interval: 10000
});

module.exports = {
  SystemMonitor,
  systemMonitor
};
