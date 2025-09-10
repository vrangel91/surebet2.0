/**
 * Script para testar performance de carregamento da SurebetsView
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class SurebetsLoadingTester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = [];
  }

  /**
   * Testa carregamento da página de surebets
   */
  async testPageLoad() {
    console.log('🧪 Testando carregamento da página de surebets...');
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${this.baseURL}/surebets`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'SurebetsLoadingTester/1.0'
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Página carregada em ${duration.toFixed(2)}ms`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`📦 Tamanho: ${(response.data.length / 1024).toFixed(2)}KB`);
      
      return {
        success: true,
        duration,
        status: response.status,
        size: response.data.length
      };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`❌ Erro ao carregar página: ${error.message}`);
      console.log(`⏱️ Tempo até erro: ${duration.toFixed(2)}ms`);
      
      return {
        success: false,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Testa API de surebets
   */
  async testSurebetsAPI() {
    console.log('🧪 Testando API de surebets...');
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${this.baseURL}/api/surebets`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'SurebetsLoadingTester/1.0'
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const data = response.data;
      const surebetsCount = data.success ? data.data.surebets?.length || 0 : 0;
      
      console.log(`✅ API respondida em ${duration.toFixed(2)}ms`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`🎯 Surebets: ${surebetsCount}`);
      console.log(`💾 Cache: ${data.cached ? 'Sim' : 'Não'}`);
      console.log(`📦 Tamanho: ${(JSON.stringify(data).length / 1024).toFixed(2)}KB`);
      
      return {
        success: true,
        duration,
        status: response.status,
        surebetsCount,
        cached: data.cached,
        size: JSON.stringify(data).length
      };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`❌ Erro na API: ${error.message}`);
      console.log(`⏱️ Tempo até erro: ${duration.toFixed(2)}ms`);
      
      return {
        success: false,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Testa cache VIP
   */
  async testVIPCache() {
    console.log('🧪 Testando cache VIP...');
    
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${this.baseURL}/api/vip-cache/stats`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SurebetsLoadingTester/1.0'
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const data = response.data;
      const cacheStats = data.success ? data.data.vipCache : null;
      
      console.log(`✅ Cache VIP respondido em ${duration.toFixed(2)}ms`);
      console.log(`📊 Hit rate: ${cacheStats?.hitRate || 'N/A'}`);
      console.log(`💾 Tamanho: ${cacheStats?.size || 0}/${cacheStats?.maxSize || 0}`);
      console.log(`📈 Utilização: ${cacheStats?.utilization || 'N/A'}`);
      
      return {
        success: true,
        duration,
        cacheStats
      };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`❌ Erro no cache VIP: ${error.message}`);
      console.log(`⏱️ Tempo até erro: ${duration.toFixed(2)}ms`);
      
      return {
        success: false,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Testa múltiplas requisições simultâneas
   */
  async testConcurrentRequests(count = 10) {
    console.log(`🧪 Testando ${count} requisições simultâneas...`);
    
    const startTime = performance.now();
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.testSurebetsAPI());
    }
    
    try {
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      
      console.log(`✅ ${successful} requisições bem-sucedidas, ${failed} falharam`);
      console.log(`⏱️ Tempo total: ${totalDuration.toFixed(2)}ms`);
      console.log(`📊 Tempo médio: ${avgDuration.toFixed(2)}ms`);
      console.log(`🚀 Requisições/segundo: ${(count / (totalDuration / 1000)).toFixed(2)}`);
      
      return {
        success: true,
        totalDuration,
        avgDuration,
        successful,
        failed,
        requestsPerSecond: count / (totalDuration / 1000)
      };
      
    } catch (error) {
      console.log(`❌ Erro no teste de concorrência: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Executa todos os testes
   */
  async runAllTests() {
    console.log('🚀 Iniciando Testes de Performance da SurebetsView');
    console.log('='.repeat(60));
    
    const results = {
      pageLoad: null,
      api: null,
      vipCache: null,
      concurrent: null
    };
    
    // Teste 1: Carregamento da página
    console.log('\n1️⃣ Teste de Carregamento da Página');
    console.log('-'.repeat(40));
    results.pageLoad = await this.testPageLoad();
    
    // Teste 2: API de surebets
    console.log('\n2️⃣ Teste da API de Surebets');
    console.log('-'.repeat(40));
    results.api = await this.testSurebetsAPI();
    
    // Teste 3: Cache VIP
    console.log('\n3️⃣ Teste do Cache VIP');
    console.log('-'.repeat(40));
    results.vipCache = await this.testVIPCache();
    
    // Teste 4: Requisições simultâneas
    console.log('\n4️⃣ Teste de Requisições Simultâneas');
    console.log('-'.repeat(40));
    results.concurrent = await this.testConcurrentRequests(5);
    
    // Resumo
    console.log('\n📋 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    
    if (results.pageLoad?.success) {
      console.log(`📄 Página: ${results.pageLoad.duration.toFixed(2)}ms`);
    } else {
      console.log(`📄 Página: ❌ Falhou`);
    }
    
    if (results.api?.success) {
      console.log(`🔌 API: ${results.api.duration.toFixed(2)}ms (${results.api.surebetsCount} surebets)`);
    } else {
      console.log(`🔌 API: ❌ Falhou`);
    }
    
    if (results.vipCache?.success) {
      console.log(`💾 Cache VIP: ${results.vipCache.duration.toFixed(2)}ms (${results.vipCache.cacheStats?.hitRate})`);
    } else {
      console.log(`💾 Cache VIP: ❌ Falhou`);
    }
    
    if (results.concurrent?.success) {
      console.log(`⚡ Concorrência: ${results.concurrent.avgDuration.toFixed(2)}ms média (${results.concurrent.requestsPerSecond.toFixed(2)} req/s)`);
    } else {
      console.log(`⚡ Concorrência: ❌ Falhou`);
    }
    
    // Avaliação
    console.log('\n🎯 AVALIAÇÃO');
    console.log('-'.repeat(40));
    
    const pageLoadTime = results.pageLoad?.duration || 0;
    const apiTime = results.api?.duration || 0;
    
    if (pageLoadTime < 1000) {
      console.log('✅ Carregamento da página: Excelente (< 1s)');
    } else if (pageLoadTime < 3000) {
      console.log('⚠️ Carregamento da página: Bom (< 3s)');
    } else {
      console.log('❌ Carregamento da página: Lento (> 3s)');
    }
    
    if (apiTime < 500) {
      console.log('✅ API de surebets: Excelente (< 500ms)');
    } else if (apiTime < 1000) {
      console.log('⚠️ API de surebets: Bom (< 1s)');
    } else {
      console.log('❌ API de surebets: Lento (> 1s)');
    }
    
    return results;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new SurebetsLoadingTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { SurebetsLoadingTester };
