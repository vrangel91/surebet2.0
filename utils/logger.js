/**
 * Sistema de Logs Detalhados
 * Implementa logging estruturado para debug e monitoramento
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(config = {}) {
    this.logLevel = config.logLevel || 'info';
    this.enableFileLogging = config.logToFile !== false; // Padrão true
    this.logDir = config.logDir || 'logs';
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = config.maxFiles || 5;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Criar diretório de logs se não existir
    if (this.enableFileLogging && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.stats = {
      totalLogs: 0,
      errorLogs: 0,
      warnLogs: 0,
      infoLogs: 0,
      debugLogs: 0
    };
  }

  /**
   * Log de erro
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Log de aviso
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log de informação
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log de debug
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Log de requisição HTTP
   */
  httpRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null,
      timestamp: new Date().toISOString()
    };

    const level = res.statusCode >= 400 ? 'error' : 'info';
    this.log(level, `HTTP ${req.method} ${req.url}`, logData);
  }

  /**
   * Log de erro de API
   */
  apiError(endpoint, error, req = null) {
    const logData = {
      endpoint,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (req) {
      logData.request = {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      };
    }

    this.log('error', `API Error: ${endpoint}`, logData);
  }

  /**
   * Log de performance
   */
  performance(operation, duration, meta = {}) {
    const logData = {
      operation,
      duration,
      ...meta,
      timestamp: new Date().toISOString()
    };

    const level = duration > 1000 ? 'warn' : 'info';
    this.log(level, `Performance: ${operation}`, logData);
  }

  /**
   * Log de cache
   */
  cache(operation, key, hit = null, meta = {}) {
    const logData = {
      operation,
      key,
      hit,
      ...meta,
      timestamp: new Date().toISOString()
    };

    this.log('debug', `Cache: ${operation}`, logData);
  }

  /**
   * Log de rate limiting
   */
  rateLimit(ip, userId, action, meta = {}) {
    const logData = {
      ip,
      userId,
      action,
      ...meta,
      timestamp: new Date().toISOString()
    };

    this.log('warn', `Rate Limit: ${action}`, logData);
  }

  /**
   * Log principal
   */
  log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.logLevel]) {
      return;
    }

    const logEntry = {
      level: level.toUpperCase(),
      message,
      meta,
      timestamp: new Date().toISOString(),
      pid: process.pid
    };

    // Atualizar estatísticas
    this.stats.totalLogs++;
    this.stats[`${level}Logs`]++;

    // Log para console
    this.logToConsole(logEntry);

    // Log para arquivo
    if (this.enableFileLogging) {
      this.writeToFile(logEntry);
    }
  }

  /**
   * Log para console com cores
   */
  logToConsole(entry) {
    const colors = {
      ERROR: '\x1b[31m', // Vermelho
      WARN: '\x1b[33m',  // Amarelo
      INFO: '\x1b[36m',  // Ciano
      DEBUG: '\x1b[90m'  // Cinza
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    console.log(
      `${color}[${time}] ${entry.level}${reset} ${entry.message}`,
      Object.keys(entry.meta).length > 0 ? entry.meta : ''
    );
  }

  /**
   * Log para arquivo
   */
  writeToFile(entry) {
    const filename = `${entry.level.toLowerCase()}.log`;
    const filepath = path.join(this.logDir, filename);
    const logLine = JSON.stringify(entry) + '\n';

    try {
      fs.appendFileSync(filepath, logLine);
      this.rotateLogFile(filepath);
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }
  }

  /**
   * Rotaciona arquivos de log quando ficam muito grandes
   */
  rotateLogFile(filepath) {
    try {
      const stats = fs.statSync(filepath);
      if (stats.size > this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = filepath.replace('.log', `-${timestamp}.log`);
        
        fs.renameSync(filepath, rotatedPath);
        
        // Manter apenas os últimos N arquivos
        const dir = path.dirname(filepath);
        const files = fs.readdirSync(dir)
          .filter(file => file.startsWith(path.basename(filepath, '.log')))
          .sort()
          .reverse();
        
        if (files.length > this.maxFiles) {
          files.slice(this.maxFiles).forEach(file => {
            fs.unlinkSync(path.join(dir, file));
          });
        }
      }
    } catch (error) {
      console.error('Erro ao rotacionar log:', error);
    }
  }

  /**
   * Obtém estatísticas dos logs
   */
  getStats() {
    return {
      ...this.stats,
      logLevel: this.logLevel,
      logToFile: this.logToFile
    };
  }

  /**
   * Limpa logs antigos
   */
  cleanOldLogs() {
    if (!this.logToFile) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias

      files.forEach(file => {
        const filepath = path.join(this.logDir, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Log antigo removido: ${file}`);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
    }
  }
}

// Instância global do logger
const logger = new Logger({
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: true,
  logDir: 'logs'
});

module.exports = {
  Logger,
  logger
};
