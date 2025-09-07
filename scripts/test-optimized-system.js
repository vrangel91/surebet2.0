/**
 * Script de Teste do Sistema Otimizado
 * Testa o scheduler, cache do servidor e WebSocket
 */

const axios = require('axios');
const WebSocket = require('ws');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3002';

class OptimizedSystemTester {
  constructor() {
    this.results = {
      scheduler: {},
      cache: {},
      webSocket: {},
      performance: {}
    };
  }

  /**
   * Testa o scheduler
   */
  async testScheduler() {
    console.log('🧪 Testando Scheduler...');
    
    try {
      // Verificar estatísticas do scheduler
      const statsResponse = await axios.get(`${BASE_URL}/api/scheduler/stats`);
      const stats = statsResponse.data.data;
      
      console.log('📊 Estatísticas do Scheduler:');
      console.log(`   - Rodando: ${stats.scheduler.isRunning}`);
      console.log(`   - Total de atualizações: ${stats.scheduler.totalUpdates}`);
      console.log(`   - Atualizações bem-sucedidas: ${stats.scheduler.successfulUpdates}`);
      console.log(`   - Última atualização: ${stats.scheduler.lastUpdate ? new Date(stats.scheduler.lastUpdate).toLocaleString() : 'Nunca'}`);
      console.log(`   - Próxima atualização: ${stats.scheduler.nextUpdate ? new Date(stats.scheduler.nextUpdate).toLocaleString() : 'N/A'}`);
      
      this.results.scheduler = stats.scheduler;
      
      // Forçar atualização
      console.log('🔄 Forçando atualização...');
      const forceResponse = await axios.post(`${BASE_URL}/api/scheduler/force-update`);
      console.log(`   - Resposta: ${forceResponse.data.message}`);
      
      // Aguardar um pouco e verificar novamente
      await this.delay(2000);
      const newStatsResponse = await axios.get(`${BASE_URL}/api/scheduler/stats`);
      const newStats = newStatsResponse.data.data;
      
      console.log('📈 Estatísticas após atualização:');
      console.log(`   - Total de atualizações: ${newStats.scheduler.totalUpdates}`);
      console.log(`   - Última atualização: ${newStats.scheduler.lastUpdate ? new Date(newStats.scheduler.lastUpdate).toLocaleString() : 'Nunca'}`);
      
    } catch (error) {
      console.error('❌ Erro ao testar scheduler:', error.message);
    }
  }

  /**
   * Testa o cache do servidor
   */
  async testServerCache() {
    console.log('\n🧪 Testando Cache do Servidor...');
    
    try {
      // Verificar estatísticas do cache
      const cacheResponse = await axios.get(`${BASE_URL}/api/cache/stats`);
      const cacheStats = cacheResponse.data.data;
      
      console.log('📊 Estatísticas do Cache:');
      console.log(`   - Tamanho: ${cacheStats.surebetsCache.size}/${cacheStats.surebetsCache.maxSize}`);
      console.log(`   - Hit rate: ${cacheStats.surebetsCache.hitRate}`);
      console.log(`   - Hits: ${cacheStats.surebetsCache.hits}`);
      console.log(`   - Misses: ${cacheStats.surebetsCache.misses}`);
      console.log(`   - Tamanho total: ${cacheStats.surebetsCache.totalSize}`);
      
      this.results.cache = cacheStats.surebetsCache;
      
      // Testar diferentes filtros
      console.log('\n🔍 Testando diferentes filtros:');
      
      const filters = [
        { name: 'Todos', params: {} },
        { name: 'Futebol', params: { sport: 'Futebol' } },
        { name: 'Prelive', params: { isLive: 'false' } },
        { name: 'Live', params: { isLive: 'true' } },
        { name: 'Alto Profit', params: { minProfit: '5' } }
      ];
      
      for (const filter of filters) {
        const startTime = performance.now();
        const response = await axios.get(`${BASE_URL}/api/surebets`, { params: filter.params });
        const duration = performance.now() - startTime;
        
        console.log(`   - ${filter.name}: ${response.data.data.surebets.length} surebets (${duration.toFixed(2)}ms) - ${response.data.cached ? 'Cache' : 'API'}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar cache:', error.message);
    }
  }

  /**
   * Testa o WebSocket
   */
  async testWebSocket() {
    console.log('\n🧪 Testando WebSocket...');
    
    return new Promise((resolve) => {
      const ws = new WebSocket(WS_URL);
      let messagesReceived = 0;
      const startTime = performance.now();
      
      ws.on('open', () => {
        console.log('🔌 WebSocket conectado');
        
        // Enviar mensagem de teste
        ws.send(JSON.stringify({
          type: 'ping'
        }));
        
        // Aguardar alguns segundos
        setTimeout(() => {
          ws.close();
        }, 5000);
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          messagesReceived++;
          
          console.log(`📨 Mensagem recebida (${messagesReceived}):`, {
            type: message.type,
            timestamp: new Date(message.timestamp).toLocaleString()
          });
          
          if (message.type === 'pong') {
            console.log('   ✅ Ping/Pong funcionando');
          }
          
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error.message);
        }
      });
      
      ws.on('close', () => {
        const duration = performance.now() - startTime;
        console.log(`🔌 WebSocket desconectado após ${duration.toFixed(2)}ms`);
        console.log(`📊 Total de mensagens recebidas: ${messagesReceived}`);
        
        this.results.webSocket = {
          messagesReceived,
          duration,
          connected: true
        };
        
        resolve();
      });
      
      ws.on('error', (error) => {
        console.error('❌ Erro no WebSocket:', error.message);
        this.results.webSocket = {
          error: error.message,
          connected: false
        };
        resolve();
      });
    });
  }

  /**
   * Testa performance geral
   */
  async testPerformance() {
    console.log('\n🧪 Testando Performance...');
    
    const concurrentUsers = 20;
    const requestsPerUser = 5;
    
    console.log(`📊 Simulando ${concurrentUsers} usuários com ${requestsPerUser} requisições cada...`);
    
    const startTime = performance.now();
    
    // Criar array de promessas para usuários simultâneos
    const userPromises = [];
    for (let i = 0; i < concurrentUsers; i++) {
      userPromises.push(this.simulateUser(i + 1, requestsPerUser));
    }
    
    // Aguardar todos os usuários terminarem
    const userResults = await Promise.all(userPromises);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Calcular estatísticas
    const totalRequests = userResults.reduce((sum, user) => sum + user.requests, 0);
    const totalErrors = userResults.reduce((sum, user) => sum + user.errors, 0);
    const totalCacheHits = userResults.reduce((sum, user) => sum + user.cacheHits, 0);
    const avgResponseTime = userResults.reduce((sum, user) => sum + user.avgResponseTime, 0) / userResults.length;
    
    console.log('📈 Resultados de Performance:');
    console.log(`   - Tempo total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   - Total de requisições: ${totalRequests}`);
    console.log(`   - Requisições por segundo: ${(totalRequests / (totalTime / 1000)).toFixed(2)}`);
    console.log(`   - Taxa de erro: ${((totalErrors / totalRequests) * 100).toFixed(2)}%`);
    console.log(`   - Cache hits: ${totalCacheHits}`);
    console.log(`   - Taxa de cache hit: ${((totalCacheHits / totalRequests) * 100).toFixed(2)}%`);
    console.log(`   - Tempo médio de resposta: ${avgResponseTime.toFixed(2)}ms`);
    
    this.results.performance = {
      totalTime,
      totalRequests,
      requestsPerSecond: totalRequests / (totalTime / 1000),
      errorRate: (totalErrors / totalRequests) * 100,
      cacheHitRate: (totalCacheHits / totalRequests) * 100,
      avgResponseTime
    };
  }

  /**
   * Simula um usuário fazendo requisições
   */
  async simulateUser(userId, requestCount) {
    const userResults = {
      userId,
      requests: 0,
      errors: 0,
      cacheHits: 0,
      responseTimes: []
    };
    
    for (let i = 0; i < requestCount; i++) {
      try {
        const startTime = performance.now();
        
        const response = await axios.get(`${BASE_URL}/api/surebets`, {
          params: {
            sport: i % 2 === 0 ? 'Futebol' : 'Basquete'
          },
          timeout: 5000
        });
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        userResults.requests++;
        userResults.responseTimes.push(responseTime);
        
        if (response.data.cached) {
          userResults.cacheHits++;
        }
        
        // Delay entre requisições
        if (i < requestCount - 1) {
          await this.delay(100);
        }
        
      } catch (error) {
        userResults.errors++;
      }
    }
    
    userResults.avgResponseTime = userResults.responseTimes.reduce((a, b) => a + b, 0) / userResults.responseTimes.length;
    
    return userResults;
  }

  /**
   * Executa todos os testes
   */
  async runAllTests() {
    console.log('🚀 Iniciando Testes do Sistema Otimizado');
    console.log('==========================================\n');
    
    try {
      // Verificar se servidor está rodando
      await axios.get(`${BASE_URL}/api/surebets`);
      console.log('✅ Servidor está rodando\n');
      
      // Executar testes
      await this.testScheduler();
      await this.testServerCache();
      await this.testWebSocket();
      await this.testPerformance();
      
      // Resumo final
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Erro ao executar testes:', error.message);
      console.log('Certifique-se de que o servidor está rodando na porta 3001');
    }
  }

  /**
   * Exibe resumo dos testes
   */
  displaySummary() {
    console.log('\n📋 RESUMO DOS TESTES');
    console.log('====================');
    
    console.log('\n🔄 Scheduler:');
    console.log(`   - Status: ${this.results.scheduler.isRunning ? '✅ Rodando' : '❌ Parado'}`);
    console.log(`   - Atualizações: ${this.results.scheduler.totalUpdates || 0}`);
    console.log(`   - Taxa de sucesso: ${this.results.scheduler.totalUpdates > 0 ? ((this.results.scheduler.successfulUpdates / this.results.scheduler.totalUpdates) * 100).toFixed(1) : 0}%`);
    
    console.log('\n💾 Cache:');
    console.log(`   - Hit rate: ${this.results.cache.hitRate || '0%'}`);
    console.log(`   - Tamanho: ${this.results.cache.size || 0}/${this.results.cache.maxSize || 0}`);
    console.log(`   - Utilização: ${this.results.cache.utilization || '0%'}`);
    
    console.log('\n🔌 WebSocket:');
    console.log(`   - Status: ${this.results.webSocket.connected ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`   - Mensagens: ${this.results.webSocket.messagesReceived || 0}`);
    
    console.log('\n⚡ Performance:');
    console.log(`   - Requisições/segundo: ${this.results.performance.requestsPerSecond?.toFixed(2) || 0}`);
    console.log(`   - Taxa de erro: ${this.results.performance.errorRate?.toFixed(2) || 0}%`);
    console.log(`   - Cache hit rate: ${this.results.performance.cacheHitRate?.toFixed(2) || 0}%`);
    console.log(`   - Tempo médio: ${this.results.performance.avgResponseTime?.toFixed(2) || 0}ms`);
    
    // Avaliação geral
    console.log('\n🎯 AVALIAÇÃO GERAL:');
    const schedulerOk = this.results.scheduler.isRunning;
    const cacheOk = parseFloat(this.results.cache.hitRate) > 50;
    const wsOk = this.results.webSocket.connected;
    const perfOk = this.results.performance.avgResponseTime < 500;
    
    if (schedulerOk && cacheOk && wsOk && perfOk) {
      console.log('   ✅ SISTEMA OTIMIZADO FUNCIONANDO PERFEITAMENTE!');
    } else {
      console.log('   ⚠️ Sistema precisa de ajustes:');
      if (!schedulerOk) console.log('      - Scheduler não está rodando');
      if (!cacheOk) console.log('      - Cache hit rate baixo');
      if (!wsOk) console.log('      - WebSocket não conecta');
      if (!perfOk) console.log('      - Performance abaixo do esperado');
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new OptimizedSystemTester();
  tester.runAllTests();
}

module.exports = { OptimizedSystemTester };
