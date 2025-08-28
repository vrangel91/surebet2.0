/**
 * Script para analisar os campos "market" da API
 * e identificar todos os tipos de mercados disponíveis
 */

const API_CONFIG = {
  BASE_URL: 'https://zerolossbet.com',
  ENDPOINTS: {
    SUREBETS: '/api/fetch_surebets/'
  },
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
    'Referer': 'https://zerolossbet.com/dashboard',
    'Origin': 'https://zerolossbet.com'
  }
}

function buildApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

async function analyzeMarketFields() {
  try {
    console.log('🔍 Analisando campos "market" da API...')
    console.log('📡 URL:', buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS))
    
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
    }
    
    const apiData = await response.json()
    console.log('✅ Dados recebidos da API')
    
    // Analisar todos os campos "market" únicos
    const uniqueMarkets = new Set()
    const marketExamples = {}
    const marketPatterns = {}
    
    // Processar dados da API
    if (apiData && Array.isArray(apiData)) {
      apiData.forEach((surebet, index) => {
        if (surebet.market) {
          const market = surebet.market
          uniqueMarkets.add(market)
          
          // Guardar exemplo do mercado
          if (!marketExamples[market]) {
            marketExamples[market] = {
              example: surebet,
              count: 0
            }
          }
          marketExamples[market].count++
          
          // Analisar padrões no mercado
          analyzeMarketPattern(market, marketPatterns)
        }
      })
    }
    
    // Exibir resultados
    console.log('\n📊 ANÁLISE DOS CAMPOS MARKET:')
    console.log('================================')
    console.log(`Total de surebets analisados: ${apiData ? apiData.length : 0}`)
    console.log(`Total de mercados únicos: ${uniqueMarkets.size}`)
    
    console.log('\n🔍 MERCADOS ÚNICOS ENCONTRADOS:')
    console.log('================================')
    const sortedMarkets = Array.from(uniqueMarkets).sort()
    sortedMarkets.forEach((market, index) => {
      const example = marketExamples[market]
      console.log(`${index + 1}. "${market}" (${example.count} ocorrências)`)
      if (example.example) {
        console.log(`   Exemplo: ${example.example.sport || 'N/A'} - ${example.example.event || 'N/A'}`)
      }
    })
    
    console.log('\n🎯 PADRÕES IDENTIFICADOS:')
    console.log('===========================')
    Object.entries(marketPatterns).forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count} ocorrências`)
    })
    
    console.log('\n💡 SUGESTÕES DE TRADUÇÃO:')
    console.log('============================')
    generateTranslationSuggestions(sortedMarkets)
    
  } catch (error) {
    console.error('❌ Erro ao analisar API:', error)
    
    // Se der erro de CORS, tentar com proxy ou mostrar dados de exemplo
    console.log('\n🔄 Tentando análise com dados de exemplo...')
    analyzeExampleData()
  }
}

function analyzeMarketPattern(market, patterns) {
  // Identificar padrões comuns
  if (market.includes('AH')) {
    patterns['Handicap Asiático (AH)'] = (patterns['Handicap Asiático (AH)'] || 0) + 1
  }
  if (market.includes('EH')) {
    patterns['Handicap Europeu (EH)'] = (patterns['Handicap Europeu (EH)'] || 0) + 1
  }
  if (market.includes('TO')) {
    patterns['Over (TO)'] = (patterns['Over (TO)'] || 0) + 1
  }
  if (market.includes('TU')) {
    patterns['Under (TU)'] = (patterns['Under (TU)'] || 0) + 1
  }
  if (market.includes('1X2')) {
    patterns['Resultado Final (1X2)'] = (patterns['Resultado Final (1X2)'] || 0) + 1
  }
  if (market.includes('DC')) {
    patterns['Dupla Chance (DC)'] = (patterns['Dupla Chance (DC)'] || 0) + 1
  }
  if (market.includes('BTS')) {
    patterns['Ambas Marcam (BTS)'] = (patterns['Ambas Marcam (BTS)'] || 0) + 1
  }
  if (market.includes('CS')) {
    patterns['Placar Exato (CS)'] = (patterns['Placar Exato (CS)'] || 0) + 1
  }
  if (market.includes('HT')) {
    patterns['Primeiro Tempo (HT)'] = (patterns['Primeiro Tempo (HT)'] || 0) + 1
  }
  if (market.includes('FT')) {
    patterns['Tempo Completo (FT)'] = (patterns['Tempo Completo (FT)'] || 0) + 1
  }
  if (market.includes('Even')) {
    patterns['Par (Even)'] = (patterns['Par (Even)'] || 0) + 1
  }
  if (market.includes('Odd')) {
    patterns['Ímpar (Odd)'] = (patterns['Ímpar (Odd)'] || 0) + 1
  }
  if (market.includes('Corners')) {
    patterns['Escanteios (Corners)'] = (patterns['Escanteios (Corners)'] || 0) + 1
  }
  if (market.includes('YC')) {
    patterns['Cartão Amarelo (YC)'] = (patterns['Cartão Amarelo (YC)'] || 0) + 1
  }
  if (market.includes('RC')) {
    patterns['Cartão Vermelho (RC)'] = (patterns['Cartão Vermelho (RC)'] || 0) + 1
  }
  if (market.includes('for Team')) {
    patterns['Específico por Time (for Team)'] = (patterns['Específico por Time (for Team)'] || 0) + 1
  }
}

function generateTranslationSuggestions(markets) {
  console.log('Baseado na análise, aqui estão as traduções recomendadas:')
  
  const translations = {
    // Handicaps
    'AH1': 'Handicap Casa',
    'AH2': 'Handicap Visitante',
    'EH1': 'Escanteio Europeu Casa',
    'EH2': 'Escanteio Europeu Visitante',
    
    // Over/Under
    'TO': 'Over Gols',
    'TU': 'Under Gols',
    
    // Resultados
    '1X2': 'Resultado Final',
    'DC': 'Dupla Chance',
    'BTS': 'Ambas Marcam',
    'CS': 'Placar Exato',
    
    // Tempos
    'HT': 'Primeiro Tempo',
    'FT': 'Tempo Completo',
    
    // Par/Ímpar
    'Even': 'Total de Gols – Par',
    'Odd': 'Total de Gols – Ímpar',
    
    // Específicos
    'for Team1': 'Casa',
    'for Team2': 'Visitante',
    'Corners': 'Escanteios',
    'YC': 'Cartão Amarelo',
    'RC': 'Cartão Vermelho'
  }
  
  Object.entries(translations).forEach(([abbreviation, translation]) => {
    console.log(`   "${abbreviation}" → "${translation}"`)
  })
}

function analyzeExampleData() {
  console.log('📊 DADOS DE EXEMPLO PARA ANÁLISE:')
  console.log('==================================')
  
  const exampleMarkets = [
    'AH1(-1)',
    'AH2(+1.5)',
    'EH1(-2) - Corners',
    'EH2(+1) - Corners',
    'TO(2.5)',
    'TU(1.5)',
    '1X2',
    'DC',
    'BTS',
    'CS',
    'HT',
    'FT',
    'Even',
    'Odd',
    'for Team1',
    'for Team2',
    'YC(2.5)',
    'RC(1.5)',
    'CORNERS(8.5)',
    'FOULS(15.5)',
    'OFFSIDES(3.5)',
    'SHOTS(12.5)',
    'POSSESSION(55.5)'
  ]
  
  console.log('Mercados de exemplo encontrados:')
  exampleMarkets.forEach((market, index) => {
    console.log(`${index + 1}. "${market}"`)
  })
  
  console.log('\n💡 SUGESTÕES DE TRADUÇÃO COMPLETAS:')
  console.log('======================================')
  generateTranslationSuggestions(exampleMarkets)
}

// Executar análise
console.log('🚀 Iniciando análise dos campos market...')
analyzeMarketFields()
