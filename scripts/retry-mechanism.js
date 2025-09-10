/**
 * Sistema de Retry Inteligente
 * Implementa retry com backoff exponencial para requisições falhadas
 */

class RetryMechanism {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries || 3;
    this.baseDelay = config.baseDelay || 1000; // 1 segundo
    this.maxDelay = config.maxDelay || 10000; // 10 segundos
    this.backoffMultiplier = config.backoffMultiplier || 2;
    this.retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EAI_AGAIN'
    ];
    this.retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  }

  /**
   * Executa uma função com retry automático
   */
  async executeWithRetry(fn, context = '') {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error;
        
        // Se não é o último attempt e o erro é retryable
        if (attempt < this.maxRetries && this.shouldRetry(error)) {
          const delay = this.calculateDelay(attempt);
          console.log(`🔄 Retry ${attempt + 1}/${this.maxRetries} para ${context} em ${delay}ms (${error.message})`);
          await this.sleep(delay);
          continue;
        }
        
        // Se não deve fazer retry ou esgotou tentativas
        break;
      }
    }
    
    throw lastError;
  }

  /**
   * Verifica se o erro deve ser retryable
   */
  shouldRetry(error) {
    // Erros de rede
    if (this.retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Status codes retryable
    if (error.response && this.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }
    
    // Timeout
    if (error.message.includes('timeout')) {
      return true;
    }
    
    // Rate limit
    if (error.response && error.response.status === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * Calcula delay para retry com backoff exponencial
   */
  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * delay; // Adiciona jitter
    return Math.min(delay + jitter, this.maxDelay);
  }

  /**
   * Utilitário para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa múltiplas funções com retry em paralelo
   */
  async executeBatchWithRetry(functions, maxConcurrency = 5) {
    const results = [];
    const executing = [];
    
    for (const fn of functions) {
      const promise = this.executeWithRetry(fn.fn, fn.context);
      results.push(promise);
      
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
      
      executing.push(promise);
    }
    
    return Promise.allSettled(results);
  }
}

module.exports = RetryMechanism;
