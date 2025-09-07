/**
 * Sistema de Teste de Carga e Performance
 * Simula múltiplos usuários acessando a página de Surebets simultaneamente
 */

const axios = require('axios');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const RetryMechanism = require('./retry-mechanism');
const CircuitBreaker = require('./circuit-breaker');

class LoadTester {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.wsUrl = config.wsUrl || 'ws://localhost:3002';
    this.results = [];
    this.activeUsers = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errors: []
    };
    
    // Sistemas de melhoria
    this.retryMechanism = new RetryMechanism({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000
    });
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 10,
      timeout: 30000,
      resetTimeout: 15000
    });
    
    // Configurações de teste otimizadas
    this.testScenarios = [
      { name: 'Carga Baixa', users: 5, duration: 30000, rampUp: 5000 },
      { name: 'Carga Moderada', users: 15, duration: 60000, rampUp: 10000 },
      { name: 'Carga Alta', users: 30, duration: 90000, rampUp: 15000 },
      { name: 'Carga Extrema', users: 50, duration: 120000, rampUp: 20000 }
    ];
  }

  /**
   * Executa todos os cenários de teste
   */
  async runAllTests() {
    console.log('🚀 Iniciando Suite de Testes de Carga e Performance');
    console.log('================================================');
    
    for (const scenario of this.testScenarios) {
      console.log(`\n📊 Executando: ${scenario.name} (${scenario.users} usuários)`);
      await this.runScenario(scenario);
      await this.waitBetweenTests(10000); // 10s entre testes
    }
    
    this.generateReport();
  }

  /**
   * Executa um cenário específico de teste com ramp-up gradual
   */
  async runScenario(scenario) {
    const startTime = Date.now();
    const promises = [];
    const rampUp = scenario.rampUp || 5000; // 5 segundos padrão
    const userBatches = this.createUserBatches(scenario.users, rampUp);
    
    console.log(`📈 Ramp-up: ${rampUp/1000}s para ${scenario.users} usuários`);
    
    // Adicionar usuários em lotes para simular ramp-up
    const batchPromises = [];
    
    for (let i = 0; i < userBatches.length; i++) {
      const batch = userBatches[i];
      const batchDelay = (rampUp / userBatches.length) * i;
      
      const batchPromise = new Promise((resolve) => {
        setTimeout(async () => {
          console.log(`👥 Adicionando lote ${i + 1}/${userBatches.length} (${batch.length} usuários)`);
          
          for (const userConfig of batch) {
            const user = new VirtualUser(userConfig.id, this.baseUrl, this.wsUrl, this.retryMechanism);
            this.activeUsers.set(userConfig.id, user);
            promises.push(this.simulateUser(user, scenario.duration));
          }
          
          resolve();
        }, batchDelay);
      });
      
      batchPromises.push(batchPromise);
    }
    
    // Aguardar todos os lotes serem adicionados
    await Promise.all(batchPromises);
    
    // Aguardar todos os usuários
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Coletar métricas do cenário
    const scenarioMetrics = this.collectScenarioMetrics(scenario.name, duration);
    this.results.push(scenarioMetrics);
    
    console.log(`✅ ${scenario.name} concluído em ${duration}ms`);
    this.printScenarioResults(scenarioMetrics);
  }

  /**
   * Cria lotes de usuários para ramp-up gradual
   */
  createUserBatches(totalUsers, rampUpTime) {
    const batchSize = Math.max(1, Math.floor(totalUsers / 5)); // 5 lotes
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
   * Simula um usuário virtual executando ações
   */
  async simulateUser(user, duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    try {
      console.log(`👤 Usuário ${user.id}: Iniciando simulação`);
      
      // 1. Login
      console.log(`👤 Usuário ${user.id}: Fazendo login...`);
      await user.login();
      console.log(`✅ Usuário ${user.id}: Login realizado com sucesso`);
      
      // 2. Acessar página de surebets
      console.log(`👤 Usuário ${user.id}: Acessando página de surebets...`);
      await user.accessSurebetsPage();
      console.log(`✅ Usuário ${user.id}: Página de surebets acessada`);
      
      // 3. Executar ações em loop durante a duração do teste
      let actionCount = 0;
      while (Date.now() < endTime) {
        const action = this.getRandomAction();
        console.log(`👤 Usuário ${user.id}: Executando ação ${action} (${actionCount + 1})`);
        await this.executeAction(user, action);
        actionCount++;
        
        // Intervalo aleatório entre ações (1-5 segundos)
        await this.sleep(Math.random() * 4000 + 1000);
      }
      
      console.log(`✅ Usuário ${user.id}: Simulação concluída (${actionCount} ações)`);
      
      // 4. Logout
      await user.logout();
      
    } catch (error) {
      this.metrics.errors.push({
        userId: user.id,
        action: 'simulation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Executa uma ação específica do usuário com retry e circuit breaker
   */
  async executeAction(user, action) {
    const startTime = Date.now();
    
    try {
      // Usar circuit breaker para proteger o servidor
      const result = await this.circuitBreaker.execute(async () => {
        // Usar retry mechanism para requisições individuais
        return await this.retryMechanism.executeWithRetry(async () => {
          switch (action) {
            case 'fetch_surebets':
              return await user.fetchSurebets();
            case 'apply_filters':
              return await user.applyFilters();
            case 'view_details':
              return await user.viewSurebetDetails();
            case 'load_accounts':
              return await user.loadBookmakerAccounts();
            case 'toggle_search':
              return await user.toggleSearch();
            case 'update_settings':
              return await user.updateSettings();
            default:
              throw new Error(`Ação desconhecida: ${action}`);
          }
        }, `User ${user.id} - ${action}`);
      }, `User ${user.id} - ${action}`);
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      // Log de erro mais detalhado
      const errorInfo = {
        userId: user.id,
        action: action,
        error: error.message,
        errorCode: error.code,
        statusCode: error.response?.status,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        circuitBreakerState: this.circuitBreaker.getStats().state
      };
      
      this.metrics.errors.push(errorInfo);
      
      // Log de erro crítico
      if (error.response?.status >= 500) {
        console.log(`🚨 Erro crítico - User ${user.id}, ${action}: ${error.message}`);
      }
    }
  }

  /**
   * Retorna uma ação aleatória baseada em probabilidades
   */
  getRandomAction() {
    const actions = [
      { name: 'fetch_surebets', weight: 40 },
      { name: 'apply_filters', weight: 20 },
      { name: 'view_details', weight: 15 },
      { name: 'load_accounts', weight: 10 },
      { name: 'toggle_search', weight: 10 },
      { name: 'update_settings', weight: 5 }
    ];
    
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        return action.name;
      }
    }
    
    return 'fetch_surebets';
  }

  /**
   * Atualiza métricas globais
   */
  updateMetrics(success, responseTime) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    
    // Calcular média móvel
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }

  /**
   * Coleta métricas de um cenário específico
   */
  collectScenarioMetrics(scenarioName, duration) {
    const errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    
    return {
      scenario: scenarioName,
      duration: duration,
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      errorRate: errorRate,
      averageResponseTime: this.metrics.averageResponseTime,
      maxResponseTime: this.metrics.maxResponseTime,
      minResponseTime: this.metrics.minResponseTime,
      requestsPerSecond: this.metrics.totalRequests / (duration / 1000),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Imprime resultados de um cenário
   */
  printScenarioResults(metrics) {
    console.log(`  📈 Requisições: ${metrics.totalRequests}`);
    console.log(`  ✅ Sucessos: ${metrics.successfulRequests}`);
    console.log(`  ❌ Falhas: ${metrics.failedRequests}`);
    console.log(`  📊 Taxa de Erro: ${metrics.errorRate.toFixed(2)}%`);
    console.log(`  ⏱️ Tempo Médio: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`  🚀 RPS: ${metrics.requestsPerSecond.toFixed(2)}`);
    
    // Verificar se atende aos critérios de qualidade
    const qualityCheck = this.checkQualityMetrics(metrics);
    console.log(`  🎯 Qualidade: ${qualityCheck.status} (${qualityCheck.score}/100)`);
  }

  /**
   * Verifica se as métricas atendem aos critérios de qualidade
   */
  checkQualityMetrics(metrics) {
    let score = 100;
    const issues = [];
    
    // Tempo de resposta < 500ms
    if (metrics.averageResponseTime > 500) {
      score -= 30;
      issues.push('Tempo de resposta alto');
    }
    
    // Taxa de erro < 1%
    if (metrics.errorRate > 1) {
      score -= 40;
      issues.push('Taxa de erro alta');
    }
    
    // RPS adequado
    if (metrics.requestsPerSecond < 10) {
      score -= 20;
      issues.push('Throughput baixo');
    }
    
    // Tempo máximo < 2s
    if (metrics.maxResponseTime > 2000) {
      score -= 10;
      issues.push('Tempo máximo alto');
    }
    
    return {
      score: Math.max(0, score),
      status: score >= 80 ? '✅ EXCELENTE' : score >= 60 ? '⚠️ BOM' : '❌ RUIM',
      issues: issues
    };
  }

  /**
   * Gera relatório final
   */
  generateReport() {
    const report = {
      summary: {
        totalScenarios: this.results.length,
        totalRequests: this.metrics.totalRequests,
        totalErrors: this.metrics.failedRequests,
        overallErrorRate: (this.metrics.failedRequests / this.metrics.totalRequests) * 100,
        averageResponseTime: this.metrics.averageResponseTime,
        testDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
      },
      scenarios: this.results,
      errors: this.metrics.errors,
      circuitBreakerStats: this.circuitBreaker.getStats(),
      retryStats: this.retryMechanism ? 'Retry mechanism ativo' : 'Não disponível',
      recommendations: this.generateRecommendations()
    };
    
    // Salvar relatório
    const reportPath = path.join(__dirname, 'load-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 RELATÓRIO FINAL');
    console.log('==================');
    console.log(`📊 Total de Cenários: ${report.summary.totalScenarios}`);
    console.log(`🔄 Total de Requisições: ${report.summary.totalRequests}`);
    console.log(`❌ Total de Erros: ${report.summary.totalErrors}`);
    console.log(`📈 Taxa de Erro Geral: ${report.summary.overallErrorRate.toFixed(2)}%`);
    console.log(`⏱️ Tempo Médio de Resposta: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`📄 Relatório salvo em: ${reportPath}`);
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.averageResponseTime > 500) {
      recommendations.push('Implementar cache mais agressivo para reduzir tempo de resposta');
    }
    
    if (this.metrics.failedRequests > this.metrics.totalRequests * 0.01) {
      recommendations.push('Investigar e corrigir erros de requisição');
    }
    
    if (this.metrics.maxResponseTime > 2000) {
      recommendations.push('Otimizar consultas de banco de dados e implementar índices');
    }
    
    const errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    if (errorRate > 5) {
      recommendations.push('Implementar rate limiting e circuit breaker');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Sistema está performando bem! Continue monitorando.');
    }
    
    return recommendations;
  }

  /**
   * Aguarda entre testes
   */
  async waitBetweenTests(ms) {
    console.log(`⏳ Aguardando ${ms/1000}s antes do próximo teste...`);
    await this.sleep(ms);
  }

  /**
   * Utilitário para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Classe para simular um usuário virtual
 */
class VirtualUser {
  constructor(id, baseUrl, wsUrl, retryMechanism = null) {
    this.id = id;
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
    this.retryMechanism = retryMechanism;
    this.session = null;
    this.ws = null;
    this.actions = [];
  }

  async login() {
    try {
      console.log(`🔐 Usuário ${this.id}: Criando usuário se necessário...`);
      // Primeiro, tentar criar o usuário (caso não exista)
      await this.createUserIfNotExists();
      
      console.log(`🔐 Usuário ${this.id}: Fazendo login...`);
      // Depois fazer login
      const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
        email: `testuser${this.id}@example.com`,
        password: 'testpassword123'
      });
      
      this.session = response.data.token;
      this.actions.push({ action: 'login', success: true, timestamp: Date.now() });
      console.log(`✅ Usuário ${this.id}: Login realizado com sucesso`);
    } catch (error) {
      console.error(`❌ Usuário ${this.id}: Erro no login:`, error.message);
      this.actions.push({ action: 'login', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async createUserIfNotExists() {
    try {
      if (this.retryMechanism) {
        // Usar retry mechanism para criação de usuário
        await this.retryMechanism.executeWithRetry(async () => {
          const response = await axios.post(`${this.baseUrl}/api/auth/register`, {
            email: `testuser${this.id}@example.com`,
            password: 'testpassword123',
            name: `Test User ${this.id}`,
            isTestUser: true // Flag para identificar usuários de teste
          });
          
          return response;
        }, `Create user ${this.id}`);
      } else {
        // Fallback sem retry mechanism
        const response = await axios.post(`${this.baseUrl}/api/auth/register`, {
          email: `testuser${this.id}@example.com`,
          password: 'testpassword123',
          name: `Test User ${this.id}`,
          isTestUser: true
        });
      }
      
      this.actions.push({ action: 'create_user', success: true, timestamp: Date.now() });
    } catch (error) {
      // Se erro 409 (usuário já existe), é OK
      if (error.response && error.response.status === 409) {
        this.actions.push({ action: 'create_user', success: true, message: 'User already exists', timestamp: Date.now() });
      } else {
        this.actions.push({ action: 'create_user', success: false, error: error.message, timestamp: Date.now() });
        throw error;
      }
    }
  }

  async accessSurebetsPage() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/surebets`, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'access_surebets', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'access_surebets', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async fetchSurebets() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/surebets`, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'fetch_surebets', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'fetch_surebets', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async applyFilters() {
    try {
      const filters = {
        selectedHouses: ['Bet365', 'Betfair', 'Pinnacle'],
        selectedSports: ['Futebol', 'Basquete'],
        minProfit: 1.0,
        maxProfit: 10.0
      };
      
      const response = await axios.post(`${this.baseUrl}/api/surebets/filter`, filters, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'apply_filters', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'apply_filters', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async viewSurebetDetails() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/surebets/details/1`, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'view_details', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'view_details', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async loadBookmakerAccounts() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/bookmaker-accounts`, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'load_accounts', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'load_accounts', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async toggleSearch() {
    try {
      const response = await axios.post(`${this.baseUrl}/api/surebets/toggle-search`, {}, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'toggle_search', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'toggle_search', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async updateSettings() {
    try {
      const settings = {
        autoUpdateInterval: 5000,
        soundEnabled: true,
        backgroundSearch: true
      };
      
      const response = await axios.put(`${this.baseUrl}/api/user/settings`, settings, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'update_settings', success: true, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      this.actions.push({ action: 'update_settings', success: false, error: error.message, timestamp: Date.now() });
      throw error;
    }
  }

  async logout() {
    try {
      await axios.post(`${this.baseUrl}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${this.session}` }
      });
      
      this.actions.push({ action: 'logout', success: true, timestamp: Date.now() });
    } catch (error) {
      this.actions.push({ action: 'logout', success: false, error: error.message, timestamp: Date.now() });
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new LoadTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { LoadTester, VirtualUser };
