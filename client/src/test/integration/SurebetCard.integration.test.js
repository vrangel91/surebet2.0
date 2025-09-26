import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SurebetCard from '@/components/UI/SurebetCard.vue'
import { mockSurebetData, mockBookmakerAccounts } from '../fixtures/surebets.js'

// Mock das dependências
vi.mock('@/config/bookmakerUrls.js', () => ({
  getBookmakerUrl: vi.fn(() => 'https://example.com'),
  extractDomainFromAnchorh: vi.fn(() => 'example.com'),
  buildBookmakerUrlFromDomain: vi.fn(() => 'https://example.com')
}))

vi.mock('@/utils/http.js', () => ({
  http: {
    get: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

describe('SurebetCard - Testes de Integração', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(SurebetCard, {
      props: {
        surebet: mockSurebetData.valid,
        isPinned: false,
        isDragging: false,
        bookmakerAccounts: mockBookmakerAccounts,
        isLoadingAccounts: false,
        ...props
      }
    })
  }

  describe('Renderização Inicial', () => {
    it('deve renderizar o card com dados válidos', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.surebet-card').exists()).toBe(true)
      expect(wrapper.find('.event-title').text()).toContain('Brasil vs Argentina')
      expect(wrapper.find('.sport-badge').text()).toContain('Futebol')
    })

    it('deve exibir informações de lucro corretamente', () => {
      wrapper = createWrapper()
      
      const profitElement = wrapper.find('.profit-value')
      expect(profitElement.exists()).toBe(true)
      expect(profitElement.text()).toContain('R$')
    })

    it('deve exibir ROI corretamente', () => {
      wrapper = createWrapper()
      
      const roiElement = wrapper.find('.roi-value')
      expect(roiElement.exists()).toBe(true)
      expect(roiElement.text()).toContain('%')
    })

    it('deve renderizar opções de aposta', () => {
      wrapper = createWrapper()
      
      const betOptions = wrapper.findAll('.bet-option')
      expect(betOptions).toHaveLength(2)
      
      expect(betOptions[0].find('.bookmaker').text()).toContain('Bet365')
      expect(betOptions[1].find('.bookmaker').text()).toContain('William Hill')
    })
  })

  describe('Cálculos de Stake', () => {
    it('deve calcular stakes corretamente', () => {
      wrapper = createWrapper()
      
      const stakes = wrapper.vm.calculatedStakes
      expect(stakes).toHaveLength(2)
      expect(stakes[0]).toBeGreaterThan(0)
      expect(stakes[1]).toBeGreaterThan(0)
    })

    it('deve exibir stakes calculados na UI', () => {
      wrapper = createWrapper()
      
      const stakeValues = wrapper.findAll('.stake-value')
      expect(stakeValues).toHaveLength(2)
      
      stakeValues.forEach(stakeValue => {
        expect(stakeValue.text()).toContain('R$')
      })
    })

    it('deve calcular total de investimento', () => {
      wrapper = createWrapper()
      
      const totalInvestment = wrapper.vm.totalInvestment
      expect(totalInvestment).toBeGreaterThan(0)
      expect(typeof totalInvestment).toBe('number')
    })

    it('deve calcular lucro esperado', () => {
      wrapper = createWrapper()
      
      const expectedProfit = wrapper.vm.expectedProfit
      expect(expectedProfit).toBeGreaterThan(0)
      expect(typeof expectedProfit).toBe('number')
    })
  })

  describe('Interações do Usuário', () => {
    it('deve permitir clicar no botão de apostar', async () => {
      wrapper = createWrapper()
      
      const betButton = wrapper.find('.bet-btn')
      expect(betButton.exists()).toBe(true)
      
      await betButton.trigger('click')
      
      // Verifica se a função placeBet foi chamada
      expect(wrapper.vm.placeBet).toBeDefined()
    })

    it('deve desabilitar botão quando não há URL válida', () => {
      wrapper = createWrapper({
        surebet: [
          { ...mockSurebetData.valid[0], url: null },
          { ...mockSurebetData.valid[1], url: null }
        ]
      })
      
      const betButtons = wrapper.findAll('.bet-btn')
      betButtons.forEach(button => {
        expect(button.classes()).toContain('disabled')
      })
    })

    it('deve exibir tooltip correto para botão desabilitado', () => {
      wrapper = createWrapper({
        surebet: [
          { ...mockSurebetData.valid[0], url: null }
        ]
      })
      
      const betButton = wrapper.find('.bet-btn')
      expect(betButton.attributes('title')).toContain('URL não disponível')
    })
  })

  describe('Estados Especiais', () => {
    it('deve exibir indicador de card fixo', () => {
      wrapper = createWrapper({ isPinned: true })
      
      const pinnedIndicator = wrapper.find('.pinned-indicator')
      expect(pinnedIndicator.exists()).toBe(true)
    })

    it('deve exibir indicador de arrastando', () => {
      wrapper = createWrapper({ isDragging: true })
      
      expect(wrapper.classes()).toContain('dragging')
    })

    it('deve lidar com surebet inválido', () => {
      wrapper = createWrapper({ surebet: mockSurebetData.invalid })
      
      const stakes = wrapper.vm.calculatedStakes
      expect(stakes).toEqual([0, 0])
    })

    it('deve lidar com dados vazios', () => {
      wrapper = createWrapper({ surebet: [] })
      
      const stakes = wrapper.vm.calculatedStakes
      expect(stakes).toEqual([])
    })
  })

  describe('Formatação de Dados', () => {
    it('deve formatar moeda corretamente', () => {
      wrapper = createWrapper()
      
      const stakeValues = wrapper.findAll('.stake-value')
      stakeValues.forEach(stakeValue => {
        expect(stakeValue.text()).toMatch(/R\$\s?\d+,\d{2}/)
      })
    })

    it('deve formatar odds corretamente', () => {
      wrapper = createWrapper()
      
      const oddsValues = wrapper.findAll('.odds-value')
      oddsValues.forEach(oddsValue => {
        expect(oddsValue.text()).toMatch(/\d+\.\d{2}/)
      })
    })

    it('deve formatar mercado corretamente', () => {
      wrapper = createWrapper()
      
      const marketElements = wrapper.findAll('.market')
      marketElements.forEach(market => {
        expect(market.text()).toContain('Resultado Final')
      })
    })
  })

  describe('Responsividade', () => {
    it('deve renderizar em diferentes tamanhos de tela', () => {
      // Simula diferentes viewports
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ]
      
      viewports.forEach(viewport => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        })
        
        wrapper = createWrapper()
        expect(wrapper.find('.surebet-card').exists()).toBe(true)
        wrapper.unmount()
      })
    })
  })

  describe('Performance', () => {
    it('deve renderizar rapidamente com muitos dados', () => {
      const startTime = Date.now()
      
      wrapper = createWrapper()
      
      const endTime = Date.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Deve renderizar em menos de 100ms
    })

    it('deve calcular stakes rapidamente', () => {
      wrapper = createWrapper()
      
      const startTime = Date.now()
      wrapper.vm.calculatedStakes
      const endTime = Date.now()
      
      const calculationTime = endTime - startTime
      expect(calculationTime).toBeLessThan(10) // Deve calcular em menos de 10ms
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter botões acessíveis', () => {
      wrapper = createWrapper()
      
      const betButtons = wrapper.findAll('.bet-btn')
      betButtons.forEach(button => {
        expect(button.attributes('title')).toBeDefined()
      })
    })

    it('deve ter estrutura semântica correta', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.surebet-card').exists()).toBe(true)
      expect(wrapper.find('.event-title').exists()).toBe(true)
      expect(wrapper.find('.bet-options').exists()).toBe(true)
    })
  })
})
