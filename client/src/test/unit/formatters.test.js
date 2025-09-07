import { describe, it, expect } from 'vitest'

// Funções de formatação (extraídas dos componentes)
function formatCurrency(value, currency = 'BRL') {
  if (!value || isNaN(value)) return 'R$ 0,00'
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  })
  
  return formatter.format(value)
}

function formatDate(date, format = 'short') {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' }
  }
  
  return new Intl.DateTimeFormat('pt-BR', options[format] || options.short).format(dateObj)
}

function formatROI(roi) {
  if (!roi || isNaN(roi)) return '0.00%'
  
  return `${roi.toFixed(2)}%`
}

function formatProfit(profit) {
  if (!profit || isNaN(profit)) return 'R$ 0,00'
  
  const sign = profit >= 0 ? '+' : ''
  return `${sign}${formatCurrency(profit)}`
}

function formatMarket(market, sport) {
  if (!market) return 'Mercado não especificado'
  
  const marketTranslations = {
    'Resultado Final': 'Resultado Final',
    'Over/Under 2.5': 'Over/Under 2.5',
    'Ambas Marcam': 'Ambas Marcam',
    'Dupla Chance': 'Dupla Chance',
    'Handicap Asiático': 'Handicap Asiático'
  }
  
  return marketTranslations[market] || market
}

function formatBookmaker(bookmaker) {
  if (!bookmaker) return 'Casa não especificada'
  
  const bookmakerNames = {
    'Bet365': 'Bet365',
    'William Hill': 'William Hill',
    'Betfair': 'Betfair',
    'Pinnacle': 'Pinnacle',
    '1xBet': '1xBet'
  }
  
  return bookmakerNames[bookmaker] || bookmaker
}

describe('Utilitários de Formatação', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores em reais corretamente', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00')
      expect(formatCurrency(1000.50)).toBe('R$ 1.000,50')
      expect(formatCurrency(0.99)).toBe('R$ 0,99')
    })

    it('deve formatar valores negativos corretamente', () => {
      expect(formatCurrency(-100)).toBe('-R$ 100,00')
      expect(formatCurrency(-1000.50)).toBe('-R$ 1.000,50')
    })

    it('deve lidar com valores inválidos', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00')
      expect(formatCurrency(undefined)).toBe('R$ 0,00')
      expect(formatCurrency('invalid')).toBe('R$ 0,00')
      expect(formatCurrency(NaN)).toBe('R$ 0,00')
    })

    it('deve formatar com diferentes moedas', () => {
      expect(formatCurrency(100, 'USD')).toBe('US$ 100,00')
      expect(formatCurrency(100, 'EUR')).toBe('€ 100,00')
    })
  })

  describe('formatDate', () => {
    const testDate = '2024-01-15T10:30:00Z'

    it('deve formatar data no formato curto', () => {
      const formatted = formatDate(testDate, 'short')
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('deve formatar data no formato longo', () => {
      const formatted = formatDate(testDate, 'long')
      expect(formatted).toMatch(/\d{2} de \w+ de \d{4}/)
    })

    it('deve formatar apenas horário', () => {
      const formatted = formatDate(testDate, 'time')
      expect(formatted).toMatch(/\d{2}:\d{2}/)
    })

    it('deve lidar com datas inválidas', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('invalid-date')).toBe('')
    })

    it('deve usar formato curto como padrão', () => {
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('formatROI', () => {
    it('deve formatar ROI corretamente', () => {
      expect(formatROI(3.2)).toBe('3.20%')
      expect(formatROI(0.5)).toBe('0.50%')
      expect(formatROI(15.75)).toBe('15.75%')
    })

    it('deve formatar ROI negativo', () => {
      expect(formatROI(-2.5)).toBe('-2.50%')
    })

    it('deve lidar com valores inválidos', () => {
      expect(formatROI(null)).toBe('0.00%')
      expect(formatROI(undefined)).toBe('0.00%')
      expect(formatROI('invalid')).toBe('0.00%')
      expect(formatROI(NaN)).toBe('0.00%')
    })
  })

  describe('formatProfit', () => {
    it('deve formatar lucro positivo', () => {
      expect(formatProfit(15.50)).toBe('+R$ 15,50')
      expect(formatProfit(100)).toBe('+R$ 100,00')
    })

    it('deve formatar prejuízo', () => {
      expect(formatProfit(-5.25)).toBe('-R$ 5,25')
    })

    it('deve lidar com valores inválidos', () => {
      expect(formatProfit(null)).toBe('R$ 0,00')
      expect(formatProfit(undefined)).toBe('R$ 0,00')
      expect(formatProfit('invalid')).toBe('R$ 0,00')
      expect(formatProfit(NaN)).toBe('R$ 0,00')
    })
  })

  describe('formatMarket', () => {
    it('deve formatar mercados conhecidos', () => {
      expect(formatMarket('Resultado Final')).toBe('Resultado Final')
      expect(formatMarket('Over/Under 2.5')).toBe('Over/Under 2.5')
      expect(formatMarket('Ambas Marcam')).toBe('Ambas Marcam')
    })

    it('deve retornar mercado original se não conhecido', () => {
      expect(formatMarket('Mercado Desconhecido')).toBe('Mercado Desconhecido')
    })

    it('deve lidar com valores nulos', () => {
      expect(formatMarket(null)).toBe('Mercado não especificado')
      expect(formatMarket(undefined)).toBe('Mercado não especificado')
    })

    it('deve ignorar parâmetro sport se não usado', () => {
      expect(formatMarket('Resultado Final', 'Futebol')).toBe('Resultado Final')
    })
  })

  describe('formatBookmaker', () => {
    it('deve formatar casas conhecidas', () => {
      expect(formatBookmaker('Bet365')).toBe('Bet365')
      expect(formatBookmaker('William Hill')).toBe('William Hill')
      expect(formatBookmaker('Betfair')).toBe('Betfair')
    })

    it('deve retornar nome original se não conhecido', () => {
      expect(formatBookmaker('Casa Desconhecida')).toBe('Casa Desconhecida')
    })

    it('deve lidar com valores nulos', () => {
      expect(formatBookmaker(null)).toBe('Casa não especificada')
      expect(formatBookmaker(undefined)).toBe('Casa não especificada')
    })
  })

  describe('Cenários de Edge Cases', () => {
    it('deve lidar com valores muito grandes', () => {
      expect(formatCurrency(999999999.99)).toBe('R$ 999.999.999,99')
      expect(formatROI(999.99)).toBe('999.99%')
    })

    it('deve lidar com valores muito pequenos', () => {
      expect(formatCurrency(0.01)).toBe('R$ 0,01')
      expect(formatROI(0.01)).toBe('0.01%')
    })

    it('deve lidar com strings vazias', () => {
      expect(formatCurrency('')).toBe('R$ 0,00')
      expect(formatDate('')).toBe('')
      expect(formatROI('')).toBe('0.00%')
    })
  })

  describe('Performance', () => {
    it('deve formatar valores rapidamente', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        formatCurrency(100.50)
        formatDate('2024-01-15T10:30:00Z')
        formatROI(3.2)
        formatProfit(15.50)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Deve ser executado em menos de 50ms
      expect(duration).toBeLessThan(50)
    })
  })
})
