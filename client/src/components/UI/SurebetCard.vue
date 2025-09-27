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
          <button class="action-btn pin-btn" :class="{ 'pinned': isPinned }" @click="togglePin"
            :title="isPinned ? 'Desafixar Card' : 'Fixar Card'">
            <i v-if="!isPinned" class="bi bi-geo-alt icon-text"></i>
            <i v-else class="bi bi-geo-alt-fill icon-text"></i>
          </button>
          <button class="action-btn add-report-btn" @click="addToReports" title="Adicionar aos Relatórios">
            <i class="bi bi-file-text icon-text"></i>
          </button>
          <button class="action-btn debit-icon-btn" :class="{ 'disabled': !canDebitFromAllBalances() }"
            @click="debitFromAllBalances()" :title="getDebitButtonTooltip()">
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
          {{ surebet[0]?.isLive ? `Live - ${surebet[0]?.minutes || '1'}'` : `Pré-live${surebet[0]?.minutes ? ` -
          ${surebet[0]?.minutes}'` : ''}` }}
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
          <div class="bookmaker-line">
            <span class="bookmaker">{{ bet.house || 'Bet365' }}</span>
          </div>
          <div class="market-line">
            <span class="market" :class="{ 'has-translation': hasMarketTranslation(bet.market) }"
              @mouseenter="showTooltip($event, bet.market)" @mouseleave="hideTooltip">
              {{ bet.market || 'Resultado Final' }}
            </span>
            <button class="market-info-btn" @mouseenter="showMarketInfoTooltip($event, bet.market)"
              @mouseleave="hideMarketInfoTooltip" :title="'Informações sobre ' + (bet.market || 'Resultado Final')">
              <i class="bi bi-info-circle market-info-icon"></i>
            </button>
          </div>
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

            <button class="bet-btn" :class="{ 'disabled': !hasValidUrl(bet) }" @click="placeBet(bet)"
              :title="getButtonTooltip(bet)">
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
import { getBookmakerUrl, extractDomainFromAnchorh, buildBookmakerUrlFromDomain } from '../../config/bookmakerUrls.js'
import { http } from '../../utils/http.js'
import marketTranslations from '../../config/marketTranslations.json'
import { emitter } from '../../utils/emitter.js'

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
      currentTooltip: null,
      marketInfoTooltipTimeout: null,
      currentMarketInfoTooltip: null
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
    this.hideMarketInfoTooltip()
    this.removeTooltipCleanup()
    this.clearAllTooltips()
  },
  beforeUnmount() {
    // Limpa tooltips ao desmontar o componente (Vue 3)
    this.hideTooltip()
    this.hideMarketInfoTooltip()
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
          const bookmakerUrl = getBookmakerUrl(bet.house, isLive, bet.anchorh1, bet.anchorh2, bet.anchorh1_original, bet.anchorh2_original, bet.house1, bet.house2)

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

        // 8. Adicionar aposta aos relatórios locais
        this.addBetToReports()

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

    // Adiciona aposta aos relatórios locais
    addBetToReports() {
      try {
        const firstBet = this.surebet[0]
        const houses = this.surebet.map(bet => bet.house).filter(Boolean)

        // Extrai a data e hora da partida do surebet
        const matchDate = firstBet.date || new Date().toISOString().split('T')[0]
        const matchHour = firstBet.hour || '00:00'

        // Cria a data completa da partida
        const matchDateTime = new Date(`${matchDate}T${matchHour}`)

        const newBet = {
          id: Date.now() + Math.random(), // ID único
          match: firstBet.match || 'Partida não especificada',
          sport: firstBet.sport || 'Esporte não especificado',
          houses: houses,
          market: firstBet.market || 'Mercado não especificado',
          odds: this.surebet.map(bet => bet.chance).join(' / '),
          stake: this.totalInvestment, // Valor total investido
          investment: this.totalInvestment, // Valor total investido
          status: 'Em andamento',
          profit: this.expectedProfit, // Lucro esperado
          roi: firstBet.profit || 0,
          date: matchDateTime.toISOString(), // Data e hora de início da partida
          surebetId: this.surebet[0]?.id || Date.now(), // Referência ao surebet original
          statusUpdated: false // Flag para controlar notificações
        }

        // Obtém apostas existentes do localStorage
        const storedBets = localStorage.getItem('reports_bets')
        let bets = storedBets ? JSON.parse(storedBets) : []

        // Adiciona a nova aposta no início
        bets.unshift(newBet)

        // Salva no localStorage
        localStorage.setItem('reports_bets', JSON.stringify(bets))

        console.log('✅ Aposta adicionada aos relatórios locais:', newBet)

        // Emite evento para atualizar ReportsView se estiver ativo
        emitter.emit('bet-added-to-reports', newBet)

      } catch (error) {
        console.error('❌ Erro ao adicionar aposta aos relatórios:', error)
      }
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
      const mappedUrl = getBookmakerUrl(bet.house, isLive, bet.anchorh1, bet.anchorh2, bet.anchorh1_original, bet.anchorh2_original, bet.house1, bet.house2)

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
      const playerMarketsMatch = market.match(/^(.+?)\s*-\s*(Over|Under)\((\d+(?:\.\d+)?)\)\s*-\s*Player\s+(Goals|Assists|Cards|Fouls|Corners|to Score)$/i)
      if (playerMarketsMatch) {
        const [, playerName, overUnder, number, marketType] = playerMarketsMatch
        const isOver = overUnder.toLowerCase() === 'over'
        const prefix = isOver ? 'Mais de' : 'Menos de'

        const marketTranslations = {
          'Goals': 'Gols',
          'Assists': 'Assistências',
          'Cards': 'Cartões',
          'Fouls': 'Faltas',
          'Corners': 'Escanteios',
          'to Score': 'Pontos'
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
      const tooltips = document.querySelectorAll('.market-tooltip, .market-info-tooltip')
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
        if (!event.target.closest('.market.has-translation') && !event.target.closest('.market-info-btn')) {
          this.hideTooltip()
          this.hideMarketInfoTooltip()
        }
      }
      document.addEventListener('click', this.clickHandler)

      // Limpa tooltips ao rolar a página
      this.scrollHandler = () => {
        this.hideTooltip()
        this.hideMarketInfoTooltip()
      }
      window.addEventListener('scroll', this.scrollHandler, { passive: true })

      // Limpa tooltips ao redimensionar a janela
      this.resizeHandler = () => {
        this.hideTooltip()
        this.hideMarketInfoTooltip()
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
    },

    // Mostra tooltip de informações do mercado
    showMarketInfoTooltip(event, market) {
      if (!market) return

      // Previne múltiplos tooltips
      if (this.marketInfoTooltipTimeout) {
        clearTimeout(this.marketInfoTooltipTimeout)
        this.marketInfoTooltipTimeout = null
      }

      // Remove tooltip existente imediatamente
      this.hideMarketInfoTooltip()

      // Delay para evitar piscar
      this.marketInfoTooltipTimeout = setTimeout(() => {
        this.createMarketInfoTooltip(event, market)
      }, 150)
    },

    // Cria o tooltip de informações do mercado
    createMarketInfoTooltip(event, market) {
      // Verifica se ainda existe o elemento target
      if (!event.target || !event.target.parentNode) return

      // Remove tooltip existente
      this.hideMarketInfoTooltip()

      // Cria elemento do tooltip
      const tooltip = document.createElement('div')
      tooltip.className = 'market-info-tooltip'
      tooltip.id = 'market-info-tooltip'

      // Gera o conteúdo do tooltip baseado no tipo de mercado
      const tooltipContent = this.generateMarketInfoContent(market)
      tooltip.innerHTML = tooltipContent

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
      this.currentMarketInfoTooltip = tooltip
    },

    // Esconde tooltip de informações do mercado
    hideMarketInfoTooltip() {
      // Limpa timeout se existir
      if (this.marketInfoTooltipTimeout) {
        clearTimeout(this.marketInfoTooltipTimeout)
        this.marketInfoTooltipTimeout = null
      }

      // Remove tooltip atual
      if (this.currentMarketInfoTooltip) {
        this.currentMarketInfoTooltip.classList.remove('show')
        setTimeout(() => {
          if (this.currentMarketInfoTooltip && this.currentMarketInfoTooltip.parentNode) {
            this.currentMarketInfoTooltip.parentNode.removeChild(this.currentMarketInfoTooltip)
          }
          this.currentMarketInfoTooltip = null
        }, 200)
      }

      // Remove tooltip por ID (fallback)
      const tooltip = document.getElementById('market-info-tooltip')
      if (tooltip) {
        tooltip.classList.remove('show')
        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip)
          }
        }, 200)
      }
    },

    // Gera o conteúdo do tooltip baseado no tipo de mercado
    generateMarketInfoContent(market) {
      const teams = this.getTeamNames()
      const marketType = this.getMarketType(market)

      let content = `
        <div class="market-info-header">
          <h4>${market}</h4>
          <p class="market-description">${this.getMarketDescription(market)}</p>
        </div>
      `

      switch (marketType) {
        case 'team1win':
        case 'team2win':
          content += this.generateTeamWinMatrix(teams, marketType)
          break
        case 'over':
        case 'under':
          content += this.generateOverUnderMatrix(market)
          break
        case 'ah1':
        case 'ah2':
          content += this.generateHandicapMatrix(teams, market, marketType)
          break
        case 'eh1':
        case 'eh2':
          content += this.generateEuropeanHandicapMatrix(teams, market, marketType)
          break
        case 'double_chance_1x':
        case 'double_chance_x2':
          content += this.generateDoubleChanceMatrix(teams, marketType)
          break
        case 'match_result':
          content += this.generateMatchResultMatrix(teams)
          break
        case 'draw_no_bet':
          content += this.generateDrawNoBetMatrix(teams)
          break
        case 'both_score_yes':
        case 'both_score_no':
          content += this.generateBothScoreMatrix(marketType)
          break
        case 'first_goal':
        case 'last_goal':
          content += this.generateGoalMatrix(teams, marketType)
          break
        case 'even':
        case 'odd':
          content += this.generateEvenOddMatrix(marketType)
          break
        case 'exact_score':
          content += this.generateExactScoreMatrix()
          break
        case 'sets':
          content += this.generateSetsMatrix()
          break
        case 'player_score':
        case 'player_rebounds':
          content += this.generatePlayerMatrix(marketType)
          break
        case 'corners':
        case 'fouls':
        case 'offsides':
        case 'shots_on_goal':
        case 'field_goals':
        case 'touchdowns':
          content += this.generateSpecificMarketMatrix(marketType)
          break
        case 'half_time':
        case 'full_time':
          content += this.generateTimeMatrix(teams, marketType)
          break
        default:
          content += this.generateGenericMatrix(market)
      }

      return content
    },

    // Identifica o tipo de mercado
    getMarketType(market) {
      if (!market) return 'generic'

      const marketLower = market.toLowerCase()

      // Vitória de times
      if (marketLower.includes('team1') && marketLower.includes('win')) return 'team1win'
      if (marketLower.includes('team2') && marketLower.includes('win')) return 'team2win'

      // Over/Under
      if (marketLower.includes('to(') || marketLower.includes('over')) return 'over'
      if (marketLower.includes('tu(') || marketLower.includes('under')) return 'under'

      // Handicap Asiático
      if (marketLower.includes('ah1')) return 'ah1'
      if (marketLower.includes('ah2')) return 'ah2'

      // Handicap Europeu
      if (marketLower.includes('eh1')) return 'eh1'
      if (marketLower.includes('eh2')) return 'eh2'

      // Dupla Chance
      if (market === '1X') return 'double_chance_1x'
      if (market === 'X2') return 'double_chance_x2'
      if (market === '1X2') return 'match_result'

      // Draw No Bet
      if (market === 'DNB') return 'draw_no_bet'

      // Both Teams to Score
      if (market === 'BothToScore') return 'both_score_yes'
      if (market === 'OneScoreless') return 'both_score_no'

      // Primeiro/Último Gol
      if (market === 'FirstGoal') return 'first_goal'
      if (market === 'LastGoal') return 'last_goal'

      // Par/Ímpar
      if (market === 'Even') return 'even'
      if (market === 'Odd') return 'odd'

      // Resultado Exato
      if (market === 'Score' || marketLower.includes('exact')) return 'exact_score'

      // Sets
      if (market === 'Sets' || market === 'Exact') return 'sets'

      // Mercados de jogadores
      if (marketLower.includes('player to score')) return 'player_score'
      if (marketLower.includes('player rebounds')) return 'player_rebounds'

      // Mercados específicos
      if (market === 'Corners') return 'corners'
      if (market === 'Fouls') return 'fouls'
      if (market === 'Offsides') return 'offsides'
      if (market === 'Shots on goal') return 'shots_on_goal'
      if (market === 'Field Goals') return 'field_goals'
      if (market === 'Touchdowns') return 'touchdowns'

      // Tempo
      if (market === 'HT') return 'half_time'
      if (market === 'FT') return 'full_time'

      return 'generic'
    },

    // Obtém descrição do mercado
    getMarketDescription(market) {
      const marketType = this.getMarketType(market)

      switch (marketType) {
        case 'team1win':
          return 'Aposta na vitória do time da casa'
        case 'team2win':
          return 'Aposta na vitória do time visitante'
        case 'over':
          return 'Aposta em mais que o valor especificado'
        case 'under':
          return 'Aposta em menos que o valor especificado'
        case 'ah1':
        case 'ah2':
          return 'Handicap asiático - vantagem/desvantagem para um dos times'
        case 'eh1':
        case 'eh2':
          return 'Handicap europeu - vantagem/desvantagem para um dos times'
        case 'double_chance_1x':
          return 'Aposta em vitória do time 1 ou empate'
        case 'double_chance_x2':
          return 'Aposta em empate ou vitória do time 2'
        case 'match_result':
          return 'Aposta no resultado final do jogo (1X2)'
        case 'draw_no_bet':
          return 'Aposta sem empate - se empatar, valor é devolvido'
        case 'both_score_yes':
          return 'Aposta que ambos os times marcarão gols'
        case 'both_score_no':
          return 'Aposta que pelo menos um time não marcará'
        case 'first_goal':
          return 'Aposta em quem marcará o primeiro gol'
        case 'last_goal':
          return 'Aposta em quem marcará o último gol'
        case 'even':
          return 'Aposta que o total será par'
        case 'odd':
          return 'Aposta que o total será ímpar'
        case 'exact_score':
          return 'Aposta no resultado exato do jogo'
        case 'sets':
          return 'Aposta relacionada aos sets do jogo'
        case 'player_score':
          return 'Aposta em jogador específico marcar'
        case 'player_rebounds':
          return 'Aposta em rebotes de jogador específico'
        case 'corners':
          return 'Aposta relacionada aos escanteios'
        case 'fouls':
          return 'Aposta relacionada às faltas'
        case 'offsides':
          return 'Aposta relacionada aos impedimentos'
        case 'shots_on_goal':
          return 'Aposta relacionada aos chutes ao gol'
        case 'field_goals':
          return 'Aposta relacionada aos gols de campo'
        case 'touchdowns':
          return 'Aposta relacionada aos touchdowns'
        case 'half_time':
          return 'Aposta no resultado do primeiro tempo'
        case 'full_time':
          return 'Aposta no resultado do tempo completo'
        default:
          return 'Aposta específica do mercado'
      }
    },

    // Gera matriz para vitória de time
    generateTeamWinMatrix(teams, marketType) {
      const isTeam1 = marketType === 'team1win'
      const teamName = isTeam1 ? teams.team1 : teams.team2
      const sport = this.getSportType()
      const hasDraws = this.sportHasDraws(sport)

      let tableRows = `
        <tr>
          <td>${teams.team1} vence</td>
          <td>${teamName}</td>
          <td class="${isTeam1 ? 'win' : 'lose'}">${isTeam1 ? 'Vitória' : 'Derrota'}</td>
        </tr>
        <tr>
          <td>${teams.team2} vence</td>
          <td>${teamName}</td>
          <td class="${!isTeam1 ? 'win' : 'lose'}">${!isTeam1 ? 'Vitória' : 'Derrota'}</td>
        </tr>
      `

      // Adiciona linha de empate apenas se o esporte tem empates
      if (hasDraws) {
        tableRows += `
          <tr>
            <td>Empate</td>
            <td>${teamName}</td>
            <td class="lose">Derrota</td>
          </tr>
        `
      }

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Over/Under
    generateOverUnderMatrix(market) {
      const isOver = market.toLowerCase().includes('to(') || market.toLowerCase().includes('over')
      const value = this.extractValueFromMarket(market)
      const sport = this.getSportType()
      const terminology = this.getSportTerminology(sport)

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Total de ${terminology.unit}</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${isOver ? `Mais de ${value}` : `Menos de ${value}`}</td>
                <td>${isOver ? `Mais de ${value}` : `Menos de ${value}`}</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>${isOver ? `Menos de ${value}` : `Mais de ${value}`}</td>
                <td>${isOver ? `Mais de ${value}` : `Menos de ${value}`}</td>
                <td class="lose">Derrota</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Handicap Asiático
    generateHandicapMatrix(teams, market, marketType) {
      const isTeam1 = marketType === 'ah1'
      const teamName = isTeam1 ? teams.team1 : teams.team2
      const handicap = this.extractHandicapFromMarket(market)
      const sport = this.getSportType()
      const hasDraws = this.sportHasDraws(sport)

      let tableRows = ''

      // Linha para vitória do time 1
      tableRows += `
        <tr>
          <td>${teams.team1} vence por ${Math.abs(handicap) + 1}</td>
          <td>${isTeam1 ? teams.team1 : teams.team2} vence</td>
          <td>${teamName}</td>
          <td class="${isTeam1 ? 'win' : 'lose'}">${isTeam1 ? 'Vitória' : 'Derrota'}</td>
        </tr>
      `

      // Linha para vitória do time 2
      tableRows += `
        <tr>
          <td>${teams.team2} vence por ${Math.abs(handicap) + 1}</td>
          <td>${isTeam1 ? teams.team2 : teams.team1} vence</td>
          <td>${teamName}</td>
          <td class="${!isTeam1 ? 'win' : 'lose'}">${!isTeam1 ? 'Vitória' : 'Derrota'}</td>
        </tr>
      `

      // Linha para empate (apenas se o esporte tem empates)
      if (hasDraws) {
        tableRows += `
          <tr>
            <td>Empate</td>
            <td>Empate</td>
            <td>${teamName}</td>
            <td class="refund">Devolução do Saldo</td>
          </tr>
        `
      }

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis (com handicap ${handicap}):</h5>
          <p class="handicap-explanation">
            <strong>Handicap Asiático:</strong> ${handicap > 0 ? 'Vantagem' : 'Desvantagem'} de ${Math.abs(handicap)} ${handicap === 0.5 || handicap === -0.5 ? 'gol' : 'gols'} para ${teamName}
          </p>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado Real</th>
                <th>Com Handicap</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p class="handicap-note">
            <strong>Nota:</strong> No handicap asiático, empates resultam na devolução do valor apostado (stake back).
          </p>
        </div>
      `
    },

    // Gera matriz para Dupla Chance
    generateDoubleChanceMatrix(teams, marketType) {
      const is1X = marketType === 'double_chance_1x'
      const betName = is1X ? `${teams.team1} ou Empate` : `Empate ou ${teams.team2}`

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${teams.team1} vence</td>
                <td>${betName}</td>
                <td class="${is1X ? 'win' : 'lose'}">${is1X ? 'Vitória' : 'Derrota'}</td>
              </tr>
              <tr>
                <td>${teams.team2} vence</td>
                <td>${betName}</td>
                <td class="${!is1X ? 'win' : 'lose'}">${!is1X ? 'Vitória' : 'Derrota'}</td>
              </tr>
              <tr>
                <td>Empate</td>
                <td>${betName}</td>
                <td class="win">Vitória</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Resultado Final (1X2)
    generateMatchResultMatrix(teams) {
      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Opções</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${teams.team1} vence</td>
                <td>1 (Vitória Time 1)</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>Empate</td>
                <td>X (Empate)</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>${teams.team2} vence</td>
                <td>2 (Vitória Time 2)</td>
                <td class="win">Vitória</td>
              </tr>
            </tbody>
          </table>
          <p class="market-note">
            <strong>Nota:</strong> Aposte em uma das três opções: 1 (Time 1), X (Empate) ou 2 (Time 2).
          </p>
        </div>
      `
    },

    // Gera matriz para Draw No Bet
    generateDrawNoBetMatrix(teams) {
      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${teams.team1} vence</td>
                <td>Time escolhido</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>${teams.team2} vence</td>
                <td>Time escolhido</td>
                <td class="lose">Derrota</td>
              </tr>
              <tr>
                <td>Empate</td>
                <td>Time escolhido</td>
                <td class="refund">Devolução do Saldo</td>
              </tr>
            </tbody>
          </table>
          <p class="market-note">
            <strong>Nota:</strong> Se o jogo empatar, o valor apostado é devolvido (stake back).
          </p>
        </div>
      `
    },

    // Gera matriz para Both Teams to Score
    generateBothScoreMatrix(marketType) {
      const isYes = marketType === 'both_score_yes'
      const betName = isYes ? 'Ambos marcam' : 'Pelo menos um não marca'

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ambos os times marcam</td>
                <td>${betName}</td>
                <td class="${isYes ? 'win' : 'lose'}">${isYes ? 'Vitória' : 'Derrota'}</td>
              </tr>
              <tr>
                <td>Apenas um time marca</td>
                <td>${betName}</td>
                <td class="${!isYes ? 'win' : 'lose'}">${!isYes ? 'Vitória' : 'Derrota'}</td>
              </tr>
              <tr>
                <td>Nenhum time marca</td>
                <td>${betName}</td>
                <td class="${!isYes ? 'win' : 'lose'}">${!isYes ? 'Vitória' : 'Derrota'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Primeiro/Último Gol
    generateGoalMatrix(teams, marketType) {
      const isFirst = marketType === 'first_goal'
      const goalType = isFirst ? 'primeiro' : 'último'

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Quem marca o ${goalType} gol</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${teams.team1}</td>
                <td>Time escolhido</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>${teams.team2}</td>
                <td>Time escolhido</td>
                <td class="lose">Derrota</td>
              </tr>
              <tr>
                <td>Nenhum gol</td>
                <td>Time escolhido</td>
                <td class="lose">Derrota</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Par/Ímpar
    generateEvenOddMatrix(marketType) {
      const isEven = marketType === 'even'
      const sport = this.getSportType()
      const terminology = this.getSportTerminology(sport)
      const betName = isEven ? `Total par` : `Total ímpar`

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Total de ${terminology.unit}</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0, 2, 4, 6, 8... (Par)</td>
                <td>${betName}</td>
                <td class="${isEven ? 'win' : 'lose'}">${isEven ? 'Vitória' : 'Derrota'}</td>
              </tr>
              <tr>
                <td>1, 3, 5, 7, 9... (Ímpar)</td>
                <td>${betName}</td>
                <td class="${!isEven ? 'win' : 'lose'}">${!isEven ? 'Vitória' : 'Derrota'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz para Sets
    generateSetsMatrix() {
      return `
        <div class="market-matrix">
          <h5>Informações sobre Sets:</h5>
          <p>Este mercado é específico para esportes que usam sets (tênis, vôlei, etc.).</p>
          <p><strong>Exemplos:</strong></p>
          <ul>
            <li>Número total de sets</li>
            <li>Vitória em sets específicos</li>
            <li>Handicap em sets</li>
          </ul>
        </div>
      `
    },

    // Gera matriz para mercados de jogadores
    generatePlayerMatrix(marketType) {
      const marketName = marketType === 'player_score' ? 'Jogador para marcar' : 'Rebotes do jogador'

      return `
        <div class="market-matrix">
          <h5>Informações sobre ${marketName}:</h5>
          <p>Este mercado é específico para apostas em jogadores individuais.</p>
          <p><strong>Como funciona:</strong></p>
          <ul>
            <li>Aposta em um jogador específico</li>
            <li>Vitória se o jogador atingir o objetivo</li>
            <li>Derrota se não atingir</li>
          </ul>
        </div>
      `
    },

    // Gera matriz para mercados específicos
    generateSpecificMarketMatrix(marketType) {
      const marketNames = {
        'corners': 'Escanteios',
        'fouls': 'Faltas',
        'offsides': 'Impedimentos',
        'shots_on_goal': 'Chutes ao Gol',
        'field_goals': 'Gols de Campo',
        'touchdowns': 'Touchdowns'
      }

      const marketName = marketNames[marketType] || marketType

      return `
        <div class="market-matrix">
          <h5>Informações sobre ${marketName}:</h5>
          <p>Este mercado é específico para estatísticas do jogo.</p>
          <p><strong>Tipos de apostas:</strong></p>
          <ul>
            <li>Over/Under no total</li>
            <li>Over/Under por time</li>
            <li>Número exato</li>
          </ul>
        </div>
      `
    },

    // Gera matriz para tempo (HT/FT)
    generateTimeMatrix(teams, marketType) {
      const timeName = marketType === 'half_time' ? 'Primeiro Tempo' : 'Tempo Completo'

      return `
        <div class="market-matrix">
          <h5>Resultados Possíveis - ${timeName}:</h5>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Resultado no ${timeName}</th>
                <th>Sua Aposta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${teams.team1} vence</td>
                <td>Time escolhido</td>
                <td class="win">Vitória</td>
              </tr>
              <tr>
                <td>${teams.team2} vence</td>
                <td>Time escolhido</td>
                <td class="lose">Derrota</td>
              </tr>
              <tr>
                <td>Empate</td>
                <td>Time escolhido</td>
                <td class="lose">Derrota</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    // Gera matriz genérica
    generateGenericMatrix(market) {
      return `
        <div class="market-matrix">
          <h5>Informações do Mercado:</h5>
          <p>Este é um mercado específico que requer análise individual.</p>
          <p><strong>Mercado:</strong> ${market}</p>
        </div>
      `
    },

    // Extrai valor numérico do mercado (para TO/TU)
    extractValueFromMarket(market) {
      const match = market.match(/\(([0-9.]+)\)/)
      return match ? match[1] : '0.5'
    },

    // Extrai handicap do mercado (para AH/EH)
    extractHandicapFromMarket(market) {
      const match = market.match(/\(([+-]?[0-9.]+)\)/)
      return match ? parseFloat(match[1]) : 0
    },

    // Obtém o tipo de esporte
    getSportType() {
      if (!this.surebet || !this.surebet[0] || !this.surebet[0].sport) {
        return 'Futebol' // Default
      }
      return this.surebet[0].sport.toLowerCase()
    },

    // Verifica se o esporte tem empates
    sportHasDraws(sport) {
      const sportsWithoutDraws = [
        'basquete',
        'basketball',
        'tênis',
        'tennis',
        'vôlei',
        'volleyball',
        'hóquei',
        'hockey',
        'beisebol',
        'baseball',
        'americano',
        'american football',
        'rugby',
        'badminton',
        'ping pong',
        'table tennis',
        'esports',
        'lol',
        'league of legends',
        'csgo',
        'counter-strike',
        'dota',
        'valorant'
      ]

      return !sportsWithoutDraws.some(sportWithoutDraw =>
        sport.includes(sportWithoutDraw)
      )
    },

    // Obtém terminologia específica do esporte
    getSportTerminology(sport) {
      const sportLower = sport.toLowerCase()

      // Esports
      if (sportLower.includes('lol') || sportLower.includes('league of legends')) {
        return {
          unit: 'Kills',
          points: 'Kills',
          goals: 'Kills',
          score: 'Kills'
        }
      }

      if (sportLower.includes('csgo') || sportLower.includes('counter-strike')) {
        return {
          unit: 'Rounds',
          points: 'Rounds',
          goals: 'Rounds',
          score: 'Rounds'
        }
      }

      if (sportLower.includes('dota')) {
        return {
          unit: 'Kills',
          points: 'Kills',
          goals: 'Kills',
          score: 'Kills'
        }
      }

      if (sportLower.includes('valorant')) {
        return {
          unit: 'Rounds',
          points: 'Rounds',
          goals: 'Rounds',
          score: 'Rounds'
        }
      }

      // Basquete
      if (sportLower.includes('basquete') || sportLower.includes('basketball')) {
        return {
          unit: 'Pontos',
          points: 'Pontos',
          goals: 'Pontos',
          score: 'Pontos'
        }
      }

      // Tênis
      if (sportLower.includes('tênis') || sportLower.includes('tennis')) {
        return {
          unit: 'Sets',
          points: 'Sets',
          goals: 'Sets',
          score: 'Sets'
        }
      }

      // Vôlei
      if (sportLower.includes('vôlei') || sportLower.includes('volleyball')) {
        return {
          unit: 'Sets',
          points: 'Sets',
          goals: 'Sets',
          score: 'Sets'
        }
      }

      // Hóquei
      if (sportLower.includes('hóquei') || sportLower.includes('hockey')) {
        return {
          unit: 'Gols',
          points: 'Gols',
          goals: 'Gols',
          score: 'Gols'
        }
      }

      // Beisebol
      if (sportLower.includes('beisebol') || sportLower.includes('baseball')) {
        return {
          unit: 'Runs',
          points: 'Runs',
          goals: 'Runs',
          score: 'Runs'
        }
      }

      // Futebol Americano
      if (sportLower.includes('americano') || sportLower.includes('american football')) {
        return {
          unit: 'Pontos',
          points: 'Pontos',
          goals: 'Pontos',
          score: 'Pontos'
        }
      }

      // Rugby
      if (sportLower.includes('rugby')) {
        return {
          unit: 'Pontos',
          points: 'Pontos',
          goals: 'Pontos',
          score: 'Pontos'
        }
      }

      // Badminton
      if (sportLower.includes('badminton')) {
        return {
          unit: 'Sets',
          points: 'Sets',
          goals: 'Sets',
          score: 'Sets'
        }
      }

      // Ping Pong / Table Tennis
      if (sportLower.includes('ping pong') || sportLower.includes('table tennis')) {
        return {
          unit: 'Sets',
          points: 'Sets',
          goals: 'Sets',
          score: 'Sets'
        }
      }

      // Default para futebol e outros esportes
      return {
        unit: 'Gols',
        points: 'Gols',
        goals: 'Gols',
        score: 'Gols'
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
  padding: 20px;
  margin-top: 8px;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 0;

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
  gap: 12px;
  flex-shrink: 0;
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
  gap: 14px;
  /* Aumentado gap para mais espaço */
  flex-shrink: 0;
  /* Previne que os controles sejam comprimidos */
}

.date-time {
  display: flex;
  align-items: center;
  gap: 6px;
  /* Aumentado gap para mais espaço */
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
  /* Previne que o elemento seja comprimido */
}

.time-icon {
  color: var(--text-secondary);
  font-size: 11px;
  /* Aumentado tamanho do ícone */
  flex-shrink: 0;
  /* Previne que o ícone seja comprimido */
}

.action-icons {
  display: flex;
  gap: 8px;
  /* Aumentado gap entre os ícones */
  align-items: center;
  flex-shrink: 0;
  /* Previne que os ícones sejam comprimidos */
}

.action-btn {
  width: 24px;
  /* Aumentado tamanho do botão */
  height: 24px;
  /* Aumentado tamanho do botão */
  background: var(--bg-overlay);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* Previne que o botão seja comprimido */

  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
    transform: translateY(-1px);
    /* Adicionado efeito hover */
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
  font-size: 12px;
  /* Aumentado tamanho do ícone */
  display: block;
  line-height: 1;
  color: var(--text-secondary, #888888);
  transition: all 0.3s ease;
  width: 12px;
  /* Aumentado largura */
  height: 12px;
  /* Aumentado altura */
  flex-shrink: 0;
  /* Previne que o ícone seja comprimido */
}

.match-info {
  margin-bottom: 20px;
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bet-option {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 255, 136, 0.1);
  }
}

.bet-header {
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-primary);
}

.bookmaker-line {
  margin-bottom: 4px;
}

.bookmaker {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
}

.market-line {
  display: flex;
  align-items: center;
  gap: 6px;
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
    padding: 16px;
    /* Reduzido padding em mobile para dar mais espaço ao conteúdo */
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    gap: 10px;
    /* Reduzido gap em mobile */
  }

  .action-btn {
    width: 22px;
    /* Reduzido tamanho em mobile */
    height: 22px;
    /* Reduzido tamanho em mobile */
  }

  .icon-text {
    font-size: 11px;
    /* Reduzido tamanho em mobile */
    width: 11px;
    /* Reduzido tamanho em mobile */
    height: 11px;
    /* Reduzido tamanho em mobile */
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
    padding: 12px;
    /* Padding ainda menor para telas muito pequenas */
  }

  .bet-header {
    margin-bottom: 10px;
  }

  .bookmaker-line {
    margin-bottom: 6px;
  }

  .bookmaker {
    font-size: 12px;
    margin-bottom: 0;
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

/* Garantir que todos os cards tenham a mesma altura no grid */
.surebet-card {
  align-self: start;

  /* Força todos os cards a terem a mesma altura baseada no conteúdo */
  &>* {
    flex-shrink: 0;
  }

  /* Garante que o conteúdo das apostas seja distribuído uniformemente */
  .bet-options {
    justify-content: flex-start;
  }
}

.market-info-btn {
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--accent-primary);
    transform: scale(1.1);
  }
}

.market-info-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.3s ease;

  .market-info-btn:hover & {
    color: var(--bg-primary);
  }
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

/* Estilos para o tooltip de informações do mercado */
.market-info-tooltip {
  position: fixed;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-primary, #333333);
  z-index: 10001;
  max-width: 400px;
  min-width: 300px;
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
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--bg-primary, #1a1a1a);
  }

  // Seta do tooltip quando está acima
  &.above::before {
    top: -8px;
    border-top: none;
    border-bottom: 8px solid var(--bg-primary, #1a1a1a);
  }

  .market-info-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-primary, #333333);

    h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--accent-primary, #00ff88);
    }

    .market-description {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary, #888888);
      line-height: 1.4;
    }
  }

  .market-matrix {
    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }

    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;

      th,
      td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid var(--border-primary, #333333);
      }

      th {
        background: var(--bg-overlay, #2a2a2a);
        font-weight: 600;
        color: var(--text-primary, #ffffff);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        color: var(--text-secondary, #cccccc);
        line-height: 1.3;

        &.win {
          color: var(--accent-primary, #00ff88);
          font-weight: 600;
        }

        &.lose {
          color: #ff4757;
          font-weight: 600;
        }

        &.refund {
          color: #ffa502;
          font-weight: 600;
        }
      }

      tr:hover {
        background: var(--bg-overlay, #2a2a2a);
      }
    }

    .handicap-explanation {
      margin: 0 0 12px 0;
      font-size: 11px;
      color: var(--text-secondary, #cccccc);
      line-height: 1.4;
      background: var(--bg-overlay, #2a2a2a);
      padding: 8px;
      border-radius: 4px;
      border-left: 3px solid var(--accent-primary, #00ff88);
    }

    .handicap-note {
      margin: 12px 0 0 0;
      font-size: 10px;
      color: var(--text-secondary, #888888);
      line-height: 1.3;
      font-style: italic;
      background: rgba(255, 165, 2, 0.1);
      padding: 6px 8px;
      border-radius: 4px;
      border-left: 2px solid #ffa502;
    }

    .market-note {
      margin: 12px 0 0 0;
      font-size: 10px;
      color: var(--text-secondary, #888888);
      line-height: 1.3;
      font-style: italic;
      background: rgba(0, 255, 136, 0.1);
      padding: 6px 8px;
      border-radius: 4px;
      border-left: 2px solid var(--accent-primary, #00ff88);
    }

    ul {
      margin: 8px 0;
      padding-left: 16px;

      li {
        margin: 4px 0;
        font-size: 11px;
        color: var(--text-secondary, #cccccc);
        line-height: 1.3;
      }
    }
  }
}
</style>
