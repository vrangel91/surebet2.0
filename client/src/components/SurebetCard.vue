<template>
  <div class="surebet-card fade-in" :class="{ 'pinned': isPinned, 'dragging': isDragging }">
    <!-- Header do Card -->
    <div class="card-header">
      <div class="profit-info">
        <span class="profit-percentage">{{ formatProfit(surebet[0]?.profit) }}%</span>
      </div>
      <div class="card-actions">
        <span class="date-time">
          <i class="bi bi-clock time-icon"></i>
          {{ formatDateTime(surebet[0]?.timestamp) }}
        </span>
        <div class="action-icons">          
          <button 
            class="action-btn pin-btn" 
            :class="{ 'pinned': isPinned }"
            @click="togglePin" 
            :title="isPinned ? 'Desafixar Card' : 'Fixar Card'"
          >
            <i v-if="!isPinned" class="bi bi-geo-alt icon-text"></i>
            <i v-else class="bi bi-geo-alt-fill icon-text"></i>
          </button>
          <button class="action-btn add-report-btn" @click="addToReports" title="Adicionar aos Relatórios">
            <i class="bi bi-file-text icon-text"></i>
          </button>
          <button 
            class="action-btn debit-icon-btn" 
            :class="{ 'disabled': !canDebitFromAllBalances() }"
            @click="debitFromAllBalances()"
            :title="getDebitButtonTooltip()"
          >
            <i class="bi bi-wallet2 icon-text"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Informações do Jogo -->
    <div class="match-info">
      <div class="match-header">
        <i class="bi bi-trophy sport-icon"></i>
        <span class="sport-name">{{ surebet[0]?.sport || 'Futebol' }}</span>
        <span class="tournament">{{ surebet[0]?.tournament || 'Liga' }}</span>
      </div>
      
      <h3 class="match-title">{{ surebet[0]?.match || 'Time A vs Time B' }}</h3>
      
      <div class="match-details">
        <span class="match-time">
          <i class="bi bi-calendar3 time-icon"></i>
          {{ surebet[0]?.date || '2025-08-18' }} às {{ surebet[0]?.hour || '23:00' }}
        </span>
        <span class="match-status" :class="{ 'live': surebet[0]?.isLive }">
          <i v-if="surebet[0]?.isLive" class="bi bi-broadcast live-icon"></i>
          {{ surebet[0]?.isLive ? `Live - ${surebet[0]?.minutes || '1'}'` : `Pré-live${surebet[0]?.minutes ? ` - ${surebet[0]?.minutes}'` : ''}` }}
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
                     <span class="market">{{ formatMarket(bet.market, surebet[0]?.sport) || 'Resultado Final' }}</span>
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
          
          <button 
            class="bet-btn" 
            :class="{ 'disabled': !hasValidUrl(bet) }"
            @click="placeBet(bet)"
            :title="getButtonTooltip(bet)"
          >
            <i class="bi bi-currency-dollar bet-icon"></i>
            <span class="bet-text">Apostar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getBookmakerUrl, extractDomainFromAnchorh, buildBookmakerUrlFromDomain } from '../config/bookmakerUrls.js'
import { http } from '../utils/http.js'

export default {
  name: 'SurebetCard',
  props: {
    surebet: {
      type: Array,
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isDragging: {
      type: Boolean,
      default: false
    },
    bookmakerAccounts: {
      type: Array,
      default: () => []
    },
    isLoadingAccounts: {
      type: Boolean,
      default: false
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
    }
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
    
             formatMarket(market, sport = null) {
      if (!market) {
        return 'Resultado Final'
      }
      
      // Retorna o market original sem tradução
      return market
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
      try {
        // Primeiro, tenta extrair o domínio dos campos anchorh1 ou anchorh2
        let targetUrl = null
        
        // Tenta extrair do anchorh1 primeiro (casa principal)
        if (bet.anchorh1) {
          const domain = extractDomainFromAnchorh(bet.anchorh1)
                      if (domain) {
              targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive || false)
              console.log(`[LINK] URL extraída de anchorh1 para ${bet.house}:`, targetUrl)
            }
        }
        
        // Se não encontrou no anchorh1, tenta no anchorh2
        if (!targetUrl && bet.anchorh2) {
          const domain = extractDomainFromAnchorh(bet.anchorh2)
                      if (domain) {
              targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive || false)
              console.log(`[LINK] URL extraída de anchorh2 para ${bet.house}:`, targetUrl)
            }
        }
        
        // Se conseguiu extrair URL dos anchorh, usa ela
        if (targetUrl) {
          console.log(`[REDIRECT] Redirecionando para ${bet.house} usando domínio extraído:`, targetUrl)
          window.open(targetUrl, '_blank')
          return
        }
        
        // Fallback: tenta usar a URL de redirecionamento da API
        if (bet.url_redirect && bet.url_redirect.includes('http')) {
          console.log(`[API] Usando URL da API para ${bet.house}:`, bet.url_redirect)
          window.open(bet.url_redirect, '_blank')
          return
        }
        
        // Último fallback: usa o mapeamento baseado no nome da casa
        if (bet.house) {
          const isLive = bet.isLive || false
          const bookmakerUrl = getBookmakerUrl(bet.house, isLive)
          
          if (bookmakerUrl && !bookmakerUrl.includes('google.com/search')) {
            console.log(`[BOOKMAKER] Redirecionando para ${bet.house} (${isLive ? 'Live' : 'Pre-match'}):`, bookmakerUrl)
            window.open(bookmakerUrl, '_blank')
          } else {
            console.warn(`[WARNING] URL não encontrada para ${bet.house}. Usando busca no Google.`)
            window.open(bookmakerUrl, '_blank')
          }
        } else {
          console.error('[ERROR] Casa de apostas não informada')
          this.showNotification('Casa de apostas não identificada!', 'error')
        }
      } catch (error) {
        console.error('Erro ao abrir casa de apostas:', error)
        this.showNotification('Erro ao abrir casa de apostas!', 'error')
      }
    },
    
    addToReports() {
      // Emite evento para o componente pai
      this.$emit('add-to-reports', this.surebet)
      
      // Mostra notificação
      this.showNotification('Surebet adicionado aos relatórios!')
    },
    
    togglePin() {
      this.$emit('toggle-pin', this.surebet)
    },
    
    showNotification(message, type = 'success') {
      // Cria elemento de notificação
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      
      // Define cores baseadas no tipo
      let backgroundColor = '#00ff88'
      let textColor = '#1a1a1a'
      
      switch (type) {
        case 'error':
          backgroundColor = '#ff4757'
          textColor = '#ffffff'
          break
        case 'info':
          backgroundColor = '#3742fa'
          textColor = '#ffffff'
          break
        case 'warning':
          backgroundColor = '#ffa502'
          textColor = '#1a1a1a'
          break
        default: // success
          backgroundColor = '#00ff88'
          textColor = '#1a1a1a'
      }
      
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: ${textColor};
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
    },
    
    // Verifica se a aposta tem uma URL válida
    hasValidUrl(bet) {
      return !!(bet.anchorh1 || bet.anchorh2 || (bet.url_redirect && bet.url_redirect.includes('http')))
    },
    

    
    // Gera tooltip para o botão
    getButtonTooltip(bet) {
      if (!this.hasValidUrl(bet)) return 'URL não disponível'
      
      let tooltip = `Casa: ${bet.house}\n`
      
      if (bet.anchorh1) {
        tooltip += `URL extraída de anchorh1\n${bet.anchorh1}`
      } else if (bet.anchorh2) {
        tooltip += `URL extraída de anchorh2\n${bet.anchorh2}`
      } else if (bet.url_redirect) {
        tooltip += `URL da API\n${bet.url_redirect}`
      }
      
      return tooltip
    },

    // Verifica se é possível debitar do saldo
    // Verifica se pode debitar do saldo de todas as contas
    canDebitFromAllBalances() {
      if (this.bookmakerAccounts.length === 0) {
        return false
      }
      
      // Verificar se todas as contas têm saldo suficiente
      for (let i = 0; i < this.surebet.length; i++) {
        const bet = this.surebet[i]
        const account = this.findBookmakerAccount(bet.house)
        
        if (!account || account.status !== 'active') {
          return false
        }
        
        const currentBalance = parseFloat(account.balance || 0)
        const stakeAmount = this.calculatedStakes[i]
        
        if (currentBalance < stakeAmount) {
          return false
        }
      }
      
      return true
    },

    // Função para debitar do saldo de todas as contas da surebet
    async debitFromAllBalances() {
      try {
        console.log('💰 Iniciando processo de débito para todas as contas da surebet')
        
        // 1. Verificar se há contas carregadas
        if (this.bookmakerAccounts.length === 0) {
          this.showNotification('Nenhuma conta de Bookmaker encontrada. Adicione contas em Bookmaker Accounts.', 'error')
          return
        }
        
        // 2. Verificar todas as contas antes de processar
        const debitOperations = []
        const insufficientAccounts = []
        
        for (let i = 0; i < this.surebet.length; i++) {
          const bet = this.surebet[i]
          const account = this.findBookmakerAccount(bet.house)
          const stakeAmount = this.calculatedStakes[i]
          
          if (!account) {
            this.showNotification(`Conta não encontrada para ${bet.house}. Adicione uma conta em Bookmaker Accounts.`, 'error')
            return
          }
          
          if (account.status !== 'active') {
            this.showNotification(`Conta ${bet.house} não está ativa.`, 'error')
            return
          }
          
          const currentBalance = parseFloat(account.balance || 0)
          
          if (currentBalance < stakeAmount) {
            insufficientAccounts.push({
              house: bet.house,
              required: stakeAmount,
              available: currentBalance
            })
          } else {
            debitOperations.push({
              account: account,
              bet: bet,
              stakeAmount: stakeAmount,
              currentBalance: currentBalance
            })
          }
        }
        
        // 3. Se há contas com saldo insuficiente, mostrar erro
        if (insufficientAccounts.length > 0) {
          const errorMessage = insufficientAccounts.map(acc => 
            `${acc.house}: Necessário ${this.formatCurrency(acc.required)}, Disponível ${this.formatCurrency(acc.available)}`
          ).join('\n')
          
          this.showNotification(
            `Saldo insuficiente em algumas contas:\n${errorMessage}`, 
            'error'
          )
          return
        }
        
        // 4. Confirmar operação para todas as contas
        const totalAmount = debitOperations.reduce((sum, op) => sum + op.stakeAmount, 0)
        const confirmMessage = `Confirmar débito total de ${this.formatCurrency(totalAmount)}?\n\n` +
          debitOperations.map(op => 
            `${op.bet.house}: ${this.formatCurrency(op.stakeAmount)} (Saldo: ${this.formatCurrency(op.currentBalance)} → ${this.formatCurrency(op.currentBalance - op.stakeAmount)})`
          ).join('\n')
        
        if (!confirm(confirmMessage)) {
          return
        }
        
        // 5. Processar débitos para todas as contas
        this.showNotification(`Processando débitos...`, 'info')
        
        const results = []
        let successCount = 0
        
        for (const operation of debitOperations) {
          try {
            const response = await http.post(`/api/bookmaker-accounts/${operation.account.id}/adjust-balance`, {
              amount: -operation.stakeAmount,
              description: `Débito automático - Surebet ${operation.bet.house} - ${this.formatCurrency(operation.stakeAmount)}`,
              type: 'surebet_debit'
            })
            
            if (response.data.success) {
              results.push({
                account: operation.account,
                bet: operation.bet,
                amount: operation.stakeAmount,
                newBalance: response.data.data.newBalance,
                success: true
              })
              successCount++
            } else {
              results.push({
                account: operation.account,
                bet: operation.bet,
                amount: operation.stakeAmount,
                success: false,
                error: response.data.message
              })
            }
          } catch (error) {
            console.error(`❌ Erro ao debitar de ${operation.bet.house}:`, error)
            results.push({
              account: operation.account,
              bet: operation.bet,
              amount: operation.stakeAmount,
              success: false,
              error: error.response?.data?.message || 'Erro desconhecido'
            })
          }
        }
        
        // 6. Emitir evento para atualizar contas no componente pai
        this.$emit('refresh-accounts')
        
        // 7. Emitir eventos e mostrar resultados
        const successfulResults = results.filter(r => r.success)
        const failedResults = results.filter(r => !r.success)
        
        if (successfulResults.length > 0) {
          // Emitir evento para cada débito bem-sucedido
          for (const result of successfulResults) {
            this.$emit('balance-debited', {
              account: result.account,
              amount: result.amount,
              surebet: this.surebet,
              newBalance: result.newBalance
            })
          }
          
          const totalDebited = successfulResults.reduce((sum, r) => sum + r.amount, 0)
          this.showNotification(
            `Débitos realizados com sucesso! Total: ${this.formatCurrency(totalDebited)}`, 
            'success'
          )
          
          console.log('✅ Débitos processados com sucesso:', successfulResults)
        }
        
        if (failedResults.length > 0) {
          const errorMessage = failedResults.map(r => 
            `${r.bet.house}: ${r.error}`
          ).join('\n')
          
          this.showNotification(
            `Alguns débitos falharam:\n${errorMessage}`, 
            'error'
          )
        }
        
      } catch (error) {
        console.error('❌ Erro ao processar débitos:', error)
        this.showNotification(
          error.response?.data?.message || 'Erro ao processar débitos do saldo', 
          'error'
        )
      }
    },

    // Gera tooltip para o botão de debitar do saldo
    getDebitButtonTooltip() {
      if (this.bookmakerAccounts.length === 0) {
        return 'Nenhuma conta de Bookmaker encontrada'
      }
      
      const tooltips = []
      
      for (let i = 0; i < this.surebet.length; i++) {
        const bet = this.surebet[i]
        const account = this.findBookmakerAccount(bet.house)
        const stakeAmount = this.calculatedStakes[i]
        
        if (!account) {
          tooltips.push(`Conta não encontrada para ${bet.house}`)
        } else if (account.status !== 'active') {
          tooltips.push(`Conta ${bet.house} não está ativa`)
        } else {
          const currentBalance = parseFloat(account.balance || 0)
          
          if (currentBalance < stakeAmount) {
            tooltips.push(`${bet.house}: Saldo insuficiente (${this.formatCurrency(currentBalance)} < ${this.formatCurrency(stakeAmount)})`)
          } else {
            tooltips.push(`${bet.house}: ${this.formatCurrency(stakeAmount)}`)
          }
        }
      }
      
      if (tooltips.length === 0) {
        return 'Erro ao verificar contas'
      }
      
      return tooltips.join('\n')
    },

    // Busca conta de Bookmaker por nome da casa
    findBookmakerAccount(bookmakerName) {
      return this.bookmakerAccounts.find(account => 
        account.bookmaker_name.toLowerCase() === bookmakerName.toLowerCase()
      )
    },

  }
}
</script>

<style lang="scss" scoped>
.surebet-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px; /* Reduzido padding para dar mais espaço ao conteúdo */
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
  width: 100%; /* Volta para 100% para ocupar todo o espaço do grid */
  max-width: 100%; /* Previne que o card seja maior que o container */
  box-sizing: border-box; /* Inclui padding e border no cálculo da largura */
  overflow: visible; /* Mudado para visible para permitir efeitos hover */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--accent-primary);
  }
  
  &.pinned {
    border-color: #ff6b6b;
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff6b6b;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pinBounce 0.6s ease-in-out;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
                           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 10;
    }
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

@keyframes pinPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pinBounce {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
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
  gap: 12px; /* Adicionado gap para garantir espaço entre elementos */
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
  gap: 14px; /* Aumentado gap para mais espaço */
  flex-shrink: 0; /* Previne que os controles sejam comprimidos */
}

.date-time {
  display: flex;
  align-items: center;
  gap: 6px; /* Aumentado gap para mais espaço */
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0; /* Previne que o elemento seja comprimido */
}

.time-icon {
  color: var(--text-secondary);
  font-size: 11px; /* Aumentado tamanho do ícone */
  flex-shrink: 0; /* Previne que o ícone seja comprimido */
}

.action-icons {
  display: flex;
  gap: 8px; /* Aumentado gap entre os ícones */
  align-items: center;
  flex-shrink: 0; /* Previne que os ícones sejam comprimidos */
}

.action-btn {
  width: 24px; /* Aumentado tamanho do botão */
  height: 24px; /* Aumentado tamanho do botão */
  background: var(--bg-overlay);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Previne que o botão seja comprimido */
  
  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
    transform: translateY(-1px); /* Adicionado efeito hover */
  }
  
  &.pin-btn {
    position: relative;
    
    &:hover {
      background: #ff6b6b;
      color: white;
      
      .icon-text {
        color: white;
      }
    }
    
    &.pinned {
      background: #ff6b6b;
      color: white;
      animation: pinPulse 0.6s ease-in-out;
      
      .icon-text {
        color: white;
      }
      
      &:hover {
        background: #ff4757;
      }
    }
  }
  
  &.add-report-btn {
    &:hover {
      background: var(--accent-primary);
      
      .icon-text {
        color: var(--bg-primary);
      }
    }
  }
  
}



.icon-text {
  font-size: 12px; /* Aumentado tamanho do ícone */
  display: block;
  line-height: 1;
  color: var(--text-secondary, #888888);
  transition: all 0.3s ease;
  width: 12px; /* Aumentado largura */
  height: 12px; /* Aumentado altura */
  flex-shrink: 0; /* Previne que o ícone seja comprimido */
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
  color: var(--accent-primary);
  font-size: 11px;
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
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.live {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
  
  .live-icon {
    color: #ff6b6b;
    font-size: 8px;
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
  color: var(--text-primary);
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
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 255, 136, 0.1);
  }
}

.bet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-primary);
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
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.odds-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
}

.odds-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
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
  justify-content: flex-start;
}

.stake-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stake-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.bet-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
  max-width: 70px;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
}

.bet-icon {
  color: var(--bg-primary);
  font-size: 10px;
}

.bet-text {
  font-size: 12px;
}

.debit-icon-btn {
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: var(--bg-overlay);
      transform: none;
    }
    
    .icon-text {
      color: var(--text-secondary);
    }
  }
}



.bet-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--text-secondary);
  
  &:hover {
    transform: none;
    box-shadow: none;
  }
}

@media (max-width: 768px) {
  .surebet-card {
    padding: 16px; /* Reduzido padding em mobile para dar mais espaço ao conteúdo */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-actions {
    gap: 10px; /* Reduzido gap em mobile */
  }
  
  .action-btn {
    width: 22px; /* Reduzido tamanho em mobile */
    height: 22px; /* Reduzido tamanho em mobile */
  }
  
  .icon-text {
    font-size: 11px; /* Reduzido tamanho em mobile */
    width: 11px; /* Reduzido tamanho em mobile */
    height: 11px; /* Reduzido tamanho em mobile */
  }
  
  .bet-details {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .odds-info,
  .stake-info {
    justify-content: space-between;
  }
  
  .bet-btn {
    width: 100%;
    max-width: none;
    min-width: auto;
  }
}

/* Media query específica para telas muito pequenas (celulares pequenos) */
@media (max-width: 400px) {
  .surebet-card {
    padding: 12px; /* Padding ainda menor para telas muito pequenas */
  }
  
  .bet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .market {
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 3px;
    word-break: break-word;
    max-width: 100%;
    display: block;
    width: 100%;
    text-align: left;
  }
  
  .bookmaker {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .bet-details {
    gap: 10px;
  }
  
  .odds-info,
  .stake-info {
    gap: 6px;
  }
  
  .odds-label,
  .stake-label {
    font-size: 11px;
  }
  
  .odds-value,
  .stake-value {
    font-size: 14px;
  }
  
  .bet-btn {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 80px;
    max-width: 80px;
  }
}

/* Estilos para modo de arrastar */
.surebet-card.dragging {
  cursor: grabbing;
  user-select: none;
  
  .card-header,
  .match-info,
  .bankroll-config,
  .bet-options {
    pointer-events: none;
  }
  
  .action-btn {
    pointer-events: none;
  }
  
  .bet-btn {
    pointer-events: none;
  }
}

.surebet-card.dragging::after {
  content: 'Arrastando...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 20px;
}

.surebet-card.dragging::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3Cpath d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'/%3E%3Cpath d='M3 21v-5h5'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 1001;
  pointer-events: none;
  margin-left: -20px;
}

/* Efeito visual quando o card está sendo arrastado */
.surebet-card.dragging {
  transform: rotate(2deg) scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}
</style>


