/**
 * Teste de Estresse Específico para Página de Surebets
 * Identifica o ponto de falha do sistema com carga extrema
 */

const axios = require('axios');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { LoadTester } = require('./load-testing');

class StressTester extends LoadTester {
  constructor(config = {}) {
    super(config);
    this.stressScenarios = [
      { name: 'Pico Repentino', users: 300, duration: 60000, rampUp: 5000 },
      { name: 'Carga Sustentada', users: 500, duration: 300000, rampUp: 30000 },
      { name: 'Teste de Recuperação', users: 200, duration: 120000, rampUp: 10000 },
      { name: 'Sobrecarga Extrema', users: 1000, duration: 180000, rampUp: 60000 }
    ];
    
    this.failurePoints = [];
    this.recoveryTimes = [];
  }

  /**
   * Executa testes de estresse
   */
  async runStressTests() {
    console.log('🔥 Iniciando Testes de Estresse');
    console.log('===============================');
    
    for (const scenario of this.stressScenarios) {
      console.log(`\n💥 Executando: ${scenario.name}`);
      await this.runStressScenario(scenario);
      await this.waitBetweenTests(15000); // 15s entre testes
    }
    
    this.generateStressReport();
  }

  /**
   * Executa um cenário de estresse específico
   */
  async runStressScenario(scenario) {
    const startTime = Date.now();
    const promises = [];
    const userBatches = this.createUserBatches(scenario.users, scenario.rampUp);
    
    console.log(`📈 Ramp-up: ${scenario.rampUp/1000}s para ${scenario.users} usuários`);
    
    // Adicionar usuários em lotes para simular ramp-up
    for (let i = 0; i < userBatches.length; i++) {
      const batch = userBatches[i];
      const batchDelay = (scenario.rampUp / userBatches.length) * i;
      
      setTimeout(async () => {
        console.log(`👥 Adicionando lote ${i + 1}/${userBatches.length} (${batch.length} usuários)`);
        
        for (const userConfig of batch) {
          const user = new StressUser(userConfig.id, this.baseUrl, this.wsUrl);
          this.activeUsers.set(userConfig.id, user);
          promises.push(this.simulateStressUser(user, scenario.duration));
        }
      }, batchDelay);
    }
    
    // Aguardar todos os usuários
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Analisar resultados do estresse
    const stressMetrics = this.analyzeStressResults(scenario.name, duration);
    this.results.push(stressMetrics);
    
    console.log(`✅ ${scenario.name} concluído em ${duration}ms`);
    this.printStressResults(stressMetrics);
  }

  /**
   * Cria lotes de usuários para ramp-up gradual
   */
  createUserBatches(totalUsers, rampUpTime) {
    const batchSize = Math.max(1, Math.floor(totalUsers / 10)); // 10 lotes
    const batches = [];
    
    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, totalUsers); j++) {
        batch.push({ id: j });
      }
      batches.push(batch);
    }
    
    return batches;
  }

  /**
   * Simula um usuário sob estresse
   */
  async simulateStressUser(user, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    try {
      // Login
      await user.login();
      
      // Ações intensivas
      while (Date.now() < endTime) {
        const action = this.getStressAction();
        await this.executeStressAction(user, action);
        
        // Intervalo menor para estresse
        await this.sleep(Math.random() * 2000 + 500); // 0.5-2.5s
      }
      
      // Logout
      await user.logout();
      
    } catch (error) {
      // Registrar ponto de falha
      this.recordFailurePoint(user.id, error, Date.now() - startTime);
    }
  }

  /**
   * Retorna ação de estresse específica
   */
  getStressAction() {
    const stressActions = [
      { name: 'rapid_fetch', weight: 30 },
      { name: 'concurrent_filters', weight: 20 },
      { name: 'heavy_operations', weight: 15 },
      { name: 'websocket_stress', weight: 15 },
      { name: 'database_intensive', weight: 10 },
      { name: 'memory_intensive', weight: 10 }
    ];
    
    const totalWeight = stressActions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of stressActions) {
      random -= action.weight;
      if (random <= 0) {
        return action.name;
      }
    }
    
    return 'rapid_fetch';
  }

  /**
   * Executa ação de estresse específica
   */
  async executeStressAction(user, action) {
    const startTime = Date.now();
    
    try {
      switch (action) {
        case 'rapid_fetch':
          // Múltiplas requisições simultâneas
          await Promise.all([
            user.fetchSurebets(),
            user.fetchSurebets(),
            user.fetchSurebets()
          ]);
          break;
          
        case 'concurrent_filters':
          // Filtros complexos simultâneos
          await Promise.all([
            user.applyComplexFilters(),
            user.applyComplexFilters(),
            user.applyComplexFilters()
          ]);
          break;
          
        case 'heavy_operations':
          // Operações pesadas
          await user.performHeavyOperations();
          break;
          
        case 'websocket_stress':
          // Estresse de WebSocket
          await user.websocketStress();
          break;
          
        case 'database_intensive':
          // Operações intensivas no banco
          await user.databaseIntensiveOperations();
          break;
          
        case 'memory_intensive':
          // Operações que consomem memória
          await user.memoryIntensiveOperations();
          break;
      }
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.metrics.errors.push({
        userId: user.id,
        action: action,
        error: error.message,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      });
      
      // Verificar se é um ponto de falha crítico
      if (this.isCriticalFailure(error, responseTime)) {
        this.recordFailurePoint(user.id, error, responseTime);
      }
    }
  }

  /**
   * Verifica se é uma falha crítica
   */
  isCriticalFailure(error, responseTime) {
    // Timeout
    if (responseTime > 10000) return true;
    
    // Erro de servidor
    if (error.response && error.response.status >= 500) return true;
    
    // Erro de conexão
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') return true;
    
    // Erro de memória
    if (error.message.includes('memory') || error.message.includes('heap')) return true;
    
    return false;
  }

  /**
   * Registra ponto de falha
   */
  recordFailurePoint(userId, error, responseTime) {
    this.failurePoints.push({
      userId,
      error: error.message,
      responseTime,
      timestamp: new Date().toISOString(),
      errorType: this.categorizeError(error)
    });
  }

  /**
   * Categoriza o tipo de erro
   */
  categorizeError(error) {
    if (error.response) {
      return `HTTP_${error.response.status}`;
    }
    
    if (error.code) {
      return error.code;
    }
    
    if (error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    
    if (error.message.includes('memory')) {
      return 'MEMORY';
    }
    
    return 'UNKNOWN';
  }

  /**
   * Analisa resultados do estresse
   */
  analyzeStressResults(scenarioName, duration) {
    const errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    const criticalFailures = this.failurePoints.length;
    const averageResponseTime = this.metrics.averageResponseTime;
    const maxResponseTime = this.metrics.maxResponseTime;
    
    // Calcular score de estresse (0-100)
    const stressScore = this.calculateStressScore(errorRate, criticalFailures, averageResponseTime);
    
    return {
      scenario: scenarioName,
      duration: duration,
      totalRequests: this.metrics.totalRequests,
      errorRate: errorRate,
      criticalFailures: criticalFailures,
      averageResponseTime: averageResponseTime,
      maxResponseTime: maxResponseTime,
      stressScore: stressScore,
      failurePoints: this.failurePoints.slice(-10), // Últimos 10 pontos de falha
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calcula score de estresse
   */
  calculateStressScore(errorRate, criticalFailures, averageResponseTime) {
    let score = 100;
    
    // Penalizar por taxa de erro
    score -= errorRate * 2;
    
    // Penalizar por falhas críticas
    score -= criticalFailures * 5;
    
    // Penalizar por tempo de resposta
    if (averageResponseTime > 1000) {
      score -= (averageResponseTime - 1000) / 100;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Imprime resultados do estresse
   */
  printStressResults(metrics) {
    console.log(`  📊 Requisições: ${metrics.totalRequests}`);
    console.log(`  ❌ Taxa de Erro: ${metrics.errorRate.toFixed(2)}%`);
    console.log(`  💥 Falhas Críticas: ${metrics.criticalFailures}`);
    console.log(`  ⏱️ Tempo Médio: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`  🚨 Tempo Máximo: ${metrics.maxResponseTime.toFixed(2)}ms`);
    console.log(`  🔥 Score de Estresse: ${metrics.stressScore.toFixed(1)}/100`);
    
    // Classificação do estresse
    let classification = '🟢 BAIXO';
    if (metrics.stressScore < 50) classification = '🔴 CRÍTICO';
    else if (metrics.stressScore < 70) classification = '🟡 MÉDIO';
    else if (metrics.stressScore < 85) classification = '🟠 ALTO';
    
    console.log(`  📈 Classificação: ${classification}`);
  }

  /**
   * Gera relatório de estresse
   */
  generateStressReport() {
    const report = {
      summary: {
        totalScenarios: this.results.length,
        totalRequests: this.metrics.totalRequests,
        totalFailures: this.metrics.failedRequests,
        criticalFailures: this.failurePoints.length,
        overallErrorRate: (this.metrics.failedRequests / this.metrics.totalRequests) * 100,
        averageStressScore: this.results.reduce((sum, r) => sum + r.stressScore, 0) / this.results.length
      },
      scenarios: this.results,
      failureAnalysis: this.analyzeFailures(),
      recommendations: this.generateStressRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    // Salvar relatório
    const reportPath = path.join(__dirname, 'stress-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🔥 RELATÓRIO DE TESTE DE ESTRESSE');
    console.log('==================================');
    console.log(`📊 Cenários Testados: ${report.summary.totalScenarios}`);
    console.log(`🔄 Total de Requisições: ${report.summary.totalRequests}`);
    console.log(`💥 Falhas Críticas: ${report.summary.criticalFailures}`);
    console.log(`📈 Taxa de Erro Geral: ${report.summary.overallErrorRate.toFixed(2)}%`);
    console.log(`🔥 Score Médio de Estresse: ${report.summary.averageStressScore.toFixed(1)}/100`);
    console.log(`📄 Relatório salvo em: ${reportPath}`);
    
    // Análise de falhas
    console.log('\n💥 ANÁLISE DE FALHAS:');
    report.failureAnalysis.forEach((analysis, index) => {
      console.log(`${index + 1}. ${analysis.type}: ${analysis.count} ocorrências (${analysis.percentage.toFixed(1)}%)`);
    });
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES DE ESTRESSE:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  /**
   * Analisa padrões de falha
   */
  analyzeFailures() {
    const failureTypes = {};
    
    this.failurePoints.forEach(failure => {
      const type = failure.errorType;
      failureTypes[type] = (failureTypes[type] || 0) + 1;
    });
    
    const total = this.failurePoints.length;
    
    return Object.entries(failureTypes)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Gera recomendações baseadas no estresse
   */
  generateStressRecommendations() {
    const recommendations = [];
    const avgScore = this.results.reduce((sum, r) => sum + r.stressScore, 0) / this.results.length;
    
    if (avgScore < 50) {
      recommendations.push('Sistema não suporta carga atual - implementar otimizações críticas');
      recommendations.push('Considerar arquitetura distribuída ou load balancing');
    } else if (avgScore < 70) {
      recommendations.push('Sistema instável sob carga - otimizar pontos críticos');
      recommendations.push('Implementar circuit breaker e retry policies');
    } else if (avgScore < 85) {
      recommendations.push('Sistema aceitável mas pode melhorar');
      recommendations.push('Otimizar consultas de banco e implementar cache');
    } else {
      recommendations.push('Sistema robusto - continuar monitoramento');
    }
    
    // Recomendações específicas baseadas em falhas
    const failureAnalysis = this.analyzeFailures();
    
    if (failureAnalysis.some(f => f.type.includes('TIMEOUT'))) {
      recommendations.push('Implementar timeouts adequados e otimizar consultas lentas');
    }
    
    if (failureAnalysis.some(f => f.type.includes('MEMORY'))) {
      recommendations.push('Investigar vazamentos de memória e otimizar uso de recursos');
    }
    
    if (failureAnalysis.some(f => f.type.includes('HTTP_5'))) {
      recommendations.push('Corrigir erros de servidor e implementar tratamento de exceções');
    }
    
    return recommendations;
  }
}

/**
 * Classe para usuário de estresse com operações específicas
 */
class StressUser {
  constructor(id, baseUrl, wsUrl) {
    this.id = id;
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
    this.session = null;
    this.ws = null;
  }

  async login() {
    // Primeiro, tentar criar o usuário (caso não exista)
    await this.createUserIfNotExists();
    
    // Depois fazer login
    const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
      email: `stressuser${this.id}@example.com`,
      password: 'stresspassword123'
    });
    this.session = response.data.token;
  }

  async createUserIfNotExists() {
    try {
      // Tentar criar usuário de teste
      await axios.post(`${this.baseUrl}/api/auth/register`, {
        email: `stressuser${this.id}@example.com`,
        password: 'stresspassword123',
        name: `Stress User ${this.id}`,
        isTestUser: true // Flag para identificar usuários de teste
      });
    } catch (error) {
      // Se erro 409 (usuário já existe), é OK
      if (!(error.response && error.response.status === 409)) {
        throw error;
      }
    }
  }

  async fetchSurebets() {
    return axios.get(`${this.baseUrl}/api/surebets`, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }

  async applyComplexFilters() {
    const filters = {
      selectedHouses: Array.from({length: 20}, (_, i) => `House${i}`),
      selectedSports: ['Futebol', 'Basquete', 'Tênis', 'Vôlei'],
      minProfit: Math.random() * 5,
      maxProfit: Math.random() * 10 + 5,
      dateRange: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 86400000).toISOString()
      }
    };
    
    return axios.post(`${this.baseUrl}/api/surebets/filter`, filters, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }

  async performHeavyOperations() {
    // Simular operações pesadas
    const operations = [
      this.fetchSurebets(),
      this.applyComplexFilters(),
      this.loadBookmakerAccounts(),
      this.updateSettings()
    ];
    
    return Promise.all(operations);
  }

  async websocketStress() {
    // Estresse de WebSocket
    const ws = new WebSocket(this.wsUrl);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, 5000);
      
      ws.on('open', () => {
        // Enviar múltiplas mensagens
        for (let i = 0; i < 10; i++) {
          ws.send(JSON.stringify({ type: 'ping', data: i }));
        }
        clearTimeout(timeout);
        ws.close();
        resolve();
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async databaseIntensiveOperations() {
    // Operações que sobrecarregam o banco
    const operations = [
      axios.get(`${this.baseUrl}/api/surebets/history`, {
        headers: { Authorization: `Bearer ${this.session}` }
      }),
      axios.get(`${this.baseUrl}/api/bookmaker-accounts`, {
        headers: { Authorization: `Bearer ${this.session}` }
      }),
      axios.get(`${this.baseUrl}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${this.session}` }
      })
    ];
    
    return Promise.all(operations);
  }

  async memoryIntensiveOperations() {
    // Operações que consomem memória
    const largeData = Array.from({length: 10000}, (_, i) => ({
      id: i,
      data: 'x'.repeat(1000)
    }));
    
    return axios.post(`${this.baseUrl}/api/surebets/bulk-process`, largeData, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }

  async loadBookmakerAccounts() {
    return axios.get(`${this.baseUrl}/api/bookmaker-accounts`, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }

  async updateSettings() {
    const settings = {
      autoUpdateInterval: Math.random() * 10000 + 1000,
      soundEnabled: Math.random() > 0.5,
      backgroundSearch: Math.random() > 0.5
    };
    
    return axios.put(`${this.baseUrl}/api/user/settings`, settings, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }

  async logout() {
    return axios.post(`${this.baseUrl}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${this.session}` }
    });
  }
}

// Executar testes de estresse se chamado diretamente
if (require.main === module) {
  const tester = new StressTester();
  tester.runStressTests().catch(console.error);
}

module.exports = { StressTester, StressUser };
