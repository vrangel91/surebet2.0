/**
 * Teste de Carga Realista para SurebetsView
 * Simula acessos distribuídos ao longo do tempo (como na prática)
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class RealisticLoadTester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.totalUsers = 50; // 50 usuários ao longo de 5 minutos
    this.testDuration = 300000; // 5 minutos
    this.results = [];
    this.errors = [];
    this.startTime = null;
    this.isRunning = false;
  }

  /**
   * Simula um usuário real acessando a página
   */
  async simulateRealUser(userId) {
    const userResults = {
      userId,
      requests: [],
      errors: [],
      startTime: Date.now(),
      sessionDuration: 0
    };

    try {
      // 1. Usuário acessa a página (primeira requisição)
      const pageStart = performance.now();
      const pageResponse = await axios.get(`${this.baseURL}/api/surebets`, {
        timeout: 10000,
        headers: {
          'User-Agent': `RealUser-${userId}/1.0`
        }
      });
      const pageTime = performance.now() - pageStart;
      
      userResults.requests.push({
        type: 'initial_load',
        duration: pageTime,
        status: pageResponse.status,
        timestamp: Date.now()
      });

      // 2. Usuário fica na página por um tempo (simular navegação)
      const sessionTime = Math.random() * 30000 + 10000; // 10-40 segundos
      await new Promise(resolve => setTimeout(resolve, sessionTime));

      // 3. Usuário faz algumas requisições durante a sessão (2-5 requisições)
      const requestCount = Math.floor(Math.random() * 4) + 2; // 2-5 requisições
      
      for (let i = 0; i < requestCount && this.isRunning; i++) {
        const requestStart = performance.now();
        
        try {
          const response = await axios.get(`${this.baseURL}/api/surebets`, {
            timeout: 5000,
            headers: {
              'User-Agent': `RealUser-${userId}/1.0`
            }
          });

          const requestTime = performance.now() - requestStart;
          
          userResults.requests.push({
            type: 'navigation',
            duration: requestTime,
            status: response.status,
            requestNumber: i + 1,
            timestamp: Date.now()
          });

          // Pausa entre requisições (1-5 segundos)
          const pauseTime = Math.random() * 4000 + 1000;
          await new Promise(resolve => setTimeout(resolve, pauseTime));

        } catch (error) {
          const requestTime = performance.now() - requestStart;
          userResults.errors.push({
            type: 'navigation_error',
            error: error.message,
            duration: requestTime,
            requestNumber: i + 1,
            timestamp: Date.now()
          });
        }
      }

      userResults.endTime = Date.now();
      userResults.sessionDuration = userResults.endTime - userResults.startTime;
      userResults.success = userResults.errors.length < (userResults.requests.length * 0.2); // 80% de sucesso

    } catch (error) {
      userResults.errors.push({
        type: 'fatal',
        message: error.message,
        timestamp: Date.now()
      });
      userResults.success = false;
      userResults.endTime = Date.now();
      userResults.sessionDuration = userResults.endTime - userResults.startTime;
    }

    return userResults;
  }

  /**
   * Executa teste realista com usuários distribuídos
   */
  async runRealisticTest() {
    console.log('🌍 Iniciando Teste de Carga Realista - SurebetsView');
    console.log('='.repeat(60));
    console.log(`👥 Total de usuários: ${this.totalUsers}`);
    console.log(`⏱️ Duração do teste: ${this.testDuration / 1000} segundos (${this.testDuration / 60000} minutos)`);
    console.log(`📊 Usuários distribuídos ao longo do tempo`);
    console.log('');

    this.startTime = Date.now();
    this.isRunning = true;

    // Distribuir usuários ao longo do tempo
    const promises = [];
    const userInterval = this.testDuration / this.totalUsers; // Intervalo entre usuários

    for (let i = 0; i < this.totalUsers; i++) {
      const delay = i * userInterval;
      
      // Agendar usuário para entrar após o delay
      const userPromise = new Promise(resolve => {
        setTimeout(async () => {
          if (this.isRunning) {
            console.log(`👤 Usuário ${i + 1}/${this.totalUsers} entrando...`);
            const result = await this.simulateRealUser(i + 1);
            resolve(result);
          } else {
            resolve(null);
          }
        }, delay);
      });
      
      promises.push(userPromise);
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
      if (result.status === 'fulfilled' && result.value) {
        this.results.push(result.value);
      } else if (result.status === 'rejected') {
        this.errors.push({
          userId: index + 1,
          error: result.reason.message
        });
      }
    });

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log(`\n✅ Teste realista concluído em ${totalDuration}ms`);
    this.generateRealisticReport(totalDuration);
  }

  /**
   * Gera relatório detalhado do teste realista
   */
  generateRealisticReport(totalDuration) {
    console.log('\n🌍 RELATÓRIO DE TESTE REALISTA');
    console.log('='.repeat(60));

    const successfulUsers = this.results.filter(r => r.success).length;
    const failedUsers = this.results.filter(r => !r.success).length;
    const totalUsers = this.results.length + this.errors.length;

    console.log(`👥 Usuários totais: ${totalUsers}`);
    console.log(`✅ Usuários bem-sucedidos: ${successfulUsers}`);
    console.log(`❌ Usuários com falha: ${failedUsers}`);
    console.log(`📈 Taxa de sucesso: ${((successfulUsers / totalUsers) * 100).toFixed(2)}%`);

    // Estatísticas de sessão
    const allRequests = this.results.flatMap(r => r.requests);
    const allErrors = this.results.flatMap(r => r.errors);
    const totalRequests = allRequests.length + allErrors.length;
    const successfulRequests = allRequests.length;
    const failedRequests = allErrors.length;

    console.log('\n📊 ESTATÍSTICAS DE SESSÃO');
    console.log('-'.repeat(40));
    console.log(`📤 Total de requisições: ${totalRequests}`);
    console.log(`✅ Requisições bem-sucedidas: ${successfulRequests}`);
    console.log(`❌ Requisições com falha: ${failedRequests}`);
    console.log(`📈 Taxa de sucesso de requisições: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);

    if (allRequests.length > 0) {
      const durations = allRequests.map(r => r.duration);
      const initialLoads = allRequests.filter(r => r.type === 'initial_load');
      const navigations = allRequests.filter(r => r.type === 'navigation');
      
      console.log('\n⏱️ PERFORMANCE DAS REQUISIÇÕES');
      console.log('-'.repeat(40));
      console.log(`⚡ Tempo médio geral: ${(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)}ms`);
      console.log(`🚀 Tempo mínimo: ${Math.min(...durations).toFixed(2)}ms`);
      console.log(`🐌 Tempo máximo: ${Math.max(...durations).toFixed(2)}ms`);

      if (initialLoads.length > 0) {
        const initialTimes = initialLoads.map(r => r.duration);
        console.log(`\n📄 Carregamento inicial:`);
        console.log(`   Média: ${(initialTimes.reduce((a, b) => a + b, 0) / initialTimes.length).toFixed(2)}ms`);
        console.log(`   Mínimo: ${Math.min(...initialTimes).toFixed(2)}ms`);
        console.log(`   Máximo: ${Math.max(...initialTimes).toFixed(2)}ms`);
      }

      if (navigations.length > 0) {
        const navTimes = navigations.map(r => r.duration);
        console.log(`\n🧭 Navegação:`);
        console.log(`   Média: ${(navTimes.reduce((a, b) => a + b, 0) / navTimes.length).toFixed(2)}ms`);
        console.log(`   Mínimo: ${Math.min(...navTimes).toFixed(2)}ms`);
        console.log(`   Máximo: ${Math.max(...navTimes).toFixed(2)}ms`);
      }

      // Análise de percentis
      const sortedDurations = durations.sort((a, b) => a - b);
      const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)];
      const p90 = sortedDurations[Math.floor(sortedDurations.length * 0.9)];
      const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];

      console.log(`\n📈 Percentis de Performance:`);
      console.log(`   P50 (mediana): ${p50.toFixed(2)}ms`);
      console.log(`   P90: ${p90.toFixed(2)}ms`);
      console.log(`   P95: ${p95.toFixed(2)}ms`);
    }

    // Estatísticas de sessão
    const sessionDurations = this.results.map(r => r.sessionDuration);
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    console.log('\n👤 ESTATÍSTICAS DE SESSÃO');
    console.log('-'.repeat(40));
    console.log(`⏱️ Duração média de sessão: ${(avgSessionDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Requisições por usuário: ${(totalRequests / totalUsers).toFixed(1)}`);

    // Estatísticas de throughput
    const requestsPerSecond = (totalRequests / (totalDuration / 1000)).toFixed(2);
    const usersPerMinute = (totalUsers / (totalDuration / 60000)).toFixed(2);

    console.log('\n🚀 THROUGHPUT');
    console.log('-'.repeat(40));
    console.log(`⚡ Requisições/segundo: ${requestsPerSecond}`);
    console.log(`👥 Usuários/minuto: ${usersPerMinute}`);

    // Análise de erros
    if (allErrors.length > 0) {
      console.log('\n❌ ANÁLISE DE ERROS');
      console.log('-'.repeat(40));
      const errorTypes = {};
      allErrors.forEach(error => {
        const type = error.error || error.message || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} ocorrências`);
      });
    }

    // Avaliação realista
    console.log('\n🎯 AVALIAÇÃO REALISTA');
    console.log('-'.repeat(40));

    let performanceScore = 100;
    let issues = [];

    // Avaliar taxa de sucesso
    const successRate = (successfulRequests / totalRequests) * 100;
    if (successRate < 95) {
      performanceScore -= 20;
      issues.push('Taxa de sucesso baixa (<95%)');
    } else if (successRate < 98) {
      performanceScore -= 10;
      issues.push('Taxa de sucesso moderada (<98%)');
    }

    // Avaliar tempo de resposta
    if (allRequests.length > 0) {
      const avgResponseTime = allRequests.reduce((sum, r) => sum + r.duration, 0) / allRequests.length;
      if (avgResponseTime > 500) {
        performanceScore -= 15;
        issues.push('Tempo de resposta alto (>500ms)');
      } else if (avgResponseTime > 200) {
        performanceScore -= 5;
        issues.push('Tempo de resposta moderado (>200ms)');
      }
    }

    // Avaliar throughput realista
    if (requestsPerSecond < 5) {
      performanceScore -= 10;
      issues.push('Throughput baixo para uso real (<5 req/s)');
    }

    console.log(`📊 Pontuação de Performance: ${Math.max(0, performanceScore)}/100`);

    if (issues.length === 0) {
      console.log('✅ EXCELENTE: Sistema suporta uso real sem problemas');
    } else {
      console.log('⚠️ PROBLEMAS DETECTADOS:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    // Recomendações realistas
    console.log('\n💡 RECOMENDAÇÕES REALISTAS');
    console.log('-'.repeat(40));
    
    if (successRate < 98) {
      console.log('🔧 Melhorar confiabilidade da API');
      console.log('🔧 Implementar retry automático');
    }
    if (allRequests.length > 0 && allRequests.reduce((sum, r) => sum + r.duration, 0) / allRequests.length > 200) {
      console.log('🔧 Otimizar tempo de resposta');
      console.log('🔧 Verificar eficiência do cache');
    }
    if (requestsPerSecond < 10) {
      console.log('🔧 Sistema está bem dimensionado para uso real');
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
      performanceScore,
      issues
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const tester = new RealisticLoadTester();
  tester.runRealisticTest().catch(console.error);
}

module.exports = { RealisticLoadTester };
