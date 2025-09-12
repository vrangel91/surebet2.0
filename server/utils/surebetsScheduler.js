/**
 * Sistema de Scheduler para Surebets
 * Busca dados da API externa automaticamente a cada 1 minuto
 * e armazena no cache do servidor
 */

const cron = require('node-cron');
const axios = require('axios');
const { logger } = require('./logger');
const { surebetsCache } = require('./surebetsCache');

class SurebetsScheduler {
  constructor(config = {}) {
    this.updateInterval = config.updateInterval || 1; // 1 minuto
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 5000; // 5 segundos
    this.isRunning = false;
    this.lastUpdate = null;
    this.consecutiveFailures = 0;
    this.stats = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastSuccess: null,
      lastError: null
    };
    
    // Configuração da API externa
    this.externalAPI = {
      baseURL: process.env.EXTERNAL_API_URL || 'https://zerolossbet.com',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://zerolossbet.com/dashboard'
      }
    };
    
    logger.info('SurebetsScheduler initialized', {
      updateInterval: this.updateInterval,
      maxRetries: this.maxRetries,
      externalAPI: this.externalAPI.baseURL
    });
  }

  /**
   * Inicia o scheduler
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return;
    }

    this.isRunning = true;
    
    // Fazer primeira busca imediatamente
    this.updateSurebets();
    
    // Agendar busca a cada minuto
    const cronExpression = `*/${this.updateInterval} * * * *`; // A cada X minutos
    this.cronJob = cron.schedule(cronExpression, () => {
      this.updateSurebets();
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    logger.info('SurebetsScheduler started', {
      cronExpression,
      updateInterval: this.updateInterval
    });
  }

  /**
   * Para o scheduler
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler not running');
      return;
    }

    this.isRunning = false;
    
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    
    logger.info('SurebetsScheduler stopped');
  }

  /**
   * Atualiza surebets da API externa
   */
  async updateSurebets() {
    if (!this.isRunning) return;

    logger.info('Fetching surebets from external API', { 
      attempt: this.consecutiveFailures + 1,
      maxRetries: this.maxRetries
    });

    try {
      const startTime = Date.now();
      
      // Buscar dados da API externa
      const surebetsData = await this.fetchFromExternalAPI();
      
      // Processar e armazenar no cache
      await this.processAndCacheData(surebetsData);
      
      const duration = Date.now() - startTime;
      
      // Atualizar estatísticas
      this.stats.totalUpdates++;
      this.stats.successfulUpdates++;
      this.stats.lastSuccess = new Date().toISOString();
      this.consecutiveFailures = 0;
      this.lastUpdate = Date.now();
      
      logger.info('Surebets updated successfully', {
        count: surebetsData.length,
        duration: `${duration}ms`,
        cacheSize: surebetsCache.getStats().size
      });
      
    } catch (error) {
      this.handleUpdateError(error);
    }
  }

  /**
   * Busca dados da API externa (com fallback para dados mockados)
   */
  async fetchFromExternalAPI() {
    try {
      const response = await axios.get('https://zerolossbet.com/api/fetch_surebets/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': 'https://zerolossbet.com/dashboard',
        },
        timeout: this.externalAPI.timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.data) {
        throw new Error('Invalid response format from external API');
      }

      // Processar dados da API zerolossbet
      const surebetsData = response.data;
      logger.info('Successfully fetched surebets from zerolossbet API', {
        count: surebetsData.length || 0
      });

      return surebetsData || [];
      
    } catch (error) {
      logger.warn('External API fetch failed, using mock data', {
        error: error.message,
        status: error.response?.status,
        url: 'https://zerolossbet.com/api/fetch_surebets/'
      });
      
      // Retornar dados mockados para demonstração
      return this.generateMockData();
    }
  }

  /**
   * Gera dados mockados para demonstração
   */
  generateMockData() {
    const sports = ['Futebol', 'Basquete', 'Tênis', 'Vôlei', 'Handebol'];
    const houses = ['Bet365', 'Betfair', 'William Hill', 'Pinnacle', 'Unibet', 'Betway'];
    const matches = [
      'Barcelona vs Real Madrid',
      'Lakers vs Warriors', 
      'Djokovic vs Nadal',
      'Brasil vs Argentina',
      'Manchester vs Liverpool'
    ];

    const mockSurebets = [];
    
    for (let i = 0; i < 50; i++) {
      const sport = sports[Math.floor(Math.random() * sports.length)];
      const house1 = houses[Math.floor(Math.random() * houses.length)];
      let house2 = houses[Math.floor(Math.random() * houses.length)];
      
      // Garantir que as casas sejam diferentes
      while (house2 === house1) {
        house2 = houses[Math.floor(Math.random() * houses.length)];
      }
      
      const profit = Math.random() * 10 + 1; // 1% a 11%
      const odds1 = 1.5 + Math.random() * 2; // 1.5 a 3.5
      const odds2 = 1.5 + Math.random() * 2; // 1.5 a 3.5
      const isLive = Math.random() > 0.7; // 30% chance de ser live
      
      mockSurebets.push({
        id: i + 1,
        sport,
        profit: parseFloat(profit.toFixed(2)),
        house1,
        house2,
        odds1: parseFloat(odds1.toFixed(2)),
        odds2: parseFloat(odds2.toFixed(2)),
        isLive,
        match: matches[Math.floor(Math.random() * matches.length)],
        league: `${sport} League`,
        createdAt: new Date(Date.now() - Math.random() * 3600000).toISOString() // Última hora
      });
    }
    
    logger.info('Generated mock data', { count: mockSurebets.length });
    return mockSurebets;
  }

  /**
   * Processa e armazena dados no cache
   */
  async processAndCacheData(surebetsData) {
    try {
      // Processar dados (filtrar, validar, etc.)
      const processedData = this.processSurebetsData(surebetsData);
      
      // Armazenar no cache com diferentes chaves para diferentes filtros
      const cacheEntries = this.createCacheEntries(processedData);
      
      // NÃO limpar cache antigo - apenas atualizar as entradas
      // surebetsCache.clear(); // REMOVIDO: causava desaparecimento das surebets
      
      // Armazenar novas entradas (sobrescreve as antigas)
      for (const [key, data] of Object.entries(cacheEntries)) {
        surebetsCache.set(key, data, 300000); // 5 minutos de TTL
      }
      
      logger.info('Data processed and cached', {
        originalCount: surebetsData.length,
        processedCount: processedData.length,
        cacheEntries: Object.keys(cacheEntries).length
      });
      
    } catch (error) {
      logger.error('Error processing and caching data', { error: error.message });
      throw error;
    }
  }

  /**
   * Processa dados dos surebets
   */
  processSurebetsData(surebetsData) {
    // Verificar se é um array
    if (!Array.isArray(surebetsData)) {
      logger.warn('surebetsData is not an array, converting to array', { 
        type: typeof surebetsData,
        data: surebetsData 
      });
      
      // Se for um objeto, tentar extrair array de dados
      if (surebetsData && typeof surebetsData === 'object') {
        // Tentar diferentes propriedades comuns
        const possibleArrays = [
          surebetsData.data,
          surebetsData.surebets,
          surebetsData.results,
          surebetsData.items
        ];
        
        for (const arr of possibleArrays) {
          if (Array.isArray(arr)) {
            surebetsData = arr;
            break;
          }
        }
        
        // Se ainda não for array, converter para array
        if (!Array.isArray(surebetsData)) {
          surebetsData = [surebetsData];
        }
      } else {
        surebetsData = [];
      }
    }
    
    return surebetsData
      .filter(surebet => {
        // Filtrar dados inválidos - ser mais flexível
        return surebet && 
               (surebet.id || surebet.surebet_id) && 
               surebet.sport && 
               (surebet.profit > 0 || surebet.profit_percentage > 0) &&
               (surebet.house1 || surebet.bookmaker1) && 
               (surebet.house2 || surebet.bookmaker2);
      })
      .map(surebet => ({
        ...surebet,
        // Normalizar campos
        id: surebet.id || surebet.surebet_id,
        profit: surebet.profit || surebet.profit_percentage,
        house1: surebet.house1 || surebet.bookmaker1,
        house2: surebet.house2 || surebet.bookmaker2,
        // Adicionar campos processados
        processedAt: new Date().toISOString(),
        profitFormatted: `${(surebet.profit || surebet.profit_percentage).toFixed(2)}%`,
        // Adicionar outros campos conforme necessário
      }))
      .sort((a, b) => (b.profit || b.profit_percentage) - (a.profit || a.profit_percentage)); // Ordenar por profit
  }

  /**
   * Cria entradas de cache para diferentes filtros
   */
  createCacheEntries(surebetsData) {
    const cacheEntries = {};
    
    // Cache para todos os dados
    cacheEntries['all'] = {
      surebets: surebetsData,
      total: surebetsData.length,
      timestamp: Date.now(),
      source: 'external_api'
    };
    
    // Cache por esporte
    const sports = [...new Set(surebetsData.map(s => s.sport))];
    sports.forEach(sport => {
      const sportData = surebetsData.filter(s => s.sport === sport);
      cacheEntries[`sport:${sport}`] = {
        surebets: sportData,
        total: sportData.length,
        timestamp: Date.now(),
        source: 'external_api',
        filter: { sport }
      };
    });
    
    // Cache para prelive e live
    const preliveData = surebetsData.filter(s => !s.isLive);
    const liveData = surebetsData.filter(s => s.isLive);
    
    cacheEntries['prelive'] = {
      surebets: preliveData,
      total: preliveData.length,
      timestamp: Date.now(),
      source: 'external_api',
      filter: { isLive: false }
    };
    
    cacheEntries['live'] = {
      surebets: liveData,
      total: liveData.length,
      timestamp: Date.now(),
      source: 'external_api',
      filter: { isLive: true }
    };
    
    // Cache por faixa de profit
    const profitRanges = [
      { min: 0, max: 2, key: 'low' },
      { min: 2, max: 5, key: 'medium' },
      { min: 5, max: 10, key: 'high' },
      { min: 10, max: Infinity, key: 'very_high' }
    ];
    
    profitRanges.forEach(range => {
      const rangeData = surebetsData.filter(s => 
        s.profit >= range.min && s.profit < range.max
      );
      cacheEntries[`profit:${range.key}`] = {
        surebets: rangeData,
        total: rangeData.length,
        timestamp: Date.now(),
        source: 'external_api',
        filter: { minProfit: range.min, maxProfit: range.max }
      };
    });
    
    return cacheEntries;
  }

  /**
   * Trata erros de atualização
   */
  handleUpdateError(error) {
    this.stats.totalUpdates++;
    this.stats.failedUpdates++;
    this.stats.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    this.consecutiveFailures++;
    
    logger.error('Error updating surebets', {
      attempt: this.consecutiveFailures,
      maxRetries: this.maxRetries,
      error: error.message,
      consecutiveFailures: this.consecutiveFailures
    });
    
    // Se excedeu o limite de tentativas, parar temporariamente
    if (this.consecutiveFailures >= this.maxRetries) {
      logger.error('Max consecutive failures reached, stopping scheduler temporarily', {
        consecutiveFailures: this.consecutiveFailures
      });
      
      // Parar por 5 minutos e depois tentar novamente
      setTimeout(() => {
        this.consecutiveFailures = 0;
        if (this.isRunning) {
          logger.info('Resuming scheduler after failure recovery');
          this.updateSurebets();
        }
      }, 5 * 60 * 1000); // 5 minutos
    }
  }

  /**
   * Força atualização imediata
   */
  async forceUpdate() {
    logger.info('Force update requested');
    await this.updateSurebets();
  }

  /**
   * Retorna estatísticas do scheduler
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      consecutiveFailures: this.consecutiveFailures,
      updateInterval: this.updateInterval,
      nextUpdate: this.getNextUpdateTime()
    };
  }

  /**
   * Calcula próximo horário de atualização
   */
  getNextUpdateTime() {
    if (!this.isRunning || !this.lastUpdate) return null;
    
    const nextUpdate = new Date(this.lastUpdate + (this.updateInterval * 60 * 1000));
    return nextUpdate.toISOString();
  }

  /**
   * Retorna informações detalhadas
   */
  getInfo() {
    return {
      stats: this.getStats(),
      config: {
        updateInterval: this.updateInterval,
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
        externalAPI: this.externalAPI
      },
      cacheStats: surebetsCache.getStats()
    };
  }
}

// Instância singleton
const surebetsScheduler = new SurebetsScheduler({
  updateInterval: 1, // 1 minuto
  maxRetries: 3,
  retryDelay: 5000
});

module.exports = { SurebetsScheduler, surebetsScheduler };
