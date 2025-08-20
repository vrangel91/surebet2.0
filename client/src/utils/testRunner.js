/**
 * Executor Principal de Testes - Página de Ranking
 */

import { runAllTests as runRankingDebugTests } from './rankingDebug.js'
import { runAllAPITests } from './apiTest.js'
import { runAllDataTests } from './rankingDataTest.js'

/**
 * Executar todos os testes
 */
export async function runAllTests() {
  console.log('🚀 Executando todos os testes da página de ranking...')
  console.log('=' .repeat(60))
  
  const startTime = Date.now()
  
  try {
    // 1. Testes de debug do ranking
    console.log('\n📊 1. Testes de Debug do Ranking')
    console.log('-'.repeat(40))
    const rankingDebugResults = runRankingDebugTests()
    
    // 2. Testes da API
    console.log('\n🌐 2. Testes da API')
    console.log('-'.repeat(40))
    const apiResults = await runAllAPITests()
    
    // 3. Testes de dados da página
    console.log('\n📋 3. Testes de Dados da Página')
    console.log('-'.repeat(40))
    const dataResults = runAllDataTests()
    
    // Calcular tempo total
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Resumo dos resultados
    console.log('\n📋 RESUMO DOS TESTES')
    console.log('=' .repeat(60))
    
    const allResults = {
      rankingDebug: rankingDebugResults,
      api: apiResults,
      data: dataResults,
      totalTime
    }
    
    // Contar testes passados/falhados
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    
    Object.entries(allResults).forEach(([category, results]) => {
      if (category === 'totalTime') return
      
      console.log(`\n📊 ${category.toUpperCase()}:`)
      
      if (Array.isArray(results)) {
        // Para testes que retornam arrays
        results.forEach((result, index) => {
          totalTests++
          if (result.success) {
            passedTests++
            console.log(`  ✅ Teste ${index + 1}: Passou`)
          } else {
            failedTests++
            console.log(`  ❌ Teste ${index + 1}: Falhou - ${result.error || 'Erro desconhecido'}`)
          }
        })
      } else if (typeof results === 'object') {
        // Para testes que retornam objetos
        Object.entries(results).forEach(([testName, result]) => {
          totalTests++
          if (result.success) {
            passedTests++
            console.log(`  ✅ ${testName}: Passou`)
          } else {
            failedTests++
            console.log(`  ❌ ${testName}: Falhou - ${result.error || 'Erro desconhecido'}`)
          }
        })
      }
    })
    
    // Estatísticas finais
    console.log('\n📈 ESTATÍSTICAS FINAIS')
    console.log('-'.repeat(40))
    console.log(`⏱️  Tempo total: ${totalTime}ms`)
    console.log(`🧪 Total de testes: ${totalTests}`)
    console.log(`✅ Testes passados: ${passedTests}`)
    console.log(`❌ Testes falhados: ${failedTests}`)
    console.log(`📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES')
    console.log('-'.repeat(40))
    
    if (failedTests === 0) {
      console.log('🎉 Todos os testes passaram! A página de ranking está funcionando perfeitamente.')
    } else {
      console.log('⚠️  Alguns testes falharam. Verifique os logs acima para identificar os problemas.')
      
      if (apiResults.connectivity && !apiResults.connectivity.success) {
        console.log('🔧 Problema: API não está acessível. Verifique a conectividade de rede.')
      }
      
      if (apiResults.endpoint && !apiResults.endpoint.success) {
        console.log('🔧 Problema: Endpoint da API não está funcionando. Verifique a URL e autenticação.')
      }
      
      if (dataResults.dataLoading && !dataResults.dataLoading.success) {
        console.log('🔧 Problema: Dados não estão sendo carregados na página. Verifique o processamento de dados.')
      }
      
      if (dataResults.chartRendering && !dataResults.chartRendering.success) {
        console.log('🔧 Problema: Gráficos não estão sendo renderizados. Verifique a biblioteca Chart.js.')
      }
    }
    
    return allResults
    
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error)
    return {
      success: false,
      error: error.message,
      totalTime: Date.now() - startTime
    }
  }
}

/**
 * Teste rápido para verificação básica
 */
export async function quickTest() {
  console.log('⚡ Teste rápido da página de ranking...')
  
  try {
    // Verificar se a página está carregada
    const rankingContainer = document.querySelector('.ranking-container')
    if (!rankingContainer) {
      console.error('❌ Página de ranking não encontrada')
      return { success: false, error: 'page_not_found' }
    }
    
    // Verificar se há dados básicos
    const statsSection = document.querySelector('.stats-section')
    if (!statsSection) {
      console.error('❌ Seção de estatísticas não encontrada')
      return { success: false, error: 'stats_not_found' }
    }
    
    // Verificar se há dados na tabela
    const tableRows = document.querySelectorAll('.ranking-table tbody tr')
    if (tableRows.length === 0) {
      console.error('❌ Nenhum dado na tabela de ranking')
      return { success: false, error: 'no_table_data' }
    }
    
    console.log('✅ Teste rápido passou - página está funcionando')
    return { 
      success: true, 
      statsFound: true, 
      tableRows: tableRows.length 
    }
    
  } catch (error) {
    console.error('❌ Erro no teste rápido:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Teste específico para problemas de dados
 */
export function testDataIssues() {
  console.log('🔍 Investigando problemas de dados...')
  
  try {
    // Verificar se há dados no Vue
    const vueApp = document.querySelector('#app')
    if (!vueApp) {
      console.error('❌ Aplicação Vue não encontrada')
      return { success: false, error: 'vue_app_not_found' }
    }
    
    // Verificar se há dados no localStorage
    const cachedData = localStorage.getItem('ranking_cache')
    if (cachedData) {
      console.log('📊 Dados em cache encontrados:', JSON.parse(cachedData))
    } else {
      console.log('⚠️ Nenhum dado em cache encontrado')
    }
    
    // Verificar se há dados no IndexedDB
    if ('indexedDB' in window) {
      console.log('💾 IndexedDB disponível')
    } else {
      console.log('⚠️ IndexedDB não disponível')
    }
    
    // Verificar se há erros no console
    console.log('🔍 Verifique o console para erros JavaScript')
    
    return { success: true, message: 'Verificação de dados concluída' }
    
  } catch (error) {
    console.error('❌ Erro ao investigar problemas de dados:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Gerar relatório de testes
 */
export function generateTestReport(results) {
  console.log('\n📄 RELATÓRIO DE TESTES')
  console.log('=' .repeat(60))
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0
    },
    details: {},
    recommendations: []
  }
  
  // Processar resultados
  Object.entries(results).forEach(([category, categoryResults]) => {
    if (category === 'totalTime') return
    
    report.details[category] = categoryResults
    
    if (Array.isArray(categoryResults)) {
      categoryResults.forEach(result => {
        report.summary.totalTests++
        if (result.success) {
          report.summary.passedTests++
        } else {
          report.summary.failedTests++
        }
      })
    } else if (typeof categoryResults === 'object') {
      Object.values(categoryResults).forEach(result => {
        if (result && typeof result === 'object' && 'success' in result) {
          report.summary.totalTests++
          if (result.success) {
            report.summary.passedTests++
          } else {
            report.summary.failedTests++
          }
        }
      })
    }
  })
  
  // Calcular taxa de sucesso
  report.summary.successRate = report.summary.totalTests > 0 
    ? (report.summary.passedTests / report.summary.totalTests) * 100 
    : 0
  
  // Gerar recomendações
  if (report.summary.failedTests === 0) {
    report.recommendations.push('🎉 Todos os testes passaram! A página está funcionando perfeitamente.')
  } else {
    report.recommendations.push('⚠️ Alguns testes falharam. Verifique os logs para identificar problemas.')
    
    if (results.api && results.api.connectivity && !results.api.connectivity.success) {
      report.recommendations.push('🔧 Verifique a conectividade com a API externa.')
    }
    
    if (results.data && results.data.dataLoading && !results.data.dataLoading.success) {
      report.recommendations.push('🔧 Verifique o carregamento e processamento de dados.')
    }
  }
  
  // Exibir relatório
  console.log(`📅 Data/Hora: ${report.timestamp}`)
  console.log(`📊 Total de Testes: ${report.summary.totalTests}`)
  console.log(`✅ Testes Passados: ${report.summary.passedTests}`)
  console.log(`❌ Testes Falhados: ${report.summary.failedTests}`)
  console.log(`📈 Taxa de Sucesso: ${report.summary.successRate.toFixed(1)}%`)
  
  console.log('\n💡 Recomendações:')
  report.recommendations.forEach(rec => console.log(`  ${rec}`))
  
  return report
}

// Executar testes automaticamente se importado diretamente
if (typeof window !== 'undefined') {
  // Estamos no navegador
  window.testRunner = {
    runAllTests,
    quickTest,
    testDataIssues,
    generateTestReport
  }
  
  console.log('🔧 Test Runner disponível em window.testRunner')
  console.log('💡 Use window.testRunner.quickTest() para um teste rápido')
  console.log('💡 Use window.testRunner.runAllTests() para todos os testes')
}
