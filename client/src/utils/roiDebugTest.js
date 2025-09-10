/**
 * Teste específico para debugar o problema do ROI
 * Este arquivo foca em identificar por que o ROI está aparecendo como 0,00%
 */

import { testSurebets } from './rankingTest.js'

// Função para simular exatamente o que acontece no componente
export function debugROIProblem() {
  console.log('🔍 DEBUG: Investigando problema do ROI...')
  console.log('=' .repeat(60))
  
  // Simular o estado inicial do componente
  let bookmakersStats = []
  let totalSurebets = 0
  let uniqueBookmakers = 0
  let totalProfit = 0
  let averageROI = 0
  
  console.log('📊 Estado inicial:')
  console.log(`   bookmakersStats: ${bookmakersStats.length} items`)
  console.log(`   totalSurebets: ${totalSurebets}`)
  console.log(`   uniqueBookmakers: ${uniqueBookmakers}`)
  console.log(`   totalProfit: ${totalProfit}`)
  console.log(`   averageROI: ${averageROI}`)
  
  console.log('')
  console.log('🔄 Simulando processamento dos surebets...')
  
  // Simular o processamento exato do componente
  const bookmakerStats = {}
  
  testSurebets.forEach((surebet, index) => {
    console.log(`\n🔍 Processando surebet ${index + 1}: ${surebet.id}`)
    console.log(`   Dados originais:`)
    console.log(`     bookmaker1: "${surebet.bookmaker1}"`)
    console.log(`     bookmaker2: "${surebet.bookmaker2}"`)
    console.log(`     profit: ${surebet.profit} (${typeof surebet.profit})`)
    console.log(`     roi: ${surebet.roi} (${typeof surebet.roi})`)
    
    // Processar bookmaker1
    if (surebet.bookmaker1) {
      const bookmaker = surebet.bookmaker1.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
          console.log(`   ✅ Criado novo bookmaker: ${bookmaker}`)
        }
        
        bookmakerStats[bookmaker].count++
        console.log(`   📈 Count atualizado para ${bookmaker}: ${bookmakerStats[bookmaker].count}`)
        
        // Verificar valores antes da validação
        console.log(`   🔍 Valores antes da validação:`)
        console.log(`     profit original: ${surebet.profit} (${typeof surebet.profit})`)
        console.log(`     roi original: ${surebet.roi} (${typeof surebet.roi})`)
        
        // Garantir que os valores são números válidos
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        
        console.log(`   ✅ Valores após validação:`)
        console.log(`     validProfit: ${validProfit} (${typeof validProfit})`)
        console.log(`     validROI: ${validROI} (${typeof validROI})`)
        
        // Verificar se a validação está funcionando
        if (validProfit !== surebet.profit) {
          console.log(`   ⚠️ ATENÇÃO: profit foi alterado de ${surebet.profit} para ${validProfit}`)
        }
        if (validROI !== surebet.roi) {
          console.log(`   ⚠️ ATENÇÃO: roi foi alterado de ${surebet.roi} para ${validROI}`)
        }
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        console.log(`   📊 Totais acumulados para ${bookmaker}:`)
        console.log(`     totalProfit: ${bookmakerStats[bookmaker].totalProfit}`)
        console.log(`     totalROI: ${bookmakerStats[bookmaker].totalROI}`)
        
        // Calcular médias
        bookmakerStats[bookmaker].averageProfit = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalProfit / bookmakerStats[bookmaker].count : 0
        bookmakerStats[bookmaker].averageROI = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalROI / bookmakerStats[bookmaker].count : 0
        
        console.log(`   🧮 Médias calculadas para ${bookmaker}:`)
        console.log(`     averageProfit: ${bookmakerStats[bookmaker].averageProfit}`)
        console.log(`     averageROI: ${bookmakerStats[bookmaker].averageROI}`)
        
        // Verificar se as médias são válidas
        if (isNaN(bookmakerStats[bookmaker].averageProfit) || bookmakerStats[bookmaker].averageProfit === Infinity || bookmakerStats[bookmaker].averageProfit === -Infinity) {
          console.log(`   ⚠️ PROBLEMA: averageProfit inválido: ${bookmakerStats[bookmaker].averageProfit}`)
          bookmakerStats[bookmaker].averageProfit = 0
        }
        if (isNaN(bookmakerStats[bookmaker].averageROI) || bookmakerStats[bookmaker].averageROI === Infinity || bookmakerStats[bookmaker].averageROI === -Infinity) {
          console.log(`   ⚠️ PROBLEMA: averageROI inválido: ${bookmakerStats[bookmaker].averageROI}`)
          bookmakerStats[bookmaker].averageROI = 0
        }
        
        console.log(`   ✅ Médias finais para ${bookmaker}:`)
        console.log(`     averageProfit: ${bookmakerStats[bookmaker].averageProfit}`)
        console.log(`     averageROI: ${bookmakerStats[bookmaker].averageROI}`)
      }
    }
    
    // Processar bookmaker2 se existir
    if (surebet.bookmaker2 && surebet.bookmaker2.trim()) {
      const bookmaker = surebet.bookmaker2.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
          console.log(`   ✅ Criado novo bookmaker2: ${bookmaker}`)
        }
        
        bookmakerStats[bookmaker].count++
        
        // Garantir que os valores são números válidos
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        // Calcular médias
        bookmakerStats[bookmaker].averageProfit = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalProfit / bookmakerStats[bookmaker].count : 0
        bookmakerStats[bookmaker].averageROI = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalROI / bookmakerStats[bookmaker].count : 0
        
        // Verificar se as médias são válidas
        if (isNaN(bookmakerStats[bookmaker].averageProfit) || bookmakerStats[bookmaker].averageProfit === Infinity || bookmakerStats[bookmaker].averageProfit === -Infinity) {
          bookmakerStats[bookmaker].averageProfit = 0
        }
        if (isNaN(bookmakerStats[bookmaker].averageROI) || bookmakerStats[bookmaker].averageROI === Infinity || bookmakerStats[bookmaker].averageROI === -Infinity) {
          bookmakerStats[bookmaker].averageROI = 0
        }
        
        console.log(`   📊 Estatísticas para bookmaker2 ${bookmaker}:`)
        console.log(`     count: ${bookmakerStats[bookmaker].count}`)
        console.log(`     totalProfit: ${bookmakerStats[bookmaker].totalProfit}`)
        console.log(`     totalROI: ${bookmakerStats[bookmaker].totalROI}`)
        console.log(`     averageProfit: ${bookmakerStats[bookmaker].averageProfit}`)
        console.log(`     averageROI: ${bookmakerStats[bookmaker].averageROI}`)
      }
    }
  })
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 RESULTADOS FINAIS DO DEBUG:')
  console.log('=' .repeat(60))
  
  // Converter para array e ordenar
  const finalStats = Object.values(bookmakerStats).sort((a, b) => b.count - a.count)
  
  finalStats.forEach((stats, index) => {
    console.log(`\n🏆 ${index + 1}º Lugar: ${stats.name}`)
    console.log(`   Count: ${stats.count}`)
    console.log(`   Total Profit: ${stats.totalProfit}`)
    console.log(`   Total ROI: ${stats.totalROI}`)
    console.log(`   Average Profit: ${stats.averageProfit}`)
    console.log(`   Average ROI: ${stats.averageROI}`)
    
    // Verificar se há problemas
    if (stats.averageROI === 0 && stats.totalROI > 0) {
      console.log(`   ⚠️ PROBLEMA IDENTIFICADO: averageROI é 0 mas totalROI é ${stats.totalROI}`)
    }
    
    if (stats.averageProfit === 0 && stats.totalProfit > 0) {
      console.log(`   ⚠️ PROBLEMA IDENTIFICADO: averageProfit é 0 mas totalProfit é ${stats.totalProfit}`)
    }
    
    // Testar formatação
    const formattedROI = formatROI(stats.averageROI)
    const formattedProfit = formatCurrency(stats.averageProfit)
    
    console.log(`   Formatação:`)
    console.log(`     ROI formatado: ${formattedROI}%`)
    console.log(`     Profit formatado: ${formattedProfit}`)
  })
  
  // Atualizar variáveis do componente
  bookmakersStats = finalStats
  totalSurebets = testSurebets.length
  uniqueBookmakers = finalStats.length
  totalProfit = finalStats.reduce((sum, stats) => sum + stats.totalProfit, 0)
  averageROI = finalStats.reduce((sum, stats) => sum + stats.totalROI, 0) / totalSurebets
  
  console.log('\n' + '=' .repeat(60))
  console.log('📈 ESTATÍSTICAS GERAIS:')
  console.log('=' .repeat(60))
  console.log(`   Total Surebets: ${totalSurebets}`)
  console.log(`   Unique Bookmakers: ${uniqueBookmakers}`)
  console.log(`   Total Profit: ${totalProfit}`)
  console.log(`   Average ROI: ${averageROI}`)
  
  return {
    bookmakersStats: finalStats,
    totalSurebets,
    uniqueBookmakers,
    totalProfit,
    averageROI
  }
}

// Função para testar especificamente a formatação do ROI
export function testROIFormatting() {
  console.log('🧪 Testando especificamente a formatação do ROI...')
  console.log('=' .repeat(60))
  
  const testValues = [
    { value: 3.2, expected: '3.20' },
    { value: 2.8, expected: '2.80' },
    { value: 4.1, expected: '4.10' },
    { value: 4.8, expected: '4.80' },
    { value: 3.5, expected: '3.50' },
    { value: 0, expected: '0.00' },
    { value: null, expected: '0.00' },
    { value: undefined, expected: '0.00' },
    { value: 'invalid', expected: '0.00' },
    { value: Infinity, expected: '0.00' },
    { value: -Infinity, expected: '0.00' }
  ]
  
  testValues.forEach(({ value, expected }) => {
    const result = formatROI(value)
    const status = result === expected ? '✅' : '❌'
    console.log(`${status} Input: ${value} (${typeof value}) -> Output: ${result} | Expected: ${expected}`)
  })
  
  console.log('=' .repeat(60))
}

// Função para testar o cálculo matemático do ROI
export function testROICalculation() {
  console.log('🧪 Testando cálculos matemáticos do ROI...')
  console.log('=' .repeat(60))
  
  // Simular dados de um bookmaker
  const testCases = [
    {
      name: 'Bet365',
      surebets: [
        { roi: 3.2, profit: 15.50 },
        { roi: 2.8, profit: 12.80 },
        { roi: 3.5, profit: 16.75 }
      ]
    },
    {
      name: 'William Hill',
      surebets: [
        { roi: 4.1, profit: 18.20 }
      ]
    },
    {
      name: 'Betfair',
      surebets: [
        { roi: 4.8, profit: 22.10 },
        { roi: 4.3, profit: 19.80 }
      ]
    }
  ]
  
  testCases.forEach(testCase => {
    console.log(`\n🔍 Testando ${testCase.name}:`)
    
    const totalROI = testCase.surebets.reduce((sum, surebet) => sum + surebet.roi, 0)
    const count = testCase.surebets.length
    const averageROI = count > 0 ? totalROI / count : 0
    
    console.log(`   Surebets: ${count}`)
    console.log(`   ROIs individuais: ${testCase.surebets.map(s => s.roi).join(', ')}`)
    console.log(`   Total ROI: ${totalROI}`)
    console.log(`   Cálculo: ${totalROI} / ${count} = ${averageROI}`)
    console.log(`   Average ROI: ${averageROI}`)
    
    // Verificar se o cálculo está correto
    const expectedAverage = testCase.surebets.reduce((sum, surebet) => sum + surebet.roi, 0) / testCase.surebets.length
    const isCorrect = Math.abs(averageROI - expectedAverage) < 0.001
    
    console.log(`   ✅ Cálculo correto: ${isCorrect ? 'SIM' : 'NÃO'}`)
  })
  
  console.log('=' .repeat(60))
}

// Função de formatação do ROI (simulando a do componente)
function formatROI(value) {
  // Verificar se o valor é válido
  if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
    return '0.00'
  }
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Verificar novamente se é um número válido
  if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
    return '0.00'
  }
  
  return numValue.toFixed(2)
}

// Função de formatação de moeda (simulando a do componente)
function formatCurrency(value) {
  // Verificar se o valor é válido
  if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
    return 'R$ 0,00'
  }
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Verificar novamente se é um número válido
  if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue)
}

// Função principal para executar todos os testes de debug
export function runROIDebugTests() {
  console.log('🚀 Iniciando testes de debug do ROI...')
  console.log('=' .repeat(80))
  
  // Teste 1: Debug completo do problema
  console.log('🧪 TESTE 1: Debug completo do problema do ROI')
  console.log('-' .repeat(50))
  const debugResults = debugROIProblem()
  
  console.log('\n' + '=' .repeat(80))
  
  // Teste 2: Formatação do ROI
  console.log('🧪 TESTE 2: Formatação do ROI')
  console.log('-' .repeat(50))
  testROIFormatting()
  
  console.log('\n' + '=' .repeat(80))
  
  // Teste 3: Cálculos matemáticos
  console.log('🧪 TESTE 3: Cálculos matemáticos do ROI')
  console.log('-' .repeat(50))
  testROICalculation()
  
  console.log('\n' + '=' .repeat(80))
  console.log('✅ Todos os testes de debug concluídos!')
  
  return debugResults
}

// Exportar para uso em outros arquivos
export default {
  debugROIProblem,
  testROIFormatting,
  testROICalculation,
  runROIDebugTests
}
