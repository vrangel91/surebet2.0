/**
 * Sistema de Rate Limiting Otimizado
 * Controla requisições por usuário/IP para evitar abuso
 */

const { logger } = require('./logger')

class RateLimiter {
  constructor(config = {}) {
    this.windowMs = config.windowMs || 60000 // 1 minuto
    this.maxRequests = config.maxRequests || 30
    this.skipSuccessfulRequests = config.skipSuccessfulRequests || false
    this.skipFailedRequests = config.skipFailedRequests || false
    this.requests = new Map()
    this.blockedIPs = new Set()
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      uniqueIPs: 0
    }
    
    // Limpeza automática
    this.startCleanupInterval()
    
    logger.info('RateLimiter initialized', {
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
      skipSuccessfulRequests: this.skipSuccessfulRequests,
      skipFailedRequests: this.skipFailedRequests
    })
  }

  /**
   * Middleware para rate limiting
   */
  middleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req)
      const now = Date.now()
      
      // Verificar se IP está bloqueado
      if (this.blockedIPs.has(clientIP)) {
        this.stats.blockedRequests++
        logger.warn('Request blocked - IP in blacklist', { ip: clientIP })
        return res.status(429).json({
          success: false,
          message: 'IP bloqueado por excesso de requisições',
          retryAfter: this.windowMs / 1000
        })
      }

      // Limpar requisições antigas
      this.cleanupOldRequests(clientIP, now)

      // Verificar limite
      const clientRequests = this.requests.get(clientIP) || []
      
      if (clientRequests.length >= this.maxRequests) {
        this.stats.blockedRequests++
        logger.warn('Rate limit exceeded', { 
          ip: clientIP, 
          requests: clientRequests.length,
          maxRequests: this.maxRequests
        })
        
        // Bloquear IP temporariamente se exceder muito
        if (clientRequests.length > this.maxRequests * 2) {
          this.blockedIPs.add(clientIP)
          setTimeout(() => {
            this.blockedIPs.delete(clientIP)
            logger.info('IP unblocked', { ip: clientIP })
          }, this.windowMs * 5) // Bloquear por 5 minutos
        }
        
        return res.status(429).json({
          success: false,
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
          retryAfter: this.windowMs / 1000,
          limit: this.maxRequests,
          remaining: 0
        })
      }

      // Adicionar requisição
      clientRequests.push(now)
      this.requests.set(clientIP, clientRequests)
      
      this.stats.totalRequests++
      this.stats.allowedRequests++
      
      // Adicionar headers de rate limit
      res.set({
        'X-RateLimit-Limit': this.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, this.maxRequests - clientRequests.length),
        'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
      })

      next()
    }
  }

  /**
   * Middleware específico para surebets
   */
  surebetsMiddleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req)
      const now = Date.now()
      
      // Limite mais restritivo para surebets
      const surebetsLimit = Math.floor(this.maxRequests * 0.5) // 50% do limite normal
      
      this.cleanupOldRequests(clientIP, now)
      const clientRequests = this.requests.get(clientIP) || []
      
      if (clientRequests.length >= surebetsLimit) {
        this.stats.blockedRequests++
        logger.warn('Surebets rate limit exceeded', { 
          ip: clientIP, 
          requests: clientRequests.length,
          limit: surebetsLimit
        })
        
        return res.status(429).json({
          success: false,
          message: 'Limite de requisições para surebets excedido',
          retryAfter: this.windowMs / 1000,
          limit: surebetsLimit,
          remaining: 0
        })
      }

      // Adicionar requisição
      clientRequests.push(now)
      this.requests.set(clientIP, clientRequests)
      
      res.set({
        'X-RateLimit-Limit': surebetsLimit,
        'X-RateLimit-Remaining': Math.max(0, surebetsLimit - clientRequests.length),
        'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
      })

      next()
    }
  }

  /**
   * Obtém IP do cliente
   */
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           '127.0.0.1'
  }

  /**
   * Limpa requisições antigas
   */
  cleanupOldRequests(clientIP, now) {
    const clientRequests = this.requests.get(clientIP)
    if (!clientRequests) return

    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < this.windowMs
    )

    if (validRequests.length === 0) {
      this.requests.delete(clientIP)
    } else {
      this.requests.set(clientIP, validRequests)
    }
  }

  /**
   * Limpeza automática
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup()
    }, this.windowMs)
  }

  /**
   * Limpeza geral
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.windowMs
      )

      if (validRequests.length === 0) {
        this.requests.delete(ip)
        cleaned++
      } else {
        this.requests.set(ip, validRequests)
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', { cleaned, remaining: this.requests.size })
    }

    this.stats.uniqueIPs = this.requests.size
  }

  /**
   * Retorna estatísticas
   */
  getStats() {
    return {
      ...this.stats,
      activeIPs: this.requests.size,
      blockedIPs: this.blockedIPs.size,
      hitRate: this.stats.totalRequests > 0 
        ? ((this.stats.allowedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    }
  }

  /**
   * Retorna informações detalhadas
   */
  getInfo() {
    const ipStats = []
    for (const [ip, requests] of this.requests.entries()) {
      ipStats.push({
        ip,
        requests: requests.length,
        lastRequest: Math.max(...requests),
        oldestRequest: Math.min(...requests)
      })
    }

    return {
      stats: this.getStats(),
      activeIPs: ipStats.sort((a, b) => b.requests - a.requests),
      blockedIPs: Array.from(this.blockedIPs)
    }
  }

  /**
   * Limpa todas as requisições
   */
  clear() {
    this.requests.clear()
    this.blockedIPs.clear()
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      uniqueIPs: 0
    }
    logger.info('Rate limiter cleared')
  }

  /**
   * Desbloqueia IP específico
   */
  unblockIP(ip) {
    this.blockedIPs.delete(ip)
    logger.info('IP unblocked manually', { ip })
  }

  /**
   * Bloqueia IP específico
   */
  blockIP(ip, duration = this.windowMs * 5) {
    this.blockedIPs.add(ip)
    setTimeout(() => {
      this.blockedIPs.delete(ip)
      logger.info('IP unblocked after duration', { ip })
    }, duration)
    logger.info('IP blocked manually', { ip, duration })
  }
}

// Instâncias para diferentes tipos de rate limiting
const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 30,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const surebetsRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 15, // Mais restritivo para surebets
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

const backendRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 100, // Mais permissivo para backend
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})

module.exports = { 
  RateLimiter, 
  apiRateLimiter, 
  surebetsRateLimiter, 
  backendRateLimiter 
}