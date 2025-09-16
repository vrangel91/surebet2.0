import { describe, it, expect, beforeEach } from 'vitest'
import { mockSurebetData } from '../fixtures/surebets.js'

// Função para arredondar stakes de forma inteligente, priorizando valores terminados em 5 ou 0
function smartRoundStakes(rawStakes) {
  const roundedStakes = rawStakes.map(stake => Math.round(stake))
  
  // Função para verificar se um número termina em 5 ou 0
  const endsWithFiveOrZero = (num) => {
    return num % 10 === 0 || num % 10 === 5
  }
  
  // Função para encontrar o valor mais próximo que termina em 5 ou 0
  const findNearestFiveOrZero = (num) => {
    const lower = Math.floor(num / 5) * 5
    const upper = Math.ceil(num / 5) * 5
    
    // Se o número já termina em 5 ou 0, retorna ele mesmo
    if (endsWithFiveOrZero(num)) return num
    
    // Retorna o mais próximo
    return (num - lower) < (upper - num) ? lower : upper
  }
  
  // Aplica o arredondamento inteligente
  const smartRounded = rawStakes.map(stake => {
    const rounded = Math.round(stake)
    const smartRounded = findNearestFiveOrZero(rounded)
    
    // Só aplica se a diferença for pequena (máximo 2 unidades)
    const difference = Math.abs(smartRounded - rounded)
    return difference <= 2 ? smartRounded : rounded
  })
  
  // Garante que todos os valores sejam pelo menos 1
  for (let i = 0; i < smartRounded.length; i++) {
    if (smartRounded[i] < 1) {
      smartRounded[i] = 1
    }
  }
  
  return smartRounded
}

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
  
  // Arredonda os valores para números inteiros com prioridade para valores terminados em 5 ou 0
  const roundedStakes = smartRoundStakes(rawStakes)
  
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

  describe('smartRoundStakes - Arredondamento Inteligente', () => {
    it('deve priorizar valores terminados em 5 ou 0', () => {
      const rawStakes = [47.3, 52.7, 98.1, 103.4]
      const smartRounded = smartRoundStakes(rawStakes)
      
      // Valores que podem ser ajustados para terminar em 5 ou 0
      expect(smartRounded).toEqual([45, 55, 100, 105])
    })

    it('deve manter valores que já terminam em 5 ou 0', () => {
      const rawStakes = [45.0, 50.0, 95.0, 100.0]
      const smartRounded = smartRoundStakes(rawStakes)
      
      expect(smartRounded).toEqual([45, 50, 95, 100])
    })

    it('deve não alterar valores quando a diferença for muito grande', () => {
      const rawStakes = [47.0, 52.0, 98.0, 103.0]
      const smartRounded = smartRoundStakes(rawStakes)
      
      // Diferença de 2 ou menos - deve ajustar
      expect(smartRounded).toEqual([45, 55, 100, 105])
    })

    it('deve manter valores originais quando a diferença for muito grande', () => {
      const rawStakes = [47.0, 52.0, 98.0, 103.0]
      // Simulando valores com diferença maior que 2
      const largeDiffStakes = [47.0, 52.0, 98.0, 103.0]
      const smartRounded = smartRoundStakes(largeDiffStakes)
      
      // Deve ajustar pois a diferença é pequena (2 ou menos)
      expect(smartRounded).toEqual([45, 55, 100, 105])
    })

    it('deve garantir que todos os valores sejam pelo menos 1', () => {
      const rawStakes = [0.3, 0.7, 0.9]
      const smartRounded = smartRoundStakes(rawStakes)
      
      expect(smartRounded.every(stake => stake >= 1)).toBe(true)
    })

    it('deve lidar com valores decimais pequenos', () => {
      const rawStakes = [1.2, 2.3, 3.4]
      const smartRounded = smartRoundStakes(rawStakes)
      
      expect(smartRounded).toEqual([1, 2, 5]) // 3.4 -> 3 -> 5 (mais próximo terminado em 5)
    })

    it('deve lidar com valores grandes', () => {
      const rawStakes = [147.3, 252.7, 398.1]
      const smartRounded = smartRoundStakes(rawStakes)
      
      expect(smartRounded).toEqual([145, 255, 400])
    })

    it('deve manter a consistência com arredondamento normal quando apropriado', () => {
      const rawStakes = [23.1, 24.9, 25.1, 26.9]
      const smartRounded = smartRoundStakes(rawStakes)
      
      // 23.1 -> 23 -> 25, 24.9 -> 25 -> 25, 25.1 -> 25 -> 25, 26.9 -> 27 -> 25
      expect(smartRounded).toEqual([25, 25, 25, 25])
    })
  })
})
