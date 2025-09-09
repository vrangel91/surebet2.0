<template>
  <div v-if="show" class="payment-confirmation-modal-overlay" @click="handleOverlayClick">
    <div class="payment-confirmation-modal" @click.stop>
      <!-- Header com animação de sucesso -->
      <div class="modal-header">
        <div class="success-animation">
          <div class="success-circle">
            <svg class="success-checkmark" width="60" height="60" viewBox="0 0 60 60">
              <circle class="success-circle-bg" cx="30" cy="30" r="28" fill="none" stroke="#00ff88" stroke-width="4"/>
              <path class="success-checkmark-path" d="M15 30l10 10 20-20" fill="none" stroke="#00ff88" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 class="modal-title">🎉 Pagamento Confirmado!</h2>
        <p class="modal-subtitle">Seu plano foi ativado com sucesso</p>
      </div>

      <!-- Conteúdo da confirmação -->
      <div class="modal-content">
        <div class="payment-details">
          <div class="detail-item">
            <span class="detail-label">Plano:</span>
            <span class="detail-value">{{ planName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-active">✅ Ativo</span>
          </div>
          <div class="detail-item" v-if="paymentId">
            <span class="detail-label">ID do Pagamento:</span>
            <span class="detail-value">{{ paymentId }}</span>
          </div>
          <div class="detail-item" v-if="expiresAt">
            <span class="detail-label">Expira em:</span>
            <span class="detail-value">{{ formatDate(expiresAt) }}</span>
          </div>
        </div>

        <!-- Benefícios do plano -->
        <div class="plan-benefits">
          <h3>🎯 Benefícios Ativados:</h3>
          <ul class="benefits-list">
            <li v-for="benefit in planBenefits" :key="benefit" class="benefit-item">
              <span class="benefit-icon">✨</span>
              {{ benefit }}
            </li>
          </ul>
        </div>

        <!-- Ações -->
        <div class="modal-actions">
          <button @click="goToSurebets" class="btn-primary">
            🚀 Acessar Surebets
          </button>
          <button @click="goToProfile" class="btn-secondary">
            👤 Ver Perfil
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <p class="footer-text">
          Obrigado por escolher o SureStake! Seu acesso VIP está ativo e você já pode aproveitar todos os benefícios.
        </p>
        <button @click="close" class="close-btn">
          ✕ Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentConfirmationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    planName: {
      type: String,
      default: 'VIP'
    },
    paymentId: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: String,
      default: ''
    },
    planBenefits: {
      type: Array,
      default: () => [
        'Acesso a todas as surebets',
        'Alertas em tempo real',
        'Suporte prioritário',
        'Análises exclusivas'
      ]
    },
    autoClose: {
      type: Boolean,
      default: false
    },
    autoCloseDelay: {
      type: Number,
      default: 10000
    }
  },
  data() {
    return {
      autoCloseTimer: null
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.startAutoClose()
        // Adicionar classe ao body para prevenir scroll
        document.body.classList.add('modal-open')
      } else {
        this.stopAutoClose()
        document.body.classList.remove('modal-open')
      }
    }
  },
  methods: {
    startAutoClose() {
      if (this.autoClose) {
        this.autoCloseTimer = setTimeout(() => {
          this.close()
        }, this.autoCloseDelay)
      }
    },
    stopAutoClose() {
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer)
        this.autoCloseTimer = null
      }
    },
    close() {
      this.$emit('close')
    },
    handleOverlayClick() {
      // Só fechar se clicar no overlay, não no modal
      this.close()
    },
    goToSurebets() {
      this.$router.push('/')
      this.close()
    },
    goToProfile() {
      this.$router.push('/profile')
      this.close()
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  beforeUnmount() {
    this.stopAutoClose()
    document.body.classList.remove('modal-open')
  }
}
</script>

<style scoped>
.payment-confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.payment-confirmation-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  padding: 30px 30px 20px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
  border-radius: 20px 20px 0 0;
}

.success-animation {
  margin-bottom: 20px;
}

.success-circle {
  display: inline-block;
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.success-checkmark {
  animation: checkmarkDraw 1s ease-in-out;
}

@keyframes checkmarkDraw {
  0% {
    stroke-dasharray: 0 100;
  }
  100% {
    stroke-dasharray: 100 0;
  }
}

.success-circle-bg {
  stroke-dasharray: 175.9;
  stroke-dashoffset: 175.9;
  animation: circleDraw 1s ease-in-out;
}

@keyframes circleDraw {
  0% {
    stroke-dashoffset: 175.9;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.success-checkmark-path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: checkmarkPath 0.5s ease-in-out 0.5s forwards;
}

@keyframes checkmarkPath {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.modal-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 700;
}

.modal-subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.modal-content {
  padding: 30px;
}

.payment-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.plan-benefits {
  margin-bottom: 25px;
}

.plan-benefits h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #555;
}

.benefit-icon {
  margin-right: 10px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #333;
}

.modal-footer {
  padding: 20px 30px 30px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.footer-text {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.close-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

/* Responsividade */
@media (max-width: 768px) {
  .payment-confirmation-modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 15px;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    padding: 15px 20px 20px;
  }
}

/* Prevenir scroll do body quando modal está aberto */
:global(.modal-open) {
  overflow: hidden;
}
</style>

