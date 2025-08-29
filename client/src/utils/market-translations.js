/**
 * Sistema Simplificado de Mercados - Surebets
 * Este arquivo retorna os mercados exatamente como são fornecidos pela API,
 * sem categorização ou traduções.
 */

// Objetos vazios - não há categorização nem traduções
export const MARKET_MAPPING = {}
export const MARKET_TRANSLATIONS = {}

/**
 * Função simplificada - retorna apenas o texto original
 * @param {string} marketText - Texto do mercado
 * @param {string} sport - Esporte (ignorado)
 * @returns {Object} - Objeto com informações básicas
 */
export function categorizeMarket(marketText, sport = null) {
  if (!marketText) return null
  
  return {
    category: "API",
    subcategory: "Original",
    baseCode: marketText,
    originalText: marketText,
    value: null,
    sport: sport
  }
}

// Funções de extração removidas - não são mais necessárias

/**
 * Função simplificada - retorna o texto original da API
 * @param {string} marketText - Texto do mercado
 * @param {string} sport - Esporte (ignorado)
 * @returns {string} - Texto original sem modificações
 */
export function formatMarketForDisplay(marketText, sport = null) {
  if (!marketText) return 'N/A'
  
  // Retornar exatamente como veio da API
  return marketText
}

/**
 * Função simplificada - retorna o texto original
 * @param {string} marketText - Texto original do campo market
 * @returns {string} - Texto original sem modificações
 */
export function translateMarketField(marketText) {
  if (!marketText) return marketText
  
  // Retornar exatamente como veio da API
  return marketText
}

/**
 * Funções utilitárias simplificadas
 * Todas retornam valores vazios ou padrão
 */
export function getMarketCategories() {
  return []
}

export function getSubcategories(category) {
  return []
}

export function getMarketCodes(category, subcategory) {
  return []
}

export function isMarketInCategory(marketText, category) {
  return false
}

export function getAvailableTranslations() {
  return {}
}

export function hasTranslation(term) {
  return false
}

export function getTranslation(term) {
  return null
}
