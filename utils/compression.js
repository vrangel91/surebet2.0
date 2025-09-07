/**
 * Sistema de Compressão de Respostas
 * Implementa compressão gzip para reduzir tamanho das respostas
 */

const zlib = require('zlib');
const { logger } = require('./logger');

class CompressionManager {
  constructor() {
    this.compressionThreshold = 1024; // Comprimir apenas respostas > 1KB
    this.compressionLevel = 6; // Nível de compressão (1-9)
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      bytesSaved: 0,
      compressionRatio: 0
    };
  }

  /**
   * Middleware de compressão
   */
  middleware() {
    return (req, res, next) => {
      const originalWrite = res.write;
      const originalEnd = res.end;
      let chunks = [];
      let originalSize = 0;

      // Interceptar escrita de dados
      res.write = function(chunk) {
        if (chunk) {
          chunks.push(chunk);
          originalSize += chunk.length;
        }
        return true;
      };

      res.end = function(chunk) {
        if (chunk) {
          chunks.push(chunk);
          originalSize += chunk.length;
        }

        // Verificar se deve comprimir
        if (this.shouldCompress(req, res, originalSize)) {
          this.compressResponse(req, res, chunks, originalSize);
        } else {
          // Enviar resposta original
          this.sendOriginalResponse(res, chunks);
        }
      }.bind(this);

      next();
    };
  }

  /**
   * Verifica se deve comprimir a resposta
   */
  shouldCompress(req, res, size) {
    // Não comprimir se muito pequena
    if (size < this.compressionThreshold) {
      return false;
    }

    // Verificar se cliente suporta compressão
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (!acceptEncoding.includes('gzip')) {
      return false;
    }

    // Verificar tipo de conteúdo
    const contentType = res.getHeader('content-type') || '';
    const compressibleTypes = [
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/plain'
    ];

    return compressibleTypes.some(type => contentType.includes(type));
  }

  /**
   * Comprime a resposta
   */
  compressResponse(req, res, chunks, originalSize) {
    try {
      const data = Buffer.concat(chunks);
      
      zlib.gzip(data, { level: this.compressionLevel }, (err, compressed) => {
        if (err) {
          logger.error('Compression failed', { error: err.message });
          this.sendOriginalResponse(res, chunks);
          return;
        }

        // Atualizar estatísticas
        this.updateStats(originalSize, compressed.length);

        // Configurar headers
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.setHeader('Vary', 'Accept-Encoding');

        // Enviar resposta comprimida
        res.writeHead(res.statusCode);
        res.end(compressed);

        logger.debug('Response compressed', {
          originalSize,
          compressedSize: compressed.length,
          ratio: (compressed.length / originalSize * 100).toFixed(2) + '%'
        });
      });
    } catch (error) {
      logger.error('Compression error', { error: error.message });
      this.sendOriginalResponse(res, chunks);
    }
  }

  /**
   * Envia resposta original
   */
  sendOriginalResponse(res, chunks) {
    res.writeHead(res.statusCode);
    chunks.forEach(chunk => res.write(chunk));
    res.end();
  }

  /**
   * Atualiza estatísticas de compressão
   */
  updateStats(originalSize, compressedSize) {
    this.stats.totalRequests++;
    this.stats.compressedRequests++;
    this.stats.bytesSaved += (originalSize - compressedSize);
    this.stats.compressionRatio = this.stats.bytesSaved / 
      (this.stats.totalRequests * originalSize) * 100;
  }

  /**
   * Obtém estatísticas de compressão
   */
  getStats() {
    return {
      ...this.stats,
      avgCompressionRatio: this.stats.compressionRatio.toFixed(2) + '%',
      bytesSavedMB: (this.stats.bytesSaved / 1024 / 1024).toFixed(2) + ' MB'
    };
  }

  /**
   * Comprime dados específicos
   */
  compressData(data, options = {}) {
    return new Promise((resolve, reject) => {
      const level = options.level || this.compressionLevel;
      const threshold = options.threshold || this.compressionThreshold;
      
      if (data.length < threshold) {
        resolve({ data, compressed: false });
        return;
      }

      zlib.gzip(data, { level }, (err, compressed) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          data: compressed,
          compressed: true,
          originalSize: data.length,
          compressedSize: compressed.length,
          ratio: (compressed.length / data.length * 100).toFixed(2) + '%'
        });
      });
    });
  }

  /**
   * Descomprime dados
   */
  decompressData(compressedData) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(compressedData, (err, decompressed) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(decompressed);
      });
    });
  }
}

// Instância global do gerenciador de compressão
const compressionManager = new CompressionManager();

module.exports = {
  CompressionManager,
  compressionManager
};
