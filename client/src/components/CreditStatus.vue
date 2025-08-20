<template>
  <div class="credit-status" :class="{ 'compact': compact }">
    <!-- Versão Compacta para Sidebar -->
    <div v-if="compact" class="credit-status-compact">
      <div class="compact-credit-info">
        <div class="account-type-display">
          <span class="account-type-text">{{ accountTypeInfo[userAccountType]?.name }}</span>
        </div>
        <div class="credits-display">
          <span class="credits-text" :class="{ 'low': userCredits <= 5 }">{{ userCredits }} créditos</span>
        </div>
      </div>
      
      <!-- Aviso de créditos baixos -->
      <div v-if="userCredits <= 5 && userCredits > 0" class="compact-warning">
        Créditos baixos
      </div>
    </div>

    <!-- Versão Completa (original) -->
    <div v-else class="credit-info">
      <div class="credit-header">
        <h3>Status da Conta</h3>
        <div class="account-type-badge" :class="userAccountType">
          {{ accountTypeInfo[userAccountType]?.name }}
        </div>
      </div>
      
      <div class="credit-details">
        <div class="credit-item">
          <div class="credit-label">
            <span class="icon">💎</span>
            Créditos Disponíveis
          </div>
          <div class="credit-value" :class="{ 'low': userCredits <= 5 }">
            {{ userCredits }}
          </div>
        </div>
        
        <div class="credit-item">
          <div class="credit-label">
            <span class="icon">📅</span>
            Último Uso
          </div>
          <div class="credit-value">
            {{ lastUsageText }}
          </div>
        </div>
        
        <div class="credit-item">
          <div class="credit-label">
            <span class="icon">⚡</span>
            Status
          </div>
          <div class="credit-value status" :class="{ 'active': canUseSystem, 'inactive': !canUseSystem }">
            {{ canUseSystem ? 'Ativo' : 'Inativo' }}
          </div>
        </div>
      </div>
      
      <!-- Aviso de créditos baixos -->
      <div v-if="userCredits <= 5 && userCredits > 0" class="credit-warning">
        <span class="warning-icon">⚠️</span>
        Créditos baixos! Compre mais créditos para continuar usando o sistema.
      </div>
      
      <!-- Sem créditos -->
      <div v-if="userCredits === 0" class="credit-error">
        <span class="error-icon">❌</span>
        Sem créditos disponíveis! Compre créditos para continuar usando o sistema.
      </div>
      
      <!-- Ações -->
      <div class="credit-actions">
        <button @click="buyCredits" class="action-btn buy-btn">
          <span class="btn-icon">💳</span>
          Comprar Créditos
        </button>
        <button @click="upgradeAccount" class="action-btn upgrade-btn">
          <span class="btn-icon">⭐</span>
          Upgrade Conta
        </button>
      </div>
    </div>
    
    <!-- Modal de Compra de Créditos -->
    <div v-if="showBuyModal" class="modal-overlay" @click="closeBuyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Comprar Créditos</h3>
          <button class="close-btn" @click="closeBuyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="credit-packages">
            <div 
              v-for="creditPackage in creditPackages" 
              :key="creditPackage.id"
              class="credit-package"
              :class="{ selected: selectedPackage === creditPackage.id }"
              @click="selectPackage(creditPackage.id)"
            >
              <div class="package-header">
                <div class="package-credits">{{ creditPackage.credits }} Créditos</div>
                <div class="package-price">{{ creditPackage.price }}</div>
              </div>
              <div class="package-description">{{ creditPackage.description }}</div>
              <div class="package-bonus" v-if="creditPackage.bonus">
                <span class="bonus-icon">🎁</span>
                {{ creditPackage.bonus }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeBuyModal" class="cancel-btn">Cancelar</button>
          <button @click="confirmPurchase" class="confirm-btn" :disabled="!selectedPackage">
            Comprar {{ selectedPackageCredits }} Créditos
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de Upgrade de Conta -->
    <div v-if="showUpgradeModal" class="modal-overlay" @click="closeUpgradeModal">
      <div class="modal-content upgrade-modal" @click.stop>
        <div class="modal-header">
          <h3>Upgrade de Conta</h3>
          <button class="close-btn" @click="closeUpgradeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="account-types">
            <div 
              v-for="(info, type) in accountTypeInfo" 
              :key="type"
              class="account-type"
              :class="{ selected: selectedAccountType === type, current: userAccountType === type }"
              @click="selectAccountType(type)"
            >
              <div class="account-type-header">
                <div class="account-type-name">{{ info.name }}</div>
                <div class="account-type-price">{{ info.price }}</div>
              </div>
              <div class="account-type-description">{{ info.description }}</div>
              <div class="account-type-features">
                <div v-for="feature in info.features" :key="feature" class="feature">
                  <span class="feature-icon">✓</span>
                  {{ feature }}
                </div>
              </div>
              <div class="account-type-credits">
                <span class="credits-icon">💰</span>
                {{ info.creditsPerDay }} créditos/dia
              </div>
              <div v-if="userAccountType === type" class="current-badge">Atual</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeUpgradeModal" class="cancel-btn">Cancelar</button>
          <button @click="confirmUpgrade" class="confirm-btn" :disabled="!selectedAccountType || selectedAccountType === userAccountType">
            {{ selectedAccountType === userAccountType ? 'Conta Atual' : `Upgrade para ${accountTypeInfo[selectedAccountType]?.name}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CreditStatus',
  props: {
    compact: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showBuyModal: false,
      showUpgradeModal: false,
      selectedPackage: null,
      selectedAccountType: null,
      creditPackages: [
        {
          id: 'basic',
          credits: 30,
          price: 'R$ 9,90',
          description: 'Pacote básico - 30 dias de uso',
          bonus: null
        },
        {
          id: 'popular',
          credits: 90,
          price: 'R$ 24,90',
          description: 'Pacote popular - 90 dias de uso',
          bonus: '10% de desconto'
        },
        {
          id: 'premium',
          credits: 365,
          price: 'R$ 89,90',
          description: 'Pacote premium - 1 ano de uso',
          bonus: '25% de desconto + 30 créditos bônus'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'userCredits',
      'userAccountType',
      'canUseSystem',
      'accountTypeInfo'
    ]),
    
    lastUsageText() {
      if (!this.$store.state.user?.lastCreditConsumption) {
        return 'Nunca usado'
      }
      
      const lastUsage = new Date(this.$store.state.user.lastCreditConsumption)
      const today = new Date()
      const diffTime = today - lastUsage
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return 'Hoje'
      } else if (diffDays === 1) {
        return 'Ontem'
      } else {
        return `${diffDays} dias atrás`
      }
    },
    
         selectedPackageCredits() {
       const creditPackage = this.creditPackages.find(p => p.id === this.selectedPackage)
       return creditPackage ? creditPackage.credits : 0
     }
  },
  methods: {
    ...mapActions([
      'addCreditsToUser',
      'upgradeAccountType'
    ]),
    
    buyCredits() {
      this.showBuyModal = true
      this.selectedPackage = null
    },
    
    closeBuyModal() {
      this.showBuyModal = false
      this.selectedPackage = null
    },
    
    selectPackage(packageId) {
      this.selectedPackage = packageId
    },
    
         confirmPurchase() {
       if (!this.selectedPackage) return
       
       const creditPackage = this.creditPackages.find(p => p.id === this.selectedPackage)
       if (!creditPackage) return
       
       // Simular compra (em produção, aqui seria integração com gateway de pagamento)
       this.addCreditsToUser({
         userId: this.$store.state.user.id,
         amount: creditPackage.credits
       })
       
       this.showNotification(`Compra realizada! ${creditPackage.credits} créditos adicionados à sua conta.`)
       this.closeBuyModal()
     },
    
    upgradeAccount() {
      this.showUpgradeModal = true
      this.selectedAccountType = null
    },
    
    closeUpgradeModal() {
      this.showUpgradeModal = false
      this.selectedAccountType = null
    },
    
    selectAccountType(accountType) {
      this.selectedAccountType = accountType
    },
    
    confirmUpgrade() {
      if (!this.selectedAccountType || this.selectedAccountType === this.userAccountType) return
      
      // Simular upgrade (em produção, aqui seria integração com gateway de pagamento)
      this.upgradeAccountType({
        userId: this.$store.state.user.id,
        accountType: this.selectedAccountType
      })
      
      this.showNotification(`Upgrade realizado! Sua conta foi atualizada para ${this.accountTypeInfo[this.selectedAccountType].name}.`)
      this.closeUpgradeModal()
    },
    
    showNotification(message) {
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
.credit-status {
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #404040;
  padding: 20px;
  margin-bottom: 20px;

  &.compact {
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    background: rgba(45, 45, 45, 0.8);
    margin-bottom: 10px;
  }
}

.credit-status-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.compact-credit-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-type-display {
  display: flex;
  align-items: center;
}

.account-type-text {
  font-size: 12px;
  color: #b0b0b0;
}

.credits-display {
  display: flex;
  align-items: center;
}

.credits-text {
  font-size: 12px;
  color: #ffffff;

  &.low {
    color: #ffc107;
  }
}

.compact-warning {
  font-size: 11px;
  color: #ffc107;
}

.credit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }
}

.account-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.basic {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.3);
  }
  
  &.premium {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }
  
  &.vip {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2));
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.3);
  }
}

.credit-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.credit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(45, 45, 45, 0.5);
  border: 1px solid #404040;
  border-radius: 8px;
}

.credit-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #b0b0b0;
  
  .icon {
    font-size: 16px;
  }
}

.credit-value {
  font-size: 16px;
  font-weight: 700;
  color: #00ff88;
  
  &.low {
    color: #ffc107;
  }
  
  &.status {
    &.active {
      color: #00ff88;
    }
    
    &.inactive {
      color: #ff6b6b;
    }
  }
}

.credit-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: #ffc107;
  font-size: 14px;
  margin-bottom: 16px;
  
  .warning-icon {
    font-size: 16px;
  }
}

.credit-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 16px;
  
  .error-icon {
    font-size: 16px;
  }
}

.credit-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  
  .btn-icon {
    font-size: 16px;
  }
  
  &.buy-btn {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #ffffff;
    
    &:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-2px);
    }
  }
  
  &.upgrade-btn {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #1a1a1a;
    
    &:hover {
      background: linear-gradient(135deg, #e0a800, #d39e00);
      transform: translateY(-2px);
    }
  }
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #404040;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  
  &.upgrade-modal {
    max-width: 800px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #404040;
  
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #404040;
  }
}

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #404040;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #404040;
  color: #ffffff;
  
  &:hover {
    background: #505050;
  }
}

.confirm-btn {
  background: #00ff88;
  color: #1a1a1a;
  
  &:hover {
    background: #00cc6a;
  }
  
  &:disabled {
    background: #404040;
    color: #808080;
    cursor: not-allowed;
  }
}

/* Pacotes de Créditos */
.credit-packages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.credit-package {
  padding: 20px;
  background: rgba(45, 45, 45, 0.5);
  border: 2px solid #404040;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #00ff88;
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }
}

.package-header {
  text-align: center;
  margin-bottom: 12px;
}

.package-credits {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.package-price {
  font-size: 18px;
  font-weight: 600;
  color: #00ff88;
}

.package-description {
  font-size: 14px;
  color: #b0b0b0;
  text-align: center;
  margin-bottom: 12px;
}

.package-bonus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #ffc107;
  font-weight: 600;
  
  .bonus-icon {
    font-size: 14px;
  }
}

/* Tipos de Conta */
.account-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.account-type {
  padding: 24px;
  background: rgba(45, 45, 45, 0.5);
  border: 2px solid #404040;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #00ff88;
    transform: translateY(-2px);
  }
  
  &.current {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }
  
  &.selected {
    border-color: #ffc107;
    background: rgba(255, 193, 7, 0.1);
  }
}

.account-type-header {
  text-align: center;
  margin-bottom: 16px;
}

.account-type-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.account-type-price {
  font-size: 18px;
  font-weight: 600;
  color: #00ff88;
}

.account-type-description {
  font-size: 14px;
  color: #b0b0b0;
  text-align: center;
  margin-bottom: 16px;
}

.account-type-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ffffff;
  background: rgba(0, 255, 136, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.account-type-credits {
  text-align: center;
  font-size: 14px;
  color: #00ff88;
  font-weight: 600;
  margin-top: 12px;
}

.credits-icon {
  font-size: 16px;
}

.current-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #00ff88;
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
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

@media (max-width: 768px) {
  .credit-details {
    grid-template-columns: 1fr;
  }
  
  .credit-actions {
    flex-direction: column;
  }
  
  .credit-packages {
    grid-template-columns: 1fr;
  }
  
  .account-types {
    grid-template-columns: 1fr;
  }
}
</style>
