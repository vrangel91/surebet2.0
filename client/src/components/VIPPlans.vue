<template>
  <div class="vip-plans">
    <div class="plans-header">
      <h2>Planos VIP</h2>
      <p>Escolha o plano ideal para você</p>
    </div>

    <div class="plans-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="plan-card"
        :class="{ 'featured': plan.id === 'vip' }"
      >
        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="currency">R$</span>
            <span class="amount">{{ plan.price.toFixed(2) }}</span>
            <span class="period">/mês</span>
          </div>
        </div>

        <div class="plan-features">
          <ul>
            <li v-for="feature in plan.features" :key="feature">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="plan-actions">
          <button 
            class="plan-button"
            :class="{ 'featured': plan.id === 'vip' }"
            @click="selectPlan(plan)"
            :disabled="loading"
          >
            {{ loading ? 'Processando...' : 'Escolher Plano' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Pagamento</h3>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="selected-plan">
            <h4>{{ selectedPlan?.name }}</h4>
            <p class="plan-price">R$ {{ selectedPlan?.price.toFixed(2) }}/mês</p>
            <p class="plan-duration">{{ selectedPlan?.days }} dias de acesso</p>
          </div>
          
          <div class="payment-methods">
            <h5>Método de Pagamento</h5>
            <div class="payment-options">
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="paymentMethod" 
                  value="credit_card"
                >
                <span>Cartão de Crédito</span>
              </label>
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="paymentMethod" 
                  value="pix"
                >
                <span>PIX</span>
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" @click="closePaymentModal">Cancelar</button>
            <button 
              class="confirm-btn" 
              @click="processPayment"
              :disabled="!paymentMethod || loading"
            >
              {{ loading ? 'Processando...' : 'Confirmar Pagamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'VIPPlans',
  data() {
    return {
      plans: [],
      loading: false,
      showPaymentModal: false,
      selectedPlan: null,
      paymentMethod: 'credit_card'
    }
  },
  async mounted() {
    await this.loadPlans()
  },
  methods: {
    async loadPlans() {
      try {
        const response = await axios.get('/api/payments/plans')
        if (response.data.success) {
          this.plans = response.data.plans
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
        this.showToast('Erro ao carregar planos', 'error')
      }
    },
    
    selectPlan(plan) {
      this.selectedPlan = plan
      this.showPaymentModal = true
    },
    
    closePaymentModal() {
      this.showPaymentModal = false
      this.selectedPlan = null
      this.paymentMethod = 'credit_card'
    },
    
    async processPayment() {
      if (!this.selectedPlan || !this.paymentMethod) return
      
      this.loading = true
      
      try {
        // Criar pedido
        const orderResponse = await axios.post('/api/payments/create-order', {
          userId: this.$store.getters.currentUser?.id,
          planId: this.selectedPlan.id,
          paymentMethod: this.paymentMethod
        })
        
        if (orderResponse.data.success) {
          // Aqui você integraria com o gateway de pagamento real
          // Por enquanto, vamos simular o pagamento
          await this.simulatePayment(orderResponse.data.order)
        }
        
      } catch (error) {
        console.error('Erro ao processar pagamento:', error)
        this.showToast('Erro ao processar pagamento', 'error')
      } finally {
        this.loading = false
      }
    },
    
    async simulatePayment(order) {
      try {
        const response = await axios.post('/api/payments/simulate-payment', {
          userId: order.userId,
          planId: order.planId,
          paymentId: order.orderId
        })
        
        if (response.data.success) {
          this.showToast('Pagamento aprovado! VIP ativado com sucesso!', 'success')
          this.closePaymentModal()
          
          // Atualizar status do usuário no store
          this.$store.dispatch('updateUser', {
            ...this.$store.getters.currentUser,
            is_vip: true,
            account_type: this.selectedPlan.id
          })
        }
        
      } catch (error) {
        console.error('Erro ao simular pagamento:', error)
        this.showToast('Erro ao processar pagamento', 'error')
      }
    },
    
    showToast(message, type = 'info') {
      // Sistema de notificação simples
      if (type === 'error') {
        alert(`❌ ${message}`)
      } else if (type === 'success') {
        alert(`✅ ${message}`)
      } else {
        alert(`ℹ️ ${message}`)
      }
    }
  }
}
</script>

<style scoped>
.vip-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.plans-header {
  text-align: center;
  margin-bottom: 3rem;
}

.plans-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.plans-header p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.plan-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.plan-card.featured {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.plan-card.featured::before {
  content: 'Mais Popular';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #00ff88;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.plan-price {
  margin-bottom: 2rem;
}

.plan-price .currency {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.plan-price .amount {
  font-size: 3rem;
  font-weight: 700;
  color: #00ff88;
}

.plan-price .period {
  font-size: 1rem;
  color: var(--text-secondary);
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--text-secondary);
}

.plan-features li svg {
  color: #00ff88;
  flex-shrink: 0;
}

.plan-button {
  width: 100%;
  padding: 1rem 2rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-button:hover:not(:disabled) {
  background: var(--bg-quaternary);
  transform: translateY(-2px);
}

.plan-button.featured {
  background: #00ff88;
  color: #1a1a1a;
  border-color: #00ff88;
}

.plan-button.featured:hover:not(:disabled) {
  background: #00cc6a;
}

.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.payment-modal {
  background: var(--bg-secondary);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.selected-plan {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.selected-plan h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.selected-plan .plan-price {
  font-size: 2rem;
  font-weight: 700;
  color: #00ff88;
  margin: 0 0 0.5rem 0;
}

.selected-plan .plan-duration {
  color: var(--text-secondary);
  margin: 0;
}

.payment-methods h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  background: var(--bg-tertiary);
}

.payment-option input[type="radio"] {
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.cancel-btn:hover {
  background: var(--bg-quaternary);
}

.confirm-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
}

.confirm-btn:hover:not(:disabled) {
  background: #00cc6a;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .vip-plans {
    padding: 1rem;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .plan-card {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .confirm-btn {
    width: 100%;
  }
}
</style>
