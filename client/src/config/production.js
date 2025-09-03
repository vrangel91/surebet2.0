// Configurações para produção
export const PRODUCTION_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  WS_BASE_URL: 'ws://localhost:3002',
  ENVIRONMENT: 'production'
};

// Função para obter URL da API baseada no ambiente
export function getApiUrl() {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_CONFIG.API_BASE_URL;
  }
  return '/api'; // Proxy em desenvolvimento
}

// Função para obter URL do WebSocket baseada no ambiente
export function getWsUrl() {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_CONFIG.WS_BASE_URL;
  }
  return '/ws'; // Proxy em desenvolvimento
}
