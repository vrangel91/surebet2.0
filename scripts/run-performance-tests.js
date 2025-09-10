#!/usr/bin/env node

/**
 * Script Principal para Execução de Testes de Performance
 * Executa todos os tipos de teste: carga, estresse e monitoramento
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const TestUserCleanup = require('./cleanup-test-users');

class PerformanceTestRunner {
  constructor() {
    this.testResults = {
      loadTests: null,
      stressTests: null,
      monitoring: null,
      startTime: null,
      endTime: null
    };
    
    this.config = {
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
      wsUrl: process.env.TEST_WS_URL || 'ws://localhost:3002',
      outputDir: path.join(__dirname, 'test-results'),
      parallel: process.env.PARALLEL_TESTS === 'true'
    };
  }

  /**
   * Executa todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO SUITE COMPLETA DE TESTES DE PERFORMANCE');
    console.log('==================================================');
    console.log(`🌐 Base URL: ${this.config.baseUrl}`);
    console.log(`🔌 WebSocket URL: ${this.config.wsUrl}`);
    console.log(`📁 Diretório de Resultados: ${this.config.outputDir}`);
    console.log('');

    this.testResults.startTime = new Date().toISOString();
    
    try {
      // Criar diretório de resultados
      this.createOutputDirectory();
      
      // Verificar se o servidor está rodando
      await this.checkServerHealth();
      
      // Executar testes baseado na configuração
      if (this.config.parallel) {
        await this.runParallelTests();
      } else {
        await this.runSequentialTests();
      }
      
      // Gerar relatório consolidado
      await this.generateConsolidatedReport();
      
      // Limpar usuários de teste
      await this.cleanupTestUsers();
      
      console.log('\n✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
      
    } catch (error) {
      console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', error.message);
      process.exit(1);
    }
  }

  /**
   * Cria diretório de resultados
   */
  createOutputDirectory() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
      console.log(`📁 Diretório de resultados criado: ${this.config.outputDir}`);
    }
  }

  /**
   * Verifica se o servidor está rodando
   */
  async checkServerHealth() {
    console.log('🔍 Verificando saúde do servidor...');
    
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.config.baseUrl}/api/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Servidor está rodando e respondendo');
      } else {
        throw new Error(`Servidor retornou status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Servidor não está acessível: ${error.message}`);
    }
  }

  /**
   * Executa testes em paralelo
   */
  async runParallelTests() {
    console.log('🔄 Executando testes em paralelo...');
    
    const promises = [
      this.runLoadTests(),
      this.runStressTests(),
      this.runMonitoring()
    ];
    
    const results = await Promise.allSettled(promises);
    
    // Processar resultados
    results.forEach((result, index) => {
      const testNames = ['Load Tests', 'Stress Tests', 'Monitoring'];
      if (result.status === 'rejected') {
        console.error(`❌ ${testNames[index]} falhou:`, result.reason);
      } else {
        console.log(`✅ ${testNames[index]} concluído`);
      }
    });
  }

  /**
   * Executa testes sequencialmente
   */
  async runSequentialTests() {
    console.log('🔄 Executando testes sequencialmente...');
    
    try {
      // 1. Testes de Carga
      console.log('\n📊 === TESTES DE CARGA ===');
      this.testResults.loadTests = await this.runLoadTests();
      
      // 2. Monitoramento durante testes de estresse
      console.log('\n🔍 === INICIANDO MONITORAMENTO ===');
      const monitoringPromise = this.runMonitoring();
      
      // 3. Testes de Estresse
      console.log('\n🔥 === TESTES DE ESTRESSE ===');
      this.testResults.stressTests = await this.runStressTests();
      
      // 4. Parar monitoramento
      console.log('\n⏹️ === PARANDO MONITORAMENTO ===');
      this.testResults.monitoring = await monitoringPromise;
      
    } catch (error) {
      console.error('❌ Erro durante execução sequencial:', error);
      throw error;
    }
  }

  /**
   * Executa testes de carga
   */
  async runLoadTests() {
    return new Promise((resolve, reject) => {
      console.log('📊 Iniciando testes de carga...');
      
      const testProcess = spawn('node', [
        path.join(__dirname, 'load-testing.js')
      ], {
        env: {
          ...process.env,
          TEST_BASE_URL: this.config.baseUrl,
          TEST_WS_URL: this.config.wsUrl
        },
        stdio: 'inherit'
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Testes de carga concluídos');
          resolve({ status: 'success', exitCode: code });
        } else {
          console.error(`❌ Testes de carga falharam com código ${code}`);
          reject(new Error(`Load tests failed with code ${code}`));
        }
      });
      
      testProcess.on('error', (error) => {
        console.error('❌ Erro ao executar testes de carga:', error);
        reject(error);
      });
    });
  }

  /**
   * Executa testes de estresse
   */
  async runStressTests() {
    return new Promise((resolve, reject) => {
      console.log('🔥 Iniciando testes de estresse...');
      
      const testProcess = spawn('node', [
        path.join(__dirname, 'stress-test.js')
      ], {
        env: {
          ...process.env,
          TEST_BASE_URL: this.config.baseUrl,
          TEST_WS_URL: this.config.wsUrl
        },
        stdio: 'inherit'
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Testes de estresse concluídos');
          resolve({ status: 'success', exitCode: code });
        } else {
          console.error(`❌ Testes de estresse falharam com código ${code}`);
          reject(new Error(`Stress tests failed with code ${code}`));
        }
      });
      
      testProcess.on('error', (error) => {
        console.error('❌ Erro ao executar testes de estresse:', error);
        reject(error);
      });
    });
  }

  /**
   * Executa monitoramento de performance
   */
  async runMonitoring() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Iniciando monitoramento de performance...');
      
      const monitorProcess = spawn('node', [
        path.join(__dirname, 'performance-monitor.js')
      ], {
        stdio: 'inherit'
      });
      
      // Parar monitoramento após 10 minutos ou quando receber sinal
      const timeout = setTimeout(() => {
        monitorProcess.kill('SIGINT');
      }, 600000); // 10 minutos
      
      monitorProcess.on('close', (code) => {
        clearTimeout(timeout);
        console.log('✅ Monitoramento concluído');
        resolve({ status: 'success', exitCode: code });
      });
      
      monitorProcess.on('error', (error) => {
        clearTimeout(timeout);
        console.error('❌ Erro ao executar monitoramento:', error);
        reject(error);
      });
      
      // Capturar sinal para parar graciosamente
      process.on('SIGINT', () => {
        clearTimeout(timeout);
        monitorProcess.kill('SIGINT');
      });
    });
  }

  /**
   * Gera relatório consolidado
   */
  async generateConsolidatedReport() {
    console.log('\n📋 Gerando relatório consolidado...');
    
    this.testResults.endTime = new Date().toISOString();
    
    const report = {
      metadata: {
        testSuite: 'Performance Tests Suite',
        version: '1.0.0',
        startTime: this.testResults.startTime,
        endTime: this.testResults.endTime,
        duration: this.calculateDuration(),
        configuration: this.config
      },
      results: this.testResults,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };
    
    // Salvar relatório consolidado
    const reportPath = path.join(this.config.outputDir, 'consolidated-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório em HTML
    await this.generateHTMLReport(report);
    
    console.log(`📄 Relatório consolidado salvo em: ${reportPath}`);
    console.log(`🌐 Relatório HTML salvo em: ${path.join(this.config.outputDir, 'report.html')}`);
  }

  /**
   * Calcula duração total dos testes
   */
  calculateDuration() {
    if (!this.testResults.startTime || !this.testResults.endTime) {
      return 0;
    }
    
    const start = new Date(this.testResults.startTime);
    const end = new Date(this.testResults.endTime);
    return end - start;
  }

  /**
   * Gera resumo dos resultados
   */
  generateSummary() {
    const summary = {
      overallStatus: 'SUCCESS',
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      criticalIssues: 0,
      warnings: 0
    };
    
    // Analisar resultados de cada tipo de teste
    if (this.testResults.loadTests) {
      summary.totalTests++;
      if (this.testResults.loadTests.status === 'success') {
        summary.passedTests++;
      } else {
        summary.failedTests++;
        summary.overallStatus = 'PARTIAL';
      }
    }
    
    if (this.testResults.stressTests) {
      summary.totalTests++;
      if (this.testResults.stressTests.status === 'success') {
        summary.passedTests++;
      } else {
        summary.failedTests++;
        summary.overallStatus = 'PARTIAL';
      }
    }
    
    if (this.testResults.monitoring) {
      summary.totalTests++;
      if (this.testResults.monitoring.status === 'success') {
        summary.passedTests++;
      } else {
        summary.failedTests++;
        summary.overallStatus = 'PARTIAL';
      }
    }
    
    if (summary.failedTests > 0) {
      summary.overallStatus = 'FAILED';
    }
    
    return summary;
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Recomendações gerais
    recommendations.push('Implementar monitoramento contínuo de performance');
    recommendations.push('Configurar alertas para métricas críticas');
    recommendations.push('Executar testes de carga regularmente');
    
    // Recomendações específicas baseadas nos resultados
    if (this.testResults.stressTests && this.testResults.stressTests.status === 'success') {
      recommendations.push('Sistema demonstrou boa resistência ao estresse');
    } else {
      recommendations.push('Investigar e corrigir problemas de estresse identificados');
    }
    
    if (this.testResults.loadTests && this.testResults.loadTests.status === 'success') {
      recommendations.push('Sistema atende aos requisitos de carga normal');
    } else {
      recommendations.push('Otimizar sistema para melhorar performance sob carga');
    }
    
    return recommendations;
  }

  /**
   * Limpa usuários de teste após os testes
   */
  async cleanupTestUsers() {
    console.log('\n🧹 Limpando usuários de teste...');
    
    try {
      const cleanup = new TestUserCleanup({
        baseUrl: this.config.baseUrl
      });
      
      await cleanup.cleanup();
      console.log('✅ Limpeza de usuários de teste concluída');
      
    } catch (error) {
      console.log('⚠️ Erro durante limpeza de usuários de teste:', error.message);
      console.log('ℹ️ Você pode executar manualmente: npm run test:cleanup');
    }
  }

  /**
   * Gera relatório em HTML
   */
  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Performance - Surebets</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .recommendations { background: #e9ecef; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .recommendations ul { margin: 10px 0; }
        .recommendations li { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Relatório de Performance - Surebets</h1>
            <p>Executado em: ${new Date(report.metadata.startTime).toLocaleString('pt-BR')}</p>
            <p>Duração: ${Math.floor(report.metadata.duration / 1000)} segundos</p>
        </div>
        
        <div class="status ${report.summary.overallStatus === 'SUCCESS' ? 'success' : 'warning'}">
            <h2>Status Geral: ${report.summary.overallStatus}</h2>
            <p>Testes Executados: ${report.summary.totalTests} | 
               Sucessos: ${report.summary.passedTests} | 
               Falhas: ${report.summary.failedTests}</p>
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total de Testes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.passedTests}</div>
                <div class="metric-label">Testes Aprovados</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.failedTests}</div>
                <div class="metric-label">Testes Falharam</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.floor(report.metadata.duration / 1000)}s</div>
                <div class="metric-label">Duração Total</div>
            </div>
        </div>
        
        <div class="recommendations">
            <h3>💡 Recomendações</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema de Testes de Performance</p>
            <p>Versão: ${report.metadata.version}</p>
        </div>
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(this.config.outputDir, 'report.html');
    fs.writeFileSync(htmlPath, html);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = PerformanceTestRunner;
