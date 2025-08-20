/**
 * Configurações da API
 */

export const API_CONFIG = {
  // URL base da API
  BASE_URL: 'https://zerolossbet.com',
  
  // Endpoints
  ENDPOINTS: {
    SUREBETS: '/api/fetch_surebets/'
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'BoasVindasBot/1.0'
  },
  
  // Configurações de timeout e retry
  TIMEOUT: 30000, // 30 segundos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configurações de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 1000 // Máximo de 1000 registros em cache
}

/**
 * Construir URL completa da API
 * @param {string} endpoint - Endpoint da API
 * @returns {string} URL completa
 */
export function buildApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * Verificar se a API está disponível
 * @returns {Promise<boolean>} True se a API estiver disponível
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: 'HEAD',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors'
    })
    return response.ok
  } catch (error) {
    console.error('Erro ao verificar saúde da API:', error)
    return false
  }
}
