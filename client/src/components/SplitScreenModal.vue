<template>
  <div v-if="isVisible" class="split-screen-modal" @click="handleBackdropClick">
    <div class="modal-content" @click.stop>
      <!-- Header do Modal -->
      <div class="modal-header">
        <div class="header-info">
          <h3 class="modal-title">Tela Dividida - {{ surebetData?.surebet?.[0]?.match || 'Jogo' }}</h3>
          <p class="modal-subtitle">{{ surebetData?.surebet?.[0]?.sport || 'Futebol' }} - {{ surebetData?.surebet?.[0]?.tournament || 'Liga' }}</p>
        </div>
        <button class="close-btn" @click="closeModal" title="Fechar tela dividida">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Container dos Iframes -->
      <div class="iframes-container">
        <div 
          v-for="(house, index) in houseUrls" 
          :key="index" 
          class="iframe-wrapper"
          :class="{ 'error-state': house.error }"
        >
          <!-- Header do Iframe -->
          <div class="iframe-header">
            <div class="house-info">
              <span class="house-name">{{ house.house }}</span>
              <span class="house-market">{{ formatMarket(house.market) }}</span>
              <span class="house-odds">Odds: {{ house.odds }}</span>
            </div>
            <div class="iframe-controls">
              <button 
                class="control-btn refresh-btn" 
                @click="refreshIframe(index)"
                title="Recarregar página"
              >
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <button 
                class="control-btn external-btn" 
                @click="openExternal(house.url)"
                title="Abrir em nova aba"
              >
                <i class="bi bi-box-arrow-up-right"></i>
              </button>
            </div>
          </div>

          <!-- Iframe ou Estado de Erro -->
          <div class="iframe-container">
            <iframe
              v-if="house.url && !house.error"
              :ref="`iframe-${index}`"
              :src="house.url"
              :title="`${house.house} - ${house.market}`"
              class="bet-iframe"
              @load="onIframeLoad(index)"
              @error="onIframeError(index)"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
            
            <!-- Estado de Carregamento -->
            <div v-else-if="!house.error" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Carregando {{ house.house }}...</p>
            </div>
            
            <!-- Estado de Erro -->
            <div v-else class="error-state">
              <div class="error-icon">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <h4>Erro ao carregar {{ house.house }}</h4>
              <p>{{ house.errorMessage || 'Não foi possível carregar a página da casa de apostas.' }}</p>
              <div class="error-actions">
                <button class="retry-btn" @click="retryIframe(index)">
                  <i class="bi bi-arrow-clockwise"></i>
                  Tentar Novamente
                </button>
                <button class="external-btn" @click="openExternal(house.url)">
                  <i class="bi bi-box-arrow-up-right"></i>
                  Abrir Externamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer com Informações da Surebet -->
      <div class="modal-footer">
        <div class="surebet-summary">
          <div class="profit-info">
            <span class="profit-label">Lucro:</span>
            <span class="profit-value">{{ formatProfit(surebetData?.surebet?.[0]?.profit) }}%</span>
          </div>
          <div class="time-info">
            <span class="time-label">Horário:</span>
            <span class="time-value">{{ formatDateTime(surebetData?.surebet?.[0]?.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatMarketForDisplay } from '../utils/market-translations.js'

export default {
  name: 'SplitScreenModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    surebetData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      houseUrls: [],
      loadingStates: {},
      errorStates: {}
    }
  },
  watch: {
    surebetData: {
      handler(newData) {
        if (newData && newData.houseUrls) {
          this.initializeHouseUrls(newData.houseUrls)
        }
      },
      immediate: true
    },
    isVisible(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          // Foca no primeiro iframe quando o modal abre
          this.focusFirstIframe()
        })
      }
    }
  },
  mounted() {
    // Componente montado
  },
  methods: {
    initializeHouseUrls(urls) {
      this.houseUrls = urls.map(house => ({
        ...house,
        error: false,
        errorMessage: null,
        loading: true
      }))
      this.loadingStates = {}
      this.errorStates = {}
    },

    formatMarket(market) {
      if (!market) return 'Resultado Final'
      return formatMarketForDisplay(market)
    },

    formatProfit(profit) {
      if (!profit) return '0.00'
      return parseFloat(profit).toFixed(2)
    },

    formatDateTime(timestamp) {
      if (!timestamp) return 'Agora'
      const date = new Date(timestamp)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    onIframeLoad(index) {
      this.loadingStates[index] = false
      this.errorStates[index] = false
      this.houseUrls[index].loading = false
      this.houseUrls[index].error = false
    },

    onIframeError(index) {
      this.loadingStates[index] = false
      this.errorStates[index] = true
      this.houseUrls[index].loading = false
      this.houseUrls[index].error = true
      this.houseUrls[index].errorMessage = 'Erro ao carregar a página'
    },

    refreshIframe(index) {
      const iframe = this.$refs[`iframe-${index}`]?.[0]
      if (iframe) {
        this.houseUrls[index].loading = true
        this.houseUrls[index].error = false
        iframe.src = iframe.src
      }
    },

    retryIframe(index) {
      this.houseUrls[index].error = false
      this.houseUrls[index].loading = true
      this.houseUrls[index].errorMessage = null
      
      // Força recarregamento do iframe
      this.$nextTick(() => {
        const iframe = this.$refs[`iframe-${index}`]?.[0]
        if (iframe) {
          iframe.src = this.houseUrls[index].url
        }
      })
    },

    openExternal(url) {
      if (url) {
        window.open(url, '_blank')
      }
    },

    focusFirstIframe() {
      const firstIframe = this.$refs['iframe-0']?.[0]
      if (firstIframe) {
        firstIframe.focus()
      }
    },

    closeModal() {
      this.$emit('close')
    },

    handleBackdropClick(event) {
      if (event.target === event.currentTarget) {
        this.closeModal()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.split-screen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 95vw;
  height: 95vh;
  background: var(--bg-primary);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.header-info {
  flex: 1;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff4757;
    color: white;
    transform: scale(1.05);
  }
  
  i {
    font-size: 18px;
  }
}

.iframes-container {
  flex: 1;
  display: flex;
  gap: 2px;
  padding: 2px;
  overflow: hidden;
  
  // Layout responsivo
  @media (min-width: 769px) {
    flex-direction: row; // Lado a lado no desktop
  }
  
  @media (max-width: 768px) {
    flex-direction: column; // Empilhado no mobile
  }
}

.iframe-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
  
  &.error-state {
    border: 2px solid #ff4757;
  }
}

.iframe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.house-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.house-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.house-market {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-overlay);
  padding: 2px 8px;
  border-radius: 4px;
}

.house-odds {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-primary);
}

.iframe-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
    transform: scale(1.05);
  }
  
  i {
    font-size: 14px;
  }
}

.iframe-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.bet-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  
  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 48px;
  color: #ff4757;
  margin-bottom: 16px;
}

.error-state h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.error-state p {
  font-size: 14px;
  margin: 0 0 24px 0;
  max-width: 300px;
}

.error-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.retry-btn,
.external-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
  
  i {
    font-size: 12px;
  }
}

.external-btn {
  background: #3742fa;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(55, 66, 250, 0.3);
  }
}

.modal-footer {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.surebet-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.profit-info,
.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profit-label,
.time-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.profit-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
}

.time-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsividade adicional
@media (max-width: 768px) {
  .modal-content {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .house-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .surebet-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .error-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .retry-btn,
  .external-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
