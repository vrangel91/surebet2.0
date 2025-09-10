/**
 * Teste para verificar o comportamento de atualização da página SurebetsView.vue
 * Este teste verifica se a página está atualizando corretamente sem fazer os conteúdos sumirem
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import SurebetsView from '../views/SurebetsView.vue'

// Mock do WebSocket
global.WebSocket = vi.fn(() => ({
  readyState: 1,
  close: vi.fn(),
  send: vi.fn(),
  onopen: null,
  onclose: null,
  onerror: null,
  onmessage: null
}))

// Mock do axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          'surebet1': [
            {
              house: 'Bet365',
              sport: 'Futebol',
              market: '1X2',
              odds: 2.5,
              isLive: false,
              currency: 'BRL',
              date: '2025-01-23'
            }
          ]
        }
      }
    })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  }
}))

// Mock dos composables
vi.mock('../utils/adaptivePolling.js', () => ({
  useAdaptivePolling: () => ({
    getCurrentInterval: () => 5000,
    updateConnectionQuality: vi.fn(),
    updateServerLoad: vi.fn(),
    recordRetry: vi.fn(),
    resetRetryCount: vi.fn(),
    setCustomInterval: vi.fn(),
    getStats: () => ({
      currentInterval: 5000,
      isUserActive: true,
      connectionQuality: 'good',
      serverLoad: 'low',
      retryCount: 0,
      timeSinceLastActivity: 0
    })
  })
}))

vi.mock('../utils/smartCache.js', () => ({
  useSmartCache: () => ({
    get: vi.fn(() => null),
    set: vi.fn(),
    has: vi.fn(() => false),
    clear: vi.fn(),
    getStats: () => ({ hits: 0, misses: 0, size: 0 })
  })
}))

vi.mock('../utils/rateLimiter.js', () => ({
  useRateLimiter: () => ({
    canMakeRequest: vi.fn(() => true),
    recordRequest: vi.fn(),
    getStats: () => ({ requests: 0, blocked: 0 })
  })
}))

// Mock dos componentes
vi.mock('../components/RouteGuard.vue', () => ({
  name: 'RouteGuard',
  template: '<div><slot /></div>'
}))

vi.mock('../components/Sidebar.vue', () => ({
  name: 'Sidebar',
  template: '<div>Sidebar</div>'
}))

vi.mock('../components/Header.vue', () => ({
  name: 'Header',
  template: '<div>Header</div>'
}))

vi.mock('../components/SurebetCard.vue', () => ({
  name: 'SurebetCard',
  template: '<div>SurebetCard</div>',
  props: ['surebet', 'isPinned', 'bookmakerAccounts', 'isLoadingAccounts']
}))

describe('SurebetsView Refresh Behavior', () => {
  let wrapper
  let store

  beforeEach(() => {
    // Criar store mock
    store = createStore({
      state: {
        user: {
          id: 1,
          username: 'testuser',
          isVIP: true
        },
        settings: {}
      },
      getters: {
        currentUser: () => store.state.user,
        isVIP: () => true,
        isAdmin: () => false
      },
      actions: {
        logout: vi.fn()
      }
    })

    // Mock do localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    })

    // Mock do console para capturar logs
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('should not cause content to disappear when refreshing data', async () => {
    // Montar o componente
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [store],
        stubs: {
          RouteGuard: true,
          Sidebar: true,
          Header: true,
          SurebetCard: true
        }
      }
    })

    // Aguardar o componente ser montado
    await wrapper.vm.$nextTick()

    // Simular dados iniciais
    const initialData = {
      'surebet1': [
        {
          house: 'Bet365',
          sport: 'Futebol',
          market: '1X2',
          odds: 2.5,
          isLive: false,
          currency: 'BRL',
          date: '2025-01-23'
        }
      ],
      'surebet2': [
        {
          house: 'Betfair',
          sport: 'Futebol',
          market: 'Over/Under',
          odds: 1.8,
          isLive: false,
          currency: 'BRL',
          date: '2025-01-23'
        }
      ]
    }

    // Definir dados iniciais
    wrapper.vm.surebets = initialData
    await wrapper.vm.$nextTick()

    // Verificar se os dados estão sendo exibidos
    expect(wrapper.vm.filteredSurebets.length).toBe(2)
    expect(wrapper.vm.paginatedSurebets.length).toBe(2)

    // Simular uma atualização de dados
    const updatedData = {
      ...initialData,
      'surebet3': [
        {
          house: 'William Hill',
          sport: 'Futebol',
          market: 'BTTS',
          odds: 1.9,
          isLive: false,
          currency: 'BRL',
          date: '2025-01-23'
        }
      ]
    }

    // Atualizar dados
    wrapper.vm.surebets = updatedData
    await wrapper.vm.$nextTick()

    // Verificar se os dados ainda estão sendo exibidos após a atualização
    expect(wrapper.vm.filteredSurebets.length).toBe(3)
    expect(wrapper.vm.paginatedSurebets.length).toBe(3)

    // Verificar se não há logs de erro
    expect(console.error).not.toHaveBeenCalled()
  })

  it('should handle pagination correctly during data updates', async () => {
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [store],
        stubs: {
          RouteGuard: true,
          Sidebar: true,
          Header: true,
          SurebetCard: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Criar muitos dados para testar paginação
    const manySurebets = {}
    for (let i = 1; i <= 100; i++) {
      manySurebets[`surebet${i}`] = [
        {
          house: `House${i}`,
          sport: 'Futebol',
          market: '1X2',
          odds: 1.5 + (i * 0.01),
          isLive: false,
          currency: 'BRL',
          date: '2025-01-23'
        }
      ]
    }

    wrapper.vm.surebets = manySurebets
    await wrapper.vm.$nextTick()

    // Verificar paginação inicial
    expect(wrapper.vm.filteredSurebets.length).toBe(100)
    expect(wrapper.vm.paginatedSurebets.length).toBe(52) // itemsPerPage = 52
    expect(wrapper.vm.currentPage).toBe(1)

    // Simular carregamento de mais dados
    wrapper.vm.loadMoreCards()
    await wrapper.vm.$nextTick()

    // Verificar se a paginação foi atualizada
    expect(wrapper.vm.currentPage).toBe(2)
    expect(wrapper.vm.paginatedSurebets.length).toBe(100) // Todos os itens na página 2
  })

  it('should not reset pagination unnecessarily when data changes', async () => {
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [store],
        stubs: {
          RouteGuard: true,
          Sidebar: true,
          Header: true,
          SurebetCard: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Definir dados iniciais
    const initialData = {
      'surebet1': [{ house: 'Bet365', sport: 'Futebol', market: '1X2', odds: 2.5, isLive: false, currency: 'BRL', date: '2025-01-23' }],
      'surebet2': [{ house: 'Betfair', sport: 'Futebol', market: 'Over/Under', odds: 1.8, isLive: false, currency: 'BRL', date: '2025-01-23' }]
    }

    wrapper.vm.surebets = initialData
    await wrapper.vm.$nextTick()

    // Avançar para página 2
    wrapper.vm.currentPage = 2
    await wrapper.vm.$nextTick()

    // Simular atualização de dados que não afeta a paginação
    const updatedData = {
      ...initialData,
      'surebet1': [{ 
        house: 'Bet365', 
        sport: 'Futebol', 
        market: '1X2', 
        odds: 2.6, // Odds atualizadas
        isLive: false, 
        currency: 'BRL', 
        date: '2025-01-23' 
      }]
    }

    wrapper.vm.surebets = updatedData
    await wrapper.vm.$nextTick()

    // Verificar se a página não foi resetada
    expect(wrapper.vm.currentPage).toBe(2)
  })

  it('should handle WebSocket updates without losing content', async () => {
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [store],
        stubs: {
          RouteGuard: true,
          Sidebar: true,
          Header: true,
          SurebetCard: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Simular dados iniciais
    const initialData = {
      'surebet1': [{ house: 'Bet365', sport: 'Futebol', market: '1X2', odds: 2.5, isLive: false, currency: 'BRL', date: '2025-01-23' }]
    }

    wrapper.vm.surebets = initialData
    await wrapper.vm.$nextTick()

    // Simular mensagem WebSocket
    const wsMessage = {
      type: 'surebets_update',
      data: {
        'surebet2': [{ house: 'Betfair', sport: 'Futebol', market: 'Over/Under', odds: 1.8, isLive: false, currency: 'BRL', date: '2025-01-23' }]
      }
    }

    // Simular recebimento de mensagem WebSocket
    if (wrapper.vm.ws && wrapper.vm.ws.onmessage) {
      wrapper.vm.ws.onmessage({ data: JSON.stringify(wsMessage) })
    }

    await wrapper.vm.$nextTick()

    // Verificar se os dados foram atualizados sem perder o conteúdo
    expect(wrapper.vm.surebets).toHaveProperty('surebet1')
    expect(wrapper.vm.surebets).toHaveProperty('surebet2')
  })

  it('should not cause infinite re-renders', async () => {
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [store],
        stubs: {
          RouteGuard: true,
          Sidebar: true,
          Header: true,
          SurebetCard: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Contar quantas vezes os computed properties são chamados
    let computedCallCount = 0
    const originalFilteredSurebets = wrapper.vm.filteredSurebets
    const originalPaginatedSurebets = wrapper.vm.paginatedSurebets

    // Mock dos computed properties para contar chamadas
    vi.spyOn(wrapper.vm, 'filteredSurebets', 'get').mockImplementation(() => {
      computedCallCount++
      return originalFilteredSurebets
    })

    vi.spyOn(wrapper.vm, 'paginatedSurebets', 'get').mockImplementation(() => {
      computedCallCount++
      return originalPaginatedSurebets
    })

    // Simular múltiplas atualizações
    for (let i = 0; i < 10; i++) {
      wrapper.vm.surebets = { [`surebet${i}`]: [{ house: 'Test', sport: 'Futebol', market: '1X2', odds: 2.0, isLive: false, currency: 'BRL', date: '2025-01-23' }] }
      await wrapper.vm.$nextTick()
    }

    // Verificar se não há chamadas excessivas
    expect(computedCallCount).toBeLessThan(50) // Limite razoável
  })
})

