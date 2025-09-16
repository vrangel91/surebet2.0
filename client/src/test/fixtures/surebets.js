// Fixtures para dados de teste de surebets

export const mockSurebetData = {
  valid: [
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
      timestamp: '2024-01-15T10:00:00Z'
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
      timestamp: '2024-01-15T10:00:00Z'
    }
  ],
  invalid: [
    {
      house: 'Bet365',
      chance: 1.50,
      market: 'Resultado Final',
      sport: 'Futebol',
      event: 'Brasil vs Argentina',
      selection1: 'Brasil',
      selection2: 'Empate',
      selection3: 'Argentina',
      odds1: 1.50,
      odds2: 1.60,
      odds3: 1.70,
      profit: -5.20,
      roi: -1.2,
      stake: 100,
      isLive: false,
      timestamp: '2024-01-15T10:00:00Z'
    }
  ],
  live: [
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
      timestamp: '2024-01-15T15:30:00Z'
    }
  ],
  extremeOdds: [
    {
      house: 'Bet365',
      chance: 1.01,
      market: 'Resultado Final',
      sport: 'Futebol',
      event: 'Brasil vs Argentina',
      selection1: 'Brasil',
      selection2: 'Empate',
      selection3: 'Argentina',
      odds1: 1.01,
      odds2: 20.0,
      odds3: 50.0,
      profit: 0.50,
      roi: 0.1,
      stake: 100,
      isLive: false,
      timestamp: '2024-01-15T10:00:00Z'
    }
  ]
}

export const mockFilters = {
  sports: ['Futebol', 'Basquete', 'Tênis', 'Vôlei'],
  houses: ['Bet365', 'William Hill', 'Betfair', 'Pinnacle', '1xBet'],
  currencies: ['BRL', 'USD', 'EUR'],
  minROI: 1.0,
  maxROI: 10.0,
  minProfit: 5.0,
  maxProfit: 1000.0
}

export const mockUser = {
  authenticated: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    isVIP: true,
    isAdmin: false,
    balance: 1000.00,
    token: 'mock-jwt-token'
  },
  notVIP: {
    id: 2,
    email: 'user@example.com',
    name: 'Regular User',
    isVIP: false,
    isAdmin: false,
    balance: 100.00,
    token: 'mock-jwt-token-2'
  },
  admin: {
    id: 3,
    email: 'admin@example.com',
    name: 'Admin User',
    isVIP: true,
    isAdmin: true,
    balance: 5000.00,
    token: 'mock-admin-token'
  }
}

export const mockBookmakerAccounts = [
  {
    id: 1,
    bookmaker: 'Bet365',
    username: 'test_user',
    isActive: true,
    balance: 500.00,
    url: 'https://www.bet365.com'
  },
  {
    id: 2,
    bookmaker: 'William Hill',
    username: 'test_user2',
    isActive: true,
    balance: 300.00,
    url: 'https://www.williamhill.com'
  },
  {
    id: 3,
    bookmaker: 'Betfair',
    username: 'test_user3',
    isActive: false,
    balance: 0.00,
    url: 'https://www.betfair.com'
  }
]

export const mockWebSocketMessages = {
  initialState: {
    type: 'initial_state',
    surebets: mockSurebetData.valid,
    isSearching: true,
    soundEnabled: true
  },
  newSurebet: {
    type: 'new_surebet',
    surebets: {
      ...mockSurebetData.valid,
      'surebet_003': mockSurebetData.live
    }
  },
  searchStateChanged: {
    type: 'search_state_changed',
    isSearching: false
  },
  error: {
    type: 'error',
    message: 'Erro de conexão com o servidor'
  }
}
