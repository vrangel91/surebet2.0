/**
 * Debug e Testes para a Página de Ranking
 */

// Dados de teste para simular a API
export const testSurebetsData = [
  {
    id: 'test_surebet_001',
    bookmaker1: 'Bet365',
    bookmaker2: 'William Hill',
    profit: 15.50,
    roi: 3.2,
    createdAt: '2024-01-15T10:00:00Z',
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'Resultado Final'
  },
  {
    id: 'test_surebet_002',
    bookmaker1: 'Bet365',
    bookmaker2: 'Unibet',
    profit: 12.80,
    roi: 2.8,
    createdAt: '2024-01-14T15:30:00Z',
    sport: 'Futebol',
    event: 'Manchester United vs Liverpool',
    market: 'Resultado Final'
  },
  {
    id: 'test_surebet_003',
    bookmaker1: 'William Hill',
    bookmaker2: 'Betfair',
    profit: 18.20,
    roi: 4.1,
    createdAt: '2024-01-13T09:15:00Z',
    sport: 'Futebol',
    event: 'Real Madrid vs Barcelona',
    market: 'Resultado Final'
  },
  {
    id: 'test_surebet_004',
    bookmaker1: 'Betfair',
    bookmaker2: 'Unibet',
    profit: 22.10,
    roi: 4.8,
    createdAt: '2024-01-12T14:20:00Z',
    sport: 'Futebol',
    event: 'Bayern Munich vs Borussia Dortmund',
    market: 'Resultado Final'
  },
  {
    id: 'test_surebet_005',
    bookmaker1: 'Bet365',
    bookmaker2: 'Betfair',
    profit: 16.75,
    roi: 3.5,
    createdAt: '2024-01-11T09:45:00Z',
    sport: 'Futebol',
    event: 'PSG vs Marseille',
    market: 'Resultado Final'
  }
]

// Dados de teste da API real (formato esperado)
export const testAPIData = {
  "surebet_test_001": [
    {
      "house": "Bet365",
      "profit": 15.50,
      "roi": 3.2,
      "timestamp": "2024-01-15T10:00:00Z",
      "sport": "Futebol",
      "event": "Brasil vs Argentina",
      "market": "Resultado Final",
      "selection1": "Brasil",
      "selection2": "Empate",
      "selection3": "Argentina",
      "odds1": 2.10,
      "odds2": 3.40,
      "odds3": 3.80,
      "stake": 100,
      "status": "active"
    }
  ],
  "surebet_test_002": [
    {
      "house": "William Hill",
      "profit": 12.80,
      "roi": 2.8,
      "timestamp": "2024-01-14T15:30:00Z",
      "sport": "Futebol",
      "event": "Manchester United vs Liverpool",
      "market": "Resultado Final",
      "selection1": "Manchester United",
      "selection2": "Empate",
      "selection3": "Liverpool",
      "odds1": 2.80,
      "odds2": 3.20,
      "odds3": 2.60,
      "stake": 100,
      "status": "active"
    }
  ]
}

/**
 * Testar processamento de dados da API
 */
export function testAPIProcessing() {
  console.log('🧪 Testando processamento de dados da API...')
  
  try {
    // Simular dados da API
    const apiData = testAPIData
    console.log('📡 Dados da API recebidos:', apiData)
    
    // Processar dados
    const processedSurebets = processTestAPIData(apiData)
    console.log('✅ Dados processados:', processedSurebets)
    
    // Testar estatísticas
    const stats = calculateTestStats(processedSurebets)
    console.log('📊 Estatísticas calculadas:', stats)
    
    return {
      success: true,
      processedSurebets,
      stats
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Processar dados de teste da API
 */
function processTestAPIData(apiData) {
  const processedSurebets = []
  const processedIds = new Set()
  
  Object.entries(apiData).forEach(([surebetId, surebetParts]) => {
    if (processedIds.has(surebetId)) {
      console.log(`⚠️ Surebet ID duplicado ignorado: ${surebetId}`)
      return
    }
    
    processedIds.add(surebetId)
    
    if (Array.isArray(surebetParts)) {
      surebetParts.forEach((part, index) => {
        try {
          const processedSurebet = {
            id: `${surebetId}_part_${index + 1}`,
            surebet_id: surebetId,
            bookmaker1: part.house,
            bookmaker2: '',
            sport: part.sport || 'Futebol',
            event: part.event || 'Evento não especificado',
            market: part.market || 'Mercado não especificado',
            profit: parseFloat(part.profit) || 0,
            roi: parseFloat(part.roi) || 0,
            createdAt: part.timestamp ? new Date(part.timestamp).toISOString() : new Date().toISOString(),
            status: part.status || 'active'
          }
          
          processedSurebets.push(processedSurebet)
        } catch (partError) {
          console.error(`Erro ao processar parte ${index + 1} do surebet ${surebetId}:`, partError)
        }
      })
    }
  })
  
  return processedSurebets
}

/**
 * Calcular estatísticas de teste
 */
function calculateTestStats(surebets) {
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
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        bookmakerStats[bookmaker].totalProfit += surebet.profit || 0
        bookmakerStats[bookmaker].totalROI += surebet.roi || 0
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
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        bookmakerStats[bookmaker].totalProfit += surebet.profit || 0
        bookmakerStats[bookmaker].totalROI += surebet.roi || 0
        bookmakerStats[bookmaker].surebets.push(surebet)
      }
    }
  })
  
  // Calcular médias
  Object.values(bookmakerStats).forEach(stats => {
    stats.averageROI = stats.count > 0 ? stats.totalROI / stats.count : 0
    stats.averageProfit = stats.count > 0 ? stats.totalProfit / stats.count : 0
  })
  
  return {
    totalSurebets: surebets.length,
    uniqueBookmakers: Object.keys(bookmakerStats).length,
    bookmakersStats: Object.values(bookmakerStats).sort((a, b) => b.count - a.count),
    totalProfit: surebets.reduce((sum, s) => sum + (s.profit || 0), 0),
    averageROI: surebets.reduce((sum, s) => sum + (s.roi || 0), 0) / surebets.length
  }
}

/**
 * Testar integração com a página de ranking
 */
export function testRankingIntegration() {
  console.log('🧪 Testando integração com a página de ranking...')
  
  try {
    // Testar dados de fallback
    const fallbackData = testSurebetsData
    console.log('📊 Dados de fallback:', fallbackData)
    
    // Testar processamento
    const stats = calculateTestStats(fallbackData)
    console.log('📈 Estatísticas de fallback:', stats)
    
    // Verificar se os dados estão no formato correto
    const isValid = validateRankingData(stats)
    console.log('✅ Validação dos dados:', isValid)
    
    return {
      success: true,
      fallbackData,
      stats,
      isValid
    }
  } catch (error) {
    console.error('❌ Erro no teste de integração:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validar dados do ranking
 */
function validateRankingData(stats) {
  const required = ['totalSurebets', 'uniqueBookmakers', 'bookmakersStats', 'totalProfit', 'averageROI']
  const hasRequired = required.every(key => stats.hasOwnProperty(key))
  
  if (!hasRequired) {
    console.error('❌ Dados faltando:', required.filter(key => !stats.hasOwnProperty(key)))
    return false
  }
  
  if (stats.bookmakersStats.length === 0) {
    console.error('❌ Nenhum bookmaker encontrado')
    return false
  }
  
  if (stats.totalSurebets === 0) {
    console.error('❌ Nenhum surebet encontrado')
    return false
  }
  
  console.log('✅ Dados válidos para o ranking')
  return true
}

/**
 * Executar todos os testes
 */
export function runAllTests() {
  console.log('🚀 Executando todos os testes de ranking...')
  
  const results = {
    apiProcessing: testAPIProcessing(),
    rankingIntegration: testRankingIntegration()
  }
  
  console.log('📋 Resultados dos testes:', results)
  
  const allPassed = results.apiProcessing.success && results.rankingIntegration.success
  console.log(allPassed ? '🎉 Todos os testes passaram!' : '❌ Alguns testes falharam')
  
  return results
}

// Executar testes automaticamente se importado diretamente
if (typeof window !== 'undefined') {
  // Estamos no navegador
  window.rankingDebug = {
    testAPIProcessing,
    testRankingIntegration,
    runAllTests,
    testSurebetsData,
    testAPIData
  }
  
  console.log('🔧 Ranking Debug disponível em window.rankingDebug')
}
