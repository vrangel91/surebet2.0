/**
 * Configuração do Banco de Dados Local
 * 
 * Este arquivo contém as configurações para o IndexedDB local
 * usado para persistir dados das surebets e estatísticas
 */

export const DATABASE_CONFIG = {
  name: 'SurebetsDB',
  version: 1,
  stores: {
    surebets: {
      name: 'surebets',
      keyPath: 'id',
      indexes: [
        { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
        { name: 'bookmaker1', keyPath: 'bookmaker1', options: { unique: false } },
        { name: 'bookmaker2', keyPath: 'bookmaker2', options: { unique: false } },
        { name: 'sport', keyPath: 'sport', options: { unique: false } },
        { name: 'profit', keyPath: 'profit', options: { unique: false } },
        { name: 'roi', keyPath: 'roi', options: { unique: false } },
        { name: 'status', keyPath: 'status', options: { unique: false } }
      ]
    },
    stats: {
      name: 'stats',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
        { name: 'type', keyPath: 'type', options: { unique: false } }
      ]
    },
    bookmakers: {
      name: 'bookmakers',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name', options: { unique: true } },
        { name: 'status', keyPath: 'status', options: { unique: false } }
      ]
    }
  }
}

export const CACHE_CONFIG = {
  // Tempo de vida do cache em milissegundos
  surebets: 5 * 60 * 1000,        // 5 minutos
  stats: 15 * 60 * 1000,          // 15 minutos
  bookmakers: 60 * 60 * 1000,     // 1 hora
  
  // Intervalos de atualização automática
  refreshIntervals: {
    fast: 15000,      // 15 segundos
    normal: 30000,    // 30 segundos
    slow: 60000,      // 1 minuto
    verySlow: 300000  // 5 minutos
  }
}

export const STORAGE_KEYS = {
  CACHE_PREFIX: 'ranking_cache_',
  SETTINGS: 'ranking_settings',
  LAST_UPDATE: 'ranking_last_update',
  USER_PREFERENCES: 'ranking_user_preferences'
}

export const ERROR_MESSAGES = {
  DB_INIT_FAILED: 'Falha ao inicializar banco de dados local',
  DB_READ_FAILED: 'Falha ao ler dados do banco local',
  DB_WRITE_FAILED: 'Falha ao salvar dados no banco local',
  CACHE_EXPIRED: 'Cache expirado, buscando dados atualizados',
  NETWORK_ERROR: 'Erro de rede, usando dados locais',
  NO_DATA: 'Nenhum dado disponível'
}

export const SUCCESS_MESSAGES = {
  DB_INIT_SUCCESS: 'Banco de dados local inicializado com sucesso',
  DATA_SAVED: 'Dados salvos no banco local',
  DATA_LOADED: 'Dados carregados do banco local',
  CACHE_UPDATED: 'Cache atualizado com sucesso'
}
