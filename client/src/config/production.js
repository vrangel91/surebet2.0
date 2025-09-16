// Configurações para produção
export const PRODUCTION_CONFIG = {
  API_BASE_URL: "https://surestake.com.br", // ✅ Domínio correto
  WS_BASE_URL: "wss://surestake.com.br/ws", // ✅ Domínio correto com path /ws
  ENVIRONMENT: "production",
};

// Função para obter URL da API baseada no ambiente
export function getApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_CONFIG.API_BASE_URL;
  }
  return ""; // Usar proxy em desenvolvimento
}

// Função para obter URL do WebSocket baseada no ambiente
export function getWsUrl() {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_CONFIG.WS_BASE_URL;
  }
  return "/ws"; // Proxy em desenvolvimento
}
