/**
 * Script de Teste de Performance para Surebets
 * Testa cache, rate limiting e otimizações
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const CONCURRENT_USERS = 50;
const REQUESTS_PER_USER = 10;
const REQUEST_DELAY = 100; // ms entre requisições

class PerformanceTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  /**
   * Simula um usuário fazendo requisições
   */
  async simulateUser(userId) {
    const userResults = {
      userId,
      requests: 0,
      cacheHits: 0,
      errors: 0,
      responseTimes: []
    };

    for (let i = 0; i < REQUESTS_PER_USER; i++) {
      try {
        const startTime = performance.now();
        
        const response = await axios.get(`${BASE_URL}/api/surebets`, {
          params: {
            sport: i % 2 === 0 ? 'Futebol' : 'Basquete',
            minProfit: Math.random() * 5,
            maxProfit: 5 + Math.random() * 10
          },
          timeout: 5000
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        userResults.requests++;
        userResults.responseTimes.push(responseTime);
        this.results.totalRequests++;
        this.results.responseTimes.push(responseTime);

        if (response.data.success) {
          this.results.successfulRequests++;
          
          if (response.data.cached) {
            this.results.cacheHits++;
            userResults.cacheHits++;
          } else {
            this.results.cacheMisses++;
          }
        }

        // Delay entre requisições
        if (i < REQUESTS_PER_USER - 1) {
          await this.delay(REQUEST_DELAY);
        }

      } catch (error) {
        userResults.errors++;
        this.results.failedRequests++;
        
        if (error.response?.status === 429) {
          this.results.rateLimitedRequests++;
        }
        
        this.results.errors.push({
          userId,
          request: i,
          error: error.message,
          status: error.response?.status
        });
      }
    }

    return userResults;
  }

  /**
   * Executa teste de performance
   */
  async runPerformanceTest() {
    console.log('🚀 Iniciando teste de performance...');
    console.log(`📊 Configuração:`);
    console.log(`   - Usuários simultâneos: ${CONCURRENT_USERS}`);
    console.log(`   - Requisições por usuário: ${REQUESTS_PER_USER}`);
    console.log(`   - Total de requisições: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
    console.log(`   - Delay entre requisições: ${REQUEST_DELAY}ms`);
    console.log('');

    const startTime = performance.now();

    // Criar array de promessas para usuários simultâneos
    const userPromises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      userPromises.push(this.simulateUser(i + 1));
    }

    // Aguardar todos os usuários terminarem
    const userResults = await Promise.all(userPromises);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Calcular estatísticas
    this.calculateStats(userResults, totalTime);

    // Exibir resultados
    this.displayResults();

    return this.results;
  }

  /**
   * Calcula estatísticas dos resultados
   */
  calculateStats(userResults, totalTime) {
    this.results.totalTime = totalTime;
    this.results.requestsPerSecond = (this.results.totalRequests / totalTime) * 1000;
    this.results.averageResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    this.results.minResponseTime = Math.min(...this.results.responseTimes);
    this.results.maxResponseTime = Math.max(...this.results.responseTimes);
    this.results.successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    this.results.cacheHitRate = this.results.cacheHits > 0 ? (this.results.cacheHits / (this.results.cacheHits + this.results.cacheMisses)) * 100 : 0;
    this.results.rateLimitRate = (this.results.rateLimitedRequests / this.results.totalRequests) * 100;

    // Calcular percentis de tempo de resposta
    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
    this.results.p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    this.results.p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    this.results.p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    this.results.p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  }

  /**
   * Exibe resultados do teste
   */
  displayResults() {
    console.log('📈 RESULTADOS DO TESTE DE PERFORMANCE');
    console.log('=====================================');
    console.log('');

    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log(`   Total de requisições: ${this.results.totalRequests}`);
    console.log(`   Requisições bem-sucedidas: ${this.results.successfulRequests}`);
    console.log(`   Requisições falharam: ${this.results.failedRequests}`);
    console.log(`   Taxa de sucesso: ${this.results.successRate.toFixed(2)}%`);
    console.log(`   Tempo total: ${(this.results.totalTime / 1000).toFixed(2)}s`);
    console.log(`   Requisições por segundo: ${this.results.requestsPerSecond.toFixed(2)}`);
    console.log('');

    console.log('⚡ TEMPO DE RESPOSTA:');
    console.log(`   Média: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Mínimo: ${this.results.minResponseTime.toFixed(2)}ms`);
    console.log(`   Máximo: ${this.results.maxResponseTime.toFixed(2)}ms`);
    console.log(`   P50: ${this.results.p50.toFixed(2)}ms`);
    console.log(`   P90: ${this.results.p90.toFixed(2)}ms`);
    console.log(`   P95: ${this.results.p95.toFixed(2)}ms`);
    console.log(`   P99: ${this.results.p99.toFixed(2)}ms`);
    console.log('');

    console.log('💾 CACHE:');
    console.log(`   Cache hits: ${this.results.cacheHits}`);
    console.log(`   Cache misses: ${this.results.cacheMisses}`);
    console.log(`   Taxa de hit: ${this.results.cacheHitRate.toFixed(2)}%`);
    console.log('');

    console.log('🚫 RATE LIMITING:');
    console.log(`   Requisições bloqueadas: ${this.results.rateLimitedRequests}`);
    console.log(`   Taxa de bloqueio: ${this.results.rateLimitRate.toFixed(2)}%`);
    console.log('');

    if (this.results.errors.length > 0) {
      console.log('❌ ERROS:');
      const errorTypes = {};
      this.results.errors.forEach(error => {
        const key = `${error.status || 'NETWORK'}: ${error.error}`;
        errorTypes[key] = (errorTypes[key] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([error, count]) => {
        console.log(`   ${error}: ${count} ocorrências`);
      });
      console.log('');
    }

    // Avaliação de performance
    console.log('🎯 AVALIAÇÃO:');
    if (this.results.successRate >= 95) {
      console.log('   ✅ Taxa de sucesso: EXCELENTE');
    } else if (this.results.successRate >= 90) {
      console.log('   ✅ Taxa de sucesso: BOA');
    } else {
      console.log('   ⚠️ Taxa de sucesso: PRECISA MELHORAR');
    }

    if (this.results.averageResponseTime <= 500) {
      console.log('   ✅ Tempo de resposta: EXCELENTE');
    } else if (this.results.averageResponseTime <= 1000) {
      console.log('   ✅ Tempo de resposta: BOA');
    } else {
      console.log('   ⚠️ Tempo de resposta: PRECISA MELHORAR');
    }

    if (this.results.cacheHitRate >= 70) {
      console.log('   ✅ Cache: EXCELENTE');
    } else if (this.results.cacheHitRate >= 50) {
      console.log('   ✅ Cache: BOA');
    } else {
      console.log('   ⚠️ Cache: PRECISA MELHORAR');
    }

    if (this.results.rateLimitRate <= 5) {
      console.log('   ✅ Rate limiting: ADEQUADO');
    } else {
      console.log('   ⚠️ Rate limiting: MUITO RESTRITIVO');
    }
  }

  /**
   * Testa cache especificamente
   */
  async testCache() {
    console.log('🧪 Testando cache...');
    
    // Primeira requisição (deve ser cache miss)
    const start1 = performance.now();
    const response1 = await axios.get(`${BASE_URL}/api/surebets`);
    const time1 = performance.now() - start1;
    
    // Segunda requisição (deve ser cache hit)
    const start2 = performance.now();
    const response2 = await axios.get(`${BASE_URL}/api/surebets`);
    const time2 = performance.now() - start2;
    
    console.log(`   Primeira requisição: ${time1.toFixed(2)}ms (cached: ${response1.data.cached})`);
    console.log(`   Segunda requisição: ${time2.toFixed(2)}ms (cached: ${response2.data.cached})`);
    console.log(`   Melhoria: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
  }

  /**
   * Testa rate limiting
   */
  async testRateLimiting() {
    console.log('🚫 Testando rate limiting...');
    
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(axios.get(`${BASE_URL}/api/surebets`).catch(err => err.response));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r?.status === 429).length;
    
    console.log(`   Requisições: ${responses.length}`);
    console.log(`   Bloqueadas: ${rateLimited}`);
    console.log(`   Taxa de bloqueio: ${(rateLimited / responses.length * 100).toFixed(1)}%`);
  }

  /**
   * Obtém estatísticas do servidor
   */
  async getServerStats() {
    try {
      const response = await axios.get(`${BASE_URL}/api/cache/stats`);
      console.log('📊 Estatísticas do servidor:');
      console.log(JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      console.log('❌ Erro ao obter estatísticas do servidor:', error.message);
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar testes
async function runTests() {
  const tester = new PerformanceTester();
  
  try {
    // Verificar se servidor está rodando
    await axios.get(`${BASE_URL}/api/surebets`);
    console.log('✅ Servidor está rodando');
    console.log('');
    
    // Teste de cache
    await tester.testCache();
    console.log('');
    
    // Teste de rate limiting
    await tester.testRateLimiting();
    console.log('');
    
    // Teste de performance completo
    await tester.runPerformanceTest();
    console.log('');
    
    // Estatísticas do servidor
    await tester.getServerStats();
    
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
    console.log('Certifique-se de que o servidor está rodando na porta 3001');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests();
}

module.exports = { PerformanceTester };
