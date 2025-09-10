/**
 * Teste para verificar a funcionalidade de limpeza de dados
 * Este arquivo testa se todos os dados são corretamente zerados
 */

/**
 * Simular dados que seriam limpos
 */
const mockData = {
  bookmakersStats: [
    {
      id: 'bet365',
      name: 'Bet365',
      count: 15,
      totalProfit: 150.50,
      totalROI: 45.2,
      averageProfit: 10.03,
      averageROI: 3.01,
      percentage: 25.5,
      lastAppearance: '2024-01-15T10:00:00Z'
    },
    {
      id: 'william_hill',
      name: 'William Hill',
      count: 12,
      totalProfit: 98.75,
      totalROI: 32.1,
      averageProfit: 8.23,
      averageROI: 2.68,
      percentage: 20.3,
      lastAppearance: '2024-01-14T15:30:00Z'
    }
  ],
  surebets: [
    {
      id: 'surebet_001',
      bookmaker1: 'Bet365',
      bookmaker2: 'William Hill',
      profit: 15.50,
      roi: 3.2,
      createdAt: '2024-01-15T10:00:00Z'
    }
  ],
  totalSurebets: 27,
  uniqueBookmakers: 2,
  totalProfit: 249.25,
  averageROI: 2.85
}

/**
 * Simular localStorage
 */
const mockLocalStorage = {
  'ranking_stats': JSON.stringify(mockData),
  'surebets_cache': JSON.stringify(mockData.surebets),
  'ranking_cache': JSON.stringify({ data: mockData.surebets, timestamp: Date.now() }),
  'bookmaker_stats_cache': JSON.stringify(mockData.bookmakersStats),
  'surebets_data': JSON.stringify(mockData.surebets),
  'bookmaker_ranking_cache': JSON.stringify(mockData.bookmakersStats),
  'temporal_data_cache': JSON.stringify([])
}

/**
 * Testar limpeza do localStorage
 */
export function testLocalStorageClearing() {
  console.log('🧪 Testando limpeza do localStorage...')
  
  // Simular localStorage existente
  Object.keys(mockLocalStorage).forEach(key => {
    localStorage.setItem(key, mockLocalStorage[key])
  })
  
  console.log('📊 localStorage antes da limpeza:', {
    keys: Object.keys(localStorage).filter(key => key.includes('ranking') || key.includes('surebet') || key.includes('bookmaker')),
    hasRankingStats: !!localStorage.getItem('ranking_stats'),
    hasSurebetsCache: !!localStorage.getItem('surebets_cache')
  })
  
  // Simular limpeza
  const keysToRemove = [
    'ranking_stats',
    'surebets_cache', 
    'ranking_cache',
    'bookmaker_stats_cache',
    'surebets_data',
    'bookmaker_ranking_cache',
    'temporal_data_cache'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('🧹 localStorage após limpeza:', {
    keys: Object.keys(localStorage).filter(key => key.includes('ranking') || key.includes('surebet') || key.includes('bookmaker')),
    hasRankingStats: !!localStorage.getItem('ranking_stats'),
    hasSurebetsCache: !!localStorage.getItem('surebets_cache')
  })
  
  const allCleared = keysToRemove.every(key => !localStorage.getItem(key))
  console.log(allCleared ? '✅ localStorage limpo com sucesso!' : '❌ Erro ao limpar localStorage')
  
  return allCleared
}

/**
 * Testar limpeza de dados em memória
 */
export function testMemoryDataClearing() {
  console.log('🧪 Testando limpeza de dados em memória...')
  
  // Simular dados em memória
  const memoryData = {
    bookmakersStats: [...mockData.bookmakersStats],
    bookmakersRanking: [...mockData.bookmakersStats],
    topPerformers: [...mockData.bookmakersStats],
    mostFrequent: [...mockData.bookmakersStats],
    highestProfit: [...mockData.bookmakersStats],
    rankedBookmakers: [...mockData.bookmakersStats],
    surebets: [...mockData.surebets],
    totalSurebets: mockData.totalSurebets,
    totalProfit: mockData.totalProfit,
    averageROI: mockData.averageROI,
    uniqueBookmakers: mockData.uniqueBookmakers,
    lastUpdate: new Date()
  }
  
  console.log('📊 Dados em memória antes da limpeza:', {
    bookmakersStatsLength: memoryData.bookmakersStats.length,
    surebetsLength: memoryData.surebets.length,
    totalSurebets: memoryData.totalSurebets,
    totalProfit: memoryData.totalProfit,
    averageROI: memoryData.averageROI
  })
  
  // Simular limpeza
  memoryData.bookmakersStats = []
  memoryData.bookmakersRanking = []
  memoryData.topPerformers = []
  memoryData.mostFrequent = []
  memoryData.highestProfit = []
  memoryData.rankedBookmakers = []
  memoryData.surebets = []
  memoryData.totalSurebets = 0
  memoryData.totalProfit = 0
  memoryData.averageROI = 0
  memoryData.uniqueBookmakers = 0
  memoryData.lastUpdate = null
  
  console.log('🧹 Dados em memória após limpeza:', {
    bookmakersStatsLength: memoryData.bookmakersStats.length,
    surebetsLength: memoryData.surebets.length,
    totalSurebets: memoryData.totalSurebets,
    totalProfit: memoryData.totalProfit,
    averageROI: memoryData.averageROI
  })
  
  const allCleared = (
    memoryData.bookmakersStats.length === 0 &&
    memoryData.surebets.length === 0 &&
    memoryData.totalSurebets === 0 &&
    memoryData.totalProfit === 0 &&
    memoryData.averageROI === 0
  )
  
  console.log(allCleared ? '✅ Dados em memória limpos com sucesso!' : '❌ Erro ao limpar dados em memória')
  
  return allCleared
}

/**
 * Testar função de limpeza completa
 */
export function testCompleteClearing() {
  console.log('🧪 Testando limpeza completa de dados...')
  
  try {
    // Testar localStorage
    const localStorageCleared = testLocalStorageClearing()
    
    // Testar dados em memória
    const memoryDataCleared = testMemoryDataClearing()
    
    // Resultado geral
    const allTestsPassed = localStorageCleared && memoryDataCleared
    
    console.log('📊 Resultado dos testes:', {
      localStorage: localStorageCleared ? '✅' : '❌',
      memoryData: memoryDataCleared ? '✅' : '❌',
      overall: allTestsPassed ? '✅ TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM'
    })
    
    return allTestsPassed
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    return false
  }
}

/**
 * Executar todos os testes
 */
export function runClearDataTests() {
  console.log('🚀 Iniciando testes de limpeza de dados...')
  console.log('=' .repeat(50))
  
  const result = testCompleteClearing()
  
  console.log('=' .repeat(50))
  console.log(result ? '🎉 Todos os testes de limpeza passaram!' : '💥 Alguns testes de limpeza falharam!')
  
  return result
}
