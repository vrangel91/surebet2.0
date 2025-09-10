// Configuração de agrupamento de mercados para o gráfico de distribuição
export const MARKET_GROUPS = {
  // Over/Under - Mercados de total de gols, chutes, etc.
  'over_under': {
    name: 'Over/Under',
    color: '#198754', // Verde principal
    patterns: [
      'Over/Under',
      'Total Goals',
      'Total Shots',
      'Total Corners',
      'Total Cards',
      'Total Points',
      'Total Runs',
      'Total Sets',
      'Total Games',
      'Total Frames',
      'Total Rounds',
      'Total Periods'
    ],
    subcategories: {
      'goals': { name: 'Gols', color: '#20c997' },
      'shots': { name: 'Chutes', color: '#28d4a3' },
      'corners': { name: 'Escanteios', color: '#30dfaf' },
      'cards': { name: 'Cartões', color: '#38eabb' },
      'other': { name: 'Outros', color: '#40f5c7' }
    }
  },

  // Resultado Final - Quem vence, empate, etc.
  'match_result': {
    name: 'Resultado Final',
    color: '#198754', // Verde principal
    patterns: [
      'Match Winner',
      '1X2',
      'Home/Away',
      'Draw No Bet',
      'Double Chance',
      'Winner',
      'Outright Winner',
      'Champion',
      'Qualification',
      'Promotion',
      'Relegation'
    ],
    subcategories: {
      'winner': { name: 'Vencedor', color: '#20c997' },
      '1x2': { name: '1X2', color: '#28d4a3' },
      'double_chance': { name: 'Dupla Chance', color: '#30dfaf' },
      'other': { name: 'Outros', color: '#38eabb' }
    }
  },

  // Handicap - Vantagens e desvantagens
  'handicap': {
    name: 'Handicap',
    color: '#fd7e14', // Laranja ajustado
    patterns: [
      'Handicap',
      'Asian Handicap',
      'European Handicap',
      'Line',
      'Spread',
      'Point Spread',
      'Run Line',
      'Puck Line'
    ],
    subcategories: {
      'asian': { name: 'Handicap Asiático', color: '#fe8a2a' },
      'european': { name: 'Handicap Europeu', color: '#ff9640' },
      'american': { name: 'Spread Americano', color: '#ffa256' },
      'other': { name: 'Outros', color: '#ffae6c' }
    }
  },

  // Específicos do Jogador - Performance individual
  'player_specific': {
    name: 'Jogador Específico',
    color: '#6f42c1', // Roxo ajustado
    patterns: [
      'Player',
      'To Score',
      'To Assist',
      'To Book',
      'To Get Card',
      'To Be Booked',
      'To Be Sent Off',
      'To Miss Penalty',
      'To Score Penalty',
      'To Score Header',
      'To Score Free Kick',
      'To Score from Outside Box',
      'To Score Hat-trick',
      'To Score Brace',
      'To Score First',
      'To Score Last',
      'To Score in Both Halves',
      'To Score and Win',
      'To Score and Team Win',
      'To Score and Team Lose',
      'To Score and Draw',
      'To Score and Team Draw',
      'To Score and Team Not Lose',
      'To Score and Team Not Win',
      'To Score and Team Not Draw',
      'To Score and Team Lose',
      'To Score and Team Win',
      'To Score and Team Draw',
      'To Score and Team Not Lose',
      'To Score and Team Not Win',
      'To Score and Team Not Draw'
    ],
    subcategories: {
      'scoring': { name: 'Marcação', color: '#7c4dd1' },
      'assists': { name: 'Assistências', color: '#8958e1' },
      'cards': { name: 'Cartões', color: '#9663f1' },
      'other': { name: 'Outros', color: '#a36eff' }
    }
  },

  // Específicos do Time - Performance coletiva
  'team_specific': {
    name: 'Time Específico',
    color: '#dc3545', // Vermelho ajustado
    patterns: [
      'Team',
      'To Win',
      'To Lose',
      'To Draw',
      'To Score',
      'To Concede',
      'To Keep Clean Sheet',
      'To Score in Both Halves',
      'To Win Both Halves',
      'To Win to Nil',
      'To Win from Behind',
      'To Come from Behind and Win',
      'To Come from Behind and Draw',
      'To Come from Behind and Lose',
      'To Lead at Half Time and Win',
      'To Lead at Half Time and Draw',
      'To Lead at Half Time and Lose',
      'To Be Leading at Half Time',
      'To Be Losing at Half Time',
      'To Be Drawing at Half Time',
      'To Score First',
      'To Score Last',
      'To Score in First Half',
      'To Score in Second Half',
      'To Score in Both Halves',
      'To Win First Half',
      'To Win Second Half',
      'To Win Both Halves',
      'To Draw First Half',
      'To Draw Second Half',
      'To Draw Both Halves',
      'To Lose First Half',
      'To Lose Second Half',
      'To Lose Both Halves'
    ],
    subcategories: {
      'winning': { name: 'Vitórias', color: '#e74c3c' },
      'scoring': { name: 'Marcação', color: '#f2544c' },
      'halves': { name: 'Tempos', color: '#ff5c5c' },
      'other': { name: 'Outros', color: '#ff646c' }
    }
  },

  // Específicos do Jogo - Eventos específicos
  'game_specific': {
    name: 'Jogo Específico',
    color: '#ffc107', // Amarelo ajustado
    patterns: [
      'Both Teams to Score',
      'Clean Sheet',
      'Exact Score',
      'Correct Score',
      'Scorecast',
      'Wincast',
      'First Goalscorer',
      'Last Goalscorer',
      'Anytime Goalscorer',
      'Method of Victory',
      'Winning Margin',
      'Highest Scoring Half',
      'Goal Line',
      'Corners',
      'Cards',
      'Bookings',
      'Red Cards',
      'Yellow Cards',
      'Penalties',
      'Own Goals',
      'Headers',
      'Free Kicks',
      'Outside Box Goals',
      'Inside Box Goals',
      'Set Piece Goals',
      'Counter Attack Goals',
      'Long Range Goals',
      'Short Range Goals'
    ],
    subcategories: {
      'scoring': { name: 'Marcação', color: '#ffca2c' },
      'cards': { name: 'Cartões', color: '#ffd351' },
      'corners': { name: 'Escanteios', color: '#ffdc76' },
      'other': { name: 'Outros', color: '#ffe59b' }
    }
  },

  // Outros - Mercados não categorizados
  'others': {
    name: 'Outros',
    color: '#6c757d', // Cinza ajustado
    patterns: [],
    subcategories: {
      'misc': { name: 'Diversos', color: '#7c858d' }
    }
  }
}

// Função para categorizar um mercado
export function categorizeMarket(marketName) {
  // Verificar se marketName é válido
  if (!marketName || typeof marketName !== 'string') {
    return {
      group: 'others',
      groupName: MARKET_GROUPS.others.name,
      groupColor: MARKET_GROUPS.others.color,
      subcategory: MARKET_GROUPS.others.subcategories.misc,
      originalName: 'Mercado Desconhecido'
    }
  }
  
  const normalizedName = marketName.toLowerCase()
  
  for (const [groupKey, group] of Object.entries(MARKET_GROUPS)) {
    if (groupKey === 'others') continue // Pular o grupo "outros"
    
    for (const pattern of group.patterns) {
      if (normalizedName.includes(pattern.toLowerCase())) {
        return {
          group: groupKey,
          groupName: group.name,
          groupColor: group.color,
          subcategory: getSubcategory(normalizedName, group.subcategories),
          originalName: marketName
        }
      }
    }
  }
  
  // Se não encontrou nenhum padrão, retorna "outros"
  return {
    group: 'others',
    groupName: MARKET_GROUPS.others.name,
    groupColor: MARKET_GROUPS.others.color,
    subcategory: MARKET_GROUPS.others.subcategories.misc,
    originalName: marketName
  }
}

// Função para determinar a subcategoria
function getSubcategory(marketName, subcategories) {
  // Garantir que subcategories existe e tem propriedades válidas
  if (!subcategories || typeof subcategories !== 'object') {
    return { name: 'Diversos', color: '#6c757d' }
  }
  
  // Lógica específica para cada tipo de grupo
  if (marketName.includes('goal') || marketName.includes('score')) {
    return subcategories.scoring || subcategories.other || subcategories.misc || { name: 'Gols', color: '#198754' }
  }
  if (marketName.includes('card') || marketName.includes('book')) {
    return subcategories.cards || subcategories.other || subcategories.misc || { name: 'Cartões', color: '#6f42c1' }
  }
  if (marketName.includes('corner')) {
    return subcategories.corners || subcategories.other || subcategories.misc || { name: 'Escanteios', color: '#ffc107' }
  }
  if (marketName.includes('win') || marketName.includes('victory')) {
    return subcategories.winning || subcategories.other || subcategories.misc || { name: 'Vitória', color: '#198754' }
  }
  if (marketName.includes('assist')) {
    return subcategories.assists || subcategories.other || subcategories.misc || { name: 'Assistências', color: '#dc3545' }
  }
  if (marketName.includes('half') || marketName.includes('period')) {
    return subcategories.halves || subcategories.other || subcategories.misc || { name: 'Tempos', color: '#fd7e14' }
  }
  if (marketName.includes('asian')) {
    return subcategories.asian || subcategories.other || subcategories.misc || { name: 'Asiático', color: '#fd7e14' }
  }
  if (marketName.includes('european')) {
    return subcategories.european || subcategories.other || subcategories.misc || { name: 'Europeu', color: '#fd7e14' }
  }
  if (marketName.includes('spread') || marketName.includes('line')) {
    return subcategories.american || subcategories.other || subcategories.misc || { name: 'Americano', color: '#fd7e14' }
  }
  
  // Retornar uma subcategoria padrão se nada for encontrado
  return subcategories.other || subcategories.misc || { name: 'Diversos', color: '#6c757d' }
}

// Função para agrupar mercados por categoria
export function groupMarketsByCategory(markets) {
  const grouped = {}
  
  markets.forEach(market => {
    const category = categorizeMarket(market.name)
    const groupKey = category.group
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        name: category.groupName,
        color: category.groupColor,
        count: 0,
        totalProfit: 0,
        profits: [],
        markets: [],
        subcategories: {}
      }
    }
    
    grouped[groupKey].count += market.count
    grouped[groupKey].totalProfit += market.totalProfit || 0
    grouped[groupKey].profits.push(...(market.profits || []))
    grouped[groupKey].markets.push(market)
    
    // Agrupar por subcategoria
    const subKey = category.subcategory.name
    if (!grouped[groupKey].subcategories[subKey]) {
      grouped[groupKey].subcategories[subKey] = {
        name: category.subcategory.name,
        color: category.subcategory.color,
        count: 0,
        totalProfit: 0,
        profits: [],
        markets: []
      }
    }
    
    grouped[groupKey].subcategories[subKey].count += market.count
    grouped[groupKey].subcategories[subKey].totalProfit += market.totalProfit || 0
    grouped[groupKey].subcategories[subKey].profits.push(...(market.profits || []))
    grouped[groupKey].subcategories[subKey].markets.push(market)
  })
  
  return grouped
}

// Função para filtrar mercados por relevância
export function filterMarketsByRelevance(markets, minCount = 2, minPercentage = 1) {
  const totalCount = markets.reduce((sum, market) => sum + market.count, 0)
  
  return markets.filter(market => {
    const percentage = (market.count / totalCount) * 100
    return market.count >= minCount && percentage >= minPercentage
  })
}

// Função para criar dados do gráfico com agrupamento
export function createChartData(groupedMarkets, showDetails = false, viewMode = 'percentage') {
  const chartData = []
  const colors = []
  const labels = []
  
  Object.entries(groupedMarkets).forEach(([groupKey, group]) => {
    if (showDetails) {
      // Mostrar subcategorias
      Object.entries(group.subcategories).forEach(([subKey, subcategory]) => {
        const value = viewMode === 'percentage' 
          ? (subcategory.count / Object.values(groupedMarkets).reduce((sum, g) => sum + g.count, 0)) * 100
          : subcategory.count
        
        chartData.push(value)
        colors.push(subcategory.color)
        labels.push(`${group.name} - ${subcategory.name}`)
      })
    } else {
      // Mostrar apenas grupos principais
      const value = viewMode === 'percentage'
        ? (group.count / Object.values(groupedMarkets).reduce((sum, g) => sum + g.count, 0)) * 100
        : group.count
      
      chartData.push(value)
      colors.push(group.color)
      labels.push(group.name)
    }
  })
  
  return { chartData, colors, labels }
}
