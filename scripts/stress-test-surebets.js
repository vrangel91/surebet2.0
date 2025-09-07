/**
 * Teste de Stress para SurebetsView
 * Simula uso contínuo e intensivo da página
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class SurebetsStressTester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.concurrentUsers = 50;
    this.testDuration = 120000; // 2 minutos
    this.requestsPerUser = 20; // 20 requisições por usuário
    this.results = [];
    this.errors = [];
    this.startTime = null;
    this.isRunning = false;
  }

  /**
   * Simula um usuário fazendo múltiplas requisições
   */
  async simulateStressUser(userId) {
    const userResults = {
      userId,
      requests: [],
      errors: [],
      startTime: Date.now(),
      successCount: 0,
      errorCount: 0
    };

    try {
      for (let i = 0; i < this.requestsPerUser && this.isRunning; i++) {
        const requestStart = performance.now();
        
        try {
          // Fazer requisição para API de surebets
          const response = await axios.get(`${this.baseURL}/api/surebets`, {
            timeout: 5000,
            headers: {
              'User-Agent': `StressTestUser-${userId}/1.0`,
              'X-Request-ID': `${userId}-${i}`
            }
          });

          const requestTime = performance.now() - requestStart;
          const surebetsCount = response.data ? Object.keys(response.data).length : 0;
          
          userResults.requests.push({
            requestNumber: i + 1,
            duration: requestTime,
            status: response.status,
            surebetsCount,
            timestamp: Date.now()
          });

          userResults.successCount++;

          // Pequena pausa aleatória entre requisições (0-500ms)
          const randomDelay = Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, randomDelay));

        } catch (error) {
          const requestTime = performance.now() - requestStart;
          userResults.errors.push({
            requestNumber: i + 1,
            error: error.message,
            duration: requestTime,
            timestamp: Date.now()
          });
          userResults.errorCount++;
        }
      }

      userResults.endTime = Date.now();
      userResults.totalDuration = userResults.endTime - userResults.startTime;
      userResults.success = userResults.errorCount < (this.requestsPerUser * 0.1); // 90% de sucesso

    } catch (error) {
      userResults.errors.push({
        type: 'fatal',
        message: error.message,
        timestamp: Date.now()
      });
      userResults.success = false;
      userResults.endTime = Date.now();
      userResults.totalDuration = userResults.endTime - userResults.startTime;
    }

    return userResults;
  }

  /**
   * Executa teste de stress
   */
  async runStressTest() {
    console.log('🔥 Iniciando Teste de Stress - SurebetsView');
    console.log('='.repeat(60));
    console.log(`👥 Usuários simultâneos: ${this.concurrentUsers}`);
    console.log(`⏱️ Duração do teste: ${this.testDuration / 1000} segundos`);
    console.log(`🔄 Requisições por usuário: ${this.requestsPerUser}`);
    console.log(`📊 Total de requisições esperadas: ${this.concurrentUsers * this.requestsPerUser}`);
    console.log('');

    this.startTime = Date.now();
    this.isRunning = true;

    // Iniciar todos os usuários simultaneamente
    const promises = [];
    for (let i = 0; i < this.concurrentUsers; i++) {
      promises.push(this.simulateStressUser(i + 1));
    }

    // Timer para parar o teste após a duração especificada
    const timer = setTimeout(() => {
      this.isRunning = false;
      console.log('\n⏰ Tempo limite atingido, finalizando teste...');
    }, this.testDuration);

    // Aguardar todos os usuários terminarem
    const results = await Promise.allSettled(promises);
    clearTimeout(timer);
    this.isRunning = false;

    // Processar resultados
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.push(result.value);
      } else {
        this.errors.push({
          userId: index + 1,
          error: result.reason.message
        });
      }
    });

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log(`\n✅ Teste de stress concluído em ${totalDuration}ms`);
    this.generateStressReport(totalDuration);
  }

  /**
   * Gera relatório detalhado do teste de stress
   */
  generateStressReport(totalDuration) {
    console.log('\n🔥 RELATÓRIO DE TESTE DE STRESS');
    console.log('='.repeat(60));

    const successfulUsers = this.results.filter(r => r.success).length;
    const failedUsers = this.results.filter(r => !r.success).length;
    const totalUsers = this.results.length + this.errors.length;

    console.log(`👥 Usuários totais: ${totalUsers}`);
    console.log(`✅ Usuários bem-sucedidos: ${successfulUsers}`);
    console.log(`❌ Usuários com falha: ${failedUsers}`);
    console.log(`📈 Taxa de sucesso: ${((successfulUsers / totalUsers) * 100).toFixed(2)}%`);

    // Estatísticas de requisições
    const allRequests = this.results.flatMap(r => r.requests);
    const allErrors = this.results.flatMap(r => r.errors);
    const totalRequests = allRequests.length + allErrors.length;
    const successfulRequests = allRequests.length;
    const failedRequests = allErrors.length;

    console.log('\n📊 ESTATÍSTICAS DE REQUISIÇÕES');
    console.log('-'.repeat(40));
    console.log(`📤 Total de requisições: ${totalRequests}`);
    console.log(`✅ Requisições bem-sucedidas: ${successfulRequests}`);
    console.log(`❌ Requisições com falha: ${failedRequests}`);
    console.log(`📈 Taxa de sucesso de requisições: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);

    if (allRequests.length > 0) {
      const durations = allRequests.map(r => r.duration);
      const surebetsCounts = allRequests.map(r => r.surebetCount || 0);
      
      console.log('\n⏱️ PERFORMANCE DAS REQUISIÇÕES');
      console.log('-'.repeat(40));
      console.log(`⚡ Tempo médio: ${(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)}ms`);
      console.log(`🚀 Tempo mínimo: ${Math.min(...durations).toFixed(2)}ms`);
      console.log(`🐌 Tempo máximo: ${Math.max(...durations).toFixed(2)}ms`);
      console.log(`📊 Surebets médios por resposta: ${(surebetsCounts.reduce((a, b) => a + b, 0) / surebetsCounts.length).toFixed(0)}`);

      // Análise de percentis
      const sortedDurations = durations.sort((a, b) => a - b);
      const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)];
      const p90 = sortedDurations[Math.floor(sortedDurations.length * 0.9)];
      const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
      const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)];

      console.log(`📈 Percentil 50 (mediana): ${p50.toFixed(2)}ms`);
      console.log(`📈 Percentil 90: ${p90.toFixed(2)}ms`);
      console.log(`📈 Percentil 95: ${p95.toFixed(2)}ms`);
      console.log(`📈 Percentil 99: ${p99.toFixed(2)}ms`);
    }

    // Estatísticas de throughput
    const requestsPerSecond = (totalRequests / (totalDuration / 1000)).toFixed(2);
    const successfulRequestsPerSecond = (successfulRequests / (totalDuration / 1000)).toFixed(2);

    console.log('\n🚀 THROUGHPUT');
    console.log('-'.repeat(40));
    console.log(`⚡ Total de requisições/segundo: ${requestsPerSecond}`);
    console.log(`✅ Requisições bem-sucedidas/segundo: ${successfulRequestsPerSecond}`);

    // Análise de erros
    if (allErrors.length > 0) {
      console.log('\n❌ ANÁLISE DE ERROS');
      console.log('-'.repeat(40));
      const errorTypes = {};
      allErrors.forEach(error => {
        const type = error.error || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} ocorrências`);
      });
    }

    // Análise de degradação de performance
    console.log('\n📉 ANÁLISE DE DEGRADAÇÃO');
    console.log('-'.repeat(40));
    
    if (allRequests.length > 10) {
      const firstHalf = allRequests.slice(0, Math.floor(allRequests.length / 2));
      const secondHalf = allRequests.slice(Math.floor(allRequests.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.duration, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.duration, 0) / secondHalf.length;
      
      const degradation = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(2);
      
      console.log(`📊 Performance inicial: ${firstHalfAvg.toFixed(2)}ms`);
      console.log(`📊 Performance final: ${secondHalfAvg.toFixed(2)}ms`);
      console.log(`📉 Degradação: ${degradation}%`);
      
      if (Math.abs(degradation) > 20) {
        console.log('⚠️ Degradação significativa detectada!');
      } else if (Math.abs(degradation) > 10) {
        console.log('⚠️ Degradação moderada detectada');
      } else {
        console.log('✅ Performance estável');
      }
    }

    // Avaliação de stress
    console.log('\n🎯 AVALIAÇÃO DE STRESS');
    console.log('-'.repeat(40));

    let stressScore = 100;
    let issues = [];

    // Avaliar taxa de sucesso
    const successRate = (successfulRequests / totalRequests) * 100;
    if (successRate < 95) {
      stressScore -= 30;
      issues.push('Taxa de sucesso baixa sob stress (<95%)');
    } else if (successRate < 98) {
      stressScore -= 15;
      issues.push('Taxa de sucesso moderada sob stress (<98%)');
    }

    // Avaliar tempo de resposta
    if (allRequests.length > 0) {
      const avgResponseTime = allRequests.reduce((sum, r) => sum + r.duration, 0) / allRequests.length;
      if (avgResponseTime > 1000) {
        stressScore -= 25;
        issues.push('Tempo de resposta alto sob stress (>1s)');
      } else if (avgResponseTime > 500) {
        stressScore -= 10;
        issues.push('Tempo de resposta moderado sob stress (>500ms)');
      }
    }

    // Avaliar throughput
    if (requestsPerSecond < 50) {
      stressScore -= 20;
      issues.push('Throughput baixo sob stress (<50 req/s)');
    } else if (requestsPerSecond < 100) {
      stressScore -= 10;
      issues.push('Throughput moderado sob stress (<100 req/s)');
    }

    console.log(`📊 Pontuação de Stress: ${Math.max(0, stressScore)}/100`);

    if (issues.length === 0) {
      console.log('✅ EXCELENTE: Sistema suporta stress alto sem problemas');
    } else {
      console.log('⚠️ PROBLEMAS DETECTADOS SOB STRESS:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    // Recomendações específicas para stress
    console.log('\n💡 RECOMENDAÇÕES PARA STRESS');
    console.log('-'.repeat(40));
    
    if (successRate < 98) {
      console.log('🔧 Implementar circuit breaker para falhas');
      console.log('🔧 Adicionar retry automático com backoff');
    }
    if (allRequests.length > 0 && allRequests.reduce((sum, r) => sum + r.duration, 0) / allRequests.length > 500) {
      console.log('🔧 Implementar cache agressivo');
      console.log('🔧 Otimizar consultas de banco de dados');
    }
    if (requestsPerSecond < 100) {
      console.log('🔧 Considerar load balancing');
      console.log('🔧 Implementar connection pooling');
    }
    if (allRequests.length > 10) {
      const firstHalf = allRequests.slice(0, Math.floor(allRequests.length / 2));
      const secondHalf = allRequests.slice(Math.floor(allRequests.length / 2));
      const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.duration, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.duration, 0) / secondHalf.length;
      const degradation = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100);
      
      if (Math.abs(degradation) > 10) {
      console.log('🔧 Investigar vazamentos de memória');
      console.log('🔧 Otimizar garbage collection');
    }

    return {
      totalUsers,
      successfulUsers,
      failedUsers,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      avgResponseTime: allRequests.length > 0 ? allRequests.reduce((sum, r) => sum + r.duration, 0) / allRequests.length : 0,
      requestsPerSecond,
      stressScore,
      issues
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const tester = new SurebetsStressTester();
  tester.runStressTest().catch(console.error);
}

module.exports = { SurebetsStressTester };
