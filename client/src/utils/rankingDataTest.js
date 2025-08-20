/**
 * Testes de Dados da Página de Ranking
 */

import { testSurebetsData } from './rankingDebug.js'

/**
 * Testar carregamento de dados na página
 */
export function testRankingDataLoading() {
  console.log('🧪 Testando carregamento de dados na página de ranking...')
  
  try {
    // Verificar se a página está carregada
    const rankingContainer = document.querySelector('.ranking-container')
    if (!rankingContainer) {
      console.error('❌ Container de ranking não encontrado')
      return { success: false, error: 'ranking_container_not_found' }
    }
    
    console.log('✅ Container de ranking encontrado')
    
    // Verificar se os dados estão sendo exibidos
    const statsSection = document.querySelector('.stats-section')
    if (!statsSection) {
      console.error('❌ Seção de estatísticas não encontrada')
      return { success: false, error: 'stats_section_not_found' }
    }
    
    console.log('✅ Seção de estatísticas encontrada')
    
    // Verificar se há dados nas estatísticas
    const statCards = statsSection.querySelectorAll('.stat-card')
    if (statCards.length === 0) {
      console.error('❌ Nenhum card de estatística encontrado')
      return { success: false, error: 'no_stat_cards' }
    }
    
    console.log(`✅ ${statCards.length} cards de estatística encontrados`)
    
    // Verificar valores das estatísticas
    const stats = {}
    statCards.forEach(card => {
      const number = card.querySelector('.stat-number')
      const label = card.querySelector('.stat-label')
      
      if (number && label) {
        const value = number.textContent.trim()
        const labelText = label.textContent.trim()
        stats[labelText] = value
        
        console.log(`📊 ${labelText}: ${value}`)
      }
    })
    
    // Verificar se há dados na tabela
    const rankingTable = document.querySelector('.ranking-table')
    if (!rankingTable) {
      console.error('❌ Tabela de ranking não encontrada')
      return { success: false, error: 'ranking_table_not_found' }
    }
    
    console.log('✅ Tabela de ranking encontrada')
    
    // Verificar se há linhas de dados
    const tableRows = rankingTable.querySelectorAll('tbody tr')
    if (tableRows.length === 0) {
      console.error('❌ Nenhuma linha de dados na tabela')
      return { success: false, error: 'no_table_data' }
    }
    
    console.log(`✅ ${tableRows.length} linhas de dados encontradas`)
    
    // Verificar se há gráficos
    const charts = document.querySelectorAll('canvas')
    if (charts.length === 0) {
      console.error('❌ Nenhum gráfico encontrado')
      return { success: false, error: 'no_charts' }
    }
    
    console.log(`✅ ${charts.length} gráficos encontrados`)
    
    return {
      success: true,
      stats,
      tableRows: tableRows.length,
      charts: charts.length
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar carregamento de dados:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Testar dados de fallback
 */
export function testFallbackData() {
  console.log('🧪 Testando dados de fallback...')
  
  try {
    // Simular dados de fallback
    const fallbackData = testSurebetsData
    console.log('📊 Dados de fallback:', fallbackData)
    
    // Verificar se os dados têm a estrutura correta
    const isValid = validateFallbackData(fallbackData)
    console.log('✅ Validação dos dados de fallback:', isValid)
    
    if (!isValid) {
      return { success: false, error: 'invalid_fallback_data' }
    }
    
    // Simular processamento dos dados
    const processedData = processFallbackData(fallbackData)
    console.log('🔄 Dados processados:', processedData)
    
    return {
      success: true,
      fallbackData,
      processedData
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar dados de fallback:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validar dados de fallback
 */
function validateFallbackData(data) {
  if (!Array.isArray(data)) {
    console.error('❌ Dados não são um array')
    return false
  }
  
  if (data.length === 0) {
    console.error('❌ Array está vazio')
    return false
  }
  
  const requiredFields = ['id', 'bookmaker1', 'profit', 'roi', 'createdAt']
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const missingFields = requiredFields.filter(field => !item.hasOwnProperty(field))
    
    if (missingFields.length > 0) {
      console.error(`❌ Item ${i} está faltando campos:`, missingFields)
      return false
    }
  }
  
  console.log('✅ Dados de fallback são válidos')
  return true
}

/**
 * Processar dados de fallback
 */
function processFallbackData(data) {
  const bookmakerStats = {}
  
  data.forEach(surebet => {
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
    totalSurebets: data.length,
    uniqueBookmakers: Object.keys(bookmakerStats).length,
    bookmakersStats: Object.values(bookmakerStats).sort((a, b) => b.count - a.count),
    totalProfit: data.reduce((sum, s) => sum + (s.profit || 0), 0),
    averageROI: data.reduce((sum, s) => sum + (s.roi || 0), 0) / data.length
  }
}

/**
 * Testar renderização dos gráficos
 */
export function testChartRendering() {
  console.log('🧪 Testando renderização dos gráficos...')
  
  try {
    // Verificar se os gráficos estão sendo renderizados
    const frequencyChart = document.querySelector('canvas[ref="frequencyChart"]')
    const timelineChart = document.querySelector('canvas[ref="timelineChart"]')
    
    if (!frequencyChart && !timelineChart) {
      console.error('❌ Nenhum gráfico encontrado')
      return { success: false, error: 'no_charts_found' }
    }
    
    const charts = []
    
    if (frequencyChart) {
      charts.push({ type: 'frequency', element: frequencyChart })
      console.log('✅ Gráfico de frequência encontrado')
    }
    
    if (timelineChart) {
      charts.push({ type: 'timeline', element: timelineChart })
      console.log('✅ Gráfico de timeline encontrado')
    }
    
    // Verificar se os gráficos têm dados
    charts.forEach(chart => {
      const ctx = chart.element.getContext('2d')
      if (ctx) {
        console.log(`📊 Contexto do gráfico ${chart.type} disponível`)
      } else {
        console.error(`❌ Contexto do gráfico ${chart.type} não disponível`)
      }
    })
    
    return {
      success: true,
      charts: charts.length,
      types: charts.map(c => c.type)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar renderização dos gráficos:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Testar funcionalidade de filtros
 */
export function testFilters() {
  console.log('🧪 Testando funcionalidade de filtros...')
  
  try {
    // Verificar se os filtros estão presentes
    const filtersSection = document.querySelector('.filters-section')
    if (!filtersSection) {
      console.error('❌ Seção de filtros não encontrada')
      return { success: false, error: 'filters_section_not_found' }
    }
    
    console.log('✅ Seção de filtros encontrada')
    
    // Verificar filtros específicos
    const periodFilter = document.querySelector('select[value="30"]')
    const sortFilter = document.querySelector('select[value="frequency"]')
    const refreshFilter = document.querySelector('select[value="30000"]')
    
    const filters = []
    
    if (periodFilter) {
      filters.push('period')
      console.log('✅ Filtro de período encontrado')
    }
    
    if (sortFilter) {
      filters.push('sort')
      console.log('✅ Filtro de ordenação encontrado')
    }
    
    if (refreshFilter) {
      filters.push('refresh')
      console.log('✅ Filtro de atualização encontrado')
    }
    
    // Verificar botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn')
    if (refreshBtn) {
      console.log('✅ Botão de atualização encontrado')
      filters.push('refresh_button')
    }
    
    return {
      success: true,
      filters: filters.length,
      types: filters
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar filtros:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Testar responsividade
 */
export function testResponsiveness() {
  console.log('🧪 Testando responsividade...')
  
  try {
    // Verificar se a página é responsiva
    const mainContent = document.querySelector('.main-content')
    if (!mainContent) {
      console.error('❌ Conteúdo principal não encontrado')
      return { success: false, error: 'main_content_not_found' }
    }
    
    // Verificar estilos responsivos
    const computedStyle = window.getComputedStyle(mainContent)
    const flexDirection = computedStyle.flexDirection
    const flexWrap = computedStyle.flexWrap
    
    console.log('📱 Estilos responsivos:', { flexDirection, flexWrap })
    
    // Verificar media queries
    const isMobile = window.innerWidth <= 768
    const isTablet = window.innerWidth <= 1200 && window.innerWidth > 768
    
    console.log('📱 Breakpoints:', {
      width: window.innerWidth,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet
    })
    
    return {
      success: true,
      flexDirection,
      flexWrap,
      width: window.innerWidth,
      isMobile,
      isTablet
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar responsividade:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Executar todos os testes de dados
 */
export function runAllDataTests() {
  console.log('🚀 Executando todos os testes de dados...')
  
  const results = {
    dataLoading: testRankingDataLoading(),
    fallbackData: testFallbackData(),
    chartRendering: testChartRendering(),
    filters: testFilters(),
    responsiveness: testResponsiveness()
  }
  
  console.log('📋 Resultados dos testes de dados:', results)
  
  const allPassed = Object.values(results).every(result => result.success)
  console.log(allPassed ? '🎉 Todos os testes de dados passaram!' : '❌ Alguns testes de dados falharam')
  
  return results
}

// Executar testes automaticamente se importado diretamente
if (typeof window !== 'undefined') {
  // Estamos no navegador
  window.rankingDataTest = {
    testRankingDataLoading,
    testFallbackData,
    testChartRendering,
    testFilters,
    testResponsiveness,
    runAllDataTests
  }
  
  console.log('🔧 Ranking Data Test disponível em window.rankingDataTest')
}
