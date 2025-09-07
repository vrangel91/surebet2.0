/**
 * Sistema de Análise de Erros
 * Analisa padrões de erro e sugere soluções
 */

const { logger } = require('./logger');

class ErrorAnalyzer {
  constructor() {
    this.errorPatterns = new Map();
    this.errorCounts = new Map();
    this.errorTimestamps = new Map();
    this.solutions = new Map();
    
    this.initializeSolutions();
  }

  /**
   * Inicializa soluções conhecidas para diferentes tipos de erro
   */
  initializeSolutions() {
    this.solutions.set('ECONNREFUSED', {
      description: 'Conexão recusada',
      solutions: [
        'Verificar se o serviço está rodando',
        'Verificar configuração de porta',
        'Verificar firewall'
      ],
      priority: 'high'
    });

    this.solutions.set('ETIMEDOUT', {
      description: 'Timeout de conexão',
      solutions: [
        'Aumentar timeout de conexão',
        'Verificar latência de rede',
        'Implementar retry mechanism'
      ],
      priority: 'medium'
    });

    this.solutions.set('ENOTFOUND', {
      description: 'Host não encontrado',
      solutions: [
        'Verificar DNS',
        'Verificar configuração de URL',
        'Verificar conectividade de rede'
      ],
      priority: 'high'
    });

    this.solutions.set('ECONNRESET', {
      description: 'Conexão resetada pelo peer',
      solutions: [
        'Implementar retry mechanism',
        'Verificar estabilidade da conexão',
        'Ajustar configurações de keep-alive'
      ],
      priority: 'medium'
    });

    this.solutions.set('EAI_AGAIN', {
      description: 'Temporary failure in name resolution',
      solutions: [
        'Verificar DNS',
        'Implementar retry mechanism',
        'Verificar conectividade de rede'
      ],
      priority: 'medium'
    });

    this.solutions.set('RATE_LIMIT_EXCEEDED', {
      description: 'Rate limit excedido',
      solutions: [
        'Implementar backoff exponencial',
        'Ajustar limites de rate limiting',
        'Implementar circuit breaker'
      ],
      priority: 'low'
    });

    this.solutions.set('CACHE_MISS', {
      description: 'Cache miss frequente',
      solutions: [
        'Ajustar TTL do cache',
        'Implementar cache warming',
        'Otimizar estratégia de cache'
      ],
      priority: 'low'
    });

    this.solutions.set('DATABASE_ERROR', {
      description: 'Erro de banco de dados',
      solutions: [
        'Verificar conexão com banco',
        'Otimizar consultas SQL',
        'Implementar connection pooling'
      ],
      priority: 'high'
    });
  }

  /**
   * Analisa um erro e retorna insights
   */
  analyzeError(error, context = {}) {
    const errorCode = error.code || error.name || 'UNKNOWN';
    const errorMessage = error.message || 'Erro desconhecido';
    const timestamp = Date.now();
    
    // Registrar erro
    this.recordError(errorCode, errorMessage, context, timestamp);
    
    // Analisar padrões
    const patterns = this.analyzePatterns(errorCode);
    
    // Gerar insights
    const insights = this.generateInsights(errorCode, patterns, context);
    
    // Log da análise
    logger.warn('Error analysis', {
      errorCode,
      errorMessage,
      patterns,
      insights,
      context
    });
    
    return {
      errorCode,
      errorMessage,
      patterns,
      insights,
      timestamp,
      context
    };
  }

  /**
   * Registra um erro para análise
   */
  recordError(errorCode, message, context, timestamp) {
    // Contar ocorrências
    const count = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, count + 1);
    
    // Registrar timestamp
    if (!this.errorTimestamps.has(errorCode)) {
      this.errorTimestamps.set(errorCode, []);
    }
    this.errorTimestamps.get(errorCode).push(timestamp);
    
    // Manter apenas últimos 100 timestamps
    const timestamps = this.errorTimestamps.get(errorCode);
    if (timestamps.length > 100) {
      timestamps.splice(0, timestamps.length - 100);
    }
  }

  /**
   * Analisa padrões de erro
   */
  analyzePatterns(errorCode) {
    const patterns = {
      frequency: this.getErrorFrequency(errorCode),
      trend: this.getErrorTrend(errorCode),
      timing: this.getErrorTiming(errorCode),
      severity: this.getErrorSeverity(errorCode)
    };
    
    return patterns;
  }

  /**
   * Obtém frequência do erro
   */
  getErrorFrequency(errorCode) {
    const count = this.errorCounts.get(errorCode) || 0;
    const timestamps = this.errorTimestamps.get(errorCode) || [];
    
    if (timestamps.length < 2) {
      return 'low';
    }
    
    const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
    const frequency = count / (timeSpan / 1000 / 60); // erros por minuto
    
    if (frequency > 10) return 'very_high';
    if (frequency > 5) return 'high';
    if (frequency > 1) return 'medium';
    return 'low';
  }

  /**
   * Obtém tendência do erro
   */
  getErrorTrend(errorCode) {
    const timestamps = this.errorTimestamps.get(errorCode) || [];
    
    if (timestamps.length < 10) {
      return 'insufficient_data';
    }
    
    const recent = timestamps.slice(-5);
    const older = timestamps.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.5) return 'increasing';
    if (recentAvg < olderAvg * 0.5) return 'decreasing';
    return 'stable';
  }

  /**
   * Obtém padrão de timing do erro
   */
  getErrorTiming(errorCode) {
    const timestamps = this.errorTimestamps.get(errorCode) || [];
    
    if (timestamps.length < 5) {
      return 'insufficient_data';
    }
    
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < avgInterval * 0.1) return 'regular';
    if (stdDev < avgInterval * 0.5) return 'semi_regular';
    return 'irregular';
  }

  /**
   * Obtém severidade do erro
   */
  getErrorSeverity(errorCode) {
    const solution = this.solutions.get(errorCode);
    if (solution) {
      return solution.priority;
    }
    
    const frequency = this.getErrorFrequency(errorCode);
    if (frequency === 'very_high') return 'high';
    if (frequency === 'high') return 'medium';
    return 'low';
  }

  /**
   * Gera insights baseados no erro
   */
  generateInsights(errorCode, patterns, context) {
    const insights = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      monitoring: []
    };
    
    const solution = this.solutions.get(errorCode);
    if (solution) {
      insights.immediate.push(...solution.solutions);
    }
    
    // Insights baseados em padrões
    if (patterns.frequency === 'very_high') {
      insights.immediate.push('Investigar causa raiz imediatamente');
      insights.monitoring.push('Configurar alertas para este erro');
    }
    
    if (patterns.trend === 'increasing') {
      insights.shortTerm.push('Implementar mitigação temporária');
      insights.monitoring.push('Monitorar tendência de crescimento');
    }
    
    if (patterns.timing === 'regular') {
      insights.longTerm.push('Implementar solução preventiva');
    }
    
    // Insights baseados no contexto
    if (context.endpoint) {
      insights.shortTerm.push(`Verificar endpoint ${context.endpoint}`);
    }
    
    if (context.userId) {
      insights.monitoring.push(`Monitorar usuário ${context.userId}`);
    }
    
    return insights;
  }

  /**
   * Obtém relatório de erros
   */
  getErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorTypes: Array.from(this.errorCounts.entries()).map(([code, count]) => ({
        code,
        count,
        frequency: this.getErrorFrequency(code),
        trend: this.getErrorTrend(code),
        severity: this.getErrorSeverity(code)
      })),
      topErrors: Array.from(this.errorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * Gera recomendações baseadas nos erros
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Recomendações baseadas em frequência
    for (const [errorCode, count] of this.errorCounts) {
      const frequency = this.getErrorFrequency(errorCode);
      const solution = this.solutions.get(errorCode);
      
      if (frequency === 'very_high' && solution) {
        recommendations.push({
          priority: 'high',
          error: errorCode,
          action: solution.solutions[0],
          reason: `Erro ${errorCode} ocorre ${frequency} vezes`
        });
      }
    }
    
    // Recomendações baseadas em tendência
    for (const errorCode of this.errorCounts.keys()) {
      const trend = this.getErrorTrend(errorCode);
      if (trend === 'increasing') {
        recommendations.push({
          priority: 'medium',
          error: errorCode,
          action: 'Investigar causa do aumento',
          reason: `Tendência crescente detectada`
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Limpa dados antigos
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [errorCode, timestamps] of this.errorTimestamps) {
      const recentTimestamps = timestamps.filter(ts => now - ts < maxAge);
      this.errorTimestamps.set(errorCode, recentTimestamps);
      
      if (recentTimestamps.length === 0) {
        this.errorTimestamps.delete(errorCode);
        this.errorCounts.delete(errorCode);
      }
    }
  }
}

// Instância global do analisador de erros
const errorAnalyzer = new ErrorAnalyzer();

// Limpeza automática a cada hora
setInterval(() => {
  errorAnalyzer.cleanup();
}, 60 * 60 * 1000);

module.exports = {
  ErrorAnalyzer,
  errorAnalyzer
};
