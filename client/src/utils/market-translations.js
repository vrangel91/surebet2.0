/**
 * Sistema de Tradução de Mercados - Surebets
 * Implementa regras específicas para traduzir mercados de apostas
 * seguindo especificações estabelecidas pelo usuário
 */

// Mapeamento de abreviações numéricas
const NUMERIC_PATTERNS = {
  // TO(x) → "Total acima de x" (genérico, será especificado depois)
  'TO\\((\\d+(?:\\.\\d+)?)\\)': (match, value) => `Total acima de ${value}`,
  
  // TU(x) → "Total abaixo de x" (genérico, será especificado depois)
  'TU\\((\\d+(?:\\.\\d+)?)\\)': (match, value) => `Total abaixo de ${value}`,
  
  // TO(x) for Team1 → "Total acima de x para o Time 1" (genérico, será especificado depois)
  'TO\\((\\d+(?:\\.\\d+)?)\\) for Team1': (match, value) => `Total acima de ${value} para o Time 1`,
  
  // TU(x) for Team1 → "Total abaixo de x para o Time 1" (genérico, será especificado depois)
  'TU\\((\\d+(?:\\.\\d+)?)\\) for Team1': (match, value) => `Total abaixo de ${value} para o Time 1`,
  
  // TO(x) for Team2 → "Total acima de x para o Time 2" (genérico, será especificado depois)
  'TU\\((\\d+(?:\\.\\d+)?)\\) for Team2': (match, value) => `Total abaixo de ${value} para o Time 2`,
  
  // TO(x) for Team2 → "Total acima de x para o Time 2" (genérico, será especificado depois)
  'TO\\((\\d+(?:\\.\\d+)?)\\) for Team2': (match, value) => `Total acima de ${value} para o Time 2`
}

// Mapeamento de contextos de time (for Team1, for Team2)
const TEAM_CONTEXT_PATTERNS = {
  'for Team1': 'para o Time 1',
  'for Team2': 'para o Time 2',
  'for team1': 'para o Time 1',
  'for team2': 'para o Time 2',
  'FOR TEAM1': 'para o Time 1',
  'FOR TEAM2': 'para o Time 2'
}

// Mapeamento de handicaps e padrões específicos por time
const HANDICAP_PATTERNS = {
  // Asian Handicap
  'AH1': 'Asian Handicap para o Time 1',
  'AH2': 'Asian Handicap para o Time 2',
  
  // European Handicap
  'EH1': 'European Handicap para o Time 1',
  'EH2': 'European Handicap para o Time 2',
  
  // Team 1 Over/Under
  'TO1': 'Team 1 Over (Total acima para o Time 1)',
  'TU1': 'Team 1 Under (Total abaixo para o Time 1)',
  
  // Team 2 Over/Under
  'TO2': 'Team 2 Over (Total acima para o Time 2)',
  'TU2': 'Team 2 Under (Total abaixo para o Time 2)',
  
  // Case-insensitive variations
  'ah1': 'Asian Handicap para o Time 1',
  'ah2': 'Asian Handicap para o Time 2',
  'eh1': 'European Handicap para o Time 1',
  'eh2': 'European Handicap para o Time 2',
  'to1': 'Team 1 Over (Total acima para o Time 1)',
  'tu1': 'Team 1 Under (Total abaixo para o Time 1)',
  'to2': 'Team 2 Over (Total acima para o Time 2)',
  'tu2': 'Team 2 Under (Total abaixo para o Time 2)'
}

// Mapeamento de vitórias de times
const TEAM_WIN_PATTERNS = {
  'Team1 Win': 'Vitória do Time 1',
  'Team2 Win': 'Vitória do Time 2',
  'Team1': 'Time 1',
  'Team2': 'Time 2'
}

// Mapeamento de pares/ímpares
const ODD_EVEN_PATTERNS = {
  'Odd': 'Resultado ímpar',
  'Even': 'Resultado par'
}

// Mapeamento de padrões de gols (Both to score, One scoreless)
const GOAL_PATTERNS = {
  'Both to score': 'Ambos marcam',
  'Both teams to score': 'Ambos os times marcam',
  'BTS': 'Ambos marcam',
  'bts': 'Ambos marcam',
  'One scoreless': 'Um time sem marcar',
  'One team scoreless': 'Um time sem marcar',
  'One scoreless team': 'Um time sem marcar',
  'Scoreless': 'Sem gols',
  'No goals': 'Sem gols',
  'Clean sheet': 'Jogo sem gols'
}

// Mapeamento de métricas específicas
const METRIC_TRANSLATIONS = {
  'Shots on goal': 'Chutes a gol',
  'Shots': 'Chutes',
  'Corners': 'Escanteios',
  'Sets': 'Sets',
  'Maps': 'Mapas',
  'Goals': 'Gols',
  'Cards': 'Cartões',
  'Fouls': 'Faltas',
  'Offsides': 'Impedimentos',
  'Yellow Cards': 'Cartões Amarelos',
  'Red Cards': 'Cartões Vermelhos',
  'Free Kicks': 'Faltas Diretas',
  'Penalties': 'Pênaltis',
  'Throw-ins': 'Lances Livres',
  'Goal Kicks': 'Tiro de Meta',
  'Substitutions': 'Substituições',
  'Injuries': 'Lesões',
  'Stoppage Time': 'Acréscimos',
  'Extra Time': 'Prorrogação',
  'Penalty Shootout': 'Disputa de Pênaltis'
}

// Mapeamento de esportes
const SPORT_TRANSLATIONS = {
  'Football': 'Futebol',
  'Soccer': 'Futebol',
  'Basketball': 'Basquete',
  'Tennis': 'Tênis',
  'Volleyball': 'Vôlei',
  'Handball': 'Handebol',
  'Ice Hockey': 'Hóquei no Gelo',
  'Hockey': 'Hóquei',
  'Baseball': 'Beisebol',
  'American Football': 'Futebol Americano',
  'Rugby': 'Rugby',
  'Cricket': 'Críquete',
  'Badminton': 'Badminton',
  'Table Tennis': 'Tênis de Mesa',
  'Ping Pong': 'Tênis de Mesa',
  'Golf': 'Golfe',
  'Boxing': 'Boxe',
  'MMA': 'MMA',
  'UFC': 'UFC',
  'Formula 1': 'Fórmula 1',
  'F1': 'Fórmula 1',
  'MotoGP': 'MotoGP',
  'Cycling': 'Ciclismo',
  'Swimming': 'Natação',
  'Athletics': 'Atletismo',
  'Track and Field': 'Atletismo'
}

/**
 * Aplica padrões de tradução numérica
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyNumericPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão numérico
  Object.entries(NUMERIC_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica padrões de contexto de time (for Team1, for Team2)
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyTeamContextPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão de contexto de time
  Object.entries(TEAM_CONTEXT_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica padrões de handicap e padrões específicos por time
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyHandicapPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão de handicap
  Object.entries(HANDICAP_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica padrões de vitória de times
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyTeamWinPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão de vitória de time
  Object.entries(TEAM_WIN_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica padrões de par/ímpar
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyOddEvenPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão de par/ímpar
  Object.entries(ODD_EVEN_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica padrões de gols (Both to score, One scoreless)
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyGoalPatterns(text) {
  let translatedText = text
  
  // Aplica cada padrão de gols
  Object.entries(GOAL_PATTERNS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica traduções de métricas específicas
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applyMetricTranslations(text) {
  let translatedText = text
  
  // Aplica cada tradução de métrica
  Object.entries(METRIC_TRANSLATIONS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Aplica traduções de esportes
 * @param {string} text - Texto a ser traduzido
 * @returns {string} - Texto traduzido
 */
function applySportTranslations(text) {
  let translatedText = text
  
  // Aplica cada tradução de esporte
  Object.entries(SPORT_TRANSLATIONS).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    translatedText = translatedText.replace(regex, replacement)
  })
  
  return translatedText
}

/**
 * Traduz um mercado seguindo todas as regras estabelecidas
 * @param {string} marketText - Texto do mercado
 * @param {string} sport - Esporte (opcional)
 * @returns {string} - Texto traduzido
 */
export function formatMarketForDisplay(marketText, sport = null) {
  if (!marketText) return 'N/A'
  
  let translatedText = marketText
  
  // Aplica todas as camadas de tradução na ordem correta
  translatedText = applyNumericPatterns(translatedText)
  translatedText = applyTeamContextPatterns(translatedText) // Nova camada para "for Team1/Team2"
  translatedText = applyHandicapPatterns(translatedText) // Nova camada para handicaps
  translatedText = applyTeamWinPatterns(translatedText)
  translatedText = applyOddEvenPatterns(translatedText)
  translatedText = applyGoalPatterns(translatedText) // Nova camada para padrões de gols
  translatedText = applyMetricTranslations(translatedText)
  
  // Se o esporte foi fornecido, aplica traduções específicas do esporte
  if (sport) {
    translatedText = applySportTranslations(translatedText)
  }
  
  // Casos especiais combinados
  // TO(x) for Team1 - Shots on goal → "Total de chutes a gol acima de x para o Time 1"
  translatedText = translatedText.replace(
    /Total acima de ([\d.]+) para o Time 1 - Shots on goal/gi,
    'Total de chutes a gol acima de $1 para o Time 1'
  )
  
  translatedText = translatedText.replace(
    /Total abaixo de ([\d.]+) para o Time 1 - Shots on goal/gi,
    'Total de chutes a gol abaixo de $1 para o Time 1'
  )
  
  translatedText = translatedText.replace(
    /Total acima de ([\d.]+) para o Time 2 - Shots on goal/gi,
    'Total de chutes a gol acima de $1 para o Time 2'
  )
  
  translatedText = translatedText.replace(
    /Total abaixo de ([\d.]+) para o Time 2 - Shots on goal/gi,
    'Total de chutes a gol abaixo de $1 para o Time 2'
  )
  
  // Casos similares para outras métricas
  const metrics = ['Shots', 'Corners', 'Sets', 'Maps', 'Goals', 'Cards', 'Fouls']
  metrics.forEach(metric => {
    const metricTranslation = METRIC_TRANSLATIONS[metric] || metric
    
    // Para Time 1
    translatedText = translatedText.replace(
      new RegExp(`Total acima de ([\d.]+) para o Time 1 - ${metric}`, 'gi'),
      `Total de ${metricTranslation.toLowerCase()} acima de $1 para o Time 1`
    )
    
    translatedText = translatedText.replace(
      new RegExp(`Total abaixo de ([\d.]+) para o Time 1 - ${metric}`, 'gi'),
      `Total de ${metricTranslation.toLowerCase()} abaixo de $1 para o Time 1`
    )
    
    // Para Time 2
    translatedText = translatedText.replace(
      new RegExp(`Total acima de ([\d.]+) para o Time 2 - ${metric}`, 'gi'),
      `Total de ${metricTranslation.toLowerCase()} acima de $1 para o Time 2`
    )
    
    translatedText = translatedText.replace(
      new RegExp(`Total abaixo de ([\d.]+) para o Time 2 - ${metric}`, 'gi'),
      `Total de ${metricTranslation.toLowerCase()} abaixo de $1 para o Time 2`
    )
  })
  
  // Especifica "de gols" quando não há métrica específica
  // Total acima de X → Total de gols acima de X
  translatedText = translatedText.replace(
    /\bTotal acima de ([\d.]+)\b(?!.*para o Time)/gi,
    'Total de gols acima de $1'
  )
  
  translatedText = translatedText.replace(
    /\bTotal abaixo de ([\d.]+)\b(?!.*para o Time)/gi,
    'Total de gols abaixo de $1'
  )
  
  // Total acima de X para o Time Y → Total de gols acima de X para o Time Y
  translatedText = translatedText.replace(
    /\bTotal acima de ([\d.]+) para o Time (\d+)\b(?!.*-)/gi,
    'Total de gols acima de $1 para o Time $2'
  )
  
  translatedText = translatedText.replace(
    /\bTotal abaixo de ([\d.]+) para o Time (\d+)\b(?!.*-)/gi,
    'Total de gols abaixo de $1 para o Time $2'
  )
  
  return translatedText
}

/**
 * Categoriza um mercado para análise
 * @param {string} marketText - Texto do mercado
 * @param {string} sport - Esporte (opcional)
 * @returns {Object} - Objeto com informações categorizadas
 */
export function categorizeMarket(marketText, sport = null) {
  if (!marketText) return null
  
  const translatedText = formatMarketForDisplay(marketText, sport)
  
  // Determina a categoria baseada no padrão
  let category = 'Outros'
  let subcategory = 'Geral'
  
  if (marketText.match(/TO\(|TU\(/)) {
    category = 'Total'
    subcategory = marketText.includes('for Team') ? 'Time Específico' : 'Geral'
  } else if (marketText.match(/\b(AH|EH|TO|TU)[12]\b/)) {
    category = 'Handicap'
    subcategory = marketText.match(/\b(AH|EH)\b/) ? 'Asian/European' : 'Over/Under'
  } else if (marketText.includes('Team') && marketText.includes('Win')) {
    category = 'Resultado'
    subcategory = 'Vitória'
  } else if (marketText.match(/\b(Odd|Even)\b/)) {
    category = 'Resultado'
    subcategory = 'Par/Ímpar'
  } else if (Object.keys(METRIC_TRANSLATIONS).some(metric => marketText.includes(metric))) {
    category = 'Estatísticas'
    subcategory = 'Métricas'
  }
  
  return {
    category,
    subcategory,
    baseCode: marketText,
    originalText: marketText,
    translatedText,
    value: null,
    sport: sport
  }
}

/**
 * Traduz um campo de mercado específico
 * @param {string} marketText - Texto original do campo market
 * @returns {string} - Texto traduzido
 */
export function translateMarketField(marketText) {
  return formatMarketForDisplay(marketText)
}

/**
 * Obtém categorias de mercado disponíveis
 * @returns {Array} - Array de categorias
 */
export function getMarketCategories() {
  return ['Total', 'Handicap', 'Resultado', 'Gols', 'Estatísticas', 'Outros']
}

/**
 * Obtém subcategorias para uma categoria
 * @param {string} category - Categoria
 * @returns {Array} - Array de subcategorias
 */
export function getSubcategories(category) {
  const subcategories = {
    'Total': ['Geral', 'Time Específico'],
    'Handicap': ['Asian/European', 'Over/Under'],
    'Resultado': ['Vitória', 'Par/Ímpar'],
    'Gols': ['Both to Score', 'One Scoreless', 'Clean Sheet'],
    'Estatísticas': ['Métricas'],
    'Outros': ['Geral']
  }
  
  return subcategories[category] || []
}

/**
 * Obtém códigos de mercado para uma categoria e subcategoria
 * @param {string} category - Categoria
 * @param {string} subcategory - Subcategoria
 * @returns {Array} - Array de códigos
 */
export function getMarketCodes(category, subcategory) {
  // Retorna exemplos baseados na categoria
  const examples = {
    'Total': ['TO(2.5)', 'TU(1.5)', 'TO(3.5) for Team1', 'TU(2.5) for Team2'],
    'Handicap': ['AH1', 'AH2', 'EH1', 'EH2', 'TO1', 'TU1', 'TO2', 'TU2'],
    'Resultado': ['Team1 Win', 'Team2 Win', 'Odd', 'Even'],
    'Gols': ['Both to score', 'One scoreless', 'BTS', 'Clean sheet'],
    'Estatísticas': ['Shots on goal', 'Corners', 'Sets', 'Maps'],
    'Outros': ['Outros mercados']
  }
  
  return examples[category] || []
}

/**
 * Verifica se um mercado está em uma categoria
 * @param {string} marketText - Texto do mercado
 * @param {string} category - Categoria
 * @returns {boolean} - True se estiver na categoria
 */
export function isMarketInCategory(marketText, category) {
  const categorized = categorizeMarket(marketText)
  return categorized && categorized.category === category
}

/**
 * Obtém traduções disponíveis
 * @returns {Object} - Objeto com todas as traduções
 */
export function getAvailableTranslations() {
  return {
    numericPatterns: NUMERIC_PATTERNS,
    teamContextPatterns: TEAM_CONTEXT_PATTERNS,
    handicapPatterns: HANDICAP_PATTERNS, // Novo mapeamento
    teamWinPatterns: TEAM_WIN_PATTERNS,
    oddEvenPatterns: ODD_EVEN_PATTERNS,
    goalPatterns: GOAL_PATTERNS, // Nova categoria de padrões de gols
    metricTranslations: METRIC_TRANSLATIONS,
    sportTranslations: SPORT_TRANSLATIONS
  }
}

/**
 * Verifica se um termo tem tradução
 * @param {string} term - Termo a verificar
 * @returns {boolean} - True se tiver tradução
 */
export function hasTranslation(term) {
  if (!term) return false
  
  return Object.keys(METRIC_TRANSLATIONS).includes(term) ||
         Object.keys(SPORT_TRANSLATIONS).includes(term) ||
         Object.keys(TEAM_WIN_PATTERNS).includes(term) ||
         Object.keys(TEAM_CONTEXT_PATTERNS).includes(term) ||
         Object.keys(HANDICAP_PATTERNS).includes(term) || // Novo mapeamento
         Object.keys(ODD_EVEN_PATTERNS).includes(term) ||
         Object.keys(GOAL_PATTERNS).includes(term) || // Nova categoria de padrões de gols
         Object.keys(NUMERIC_PATTERNS).some(pattern => new RegExp(pattern, 'i').test(term))
}

/**
 * Obtém a tradução de um termo específico
 * @param {string} term - Termo a traduzir
 * @returns {string|null} - Tradução ou null se não encontrada
 */
export function getTranslation(term) {
  if (!term) return null
  
  // Verifica em cada mapeamento
  if (METRIC_TRANSLATIONS[term]) return METRIC_TRANSLATIONS[term]
  if (SPORT_TRANSLATIONS[term]) return SPORT_TRANSLATIONS[term]
  if (TEAM_WIN_PATTERNS[term]) return TEAM_WIN_PATTERNS[term]
  if (TEAM_CONTEXT_PATTERNS[term]) return TEAM_CONTEXT_PATTERNS[term]
  if (HANDICAP_PATTERNS[term]) return HANDICAP_PATTERNS[term] // Novo mapeamento
  if (ODD_EVEN_PATTERNS[term]) return ODD_EVEN_PATTERNS[term]
  if (GOAL_PATTERNS[term]) return GOAL_PATTERNS[term] // Nova categoria de padrões de gols
  
  // Verifica padrões numéricos
  for (const [pattern, replacement] of Object.entries(NUMERIC_PATTERNS)) {
    const regex = new RegExp(pattern, 'i')
    if (regex.test(term)) {
      const match = term.match(regex)
      if (match) {
        return replacement(...match)
      }
    }
  }
  
  return null
}
