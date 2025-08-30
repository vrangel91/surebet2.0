// Configuração de agrupamento de mercados para o gráfico de distribuição
export const MARKET_GROUPS = {
  // Over/Under - Mercados de total de gols, chutes, etc.
  'over_under': {
    name: 'Over/Under',
    color: '#4A90E2', // Azul
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
      'goals': { name: 'Gols', color: '#5BA0F2' },
      'shots': { name: 'Chutes', color: '#6BB0FF' },
      'corners': { name: 'Escanteios', color: '#7BC0FF' },
      'cards': { name: 'Cartões', color: '#8BD0FF' },
      'other': { name: 'Outros', color: '#9BE0FF' }
    }
  },

  // Resultado Final - Quem vence, empate, etc.
  'match_result': {
    name: 'Resultado Final',
    color: '#50C878', // Verde
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
      'winner': { name: 'Vencedor', color: '#60D888' },
      '1x2': { name: '1X2', color: '#70E898' },
      'double_chance': { name: 'Dupla Chance', color: '#80F8A8' },
      'other': { name: 'Outros', color: '#90FFB8' }
    }
  },

  // Handicap - Vantagens e desvantagens
  'handicap': {
    name: 'Handicap',
    color: '#FF6B35', // Laranja
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
      'asian': { name: 'Handicap Asiático', color: '#FF7B45' },
      'european': { name: 'Handicap Europeu', color: '#FF8B55' },
      'american': { name: 'Spread Americano', color: '#FF9B65' },
      'other': { name: 'Outros', color: '#FFAB75' }
    }
  },

  // Específicos do Jogador - Performance individual
  'player_specific': {
    name: 'Jogador Específico',
    color: '#9B59B6', // Roxo
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
      'scoring': { name: 'Marcação', color: '#AB69C6' },
      'assists': { name: 'Assistências', color: '#BB79D6' },
      'cards': { name: 'Cartões', color: '#CB89E6' },
      'other': { name: 'Outros', color: '#DB99F6' }
    }
  },

  // Específicos do Time - Performance coletiva
  'team_specific': {
    name: 'Time Específico',
    color: '#E74C3C', // Vermelho
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
      'winning': { name: 'Vitórias', color: '#F7544C' },
      'scoring': { name: 'Marcação', color: '#FF645C' },
      'halves': { name: 'Tempos', color: '#FF746C' },
      'other': { name: 'Outros', color: '#FF847C' }
    }
  },

  // Específicos do Jogo - Eventos específicos
  'game_specific': {
    name: 'Jogo Específico',
    color: '#F39C12', // Amarelo
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
      'scoring': { name: 'Marcação', color: '#FFAC22' },
      'cards': { name: 'Cartões', color: '#FFBC32' },
      'corners': { name: 'Escanteios', color: '#FFCC42' },
      'other': { name: 'Outros', color: '#FFDC52' }
    }
  },

  // Outros - Mercados não categorizados
  'others': {
    name: 'Outros',
    color: '#95A5A6', // Cinza
    patterns: [],
    subcategories: {
      'misc': { name: 'Diversos', color: '#A5B5B6' }
    }
  }
}

// Função para categorizar um mercado
export function categorizeMarket(marketName) {
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
  // Lógica específica para cada tipo de grupo
  if (marketName.includes('goal') || marketName.includes('score')) {
    return subcategories.scoring || subcategories.misc
  }
  if (marketName.includes('card') || marketName.includes('book')) {
    return subcategories.cards || subcategories.misc
  }
  if (marketName.includes('corner')) {
    return subcategories.corners || subcategories.misc
  }
  if (marketName.includes('win') || marketName.includes('victory')) {
    return subcategories.winning || subcategories.misc
  }
  if (marketName.includes('assist')) {
    return subcategories.assists || subcategories.misc
  }
  if (marketName.includes('half') || marketName.includes('period')) {
    return subcategories.halves || subcategories.misc
  }
  if (marketName.includes('asian')) {
    return subcategories.asian || subcategories.misc
  }
  if (marketName.includes('european')) {
    return subcategories.european || subcategories.misc
  }
  if (marketName.includes('spread') || marketName.includes('line')) {
    return subcategories.american || subcategories.misc
  }
  
  return subcategories.other || subcategories.misc
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
