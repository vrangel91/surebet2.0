// Configurações de ambiente
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: '', // Usar proxy em desenvolvimento
    WS_BASE_URL: '/ws', // Usar proxy em desenvolvimento
    ENVIRONMENT: 'development'
  },
  production: {
    API_BASE_URL: 'https://surestake.com.br', // Seu domínio real
    WS_BASE_URL: 'wss://surestake.com.br',   // WebSocket do seu domínio
    ENVIRONMENT: 'production'
  },
  staging: {
    API_BASE_URL: 'https://surestake.com.br', // Usar o mesmo domínio principal
    WS_BASE_URL: 'wss://surestake.com.br',   // WebSocket do domínio principal
    ENVIRONMENT: 'staging'
  }
};

// Função para obter configuração baseada no ambiente
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENTS[env] || ENVIRONMENTS.development;
}

// Função para obter URL da API baseada no ambiente
export function getApiUrl() {
  const config = getEnvironmentConfig();
  return config.API_BASE_URL;
}

// Função para obter URL do WebSocket baseada no ambiente
export function getWsUrl() {
  const config = getEnvironmentConfig();
  return config.WS_BASE_URL;
}

// Função para verificar se está em produção
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// Função para verificar se está em desenvolvimento
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// Função para verificar se está em staging
export function isStaging() {
  return process.env.NODE_ENV === 'staging';
}

export default {
  getEnvironmentConfig,
  getApiUrl,
  getWsUrl,
  isProduction,
  isDevelopment,
  isStaging
};
