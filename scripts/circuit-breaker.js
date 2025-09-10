/**
 * Sistema de Circuit Breaker
 * Implementa circuit breaker para evitar sobrecarga do servidor
 */

class CircuitBreaker {
  constructor(config = {}) {
    this.failureThreshold = config.failureThreshold || 5; // 5 falhas consecutivas
    this.timeout = config.timeout || 60000; // 60 segundos
    this.resetTimeout = config.resetTimeout || 30000; // 30 segundos
    this.monitoringPeriod = config.monitoringPeriod || 10000; // 10 segundos
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.requestCount = 0;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpens: 0
    };
  }

  /**
   * Executa uma função através do circuit breaker
   */
  async execute(fn, context = '') {
    this.metrics.totalRequests++;
    
    // Verificar se o circuit está aberto
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker: Tentando reset para ${context}`);
      } else {
        throw new Error(`Circuit breaker OPEN para ${context}`);
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess(context);
      return result;
    } catch (error) {
      this.onFailure(error, context);
      throw error;
    }
  }

  /**
   * Verifica se deve tentar resetar o circuit
   */
  shouldAttemptReset() {
    if (this.state !== 'OPEN') return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.resetTimeout;
  }

  /**
   * Callback de sucesso
   */
  onSuccess(context) {
    this.metrics.successfulRequests++;
    this.successCount++;
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      // Se está em half-open e teve sucesso, fechar o circuit
      this.state = 'CLOSED';
      console.log(`✅ Circuit breaker: Fechado para ${context}`);
    }
  }

  /**
   * Callback de falha
   */
  onFailure(error, context) {
    this.metrics.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.metrics.circuitOpens++;
      console.log(`🚨 Circuit breaker: ABERTO para ${context} (${this.failureCount} falhas consecutivas)`);
    }
  }

  /**
   * Obtém estatísticas do circuit breaker
   */
  getStats() {
    const errorRate = this.metrics.totalRequests > 0 
      ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100 
      : 0;
    
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      errorRate: errorRate,
      circuitOpens: this.metrics.circuitOpens,
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests
    };
  }

  /**
   * Reseta o circuit breaker manualmente
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    console.log('🔄 Circuit breaker: Resetado manualmente');
  }

  /**
   * Força abertura do circuit breaker
   */
  open() {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
    console.log('🚨 Circuit breaker: Forçado a abrir');
  }

  /**
   * Verifica se o circuit está fechado (permitindo requisições)
   */
  isClosed() {
    return this.state === 'CLOSED';
  }

  /**
   * Verifica se o circuit está aberto (bloqueando requisições)
   */
  isOpen() {
    return this.state === 'OPEN';
  }

  /**
   * Verifica se o circuit está em half-open (testando)
   */
  isHalfOpen() {
    return this.state === 'HALF_OPEN';
  }
}

module.exports = CircuitBreaker;
