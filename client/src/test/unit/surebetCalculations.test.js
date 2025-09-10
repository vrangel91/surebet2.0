import { describe, it, expect, beforeEach } from 'vitest'
import { mockSurebetData } from '../fixtures/surebets.js'

// Função para calcular stakes de surebet (extraída do componente)
function calculateSurebetStakes(surebet, defaultStake = 100) {
  if (!surebet || surebet.length === 0) return []
  
  const odds = surebet.map(bet => parseFloat(bet.chance) || 1.0)
  const totalOdds = odds.reduce((sum, odd) => sum + (1 / odd), 0)
  
  // Se totalOdds >= 1, não é um surebet válido
  if (totalOdds >= 1) return odds.map(() => 0)
  
  // Calcula o stake para cada casa
  const rawStakes = odds.map(odd => {
    const stake = (defaultStake / odd) / totalOdds
    return stake
  })
  
  // Arredonda os valores para números inteiros
  const roundedStakes = rawStakes.map(stake => Math.round(stake))
  
  // Garante que todos os valores sejam pelo menos 1
  for (let i = 0; i < roundedStakes.length; i++) {
    if (roundedStakes[i] < 1) {
      roundedStakes[i] = 1
    }
  }
  
  return roundedStakes
}

// Função para calcular lucro esperado
function calculateExpectedProfit(surebet, stakes) {
  if (stakes.length === 0) return 0
  
  const totalInvestment = stakes.reduce((sum, stake) => sum + stake, 0)
  
  // Calcula o retorno mínimo (qualquer aposta que ganhar)
  const minReturn = Math.min(...stakes.map((stake, index) => 
    stake * (parseFloat(surebet[index].chance) || 1.0)
  ))
  
  return Math.round((minReturn - totalInvestment) * 100) / 100
}

// Função para verificar se é um surebet válido
function isValidSurebet(surebet) {
  if (!surebet || surebet.length < 2) return false
  
  const odds = surebet.map(bet => parseFloat(bet.chance) || 1.0)
  const totalOdds = odds.reduce((sum, odd) => sum + (1 / odd), 0)
  
  return totalOdds < 1
}

describe('Cálculos de Surebet', () => {
  describe('calculateSurebetStakes', () => {
    it('deve calcular stakes corretamente para surebet válido', () => {
      const surebet = mockSurebetData.valid
      const stakes = calculateSurebetStakes(surebet, 100)
      
      expect(stakes).toHaveLength(2)
      expect(stakes[0]).toBeGreaterThan(0)
      expect(stakes[1]).toBeGreaterThan(0)
      expect(stakes.every(stake => stake >= 1)).toBe(true)
    })

    it('deve retornar array vazio para surebet inválido', () => {
      const surebet = mockSurebetData.invalid
      const stakes = calculateSurebetStakes(surebet, 100)
      
      expect(stakes).toEqual([0, 0])
    })

    it('deve calcular stakes com valores extremos', () => {
      const surebet = mockSurebetData.extremeOdds
      const stakes = calculateSurebetStakes(surebet, 100)
      
      expect(stakes).toHaveLength(3)
      expect(stakes.every(stake => stake >= 1)).toBe(true)
    })

    it('deve retornar array vazio para dados vazios', () => {
      const stakes = calculateSurebetStakes([], 100)
      expect(stakes).toEqual([])
    })

    it('deve retornar array vazio para dados nulos', () => {
      const stakes = calculateSurebetStakes(null, 100)
      expect(stakes).toEqual([])
    })
  })

  describe('calculateExpectedProfit', () => {
    it('deve calcular lucro corretamente para surebet válido', () => {
      const surebet = mockSurebetData.valid
      const stakes = calculateSurebetStakes(surebet, 100)
      const profit = calculateExpectedProfit(surebet, stakes)
      
      expect(profit).toBeGreaterThan(0)
      expect(typeof profit).toBe('number')
    })

    it('deve retornar 0 para stakes vazios', () => {
      const surebet = mockSurebetData.valid
      const profit = calculateExpectedProfit(surebet, [])
      
      expect(profit).toBe(0)
    })

    it('deve calcular lucro com valores extremos', () => {
      const surebet = mockSurebetData.extremeOdds
      const stakes = calculateSurebetStakes(surebet, 100)
      const profit = calculateExpectedProfit(surebet, stakes)
      
      expect(typeof profit).toBe('number')
    })
  })

  describe('isValidSurebet', () => {
    it('deve retornar true para surebet válido', () => {
      const surebet = mockSurebetData.valid
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(true)
    })

    it('deve retornar false para surebet inválido', () => {
      const surebet = mockSurebetData.invalid
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(false)
    })

    it('deve retornar false para dados vazios', () => {
      const isValid = isValidSurebet([])
      expect(isValid).toBe(false)
    })

    it('deve retornar false para dados nulos', () => {
      const isValid = isValidSurebet(null)
      expect(isValid).toBe(false)
    })

    it('deve retornar false para surebet com menos de 2 apostas', () => {
      const surebet = [mockSurebetData.valid[0]]
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(false)
    })
  })

  describe('Cenários de Edge Cases', () => {
    it('deve lidar com odds muito baixas (1.01)', () => {
      const surebet = [
        { chance: 1.01, house: 'Bet365' },
        { chance: 20.0, house: 'William Hill' }
      ]
      
      const stakes = calculateSurebetStakes(surebet, 100)
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(true)
      expect(stakes).toHaveLength(2)
      expect(stakes.every(stake => stake >= 1)).toBe(true)
    })

    it('deve lidar com odds muito altas (100.0)', () => {
      const surebet = [
        { chance: 1.50, house: 'Bet365' },
        { chance: 100.0, house: 'William Hill' }
      ]
      
      const stakes = calculateSurebetStakes(surebet, 100)
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(true)
      expect(stakes).toHaveLength(2)
    })

    it('deve lidar com odds iguais (não é surebet)', () => {
      const surebet = [
        { chance: 2.0, house: 'Bet365' },
        { chance: 2.0, house: 'William Hill' }
      ]
      
      const stakes = calculateSurebetStakes(surebet, 100)
      const isValid = isValidSurebet(surebet)
      
      expect(isValid).toBe(false)
      expect(stakes).toEqual([0, 0])
    })

    it('deve lidar com valores de chance inválidos', () => {
      const surebet = [
        { chance: 'invalid', house: 'Bet365' },
        { chance: null, house: 'William Hill' },
        { chance: undefined, house: 'Betfair' }
      ]
      
      const stakes = calculateSurebetStakes(surebet, 100)
      const isValid = isValidSurebet(surebet)
      
      // Deve usar 1.0 como valor padrão para chances inválidas
      expect(stakes).toHaveLength(3)
      expect(stakes.every(stake => stake >= 1)).toBe(true)
    })
  })

  describe('Performance', () => {
    it('deve calcular stakes rapidamente para muitos surebets', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        calculateSurebetStakes(mockSurebetData.valid, 100)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Deve ser executado em menos de 100ms
      expect(duration).toBeLessThan(100)
    })
  })
})
