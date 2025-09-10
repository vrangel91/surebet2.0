#!/usr/bin/env node

/**
 * Teste Rápido de Performance
 * Executa um teste simplificado para validar melhorias
 */

const { LoadTester } = require('./load-testing');

class QuickTester {
  constructor() {
    this.tester = new LoadTester({
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
      wsUrl: process.env.TEST_WS_URL || 'ws://localhost:3002'
    });
    
    // Configurar cenários de teste rápido
    this.tester.testScenarios = [
      { name: 'Teste Rápido', users: 3, duration: 15000, rampUp: 3000 }
    ];
  }

  /**
   * Executa teste rápido
   */
  async runQuickTest() {
    console.log('⚡ TESTE RÁPIDO DE PERFORMANCE');
    console.log('==============================');
    console.log('🎯 Objetivo: Validar melhorias implementadas');
    console.log('👥 Usuários: 3');
    console.log('⏱️ Duração: 15 segundos');
    console.log('📈 Ramp-up: 3 segundos');
    console.log('');

    try {
      // Executar apenas o primeiro cenário
      const scenario = this.tester.testScenarios[0];
      console.log('⏳ Aguardando execução dos usuários...');
      await this.tester.runScenario(scenario);
      
      // Aguardar um pouco mais para garantir que todas as métricas foram coletadas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar relatório simplificado
      this.generateQuickReport();
      
    } catch (error) {
      console.error('❌ Erro durante teste rápido:', error.message);
      process.exit(1);
    }
  }

  /**
   * Gera relatório rápido
   */
  generateQuickReport() {
    const metrics = this.tester.metrics;
    const errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
    const avgResponseTime = metrics.averageResponseTime;
    
    console.log('\n📊 RESULTADOS DO TESTE RÁPIDO');
    console.log('=============================');
    console.log(`📈 Total de Requisições: ${metrics.totalRequests}`);
    console.log(`✅ Sucessos: ${metrics.successfulRequests}`);
    console.log(`❌ Falhas: ${metrics.failedRequests}`);
    console.log(`📊 Taxa de Erro: ${errorRate.toFixed(2)}%`);
    console.log(`⏱️ Tempo Médio: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 RPS: ${(metrics.totalRequests / 15).toFixed(2)}`);
    
    // Avaliação rápida
    let status = '🟢 EXCELENTE';
    let score = 100;
    
    if (errorRate > 5) {
      status = '🔴 RUIM';
      score -= 50;
    } else if (errorRate > 1) {
      status = '🟡 BOM';
      score -= 20;
    }
    
    if (avgResponseTime > 1000) {
      status = '🔴 RUIM';
      score -= 30;
    } else if (avgResponseTime > 500) {
      score -= 15;
    }
    
    console.log(`\n🎯 Status: ${status} (${score}/100)`);
    
    // Recomendações rápidas
    if (errorRate > 10) {
      console.log('\n💡 RECOMENDAÇÕES:');
      console.log('1. Verificar se o servidor está rodando corretamente');
      console.log('2. Verificar logs do servidor para erros');
      console.log('3. Verificar se o banco de dados está acessível');
    } else if (errorRate > 1) {
      console.log('\n💡 RECOMENDAÇÕES:');
      console.log('1. Sistema melhorou, mas ainda há alguns erros');
      console.log('2. Continuar monitoramento');
    } else {
      console.log('\n✅ SISTEMA FUNCIONANDO BEM!');
      console.log('Pode executar testes completos: npm run test:performance');
    }
  }
}

// Executar teste rápido se chamado diretamente
if (require.main === module) {
  const quickTester = new QuickTester();
  quickTester.runQuickTest().catch(console.error);
}

module.exports = QuickTester;
