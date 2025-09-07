/**
 * Teste de Carga para SurebetsView
 * Simula 100 usuários acessando a página simultaneamente
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class SurebetsLoadTester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.concurrentUsers = 100;
    this.testDuration = 60000; // 1 minuto
    this.results = [];
    this.errors = [];
    this.startTime = null;
  }

  /**
   * Simula um usuário acessando a página
   */
  async simulateUser(userId) {
    const userResults = {
      userId,
      requests: [],
      errors: [],
      startTime: Date.now()
    };

    try {
      // 1. Acessar a página principal
      const pageStart = performance.now();
      const pageResponse = await axios.get(`${this.baseURL}/surebets`, {
        timeout: 10000,
        headers: {
          'User-Agent': `LoadTestUser-${userId}/1.0`
        }
      });
      const pageTime = performance.now() - pageStart;
      
      userResults.requests.push({
        type: 'page_load',
        duration: pageTime,
        status: pageResponse.status,
        size: pageResponse.data.length
      });

      // 2. Fazer requisição para API de surebets
      const apiStart = performance.now();
      const apiResponse = await axios.get(`${this.baseURL}/api/surebets`, {
        timeout: 10000,
        headers: {
          'User-Agent': `LoadTestUser-${userId}/1.0`
        }
      });
      const apiTime = performance.now() - apiStart;
      
      const surebetsCount = apiResponse.data ? Object.keys(apiResponse.data).length : 0;
      userResults.requests.push({
        type: 'api_surebets',
        duration: apiTime,
        status: apiResponse.status,
        surebetsCount,
        size: JSON.stringify(apiResponse.data).length
      });

      // 3. Simular navegação (múltiplas requisições)
      for (let i = 0; i < 3; i++) {
        const navStart = performance.now();
        const navResponse = await axios.get(`${this.baseURL}/api/surebets`, {
          timeout: 5000,
          headers: {
            'User-Agent': `LoadTestUser-${userId}/1.0`
          }
        });
        const navTime = performance.now() - navStart;
        
        userResults.requests.push({
          type: 'navigation',
          duration: navTime,
          status: navResponse.status,
          iteration: i + 1
        });

        // Pequena pausa entre navegações
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      userResults.endTime = Date.now();
      userResults.totalDuration = userResults.endTime - userResults.startTime;
      userResults.success = true;

    } catch (error) {
      userResults.errors.push({
        type: error.code || 'unknown',
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
   * Executa teste de carga com múltiplos usuários
   */
  async runLoadTest() {
    console.log('🚀 Iniciando Teste de Carga - SurebetsView');
    console.log('='.repeat(60));
    console.log(`👥 Usuários simultâneos: ${this.concurrentUsers}`);
    console.log(`⏱️ Duração do teste: ${this.testDuration / 1000} segundos`);
    console.log(`🌐 URL base: ${this.baseURL}`);
    console.log('');

    this.startTime = Date.now();
    const promises = [];

    // Criar usuários em lotes para não sobrecarregar
    const batchSize = 10;
    const batches = Math.ceil(this.concurrentUsers / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, this.concurrentUsers);
      
      console.log(`📦 Iniciando lote ${batch + 1}/${batches} (usuários ${batchStart + 1}-${batchEnd})`);
      
      // Criar usuários do lote
      const batchPromises = [];
      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(this.simulateUser(i + 1));
      }

      // Executar lote
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Processar resultados do lote
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.results.push(result.value);
        } else {
          this.errors.push({
            userId: batchStart + index + 1,
            error: result.reason.message
          });
        }
      });

      // Pequena pausa entre lotes
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log(`\n✅ Teste concluído em ${totalDuration}ms`);
    this.generateReport(totalDuration);
  }

  /**
   * Gera relatório detalhado do teste
   */
  generateReport(totalDuration) {
    console.log('\n📊 RELATÓRIO DE TESTE DE CARGA');
    console.log('='.repeat(60));

    const successfulUsers = this.results.filter(r => r.success).length;
    const failedUsers = this.results.filter(r => !r.success).length;
    const totalUsers = this.results.length + this.errors.length;

    console.log(`👥 Usuários totais: ${totalUsers}`);
    console.log(`✅ Usuários bem-sucedidos: ${successfulUsers}`);
    console.log(`❌ Usuários com falha: ${failedUsers}`);
    console.log(`📈 Taxa de sucesso: ${((successfulUsers / totalUsers) * 100).toFixed(2)}%`);

    // Estatísticas de performance
    const allRequests = this.results.flatMap(r => r.requests);
    const pageLoads = allRequests.filter(r => r.type === 'page_load');
    const apiCalls = allRequests.filter(r => r.type === 'api_surebets');
    const navigations = allRequests.filter(r => r.type === 'navigation');

    console.log('\n⏱️ ESTATÍSTICAS DE PERFORMANCE');
    console.log('-'.repeat(40));

    if (pageLoads.length > 0) {
      const pageTimes = pageLoads.map(r => r.duration);
      console.log(`📄 Carregamento de página:`);
      console.log(`   Média: ${(pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length).toFixed(2)}ms`);
      console.log(`   Mínimo: ${Math.min(...pageTimes).toFixed(2)}ms`);
      console.log(`   Máximo: ${Math.max(...pageTimes).toFixed(2)}ms`);
    }

    if (apiCalls.length > 0) {
      const apiTimes = apiCalls.map(r => r.duration);
      const surebetsCounts = apiCalls.map(r => r.surebetCount || 0);
      console.log(`🔌 API de surebets:`);
      console.log(`   Média: ${(apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length).toFixed(2)}ms`);
      console.log(`   Mínimo: ${Math.min(...apiTimes).toFixed(2)}ms`);
      console.log(`   Máximo: ${Math.max(...apiTimes).toFixed(2)}ms`);
      console.log(`   Surebets médios: ${(surebetsCounts.reduce((a, b) => a + b, 0) / surebetsCounts.length).toFixed(0)}`);
    }

    if (navigations.length > 0) {
      const navTimes = navigations.map(r => r.duration);
      console.log(`🧭 Navegação:`);
      console.log(`   Média: ${(navTimes.reduce((a, b) => a + b, 0) / navTimes.length).toFixed(2)}ms`);
      console.log(`   Mínimo: ${Math.min(...navTimes).toFixed(2)}ms`);
      console.log(`   Máximo: ${Math.max(...navTimes).toFixed(2)}ms`);
    }

    // Estatísticas de throughput
    const totalRequests = allRequests.length;
    const requestsPerSecond = (totalRequests / (totalDuration / 1000)).toFixed(2);
    const usersPerSecond = (totalUsers / (totalDuration / 1000)).toFixed(2);

    console.log('\n🚀 THROUGHPUT');
    console.log('-'.repeat(40));
    console.log(`📊 Total de requisições: ${totalRequests}`);
    console.log(`⚡ Requisições/segundo: ${requestsPerSecond}`);
    console.log(`👥 Usuários/segundo: ${usersPerSecond}`);

    // Análise de erros
    if (this.errors.length > 0) {
      console.log('\n❌ ANÁLISE DE ERROS');
      console.log('-'.repeat(40));
      const errorTypes = {};
      this.errors.forEach(error => {
        const type = error.error || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} ocorrências`);
      });
    }

    // Avaliação de performance
    console.log('\n🎯 AVALIAÇÃO DE PERFORMANCE');
    console.log('-'.repeat(40));

    const avgPageLoad = pageLoads.length > 0 ? 
      pageLoads.reduce((sum, r) => sum + r.duration, 0) / pageLoads.length : 0;
    const avgApiCall = apiCalls.length > 0 ? 
      apiCalls.reduce((sum, r) => sum + r.duration, 0) / apiCalls.length : 0;

    let performanceScore = 100;
    let issues = [];

    // Avaliar tempo de carregamento da página
    if (avgPageLoad > 3000) {
      performanceScore -= 30;
      issues.push('Carregamento de página lento (>3s)');
    } else if (avgPageLoad > 1000) {
      performanceScore -= 15;
      issues.push('Carregamento de página moderado (>1s)');
    }

    // Avaliar tempo da API
    if (avgApiCall > 2000) {
      performanceScore -= 25;
      issues.push('API de surebets lenta (>2s)');
    } else if (avgApiCall > 1000) {
      performanceScore -= 10;
      issues.push('API de surebets moderada (>1s)');
    }

    // Avaliar taxa de sucesso
    const successRate = (successfulUsers / totalUsers) * 100;
    if (successRate < 90) {
      performanceScore -= 20;
      issues.push('Taxa de sucesso baixa (<90%)');
    } else if (successRate < 95) {
      performanceScore -= 10;
      issues.push('Taxa de sucesso moderada (<95%)');
    }

    // Avaliar throughput
    if (requestsPerSecond < 10) {
      performanceScore -= 15;
      issues.push('Throughput baixo (<10 req/s)');
    }

    console.log(`📊 Pontuação de Performance: ${Math.max(0, performanceScore)}/100`);

    if (issues.length === 0) {
      console.log('✅ EXCELENTE: Sistema suporta carga alta sem problemas');
    } else {
      console.log('⚠️ PROBLEMAS DETECTADOS:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES');
    console.log('-'.repeat(40));
    
    if (avgPageLoad > 2000) {
      console.log('🔧 Otimizar carregamento da página (lazy loading, code splitting)');
    }
    if (avgApiCall > 1000) {
      console.log('🔧 Implementar cache na API de surebets');
      console.log('🔧 Otimizar consultas ao banco de dados');
    }
    if (successRate < 95) {
      console.log('🔧 Investigar e corrigir erros de conectividade');
      console.log('🔧 Implementar retry automático');
    }
    if (requestsPerSecond < 20) {
      console.log('🔧 Considerar escalabilidade horizontal');
      console.log('🔧 Otimizar recursos do servidor');
    }

    return {
      totalUsers,
      successfulUsers,
      failedUsers,
      successRate,
      avgPageLoad,
      avgApiCall,
      requestsPerSecond,
      performanceScore,
      issues
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const tester = new SurebetsLoadTester();
  tester.runLoadTest().catch(console.error);
}

module.exports = { SurebetsLoadTester };
