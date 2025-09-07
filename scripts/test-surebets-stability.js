/**
 * Script para testar estabilidade das surebets
 * Verifica se as surebets aparecem e desaparecem
 */

const axios = require('axios');

class SurebetsStabilityTester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = [];
    this.testDuration = 60000; // 1 minuto
    this.checkInterval = 5000; // 5 segundos
  }

  /**
   * Testa estabilidade das surebets
   */
  async testStability() {
    console.log('🧪 Testando Estabilidade das Surebets');
    console.log('='.repeat(50));
    console.log(`⏱️ Duração: ${this.testDuration / 1000} segundos`);
    console.log(`🔄 Intervalo: ${this.checkInterval / 1000} segundos`);
    console.log('');

    const startTime = Date.now();
    let checkCount = 0;
    let lastCount = 0;
    let disappearingCount = 0;
    let appearingCount = 0;

    const interval = setInterval(async () => {
      checkCount++;
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      try {
        const response = await axios.get(`${this.baseURL}/api/surebets`, {
          timeout: 5000
        });

        const data = response.data;
        const currentCount = data.success ? data.data.surebets?.length || 0 : 0;

        // Verificar se as surebets desapareceram
        if (lastCount > 0 && currentCount === 0) {
          disappearingCount++;
          console.log(`❌ [${checkCount}] Surebets desapareceram! (${lastCount} → 0)`);
        }
        // Verificar se as surebets apareceram
        else if (lastCount === 0 && currentCount > 0) {
          appearingCount++;
          console.log(`✅ [${checkCount}] Surebets apareceram! (0 → ${currentCount})`);
        }
        // Verificar mudanças significativas
        else if (Math.abs(currentCount - lastCount) > 10) {
          console.log(`🔄 [${checkCount}] Mudança significativa: ${lastCount} → ${currentCount}`);
        }

        // Log periódico
        if (checkCount % 6 === 0) { // A cada 30 segundos
          console.log(`📊 [${checkCount}] Count: ${currentCount}, Cache: ${data.cached ? 'Sim' : 'Não'}, Source: ${data.source || 'N/A'}`);
        }

        lastCount = currentCount;

        // Armazenar resultado
        this.results.push({
          check: checkCount,
          timestamp: new Date().toISOString(),
          count: currentCount,
          cached: data.cached,
          source: data.source,
          elapsed: elapsed
        });

      } catch (error) {
        console.log(`❌ [${checkCount}] Erro: ${error.message}`);
        this.results.push({
          check: checkCount,
          timestamp: new Date().toISOString(),
          error: error.message,
          elapsed: elapsed
        });
      }

      // Parar após o tempo definido
      if (elapsed >= this.testDuration) {
        clearInterval(interval);
        this.generateReport(disappearingCount, appearingCount);
      }
    }, this.checkInterval);
  }

  /**
   * Gera relatório final
   */
  generateReport(disappearingCount, appearingCount) {
    console.log('\n📋 RELATÓRIO DE ESTABILIDADE');
    console.log('='.repeat(50));

    const totalChecks = this.results.length;
    const successfulChecks = this.results.filter(r => !r.error).length;
    const errorChecks = this.results.filter(r => r.error).length;

    console.log(`🔍 Total de verificações: ${totalChecks}`);
    console.log(`✅ Verificações bem-sucedidas: ${successfulChecks}`);
    console.log(`❌ Verificações com erro: ${errorChecks}`);
    console.log(`👻 Surebets desapareceram: ${disappearingCount} vezes`);
    console.log(`✨ Surebets apareceram: ${appearingCount} vezes`);

    // Análise de estabilidade
    const counts = this.results.filter(r => r.count !== undefined).map(r => r.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;

    console.log('\n📊 ESTATÍSTICAS DE CONTAGEM');
    console.log(`📉 Mínimo: ${minCount}`);
    console.log(`📈 Máximo: ${maxCount}`);
    console.log(`📊 Média: ${avgCount.toFixed(1)}`);

    // Verificar estabilidade
    const isStable = disappearingCount === 0 && appearingCount <= 1;
    const stabilityScore = Math.max(0, 100 - (disappearingCount * 20) - (appearingCount * 10));

    console.log('\n🎯 AVALIAÇÃO DE ESTABILIDADE');
    console.log(`📊 Pontuação: ${stabilityScore}/100`);

    if (isStable) {
      console.log('✅ SISTEMA ESTÁVEL: Surebets não estão desaparecendo');
    } else if (disappearingCount > 0) {
      console.log('❌ SISTEMA INSTÁVEL: Surebets estão desaparecendo');
    } else {
      console.log('⚠️ SISTEMA PARCIALMENTE ESTÁVEL: Algumas flutuações detectadas');
    }

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES');
    if (disappearingCount > 0) {
      console.log('🔧 Verificar limpeza de cache no scheduler');
      console.log('🔧 Verificar processamento de dados da API');
      console.log('🔧 Verificar fallbacks na rota da API');
    }
    if (errorChecks > totalChecks * 0.1) {
      console.log('🔧 Verificar conectividade com o servidor');
      console.log('🔧 Verificar logs de erro do servidor');
    }
    if (stabilityScore < 70) {
      console.log('🔧 Considerar aumentar TTL do cache');
      console.log('🔧 Considerar implementar cache persistente');
    }

    return {
      totalChecks,
      successfulChecks,
      errorChecks,
      disappearingCount,
      appearingCount,
      minCount,
      maxCount,
      avgCount,
      stabilityScore,
      isStable
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const tester = new SurebetsStabilityTester();
  tester.testStability().catch(console.error);
}

module.exports = { SurebetsStabilityTester };
