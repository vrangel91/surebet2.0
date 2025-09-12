<template>
  <div class="payment-confirmation">
    <div class="confirmation-container">
      <!-- Ícone de sucesso -->
      <div class="success-icon">
        <svg width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      </div>

      <!-- Título de sucesso -->
      <h1 class="success-title">Pagamento Confirmado!</h1>
      <p class="success-subtitle">Seu plano VIP foi ativado com sucesso</p>

      <!-- Detalhes do pagamento -->
      <div class="payment-details">
        <div class="detail-card">
          <h3>Detalhes do Pagamento</h3>
          <div class="detail-row">
            <span class="label">Plano:</span>
            <span class="value">{{ paymentDetails.planName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Valor:</span>
            <span class="value">R$ {{ paymentDetails.amount.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">ID do Pagamento:</span>
            <span class="value">{{ paymentDetails.paymentId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Data:</span>
            <span class="value">{{ formatDate(paymentDetails.date) }}</span>
          </div>
        </div>

        <div class="vip-details">
          <h3>Seu Acesso VIP</h3>
          <div class="vip-info">
            <div class="vip-badge">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <span>VIP Ativo</span>
            </div>
            <p class="vip-expiry">Válido até: {{ formatDate(paymentDetails.expiresAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Benefícios do plano -->
      <div class="plan-benefits">
        <h3>Benefícios do seu plano {{ paymentDetails.planName }}</h3>
        <ul class="benefits-list">
          <li v-for="benefit in paymentDetails.benefits" :key="benefit">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            {{ benefit }}
          </li>
        </ul>
      </div>

      <!-- Ações -->
      <div class="confirmation-actions">
        <button class="primary-btn" @click="goToDashboard">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z"/>
          </svg>
          Ir para Dashboard
        </button>
        <button class="secondary-btn" @click="downloadReceipt">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          Baixar Comprovante
        </button>
      </div>

      <!-- Informações adicionais -->
      <div class="additional-info">
        <p>
          <strong>Obrigado por escolher o SureStake!</strong><br>
          Seu acesso VIP foi ativado e você já pode aproveitar todos os benefícios do seu plano.
        </p>
        <p>
          Em caso de dúvidas, entre em contato conosco através do suporte.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentConfirmation',
  data() {
    return {
      paymentDetails: {
        planName: 'VIP',
        amount: 99.90,
        paymentId: 'PAY_123456789',
        date: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        benefits: [
          'Acesso a todas as surebets',
          'Suporte VIP prioritário',
          'Alertas em tempo real',
          'Análises exclusivas',
          'Estatísticas avançadas'
        ]
      }
    }
  },
  mounted() {
    // Buscar detalhes do pagamento da URL ou do store
    this.loadPaymentDetails();
    
    // Atualizar status do usuário no store
    this.updateUserStatus();
  },
  methods: {
    loadPaymentDetails() {
      // Buscar detalhes do pagamento da query string ou do store
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id');
      const planId = urlParams.get('plan_id');
      
      if (paymentId) {
        this.paymentDetails.paymentId = paymentId;
      }
      
      if (planId) {
        this.loadPlanDetails(planId);
      }
    },
    
    async loadPlanDetails(planId) {
      try {
        const response = await this.$axios.get(`/api/payments/plans`);
        if (response.data.success) {
          const plan = response.data.plans.find(p => p.id === planId);
          if (plan) {
            this.paymentDetails.planName = plan.name;
            this.paymentDetails.amount = plan.price;
            this.paymentDetails.benefits = plan.features;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do plano:', error);
      }
    },
    
    updateUserStatus() {
      // Atualizar status do usuário no store para refletir o VIP ativo
      const user = this.$store.getters.currentUser;
      if (user) {
        this.$store.dispatch('updateUser', {
          ...user,
          is_vip: true,
          account_type: this.paymentDetails.planName.toLowerCase(),
          vip_expires_at: this.paymentDetails.expiresAt
        });
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    
    downloadReceipt() {
      // Gerar e baixar comprovante de pagamento
      const receiptData = {
        plan: this.paymentDetails.planName,
        amount: this.paymentDetails.amount,
        paymentId: this.paymentDetails.paymentId,
        date: this.paymentDetails.date,
        expiresAt: this.paymentDetails.expiresAt
      };
      
      // Criar e baixar arquivo PDF (implementação básica)
      const receiptText = `
COMPROVANTE DE PAGAMENTO - SURESTAKE
=====================================

Plano: ${receiptData.plan}
Valor: R$ ${receiptData.amount.toFixed(2)}
ID do Pagamento: ${receiptData.paymentId}
Data: ${this.formatDate(receiptData.date)}
Válido até: ${this.formatDate(receiptData.expiresAt)}

Obrigado por escolher o SureStake!
      `;
      
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprovante-surestake-${receiptData.paymentId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.payment-confirmation {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.confirmation-container {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
}

.success-icon {
  color: #00ff88;
  margin-bottom: 2rem;
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.success-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
}

.payment-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.detail-card, .vip-details {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
}

.detail-card h3, .vip-details h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-row .value {
  color: var(--text-primary);
  font-weight: 600;
}

.vip-info {
  text-align: center;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.vip-expiry {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.plan-benefits {
  margin-bottom: 3rem;
}

.plan-benefits h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.benefits-list li:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.benefits-list li svg {
  color: #00ff88;
  flex-shrink: 0;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
}

.secondary-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.secondary-btn:hover {
  background: var(--bg-quaternary);
  transform: translateY(-2px);
}

.additional-info {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
}

.additional-info p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.additional-info p:last-child {
  margin-bottom: 0;
}

.additional-info strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .confirmation-container {
    padding: 2rem;
    margin: 1rem;
  }
  
  .payment-details {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
  }
  
  .benefits-list {
    grid-template-columns: 1fr;
  }
}
</style>
