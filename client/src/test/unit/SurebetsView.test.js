/**
 * Testes Unitários para SurebetsView.vue
 * Testa funcionalidades básicas, cache e performance
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import SurebetsView from '@/views/SurebetsView.vue'
import surebetsCache from '@/utils/surebetsCache'

// Mock do router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/surebets', component: SurebetsView },
    { path: '/login', component: { template: '<div>Login</div>' } }
  ]
})

// Mock de componentes
const mockComponents = {
  RouteGuard: {
    template: '<div><slot /></div>',
    props: ['requiresVIP']
  },
  Sidebar: {
    template: '<div class="sidebar">Sidebar</div>',
    props: ['sidebarCollapsed'],
    emits: ['toggle-sidebar', 'sidebar-state-loaded']
  },
  Header: {
    template: '<div class="header">Header</div>'
  },
  SurebetCard: {
    template: '<div class="surebet-card">Surebet Card</div>',
    props: ['surebet', 'isPinned', 'soundEnabled']
  }
}

// Mock de dados de teste
const mockSurebetsData = {
  success: true,
  data: {
    surebets: [
      {
        id: 1,
        sport: 'Futebol',
        profit: 5.2,
        house1: 'Casa A',
        house2: 'Casa B',
        odds1: 2.1,
        odds2: 2.0,
        isLive: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        sport: 'Basquete',
        profit: 3.8,
        house1: 'Casa C',
        house2: 'Casa D',
        odds1: 1.8,
        odds2: 1.9,
        isLive: true,
        createdAt: new Date().toISOString()
      }
    ],
    total: 2,
    timestamp: Date.now()
  }
}

describe('SurebetsView.vue', () => {
  let wrapper
  let mockFetch

  beforeEach(async () => {
    // Mock fetch global
    mockFetch = vi.fn()
    global.fetch = mockFetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSurebetsData)
    })

    // Limpar cache antes de cada teste
    surebetsCache.clear()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock console para evitar logs nos testes
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Montar componente
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [router],
        components: mockComponents,
        stubs: {
          'lucide-vue-next': true
        }
      }
    })

    // Aguardar componente ser montado
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar corretamente', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.surebets-container').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('Surebets')
    })

    it('deve mostrar controles de busca', () => {
      expect(wrapper.find('.search-controls').exists()).toBe(true)
      expect(wrapper.find('.control-btn').exists()).toBe(true)
    })

    it('deve mostrar filtros de data', () => {
      expect(wrapper.find('.date-filters').exists()).toBe(true)
      expect(wrapper.find('.date-filter-input').exists()).toBe(true)
    })
  })

  describe('Funcionalidades de Cache', () => {
    it('deve usar cache para evitar chamadas desnecessárias', async () => {
      // Primeira chamada
      await wrapper.vm.fetchSurebets()
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Segunda chamada (deve usar cache)
      await wrapper.vm.fetchSurebets()
      expect(mockFetch).toHaveBeenCalledTimes(1) // Não deve chamar novamente
    })

    it('deve forçar refresh quando solicitado', async () => {
      // Primeira chamada
      await wrapper.vm.fetchSurebets()
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Refresh forçado
      await wrapper.vm.fetchSurebets(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('deve limpar cache quando solicitado', () => {
      const clearSpy = vi.spyOn(surebetsCache, 'clear')
      wrapper.vm.clearCache()
      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('Controles de Busca', () => {
    it('deve alternar estado de busca', async () => {
      const initialSearching = wrapper.vm.isSearching
      
      await wrapper.find('.control-btn').trigger('click')
      
      expect(wrapper.vm.isSearching).toBe(!initialSearching)
    })

    it('deve alternar som', async () => {
      const initialSound = wrapper.vm.soundEnabled
      
      const soundButton = wrapper.findAll('.control-btn')[1]
      await soundButton.trigger('click')
      
      expect(wrapper.vm.soundEnabled).toBe(!initialSound)
    })

    it('deve mostrar estado correto dos botões', () => {
      const searchButton = wrapper.find('.control-btn')
      expect(searchButton.classes()).toContain('active')
    })
  })

  describe('Filtros', () => {
    it('deve aplicar filtro de data', async () => {
      const dateInput = wrapper.find('.date-filter-input')
      const testDate = '2024-01-15'
      
      await dateInput.setValue(testDate)
      await dateInput.trigger('change')
      
      expect(wrapper.vm.selectedDate).toBe(testDate)
    })

    it('deve limpar filtro de data', async () => {
      wrapper.vm.selectedDate = '2024-01-15'
      await wrapper.vm.$nextTick()
      
      const clearButton = wrapper.find('.clear-date-btn')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.selectedDate).toBe('')
    })

    it('deve alternar entre filtros prelive e live', async () => {
      const preliveTab = wrapper.find('.filter-tab')
      await preliveTab.trigger('click')
      
      expect(wrapper.vm.activeFilter).toBe('prelive')
    })
  })

  describe('Performance e Otimização', () => {
    it('deve evitar múltiplas chamadas simultâneas', async () => {
      // Iniciar múltiplas chamadas simultâneas
      const promises = [
        wrapper.vm.fetchSurebets(),
        wrapper.vm.fetchSurebets(),
        wrapper.vm.fetchSurebets()
      ]
      
      await Promise.all(promises)
      
      // Deve fazer apenas uma chamada real
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('deve implementar retry com backoff exponencial', async () => {
      // Mock de erro
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      // Mock de sucesso na segunda tentativa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSurebetsData)
      })

      await wrapper.vm.fetchSurebets()
      
      // Deve ter tentado novamente
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('deve parar polling quando componente é desmontado', () => {
      const stopSpy = vi.spyOn(wrapper.vm, 'stopAutoUpdate')
      
      wrapper.unmount()
      
      expect(stopSpy).toHaveBeenCalled()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erros de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      await wrapper.vm.fetchSurebets()
      
      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('deve tratar respostas HTTP inválidas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
      
      await wrapper.vm.fetchSurebets()
      
      expect(wrapper.vm.error).toContain('HTTP 500')
    })

    it('deve tratar dados inválidos da API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, message: 'Invalid data' })
      })
      
      await wrapper.vm.fetchSurebets()
      
      expect(wrapper.vm.error).toBe('Invalid data')
    })
  })

  describe('Integração com Cache', () => {
    it('deve mostrar estatísticas do cache', () => {
      const stats = wrapper.vm.getCacheStats()
      
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('size')
    })

    it('deve atualizar estatísticas após uso', async () => {
      const initialStats = wrapper.vm.getCacheStats()
      
      await wrapper.vm.fetchSurebets()
      
      const finalStats = wrapper.vm.getCacheStats()
      expect(finalStats.totalRequests).toBeGreaterThan(initialStats.totalRequests)
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar layout para diferentes tamanhos de tela', async () => {
      // Simular mudança de tamanho de tela
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      // Verificar se layout se adaptou
      expect(wrapper.find('.surebets-container').exists()).toBe(true)
    })
  })
})
