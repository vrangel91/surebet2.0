/**
 * Teste para verificar o cálculo do ROI Médio Ponderado
 * 
 * Fórmula: ROI_médio = (Lucro Total / Investimento Total) × 100
 */

// Dados de teste com diferentes cenários de ROI
const testSurebets = [
  // Cenário 1: Surebets com investimentos diferentes
  {
    id: 'surebet_001',
    bookmaker1: 'Bet365',
    bookmaker2: 'William Hill',
    profit: 15.50,
    roi: 3.2,
    stake: 100, // Investimento R$100
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'Resultado Final',
    odds1: 2.10,
    odds2: 1.85,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'surebet_002',
    bookmaker1: 'Bet365',
    bookmaker2: 'Unibet',
    profit: 25.60,
    roi: 2.8,
    stake: 200, // Investimento R$200
    sport: 'Futebol',
    event: 'Manchester United vs Liverpool',
    market: 'Resultado Final',
    odds1: 1.95,
    odds2: 2.05,
    createdAt: '2024-01-14T15:30:00Z'
  },
  {
    id: 'surebet_003',
    bookmaker1: 'William Hill',
    bookmaker2: 'Betfair',
    profit: 8.20,
    roi: 4.1,
    stake: 50, // Investimento R$50
    sport: 'Futebol',
    event: 'Real Madrid vs Barcelona',
    market: 'Resultado Final',
    odds1: 2.20,
    odds2: 1.75,
    createdAt: '2024-01-13T09:15:00Z'
  }
]

// Função para calcular ROI Médio Ponderado
function calculateWeightedROI(surebets) {
  const totalProfit = surebets.reduce((sum, surebet) => {
    const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
    return sum + validProfit
  }, 0)
  
  const totalInvestment = surebets.reduce((sum, surebet) => {
    const validStake = isNaN(surebet.stake) || surebet.stake === null || surebet.stake === undefined ? 100 : parseFloat(surebet.stake)
    return sum + validStake
  }, 0)
  
  if (totalInvestment > 0) {
    return (totalProfit / totalInvestment) * 100
  } else {
    return 0
  }
}

// Função para calcular ROI Médio Simples (método antigo)
function calculateSimpleROI(surebets) {
  const totalROI = surebets.reduce((sum, surebet) => {
    const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
    return sum + validROI
  }, 0)
  
  return surebets.length > 0 ? totalROI / surebets.length : 0
}

// Função para processar estatísticas dos bookmakers
function processBookmakerStats(surebets) {
  const bookmakerStats = {}
  
  surebets.forEach(surebet => {
    // Processar bookmaker1
    if (surebet.bookmaker1) {
      const bookmaker = surebet.bookmaker1.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            totalInvestment: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        const validStake = isNaN(surebet.stake) || surebet.stake === null || surebet.stake === undefined ? 100 : parseFloat(surebet.stake)
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].totalInvestment += validStake
        bookmakerStats[bookmaker].surebets.push(surebet)
      }
    }
    
    // Processar bookmaker2
    if (surebet.bookmaker2 && surebet.bookmaker2.trim()) {
      const bookmaker = surebet.bookmaker2.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            totalInvestment: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        const validStake = isNaN(surebet.stake) || surebet.stake === null || surebet.stake === undefined ? 100 : parseFloat(surebet.stake)
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].totalInvestment += validStake
        bookmakerStats[bookmaker].surebets.push(surebet)
      }
    }
  })
  
  // Calcular médias para cada bookmaker
  Object.values(bookmakerStats).forEach(stats => {
    if (stats.count > 0) {
      stats.averageProfit = stats.totalProfit / stats.count
      
      // ROI Médio Ponderado
      if (stats.totalInvestment > 0) {
        stats.averageROI = (stats.totalProfit / stats.totalInvestment) * 100
      } else {
        stats.averageROI = 0
      }
      
      // ROI Médio Simples (para comparação)
      stats.simpleAverageROI = stats.totalROI / stats.count
    } else {
      stats.averageProfit = 0
      stats.averageROI = 0
      stats.simpleAverageROI = 0
    }
  })
  
  return bookmakerStats
}

// Função principal de teste
export function runWeightedROITests() {
  console.log('🧮 Testando cálculo do ROI Médio Ponderado...')
  console.log('=' * 60)
  
  // Teste 1: Cálculo global
  console.log('📊 Teste 1: Cálculo Global')
  const weightedROI = calculateWeightedROI(testSurebets)
  const simpleROI = calculateSimpleROI(testSurebets)
  
  console.log('Dados de teste:')
  testSurebets.forEach((surebet, index) => {
    console.log(`  Surebet ${index + 1}: Lucro R$${surebet.profit}, Investimento R$${surebet.stake}, ROI ${surebet.roi}%`)
  })
  
  console.log('\nResultados:')
  console.log(`  ROI Médio Ponderado: ${weightedROI.toFixed(4)}%`)
  console.log(`  ROI Médio Simples: ${simpleROI.toFixed(4)}%`)
  
  // Verificar se o cálculo está correto
  const expectedWeightedROI = ((15.50 + 25.60 + 8.20) / (100 + 200 + 50)) * 100
  console.log(`  ROI Esperado: ${expectedWeightedROI.toFixed(4)}%`)
  console.log(`  ✅ Cálculo correto: ${Math.abs(weightedROI - expectedWeightedROI) < 0.01}`)
  
  console.log('\n' + '=' * 60)
  
  // Teste 2: Estatísticas por bookmaker
  console.log('📊 Teste 2: Estatísticas por Bookmaker')
  const bookmakerStats = processBookmakerStats(testSurebets)
  
  Object.entries(bookmakerStats).forEach(([name, stats]) => {
    console.log(`\n${name}:`)
    console.log(`  Contagem: ${stats.count}`)
    console.log(`  Lucro Total: R$${stats.totalProfit.toFixed(2)}`)
    console.log(`  Investimento Total: R$${stats.totalInvestment.toFixed(2)}`)
    console.log(`  ROI Médio Ponderado: ${stats.averageROI.toFixed(4)}%`)
    console.log(`  ROI Médio Simples: ${stats.simpleAverageROI.toFixed(4)}%`)
    
    // Verificar se o cálculo está correto
    const expectedROI = stats.totalInvestment > 0 ? (stats.totalProfit / stats.totalInvestment) * 100 : 0
    console.log(`  ROI Esperado: ${expectedROI.toFixed(4)}%`)
    console.log(`  ✅ Cálculo correto: ${Math.abs(stats.averageROI - expectedROI) < 0.01}`)
  })
  
  console.log('\n' + '=' * 60)
  
  // Teste 3: Comparação dos métodos
  console.log('📊 Teste 3: Comparação dos Métodos')
  console.log('Diferenças entre ROI Médio Ponderado e Simples:')
  
  Object.entries(bookmakerStats).forEach(([name, stats]) => {
    const difference = stats.averageROI - stats.simpleAverageROI
    console.log(`  ${name}: ${difference.toFixed(4)}% (${difference > 0 ? 'Ponderado maior' : 'Simples maior'})`)
  })
  
  console.log('\n✅ Testes do ROI Médio Ponderado concluídos!')
}

// Função para testar cenários específicos
export function testSpecificScenarios() {
  console.log('🎯 Testando cenários específicos...')
  
  // Cenário: Investimentos muito diferentes
  const highVarianceSurebets = [
    { profit: 5, stake: 50, roi: 10 },   // ROI 10%, investimento pequeno
    { profit: 100, stake: 1000, roi: 10 }, // ROI 10%, investimento grande
  ]
  
  const weightedROI = calculateWeightedROI(highVarianceSurebets)
  const simpleROI = calculateSimpleROI(highVarianceSurebets)
  
  console.log('Cenário: Investimentos muito diferentes')
  console.log(`  ROI Médio Ponderado: ${weightedROI.toFixed(4)}%`)
  console.log(`  ROI Médio Simples: ${simpleROI.toFixed(4)}%`)
  console.log(`  Diferença: ${(weightedROI - simpleROI).toFixed(4)}%`)
  
  // Cenário: Investimentos iguais
  const equalInvestmentSurebets = [
    { profit: 10, stake: 100, roi: 10 },
    { profit: 20, stake: 100, roi: 20 },
  ]
  
  const weightedROI2 = calculateWeightedROI(equalInvestmentSurebets)
  const simpleROI2 = calculateSimpleROI(equalInvestmentSurebets)
  
  console.log('\nCenário: Investimentos iguais')
  console.log(`  ROI Médio Ponderado: ${weightedROI2.toFixed(4)}%`)
  console.log(`  ROI Médio Simples: ${simpleROI2.toFixed(4)}%`)
  console.log(`  Diferença: ${(weightedROI2 - simpleROI2).toFixed(4)}%`)
}
