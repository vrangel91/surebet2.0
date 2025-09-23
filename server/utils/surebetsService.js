/**
 * Serviço de Surebets com Cache
 * Gerencia requisições para API externa com cache inteligente
 */

const axios = require('axios');
const { surebetsCache } = require('./surebetsCache');

class SurebetsService {
  constructor() {
    this.externalAPI = {
      url: 'https://sempregreen.net.br/apipre/stream',
      timeout: 15000, // Aumentado para 15 segundos
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Referer': 'https://sempregreen.net.br'
      }
    };

    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // 1 segundo
      backoffMultiplier: 2
    };

    this.stats = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastUpdate: null,
      averageResponseTime: 0
    };

    console.log('✅ Serviço de Surebets inicializado');
  }

  /**
   * Obter surebets com cache inteligente
   */
  async getSurebets(filters = {}) {
    const startTime = Date.now();
    
    try {
      // 1. Tentar obter do cache primeiro
      const cachedData = await surebetsCache.getSurebets(filters);
      if (cachedData) {
        this.stats.cacheHits++;
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);
        
        console.log(`⚡ Cache HIT - Surebets obtidos em ${responseTime}ms`);
        return {
          success: true,
          data: cachedData,
          source: 'cache',
          timestamp: Date.now(),
          responseTime
        };
      }

      // 2. Cache miss - buscar da API externa
      this.stats.cacheMisses++;
      console.log('🌐 Cache MISS - Buscando da API externa...');
      
      const apiData = await this.fetchFromExternalAPI();
      
      if (apiData.success) {
        // 3. Armazenar no cache para próximas requisições
        await surebetsCache.setSurebets(apiData.data, filters);
        
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);
        this.stats.lastUpdate = Date.now();
        
        console.log(`✅ API SUCCESS - Surebets obtidos em ${responseTime}ms`);
        return {
          success: true,
          data: apiData.data,
          source: 'api',
          timestamp: Date.now(),
          responseTime
        };
      } else {
        // 4. API falhou - tentar fallback do cache
        console.log('⚠️ API FAILED - Tentando fallback do cache...');
        const fallbackData = await this.getFallbackData(filters);
        
        if (fallbackData) {
          const responseTime = Date.now() - startTime;
          this.updateAverageResponseTime(responseTime);
          
          console.log(`🔄 FALLBACK SUCCESS - Dados antigos obtidos em ${responseTime}ms`);
          return {
            success: true,
            data: fallbackData,
            source: 'fallback',
            timestamp: Date.now(),
            responseTime,
            warning: 'Dados podem estar desatualizados'
          };
        }
        
        // 5. Tudo falhou
        this.stats.errors++;
        const responseTime = Date.now() - startTime;
        
        console.log(`❌ ALL FAILED - Nenhum dado disponível em ${responseTime}ms`);
        return {
          success: false,
          error: 'Não foi possível obter dados de surebets',
          source: 'error',
          timestamp: Date.now(),
          responseTime
        };
      }

    } catch (error) {
      this.stats.errors++;
      const responseTime = Date.now() - startTime;
      
      console.error('❌ Erro no serviço de surebets:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'error',
        timestamp: Date.now(),
        responseTime
      };
    }
  }

  /**
   * Buscar dados da API externa com retry
   */
  async fetchFromExternalAPI() {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(`🌐 Tentativa ${attempt}/${this.retryConfig.maxRetries} - API externa`);
        
        const response = await axios.get(this.externalAPI.url, {
          timeout: this.externalAPI.timeout,
          headers: this.externalAPI.headers
        });

        this.stats.apiCalls++;
        
        if (response.status === 200 && response.data) {
          const processedData = this.processAPIData(response.data);
          return {
            success: true,
            data: processedData,
            attempt
          };
        } else {
          throw new Error(`API retornou status ${response.status}`);
        }

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError.message,
      attempts: this.retryConfig.maxRetries
    };
  }

  /**
   * Processar dados da API externa
   */
  processAPIData(apiData) {
    try {
      // Se os dados já estão no formato correto
      if (typeof apiData === 'object' && apiData !== null) {
        return apiData;
      }

      // Se é uma string JSON
      if (typeof apiData === 'string') {
        return JSON.parse(apiData);
      }

      // Se é um array
      if (Array.isArray(apiData)) {
        return apiData;
      }

      // Fallback - retornar como está
      return apiData;

    } catch (error) {
      console.warn('⚠️ Erro ao processar dados da API:', error.message);
      return apiData;
    }
  }

  /**
   * Obter dados de fallback (cache antigo ou sistema legacy)
   */
  async getFallbackData(filters = {}) {
    try {
      // Tentar obter dados antigos do cache (até 5 minutos)
      const fallbackKey = `fallback:${surebetsCache.generateSurebetsKey(filters)}`;
      const fallbackData = await surebetsCache.getWithFallback(
        surebetsCache.generateSurebetsKey(filters),
        fallbackKey,
        300 // 5 minutos
      );

      if (fallbackData) {
        console.log('🔄 Dados de fallback encontrados no cache');
        return fallbackData.data;
      }

      // Tentar obter dados do sistema legacy (variável global surebets)
      if (typeof global !== 'undefined' && global.surebets && typeof global.surebets === 'object') {
        console.log('🔄 Usando dados do sistema legacy como fallback');
        return global.surebets;
      }

      // Se não há fallback, gerar dados mock para não quebrar a aplicação
      console.log('🎭 Gerando dados mock como último recurso');
      return this.generateMockData();

    } catch (error) {
      console.error('❌ Erro ao obter dados de fallback:', error.message);
      return this.generateMockData();
    }
  }

  /**
   * Gerar dados mock para fallback
   */
  generateMockData() {
    return {
      mock: true,
      message: 'Dados temporários - API indisponível',
      timestamp: Date.now(),
      surebets: []
    };
  }

  /**
   * Atualizar tempo médio de resposta
   */
  updateAverageResponseTime(newTime) {
    if (this.stats.averageResponseTime === 0) {
      this.stats.averageResponseTime = newTime;
    } else {
      this.stats.averageResponseTime = (this.stats.averageResponseTime + newTime) / 2;
    }
  }

  /**
   * Obter estatísticas do serviço
   */
  getStats() {
    const cacheStats = surebetsCache.getStats();
    const totalRequests = this.stats.cacheHits + this.stats.cacheMisses;
    const cacheHitRate = totalRequests > 0 
      ? (this.stats.cacheHits / totalRequests * 100).toFixed(2)
      : 0;

    return {
      service: {
        apiCalls: this.stats.apiCalls,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        errors: this.stats.errors,
        cacheHitRate: `${cacheHitRate}%`,
        averageResponseTime: Math.round(this.stats.averageResponseTime),
        lastUpdate: this.stats.lastUpdate
      },
      cache: cacheStats
    };
  }

  /**
   * Limpar cache manualmente
   */
  clearCache() {
    surebetsCache.clear();
    console.log('🧹 Cache de surebets limpo manualmente');
  }

  /**
   * Pré-aquecer cache
   */
  async preloadCache() {
    console.log('🔥 Pré-aquecendo cache de surebets...');
    const result = await this.getSurebets();
    
    if (result.success) {
      console.log('✅ Cache pré-aquecido com sucesso');
    } else {
      console.log('⚠️ Falha ao pré-aquecer cache');
    }
    
    return result;
  }

  /**
   * Verificar saúde do serviço
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      const result = await this.getSurebets();
      const responseTime = Date.now() - startTime;

      return {
        healthy: result.success,
        responseTime,
        source: result.source,
        timestamp: Date.now(),
        stats: this.getStats()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

// Instância global do serviço
const surebetsService = new SurebetsService();

module.exports = { SurebetsService, surebetsService };
