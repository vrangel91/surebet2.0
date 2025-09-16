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
          <span 
            class="market" 
            :class="{ 'has-translation': hasMarketTranslation(bet.market) }"
            @mouseenter="showTooltip($event, bet.market)"
            @mouseleave="hideTooltip"
          >
            {{ bet.market || 'Resultado Final' }}
          </span>
        </div>
        
        <div class="bet-details">
          <div class="odds-info">
            <span class="odds-label">Odds:</span>
            <span class="odds-value">{{ bet.chance || 1.11 }}</span>
          </div>
          
          <div class="stake-section">
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
  </div>
</template>

<script>
import { getBookmakerUrl, extractDomainFromAnchorh, buildBookmakerUrlFromDomain } from '../config/bookmakerUrls.js'
import { http } from '../utils/http.js'
import marketTranslations from '../config/marketTranslations.json'

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
    },
    roundValues: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultStake: 100.00, // Valor padrão, será carregado das configurações
      tooltipTimeout: null,
      currentTooltip: null
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
      
      // Aplica arredondamento inteligente se solicitado, senão mantém valores decimais reais
      let roundedStakes
      
      if (this.roundValues) {
        // Arredondamento inteligente que preserva o lucro esperado
        roundedStakes = this.smartRoundStakes(rawStakes, odds)
      } else {
        // Mantém valores decimais reais
        roundedStakes = rawStakes.map(stake => Math.max(1, stake))
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
    this.setupTooltipCleanup()
  },
  beforeDestroy() {
    // Limpa tooltips ao destruir o componente
    this.hideTooltip()
    this.removeTooltipCleanup()
    this.clearAllTooltips()
  },
  beforeUnmount() {
    // Limpa tooltips ao desmontar o componente (Vue 3)
    this.hideTooltip()
    this.removeTooltipCleanup()
    this.clearAllTooltips()
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

    // Arredondamento inteligente que preserva o lucro esperado
    smartRoundStakes(rawStakes, odds) {
      // 1. Arredonda cada stake individualmente
      const roundedStakes = rawStakes.map(stake => Math.max(1, Math.round(stake)))
      
      // 2. Calcula o lucro original
      const originalTotalInvestment = rawStakes.reduce((sum, stake) => sum + stake, 0)
      const originalMinReturn = Math.min(...rawStakes.map((stake, index) => 
        stake * (parseFloat(odds[index]) || 1.0)
      ))
      const originalProfit = originalMinReturn - originalTotalInvestment
      
      // 3. Calcula o lucro após arredondamento simples
      const roundedTotalInvestment = roundedStakes.reduce((sum, stake) => sum + stake, 0)
      const roundedMinReturn = Math.min(...roundedStakes.map((stake, index) => 
        stake * (parseFloat(odds[index]) || 1.0)
      ))
      const roundedProfit = roundedMinReturn - roundedTotalInvestment
      
      // 4. Se a diferença no lucro for pequena (menos de 1%), mantém o arredondamento simples
      const profitDifference = Math.abs(originalProfit - roundedProfit)
      const profitPercentage = Math.abs(profitDifference / originalProfit) * 100
      
      if (profitPercentage < 1) {
        return roundedStakes
      }
      
      // 5. Ajuste proporcional para preservar o lucro
      const adjustmentFactor = originalTotalInvestment / roundedTotalInvestment
      const adjustedStakes = roundedStakes.map(stake => {
        const adjusted = stake * adjustmentFactor
        return Math.max(1, Math.round(adjusted))
      })
      
      // 6. Verifica se o ajuste melhorou o lucro
      const adjustedTotalInvestment = adjustedStakes.reduce((sum, stake) => sum + stake, 0)
      const adjustedMinReturn = Math.min(...adjustedStakes.map((stake, index) => 
        stake * (parseFloat(odds[index]) || 1.0)
      ))
      const adjustedProfit = adjustedMinReturn - adjustedTotalInvestment
      
      // 7. Retorna a opção que preserva melhor o lucro original
      const adjustedProfitDifference = Math.abs(originalProfit - adjustedProfit)
      
      if (adjustedProfitDifference < profitDifference) {
        return adjustedStakes
      } else {
        return roundedStakes
      }
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
        // PRIORIDADE 1: Usa nosso mapeamento interno
        if (bet.house) {
          const isLive = bet.isLive || false
          const bookmakerUrl = getBookmakerUrl(bet.house, isLive, bet.anchorh1, bet.anchorh2)
          
          if (bookmakerUrl && !bookmakerUrl.includes('google.com/search')) {
            console.log(`[BOOKMAKER] Redirecionando para ${bet.house} (${isLive ? 'Live' : 'Pre-match'}):`, bookmakerUrl)
            window.open(bookmakerUrl, '_blank')
            return
          }
        }
        
        // FALLBACK 1: Tenta usar a URL de redirecionamento da API
        if (bet.url_redirect && bet.url_redirect.includes('http')) {
          console.log(`[API] Usando URL da API para ${bet.house}:`, bet.url_redirect)
          window.open(bet.url_redirect, '_blank')
          return
        }
        
        // FALLBACK 2: Tenta extrair o domínio dos campos anchorh1 ou anchorh2
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
        
        // FALLBACK FINAL: Busca no Google
        if (bet.house) {
          console.warn(`[WARNING] URL não encontrada para ${bet.house}. Usando busca no Google.`)
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(bet.house + ' apostas esportivas')}`
          window.open(googleUrl, '_blank')
        } else {
          console.error('[ERROR] Casa de apostas não informada')
          this.showNotification('Casa de apostas não identificada!', 'error')
        }
      } catch (error) {
        console.error('Erro ao abrir casa de apostas:', error)
        this.showNotification('Erro ao abrir casa de apostas!', 'error')
      }
    },
    
    async addToReports() {
      try {
        // 1. Verificar se há contas carregadas
        if (this.bookmakerAccounts.length === 0) {
          this.showNotification('Nenhuma conta de Bookmaker encontrada. Adicione contas em Bookmaker Accounts.', 'error')
          return
        }

        // 2. Verificar se todas as contas têm saldo suficiente
        const insufficientAccounts = []
        const debitOperations = []

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

        // 4. Confirmar operação
        const totalAmount = debitOperations.reduce((sum, op) => sum + op.stakeAmount, 0)
        const confirmMessage = `Confirmar registro de surebet e débito total de ${this.formatCurrency(totalAmount)}?\n\n` +
          debitOperations.map(op => 
            `${op.bet.house}: ${this.formatCurrency(op.stakeAmount)} (Saldo: ${this.formatCurrency(op.currentBalance)} → ${this.formatCurrency(op.currentBalance - op.stakeAmount)})`
          ).join('\n')
        
        if (!confirm(confirmMessage)) {
          return
        }

        // 5. Processar débitos e registrar relatório
        this.showNotification(`Processando registro e débitos...`, 'info')

        const results = []
        let successCount = 0

        // Processar cada débito
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

        // 6. Registrar no relatório de surebets
        try {
          const reportData = {
            surebet: this.surebet,
            stakes: this.calculatedStakes,
            totalInvestment: this.totalInvestment,
            expectedProfit: this.expectedProfit,
            timestamp: new Date().toISOString(),
            status: 'pending',
            results: results.filter(r => r.success)
          }

          const reportResponse = await http.post('/api/surebet-reports', reportData)
          
          if (reportResponse.data.success) {
            console.log('✅ Relatório de surebet registrado:', reportResponse.data.data)
          } else {
            console.error('❌ Erro ao registrar relatório:', reportResponse.data.message)
          }
        } catch (error) {
          console.error('❌ Erro ao registrar relatório de surebet:', error)
        }

        // 7. Emitir eventos e mostrar resultados
        this.$emit('refresh-accounts')
        this.$emit('add-to-reports', this.surebet)

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
            `Surebet registrado e débitos realizados! Total: ${this.formatCurrency(totalDebited)}`, 
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
        console.error('❌ Erro ao processar relatório:', error)
        this.showNotification(
          error.response?.data?.message || 'Erro ao processar relatório de surebet', 
          'error'
        )
      }
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
      
      // Usa nosso mapeamento prioritariamente
      const isLive = bet.isLive || false
      const mappedUrl = getBookmakerUrl(bet.house, isLive, bet.anchorh1, bet.anchorh2)
      
      if (mappedUrl && !mappedUrl.includes('google.com/search')) {
        tooltip += `URL do nosso mapeamento\n${mappedUrl}`
      } else if (bet.url_redirect) {
        tooltip += `URL da API\n${bet.url_redirect}`
      } else if (bet.anchorh1) {
        tooltip += `URL extraída de anchorh1\n${bet.anchorh1}`
      } else if (bet.anchorh2) {
        tooltip += `URL extraída de anchorh2\n${bet.anchorh2}`
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

    // Busca tradução do market
    getMarketTranslation(market) {
      if (!market) return null
      
      // Busca tradução exata primeiro
      if (marketTranslations.translations[market]) {
        let translation = marketTranslations.translations[market]
        // Substitui Team 1 e Team 2 pelos nomes reais dos times
        translation = this.replaceTeamNames(translation)
        return translation
      }
      
      // Busca tradução dinâmica para padrões
      const dynamicTranslation = this.getDynamicTranslation(market)
      if (dynamicTranslation) {
        return dynamicTranslation
      }
      
      // Se não encontrar tradução exata, retorna o market original
      return null
    },

    // Substitui "Team 1" e "Team 2" pelos nomes reais dos times
    replaceTeamNames(translation) {
      if (!translation) return translation
      
      const teams = this.getTeamNames()
      
      // Debug: verificar se está funcionando
      if (translation.includes('Time 1') || translation.includes('Time 2')) {
        console.log('🔄 Substituindo times:', {
          original: translation,
          teams: teams,
          result: translation
            .replace(/Time 1/g, teams.team1)
            .replace(/Team 1/g, teams.team1)
            .replace(/Time 2/g, teams.team2)
            .replace(/Team 2/g, teams.team2)
        })
      }
      
      return translation
        .replace(/Time 1/g, teams.team1)
        .replace(/Team 1/g, teams.team1)
        .replace(/Time 2/g, teams.team2)
        .replace(/Team 2/g, teams.team2)
    },

    // Verifica se existe tradução para o market
    hasMarketTranslation(market) {
      return marketTranslations.translations.hasOwnProperty(market) || this.getDynamicTranslation(market) !== null
    },

    // Gera tradução dinâmica para padrões
    getDynamicTranslation(market) {
      if (!market) return null

      // Padrão para mercados de jogadores com shots on target
      const playerShotsMatch = market.match(/^(.+?)\s*-\s*(Over|Under)\((\d+(?:\.\d+)?)\)\s*-\s*Player\s+Shots\s+on\s+Target$/i)
      if (playerShotsMatch) {
        const [, playerName, overUnder, number] = playerShotsMatch
        const isOver = overUnder.toLowerCase() === 'over'
        const prefix = isOver ? 'Mais de' : 'Menos de'
        const cleanPlayerName = playerName.trim()
        return `${cleanPlayerName} - ${prefix} ${number} Chutes ao Gol`
      }

      // Padrão para outros mercados de jogadores
      const playerMarketsMatch = market.match(/^(.+?)\s*-\s*(Over|Under)\((\d+(?:\.\d+)?)\)\s*-\s*Player\s+(Goals|Assists|Cards|Fouls|Corners)$/i)
      if (playerMarketsMatch) {
        const [, playerName, overUnder, number, marketType] = playerMarketsMatch
        const isOver = overUnder.toLowerCase() === 'over'
        const prefix = isOver ? 'Mais de' : 'Menos de'
        
        const marketTranslations = {
          'Goals': 'Gols',
          'Assists': 'Assistências',
          'Cards': 'Cartões',
          'Fouls': 'Faltas',
          'Corners': 'Escanteios'
        }
        
        const translatedType = marketTranslations[marketType] || marketType
        const cleanPlayerName = playerName.trim()
        return `${cleanPlayerName} - ${prefix} ${number} ${translatedType}`
      }

      // Padrão para TO/TU com valores dinâmicos - Sets
      const toTuSetsMatch = market.match(/^(TO|TU)\(([0-9.]+)\)\s*-\s*Sets$/)
      if (toTuSetsMatch) {
        const [, type, value] = toTuSetsMatch
        const prefix = type === 'TO' ? 'Mais de' : 'Menos de'
        return `${prefix} ${value} Sets`
      }

      // Padrão para TO/TU com valores dinâmicos - Tie Break
      const toTuTieBreakMatch = market.match(/^(TO|TU)\(([0-9.]+)\)\s*-\s*Tie Break$/)
      if (toTuTieBreakMatch) {
        const [, type, value] = toTuTieBreakMatch
        const prefix = type === 'TO' ? 'Mais de' : 'Menos de'
        return `${prefix} ${value} Tie Break`
      }

      // Padrão para Exact com valores dinâmicos - Sets
      const exactSetsMatch = market.match(/^Exact\s*\(([0-9]+)\)\s*-\s*Sets$/)
      if (exactSetsMatch) {
        const [, value] = exactSetsMatch
        return `Exato ${value} Sets`
      }

      // Padrão para Sets exatos com valores dinâmicos
      const setsExactMatch = market.match(/^Sets\s*\(([0-9]+):([0-9]+)\)$/)
      if (setsExactMatch) {
        const [, home, away] = setsExactMatch
        return `Sets Exatos (${home}:${away})`
      }

      // Padrão para AH com valores dinâmicos - Sets
      const ahSetsMatch = market.match(/^(AH[12])\(([+-]?[0-9.]+)\)\s*-\s*Sets$/)
      if (ahSetsMatch) {
        const [, team, value] = ahSetsMatch
        const teamName = this.getTeamName(team)
        return `Handicap Asiático ${value} - Sets - ${teamName}`
      }

      // Padrão para AH com valores dinâmicos - Hóquei [with OT & SO]
      const ahHockeyOtMatch = market.match(/^(AH[12])\(([+-]?[0-9.]+)\)\s*\[\s*with\s*OT\s*&\s*SO\s*\]$/)
      if (ahHockeyOtMatch) {
        const [, team, value] = ahHockeyOtMatch
        const teamName = this.getTeamName(team)
        return `Handicap Asiático ${value} - ${teamName} (com OT e SO)`
      }

      // Padrão para AH com valores dinâmicos - Hóquei [60 mins]
      const ahHockey60Match = market.match(/^(AH[12])\(([+-]?[0-9.]+)\)\s*\[\s*60\s*mins\s*\]$/)
      if (ahHockey60Match) {
        const [, team, value] = ahHockey60Match
        const teamName = this.getTeamName(team)
        return `Handicap Asiático ${value} - ${teamName} (60 min)`
      }

      // Padrão para AH com valores dinâmicos - LoL Maps
      const ahLoLMapsMatch = market.match(/^(AH[12])\(([+-]?[0-9.]+)\)\s*-\s*Maps$/)
      if (ahLoLMapsMatch) {
        const [, team, value] = ahLoLMapsMatch
        const teamName = this.getTeamName(team)
        return `Handicap Asiático ${value} - Maps - ${teamName}`
      }

      // Padrão para TO/TU com valores dinâmicos - Offsides (Impedimentos)
      const toTuOffsidesMatch = market.match(/^(TO|TU)\(([0-9.]+)\)\s*for\s*(Team[12])\s*-\s*Offsides$/i)
      if (toTuOffsidesMatch) {
        const [, type, value, team] = toTuOffsidesMatch
        const prefix = type === 'TO' ? 'Mais de' : 'Menos de'
        const teamName = this.getTeamName(team)
        return `${prefix} ${value} Impedimentos - ${teamName}`
      }

      // Padrão para apostas simples de Offsides (1, 2)
      const simpleOffsidesMatch = market.match(/^([12])\s*-\s*Offsides$/i)
      if (simpleOffsidesMatch) {
        const [, team] = simpleOffsidesMatch
        const teamName = this.getTeamName(`Team${team}`)
        return `${teamName} - Impedimentos`
      }

      // Padrão para apostas duplas de Offsides (1X, X2)
      const doubleChanceOffsidesMatch = market.match(/^(1X|X2)\s*-\s*Offsides$/i)
      if (doubleChanceOffsidesMatch) {
        const [, betType] = doubleChanceOffsidesMatch
        if (betType === '1X') {
          const team1Name = this.getTeamName('Team1')
          return `${team1Name} ou Empate - Impedimentos`
        } else if (betType === 'X2') {
          const team2Name = this.getTeamName('Team2')
          return `Empate ou ${team2Name} - Impedimentos`
        }
      }

      // Padrão para TO/TU com Kills (10-60)
      const toTuKillsMatch = market.match(/^(TO|TU)\(([0-9.]+)\)\s*-\s*Kills$/i)
      if (toTuKillsMatch) {
        const [, type, value] = toTuKillsMatch
        const prefix = type === 'TO' ? 'Mais de' : 'Menos de'
        return `${prefix} ${value} Abates`
      }

      // Padrão para EH1/EH2 com números negativos
      const ehNegativeMatch = market.match(/^(EH[12])\(([+-]?[0-9.]+)\)$/)
      if (ehNegativeMatch) {
        const [, team, value] = ehNegativeMatch
        const teamName = this.getTeamName(team)
        const formattedValue = parseFloat(value) >= 0 ? `+${value}` : value
        return `Handicap Europeu ${formattedValue} - ${teamName}`
      }

      // Padrão para AH1/AH2 com números negativos
      const ahNegativeMatch = market.match(/^(AH[12])\(([+-]?[0-9.]+)\)$/)
      if (ahNegativeMatch) {
        const [, team, value] = ahNegativeMatch
        const teamName = this.getTeamName(team)
        const formattedValue = parseFloat(value) >= 0 ? `+${value}` : value
        return `Handicap Asiático ${formattedValue} - ${teamName}`
      }

      return null
    },

    // Extrai nomes dos times do campo match
    getTeamNames() {
      if (!this.surebet || !this.surebet[0] || !this.surebet[0].match) {
        return { team1: 'Time 1', team2: 'Time 2' }
      }

      const matchString = this.surebet[0].match
      console.log('🔍 Analisando match:', matchString)
      
      // Foca especificamente no caractere \u2013 (traço longo)
      const separators = /[\u2013\u2014]/g
      const teams = matchString.split(separators).map(team => team.trim()).filter(team => team.length > 0)
      
      console.log('📋 Times extraídos:', teams)
      
      if (teams.length >= 2) {
        const result = {
          team1: teams[0],
          team2: teams[1]
        }
        console.log('✅ Times finais:', result)
        return result
      }
      
      // Fallback: tenta outros separadores se o traço longo não funcionar
      const fallbackSeparators = /[\-\s+vs\s+]/i
      const fallbackTeams = matchString.split(fallbackSeparators).map(team => team.trim()).filter(team => team.length > 0)
      
      if (fallbackTeams.length >= 2) {
        const result = {
          team1: fallbackTeams[0],
          team2: fallbackTeams[1]
        }
        console.log('🔄 Fallback - Times finais:', result)
        return result
      }
      
      console.log('❌ Não foi possível extrair nomes dos times')
      return { team1: 'Time 1', team2: 'Time 2' }
    },

    // Retorna o nome do time baseado no código (AH1, AH2, etc.)
    getTeamName(teamCode) {
      const teams = this.getTeamNames()
      
      if (teamCode === 'AH1' || teamCode === 'EH1' || teamCode === 'Team1') {
        return teams.team1
      } else if (teamCode === 'AH2' || teamCode === 'EH2' || teamCode === 'Team2') {
        return teams.team2
      }
      
      return teamCode === 'AH1' ? 'Time 1' : 'Time 2'
    },

    // Mostra tooltip customizado
    showTooltip(event, market) {
      if (!this.hasMarketTranslation(market)) return
      
      const translation = this.getMarketTranslation(market)
      if (!translation) return
      
      // Previne múltiplos tooltips
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        this.tooltipTimeout = null
      }
      
      // Remove tooltip existente imediatamente
      this.hideTooltip()
      
      // Delay para evitar piscar
      this.tooltipTimeout = setTimeout(() => {
        this.createTooltip(event, translation)
      }, 150)
    },

    // Cria o tooltip
    createTooltip(event, translation) {
      // Verifica se ainda existe o elemento target
      if (!event.target || !event.target.parentNode) return
      
      // Remove tooltip existente
      this.hideTooltip()
      
      // Cria elemento do tooltip
      const tooltip = document.createElement('div')
      tooltip.className = 'market-tooltip'
      tooltip.textContent = translation
      tooltip.id = 'market-tooltip'
      
      // Adiciona ao body
      document.body.appendChild(tooltip)
      
      // Posiciona o tooltip
      const rect = event.target.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
      let top = rect.top - tooltipRect.height - 8
      let isAbove = true
      
      // Ajusta se sair da tela
      if (left < 8) left = 8
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8
      }
      
      // Se não couber acima, coloca abaixo
      if (top < 8) {
        top = rect.bottom + 8
        isAbove = false
      }
      
      // Adiciona classe para posicionamento da seta
      if (isAbove) {
        tooltip.classList.add('above')
      }
      
      tooltip.style.left = left + 'px'
      tooltip.style.top = top + 'px'
      
      // Adiciona animação
      requestAnimationFrame(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.classList.add('show')
        }
      })
      
      // Armazena referência para limpeza
      this.currentTooltip = tooltip
    },

    // Esconde tooltip customizado
    hideTooltip() {
      // Limpa timeout se existir
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        this.tooltipTimeout = null
      }
      
      // Remove tooltip atual
      if (this.currentTooltip) {
        this.currentTooltip.classList.remove('show')
        setTimeout(() => {
          if (this.currentTooltip && this.currentTooltip.parentNode) {
            this.currentTooltip.parentNode.removeChild(this.currentTooltip)
          }
          this.currentTooltip = null
        }, 200)
      }
      
      // Remove tooltip por ID (fallback)
      const tooltip = document.getElementById('market-tooltip')
      if (tooltip) {
        tooltip.classList.remove('show')
        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip)
          }
        }, 200)
      }
    },

    // Limpa todos os tooltips órfãos
    clearAllTooltips() {
      const tooltips = document.querySelectorAll('.market-tooltip')
      tooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip)
        }
      })
    },

    // Configura limpeza automática de tooltips
    setupTooltipCleanup() {
      // Limpa tooltips ao clicar fora
      this.clickHandler = (event) => {
        if (!event.target.closest('.market.has-translation')) {
          this.hideTooltip()
        }
      }
      document.addEventListener('click', this.clickHandler)

      // Limpa tooltips ao rolar a página
      this.scrollHandler = () => {
        this.hideTooltip()
      }
      window.addEventListener('scroll', this.scrollHandler, { passive: true })

      // Limpa tooltips ao redimensionar a janela
      this.resizeHandler = () => {
        this.hideTooltip()
      }
      window.addEventListener('resize', this.resizeHandler, { passive: true })

      // Limpa tooltips ao mudar de rota (Vue Router)
      if (this.$router) {
        this.routerHandler = () => {
          this.clearAllTooltips()
        }
        this.$router.beforeEach(this.routerHandler)
      }
    },

    // Remove listeners de limpeza
    removeTooltipCleanup() {
      if (this.clickHandler) {
        document.removeEventListener('click', this.clickHandler)
      }
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler)
      }
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
      }
      if (this.routerHandler && this.$router) {
        this.$router.beforeEach(this.routerHandler)
      }
    }

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
  user-select: text;
  cursor: text;
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
  transition: all 0.3s ease;
  position: relative;
  cursor: default;
  
  &.has-translation {
    cursor: help;
    
    &:hover {
      background: var(--accent-primary);
      color: var(--bg-primary);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.2);
    }
  }
}

.bet-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.stake-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  min-width: 80px;
  max-width: 100px;
  white-space: nowrap;
  flex-shrink: 0;
  
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
    gap: 10px;
  }
  
  .stake-section {
    gap: 8px;
  }
  
  .odds-info {
    justify-content: space-between;
  }
  
  .bet-btn {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 70px;
    max-width: 90px;
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
    gap: 6px;
  }
  
  .stake-section {
    gap: 6px;
  }
  
  .odds-info {
    gap: 4px;
  }
  
  .stake-info {
    gap: 4px;
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
    padding: 6px 8px;
    font-size: 11px;
    min-width: 60px;
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
  
  /* Permitir seleção de texto no título do jogo mesmo durante arrastar */
  .match-title {
    user-select: text;
    cursor: text;
    pointer-events: auto;
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

<!-- Estilos globais para o tooltip customizado -->
<style lang="scss">
.market-tooltip {
  position: fixed;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary, #333333);
  z-index: 10000;
  max-width: 300px;
  word-wrap: break-word;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
  pointer-events: none;
  
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  // Seta do tooltip
  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--bg-primary, #1a1a1a);
  }
  
  // Seta do tooltip quando está acima
  &.above::before {
    top: -6px;
    border-top: none;
    border-bottom: 6px solid var(--bg-primary, #1a1a1a);
  }
}
</style>
