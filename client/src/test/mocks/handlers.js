import { http, HttpResponse } from 'msw'

// Mock data para testes
const mockSurebets = {
  'surebet_001': [
    {
      house: 'Bet365',
      chance: 2.10,
      market: 'Resultado Final',
      sport: 'Futebol',
      event: 'Brasil vs Argentina',
      selection1: 'Brasil',
      selection2: 'Empate',
      selection3: 'Argentina',
      odds1: 2.10,
      odds2: 3.40,
      odds3: 3.80,
      profit: 15.50,
      roi: 3.2,
      stake: 100,
      isLive: false,
      timestamp: new Date().toISOString()
    },
    {
      house: 'William Hill',
      chance: 3.40,
      market: 'Resultado Final',
      sport: 'Futebol',
      event: 'Brasil vs Argentina',
      selection1: 'Brasil',
      selection2: 'Empate',
      selection3: 'Argentina',
      odds1: 2.10,
      odds2: 3.40,
      odds3: 3.80,
      profit: 15.50,
      roi: 3.2,
      stake: 100,
      isLive: false,
      timestamp: new Date().toISOString()
    }
  ],
  'surebet_002': [
    {
      house: 'Betfair',
      chance: 1.85,
      market: 'Over/Under 2.5',
      sport: 'Futebol',
      event: 'Manchester United vs Liverpool',
      selection1: 'Over 2.5',
      selection2: 'Under 2.5',
      odds1: 1.85,
      odds2: 2.05,
      profit: 8.20,
      roi: 2.1,
      stake: 100,
      isLive: true,
      timestamp: new Date().toISOString()
    },
    {
      house: 'Pinnacle',
      chance: 2.05,
      market: 'Over/Under 2.5',
      sport: 'Futebol',
      event: 'Manchester United vs Liverpool',
      selection1: 'Over 2.5',
      selection2: 'Under 2.5',
      odds1: 1.85,
      odds2: 2.05,
      profit: 8.20,
      roi: 2.1,
      stake: 100,
      isLive: true,
      timestamp: new Date().toISOString()
    }
  ]
}

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  isVIP: true,
  isAdmin: false,
  balance: 1000.00
}

const mockBookmakerAccounts = [
  {
    id: 1,
    bookmaker: 'Bet365',
    username: 'test_user',
    isActive: true,
    balance: 500.00
  },
  {
    id: 2,
    bookmaker: 'William Hill',
    username: 'test_user2',
    isActive: true,
    balance: 300.00
  }
]

// Handlers para MSW
export const handlers = [
  // API de Surebets
  http.get('/api/surebets', () => {
    return HttpResponse.json(mockSurebets)
  }),

  // API de usuário
  http.get('/api/user/profile', () => {
    return HttpResponse.json(mockUser)
  }),

  // API de contas de bookmakers
  http.get('/api/bookmaker-accounts', () => {
    return HttpResponse.json(mockBookmakerAccounts)
  }),

  // API de estatísticas
  http.get('/api/surebets/stats', () => {
    return HttpResponse.json({
      totalSurebets: Object.keys(mockSurebets).length,
      preliveCount: 1,
      liveCount: 1,
      averageROI: 2.65,
      totalProfit: 23.70
    })
  }),

  // API de filtros
  http.get('/api/surebets/filters', () => {
    return HttpResponse.json({
      sports: ['Futebol', 'Basquete', 'Tênis'],
      houses: ['Bet365', 'William Hill', 'Betfair', 'Pinnacle'],
      currencies: ['BRL', 'USD', 'EUR']
    })
  }),

  // WebSocket mock (simulado via HTTP)
  http.get('/api/websocket/status', () => {
    return HttpResponse.json({
      connected: true,
      lastMessage: new Date().toISOString()
    })
  }),

  // Mock de erro para testes de falha
  http.get('/api/surebets/error', () => {
    return HttpResponse.json(
      { error: 'Servidor temporariamente indisponível' },
      { status: 500 }
    )
  }),

  // Mock de timeout
  http.get('/api/surebets/timeout', () => {
    return new Promise(() => {}) // Nunca resolve para simular timeout
  })
]

// Função para adicionar novos surebets dinamicamente
export const addMockSurebet = (id, surebetData) => {
  mockSurebets[id] = surebetData
}

// Função para limpar dados de teste
export const clearMockData = () => {
  Object.keys(mockSurebets).forEach(key => {
    if (!key.startsWith('surebet_00')) {
      delete mockSurebets[key]
    }
  })
}
