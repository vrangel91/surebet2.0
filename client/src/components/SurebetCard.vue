<template>
  <div class="surebet-card fade-in">
    <!-- Header do Card -->
    <div class="card-header">
      <div class="profit-info">
        <span class="profit-percentage">{{ formatProfit(surebet[0]?.profit) }}%</span>
      </div>
      <div class="card-actions">
        <span class="date-time">
          <span class="time-icon">🕐</span>
          {{ formatDateTime(surebet[0]?.timestamp) }}
        </span>
        <div class="action-icons">
          <button class="action-btn" @click="calculateBet">
            <span class="action-icon">🧮</span>
          </button>
          <button class="action-btn" @click="refreshBet">
            <span class="action-icon">🔄</span>
          </button>
          <button class="action-btn" @click="addToReports" title="Adicionar aos Relatórios">
            <span class="action-icon">📊</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Informações do Jogo -->
    <div class="match-info">
      <div class="match-header">
        <span class="sport-icon">⚽</span>
        <span class="sport-name">{{ surebet[0]?.sport || 'Futebol' }}</span>
        <span class="tournament">{{ surebet[0]?.tournament || 'Liga' }}</span>
      </div>
      
      <h3 class="match-title">{{ surebet[0]?.match || 'Time A vs Time B' }}</h3>
      
      <div class="match-details">
        <span class="match-time">
          <span class="time-icon">📅</span>
          {{ surebet[0]?.date || '2025-08-18' }} às {{ surebet[0]?.hour || '23:00' }}
        </span>
        <span class="match-status" :class="{ 'live': surebet[0]?.minutes > 0 }">
          {{ surebet[0]?.minutes > 0 ? `Live - ${surebet[0]?.minutes}'` : 'Pré-live' }}
        </span>
      </div>
    </div>

    <!-- Configuração da Banca -->
    <div class="bankroll-config">
      <div class="bankroll-info">
        <span class="bankroll-label">Banca Configurada:</span>
        <span class="bankroll-value">{{ formatCurrency(defaultStake) }}</span>
      </div>
      <div class="expected-profit">
        <span class="profit-label">Lucro Esperado:</span>
        <span class="profit-value">{{ formatCurrency(expectedProfit) }}</span>
      </div>
    </div>

    <!-- Opções de Aposta -->
    <div class="bet-options">
      <div v-for="(bet, index) in surebet" :key="index" class="bet-option">
        <div class="bet-header">
          <span class="bookmaker">{{ bet.house || 'Bet365' }}</span>
          <span class="market">{{ bet.market || 'AH1(+1)' }}</span>
        </div>
        
        <div class="bet-details">
          <div class="odds-info">
            <span class="odds-label">Odds:</span>
            <span class="odds-value">{{ bet.chance || 1.11 }}</span>
          </div>
          
          <div class="stake-info">
            <span class="stake-label">Apostar:</span>
            <span class="stake-value">{{ formatCurrency(calculatedStakes[index]) }}</span>
          </div>
          
          <button class="bet-btn" @click="placeBet(bet)">
            <span class="bet-icon">💰</span>
            <span class="bet-text">Apostar</span>
          </button>
        </div>
      </div>
    </div>


    
  </div>
</template>

<script>
export default {
  name: 'SurebetCard',
  props: {
    surebet: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      defaultStake: 100.00 // Valor padrão, será carregado das configurações
    }
  },
  computed: {
    // Calcula as apostas para cada casa baseado nas odds
    calculatedStakes() {
      if (!this.surebet || this.surebet.length === 0) return []
      
      const odds = this.surebet.map(bet => parseFloat(bet.chance) || 1.0)
      const totalOdds = odds.reduce((sum, odd) => sum + (1 / odd), 0)
      
      // Se totalOdds >= 1, não é um surebet válido
      if (totalOdds >= 1) return odds.map(() => 0)
      
      // Calcula o stake para cada casa
      const rawStakes = odds.map(odd => {
        const stake = (this.defaultStake / odd) / totalOdds
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
      
      // Ajusta os valores para manter o lucro
      const totalRaw = rawStakes.reduce((sum, stake) => sum + stake, 0)
      let totalRounded = roundedStakes.reduce((sum, stake) => sum + stake, 0)
      
      // Se o total arredondado for maior que o original, ajusta para baixo
      if (totalRounded > totalRaw) {
        const excess = totalRounded - totalRaw
        
        // Distribui o excesso entre os valores maiores
        const sortedIndices = roundedStakes
          .map((stake, index) => ({ stake, index }))
          .sort((a, b) => b.stake - a.stake)
        
        let remainingExcess = excess
        for (const { index } of sortedIndices) {
          if (remainingExcess <= 0) break
          
          const currentStake = roundedStakes[index]
          const reduction = Math.min(remainingExcess, currentStake - 1)
          
          roundedStakes[index] = currentStake - reduction
          remainingExcess -= reduction
        }
      }
      
      return roundedStakes
    },
    
    // Total a ser investido
    totalInvestment() {
      return this.calculatedStakes.reduce((sum, stake) => sum + stake, 0)
    },
    
    // Lucro esperado
    expectedProfit() {
      if (this.calculatedStakes.length === 0) return 0
      
      // Calcula o retorno mínimo (qualquer aposta que ganhar)
      const minReturn = Math.min(...this.calculatedStakes.map((stake, index) => 
        stake * (parseFloat(this.surebet[index].chance) || 1.0)
      ))
      
      return Math.round((minReturn - this.totalInvestment) * 100) / 100
    },
    

  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    formatProfit(profit) {
      if (!profit) return '0.00'
      return parseFloat(profit).toFixed(2)
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    
    formatDateTime(timestamp) {
      if (!timestamp) return 'Agora'
      const date = new Date(timestamp)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    loadSettings() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          this.defaultStake = settings.reports?.defaultStake || 100.00
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    },
    
    calculateBet() {
      // Implementar calculadora de apostas
      console.log('Calculadora de apostas')
    },
    
    refreshBet() {
      // Implementar refresh da aposta
      console.log('Refresh da aposta')
    },
    
    placeBet(bet) {
      if (bet.url_redirect) {
        window.open(bet.url_redirect, '_blank')
      } else {
        console.log('URL de aposta não disponível')
      }
    },
    
    addToReports() {
      // Emite evento para o componente pai
      this.$emit('add-to-reports', this.surebet)
      
      // Mostra notificação
      this.showNotification('Surebet adicionado aos relatórios!')
    },
    
    showNotification(message) {
      // Cria elemento de notificação
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
             notification.style.cssText = `
         position: fixed;
         top: 100px;
         right: 20px;
         background: #00ff88;
         color: #1a1a1a;
         padding: 12px 20px;
         border-radius: 8px;
         font-weight: 600;
         z-index: 10000;
         animation: slideIn 0.3s ease;
       `
      
      document.body.appendChild(notification)
      
      // Remove após 3 segundos
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.surebet-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--accent-primary);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.profit-info {
  .profit-percentage {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent-primary);
  }
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.time-icon {
  font-size: 14px;
}

.action-icons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }
}

.action-icon {
  font-size: 14px;
}

.match-info {
  margin-bottom: 20px;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sport-icon {
  font-size: 16px;
}

.sport-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.tournament {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-overlay);
  padding: 2px 8px;
  border-radius: 4px;
}

.match-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}

.match-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.match-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.match-status {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-overlay);
  padding: 4px 8px;
  border-radius: 4px;
  
  &.live {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
}

/* Configuração da Banca */
.bankroll-config {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.bankroll-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bankroll-label {
  font-size: 14px;
  color: var(--text-primary);
}

.bankroll-value {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.expected-profit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.profit-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.profit-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
}

.bet-options {
  margin-bottom: 20px;
}

.bet-option {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.bet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bookmaker {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.market {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-overlay);
  padding: 2px 6px;
  border-radius: 4px;
}

.bet-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.odds-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.odds-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.odds-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
}

.stake-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.stake-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stake-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.bet-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
}

.bet-icon {
  font-size: 14px;
}

.bet-text {
  font-size: 12px;
}

/* Resumo do Cálculo */
.calculation-summary {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-primary);
  
  &:last-child {
    border-bottom: none;
  }
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  
  &.profit {
    color: var(--accent-primary);
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.profit-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profit-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.profit-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
}

.card-stats {
  display: flex;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .surebet-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .bet-details {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .odds-info,
  .stake-info {
    min-width: auto;
    width: 100%;
    justify-content: space-between;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>

