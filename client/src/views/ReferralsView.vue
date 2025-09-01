<template>
  <RouteGuard :requiresAuth="true">
    <div class="referrals-container">
      <!-- Sidebar Reutilizável -->
      <Sidebar 
        :sidebarCollapsed="sidebarCollapsed"
        @toggle-sidebar="handleSidebarToggle"
        @sidebar-state-loaded="handleSidebarStateLoaded"
        @open-glossary="openGlossary"
      />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />
      
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Minhas indicações</h2>
          <p class="page-subtitle">Gerencie suas indicações e comissões</p>
        </div>
      </header>

      <!-- Main Content -->
      <div class="referrals-main">
        <!-- Information Cards -->
        <div class="info-cards">
                     <!-- Comissões Card -->
           <div class="info-card">
             <div class="card-icon commission-icon">
               <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                 <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2z"/>
                 <path d="M0 7v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7H0zm3 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9z"/>
               </svg>
             </div>
             <div class="card-content">
               <div class="card-value">R$ {{ formattedCommissionBalance }}</div>
               <div class="card-subtitle">
                 {{ referredUsers.length }} usuário{{ referredUsers.length !== 1 ? 's' : '' }} indicado{{ referredUsers.length !== 1 ? 's' : '' }}
               </div>
                              <button 
                  class="withdraw-btn" 
                  :class="{ 'disabled': commissionBalance < 100 }"
                  @click="withdrawCommission"
                  :disabled="commissionBalance < 100"
                >
                  {{ commissionBalance >= 100 ? '+ Sacar comissão' : 'Mínimo R$ 100,00' }}
                </button>
             </div>
           </div>

          <!-- Histórico Card -->
          <div class="info-card">
            <div class="card-icon history-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">Visualizar</div>
              <button class="view-btn" @click="viewHistory">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Refer and Earn Section -->
        <div class="refer-earn-section">
          <div class="refer-content">
            <h3 class="refer-title">Indique e ganhe!</h3>
                         <p class="refer-description">
               Divulgue seu link de afiliado abaixo e ganhe R$ 19,90 por cada usuário indicado que contratar um plano mensal ou anual. Usuários aparecem na lista assim que se cadastram, mas a comissão só é liberada após a contratação do plano. Saque disponível a partir de R$ 100,00 acumulados.
             </p>
            
            <div class="affiliate-link-section">
              <input 
                ref="affiliateLinkInput"
                type="text" 
                :value="affiliateLink" 
                readonly 
                class="affiliate-link-input"
              >
              <button class="copy-link-btn" @click="copyAffiliateLink">
                <svg v-if="!linkCopied" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                <span v-if="linkCopied">✓</span>
                {{ linkCopied ? 'Copiado' : 'Copiar' }}
              </button>
            </div>
          </div>
          
          <div class="rocket-illustration">
            <img 
              src="../assets/img/welcome-banner.gif" 
              alt="Welcome Banner" 
              class="welcome-banner-img"
            >
          </div>
        </div>

        <!-- Referred Users Table -->
        <div class="referred-users-section">
          <h3 class="section-title">Usuários Indicados</h3>
          
          <div class="table-container">
            <table class="referrals-table">
              <thead>
                                 <tr>
                   <th>NOME DO INDICADO</th>
                   <th>PLANO CONTRATADO</th>
                   <th>COMISSÃO (R$)</th>
                 </tr>
              </thead>
              <tbody>
                <tr v-if="referredUsers.length === 0" class="empty-row">
                  <td colspan="3">
                    <div class="empty-state">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
                      </svg>
                                           <p>Nenhum usuário indicado ainda</p>
                     <span>Compartilhe seu link de afiliado! Usuários cadastrados aparecerão aqui e você ganhará R$ 19,90 quando eles contratarem planos mensais ou anuais.</span>
                    </div>
                  </td>
                </tr>
                                 <tr v-for="user in referredUsers" :key="user.id" class="user-row" :class="getUserRowClass(user.status)">
                   <td>
                     <div class="user-info">
                       <span class="user-name">{{ user.name }}</span>
                       <span v-if="user.status === 'pending'" class="status-badge status-pending">Aguardando plano</span>
                       <span v-else-if="user.status === 'active'" class="status-badge status-active">Plano ativo</span>
                       <span v-else class="status-badge status-no-plan">Sem plano</span>
                     </div>
                   </td>
                   <td>
                     <span v-if="user.planInfo" class="plan-info">
                       {{ user.planInfo.name }} ({{ user.planInfo.days }} dias)
                     </span>
                     <span v-else class="no-plan">Aguardando contratação</span>
                   </td>
                   <td>
                     <span v-if="user.commission > 0" class="commission-amount">
                       R$ {{ formatCurrency(user.commission) }}
                     </span>
                     <span v-else class="commission-pending">
                       R$ 19,90 <small>(quando ativar plano)</small>
                     </span>
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Glossary Modal -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal-content history-modal" @click.stop>
        <div class="modal-header">
          <h3>Histórico de Saques</h3>
          <button class="close-btn" @click="closeHistoryModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="withdrawalHistory.length === 0" class="empty-history">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
            </svg>
            <p>Nenhum saque realizado ainda</p>
            <span>Seus saques aparecerão aqui quando você fizer solicitações</span>
          </div>
          
          <div v-else class="history-table-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="withdrawal in withdrawalHistory" :key="withdrawal.id" class="history-row">
                  <td>{{ formatDate(withdrawal.date) }}</td>
                  <td class="amount-cell">R$ {{ formatCurrency(withdrawal.amount) }}</td>
                  <td>
                    <span :class="['status-badge', `status-${withdrawal.status}`]">
                      {{ getStatusText(withdrawal.status) }}
                    </span>
                  </td>
                  <td>{{ withdrawal.method }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeHistoryModal">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="showToast" class="toast-container" :class="toastType">
      <div class="toast-content">
        <div class="toast-icon">
          <svg v-if="toastType === 'success'" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <svg v-else-if="toastType === 'error'" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
          <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
        </div>
        <div class="toast-message">{{ toastMessage }}</div>
        <button class="toast-close" @click="hideToast">×</button>
      </div>
    </div>
    </div>
  </RouteGuard>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
import RouteGuard from '../components/RouteGuard.vue'

export default {
  name: 'ReferralsView',
  components: {
    Sidebar,
    Header,
    GlossaryModal,
    RouteGuard
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      showHistoryModal: false,
      showToast: false,
      toastMessage: '',
      toastType: 'info',
      commissionBalance: 0,
      affiliateLink: 'http://localhost:3001/login?referer_id=SEU_CODIGO_AQUI',
      linkCopied: false,
      referredUsers: [], // Array vazio para simular estado inicial
      withdrawalHistory: [] // Array para histórico de saques
    }
  },
  
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    formattedCommissionBalance() {
      const balance = parseFloat(this.commissionBalance) || 0
      return balance.toFixed(2).replace('.', ',')
    }
  },
  
  mounted() {
    // Buscar dados de referências da API
    this.fetchReferralData()
  },
  
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },

    closeGlossary() {
      this.showGlossaryModal = false
    },

    async fetchReferralData() {
      try {
        const response = await fetch('/api/referrals/my-status', {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.authToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.referralData) {
            this.affiliateLink = data.referralData.affiliateLink
            this.commissionBalance = parseFloat(data.referralData.commissionBalance) || 0
            this.referredUsers = data.referralData.referredUsers || []
          }
        } else {
          console.error('Erro ao buscar dados de referências:', response.status)
        }
      } catch (error) {
        console.error('Erro ao buscar dados de referências:', error)
      }
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    withdrawCommission() {
      const balance = parseFloat(this.commissionBalance) || 0
      if (balance >= 100) {
        // Simula saque de comissão (mínimo R$ 100,00)
        this.showToastNotification(`Saque de R$ ${balance.toFixed(2).replace('.', ',')} solicitado!`, 'success')
        this.commissionBalance = 0
      } else if (balance > 0) {
        this.showToastNotification(`Valor mínimo para saque é R$ 100,00. Você possui R$ ${balance.toFixed(2).replace('.', ',')}`, 'error')
      } else {
        this.showToastNotification('Você não possui comissões disponíveis para saque.', 'error')
      }
    },
    
    viewHistory() {
      this.showHistoryModal = true
    },
    
    async copyAffiliateLink() {
      try {
        await navigator.clipboard.writeText(this.affiliateLink)
        this.linkCopied = true
        setTimeout(() => {
          this.linkCopied = false
        }, 2000)
      } catch (err) {
        // Fallback para browsers que não suportam clipboard API
        this.$refs.affiliateLinkInput.select()
        document.execCommand('copy')
        this.linkCopied = true
        setTimeout(() => {
          this.linkCopied = false
        }, 2000)
      }
    },

    showToastNotification(message, type = 'info') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => {
        this.hideToast();
      }, 3000); // 3 segundos de duração
    },

    hideToast() {
      this.showToast = false;
      this.toastMessage = '';
      this.toastType = 'info';
    },

    openHistoryModal() {
      this.showHistoryModal = true;
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
    },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    formatCurrency(value) {
      const numValue = parseFloat(value) || 0;
      return numValue.toFixed(2).replace('.', ',');
    },

         getStatusText(status) {
       switch (status) {
         case 'pending':
           return 'Pendente';
         case 'completed':
           return 'Completado';
         case 'failed':
           return 'Falhou';
         default:
           return 'Desconhecido';
       }
     },

     getUserRowClass(status) {
       switch (status) {
         case 'active':
           return 'user-row-active';
         case 'pending':
           return 'user-row-pending';
         case 'no-plan':
           return 'user-row-no-plan';
         default:
           return '';
       }
     },
  }
}
</script>

<style scoped>
.referrals-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Referrals Main Content */
.referrals-main {
  flex: 1;
  padding: 32px 24px;
  width: 100%;
  overflow-y: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #00ff88;
  margin: 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

/* Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Commission and Plan Status Styles */
.commission-amount {
  color: #00ff88;
  font-weight: 600;
}

.commission-pending {
  color: #ffd700;
  font-weight: 500;
}

.commission-pending small {
  font-size: 12px;
  opacity: 0.7;
  font-weight: normal;
}

.no-plan {
  color: #ff6b35;
  font-style: italic;
}

.plan-info {
  color: #00ff88;
  font-weight: 500;
}

/* User Row Status Styles */
.user-row-active {
  background: rgba(0, 255, 136, 0.05);
  border-left: 4px solid #00ff88;
}

.user-row-pending {
  background: rgba(255, 215, 0, 0.05);
  border-left: 4px solid #ffd700;
}

.user-row-no-plan {
  background: rgba(255, 107, 53, 0.05);
  border-left: 4px solid #ff6b35;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background-color: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.status-pending {
  background-color: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.status-no-plan {
  background-color: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
}

.info-card {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 255, 136, 0.3);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.commission-icon {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.history-icon {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.card-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  opacity: 0.8;
}

.withdraw-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

 .withdraw-btn:hover:not(.disabled) {
   background: #00cc6a;
   transform: translateY(-1px);
 }

 .withdraw-btn.disabled {
   background: #666666;
   color: #999999;
   cursor: not-allowed;
   opacity: 0.6;
 }

 .withdraw-btn.disabled:hover {
   background: #666666;
   transform: none;
 }

.view-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Refer and Earn Section */
.refer-earn-section {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.refer-earn-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.refer-earn-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 255, 136, 0.3);
}

.refer-content {
  flex: 1;
  color: var(--text-primary, #ffffff);
  position: relative;
  z-index: 1;
}

.refer-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--text-primary, #ffffff);
}

.refer-description {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 24px 0;
  color: var(--text-secondary, #cccccc);
  opacity: 0.9;
}

.affiliate-link-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.affiliate-link-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-primary, #1a1a1a);
  border: 2px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  font-family: monospace;
  transition: all 0.2s ease;
}

.affiliate-link-input:focus {
  outline: none;
  border-color: #00ff88;
  background: var(--bg-secondary, #2a2a2a);
}

.copy-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-primary, #1a1a1a);
  color: #00ff88;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.copy-link-btn:hover {
  background: var(--bg-secondary, #2a2a2a);
  transform: translateY(-1px);
  border-color: rgba(0, 255, 136, 0.3);
}

.rocket-illustration {
  flex-shrink: 0;
  animation: rocketFloat 3s ease-in-out infinite;
}

.welcome-banner-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes rocketFloat {
  0%, 100% {
    transform: translateY(0px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
}

/* Referred Users Section */
.referred-users-section {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0 0 24px 0;
}

.table-container {
  overflow-x: auto;
}

.referrals-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
  overflow: hidden;
}

.referrals-table th {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.referrals-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #ffffff);
}

.referrals-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.empty-row td {
  text-align: center;
  padding: 48px 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary, #888888);
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.empty-state span {
  font-size: 14px;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
}

/* History Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.history-modal {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.modal-header h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #00ff88;
}

.modal-body {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary, #888888);
}

.empty-history svg {
  opacity: 0.5;
}

.empty-history p {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.empty-history span {
  font-size: 16px;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
}

.history-table-container {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
  overflow: hidden;
}

.history-table th {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.history-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #ffffff);
}

.history-table tr:last-child td {
  border-bottom: none;
}

.history-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.amount-cell {
  font-weight: 700;
  color: #00ff88;
}

.status-badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.status-pending {
  background-color: rgba(255, 215, 0, 0.1);
  color: #ffd700;
}

.status-completed {
  background-color: rgba(0, 255, 136, 0.1);
  color: #00ff88;
}

.status-failed {
  background-color: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.btn-primary:hover {
  background: #00cc6a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: toastSlideIn 0.3s ease-out;
}

.toast-content {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 400px;
}

.toast-container.success .toast-content {
  border-left: 4px solid #00ff88;
}

.toast-container.error .toast-content {
  border-left: 4px solid #ff6b35;
}

.toast-container.info .toast-content {
  border-left: 4px solid #007bff;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #00ff88;
}

.toast-container.error .toast-icon {
  color: #ff6b35;
}

.toast-container.info .toast-icon {
  color: #007bff;
}

.toast-message {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary, #ffffff);
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #00ff88;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .referrals-main {
    padding: 24px 16px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .info-card {
    padding: 20px;
  }
  
  .refer-earn-section {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .refer-title {
    font-size: 24px;
  }
  
  .refer-description {
    font-size: 14px;
  }
  
  .affiliate-link-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .rocket-illustration {
    order: -1;
  }
  
      .welcome-banner-img {
      width: 80px;
      height: 80px;
    }

    .history-modal {
      width: 95%;
      max-width: 95%;
    }

    .modal-header {
      padding: 16px 20px;
    }

    .modal-header h3 {
      font-size: 24px;
    }

    .close-btn {
      font-size: 24px;
    }

    .modal-body {
      padding: 16px 20px;
    }

    .empty-history {
      padding: 32px 16px;
    }

    .history-table-container {
      overflow-x: auto;
    }

    .history-table th,
    .history-table td {
      padding: 12px 8px;
      font-size: 14px;
    }

    .modal-footer {
      padding: 16px 20px;
    }

    .btn-primary {
      padding: 12px 24px;
      font-size: 14px;
    }

    .toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
      width: auto;
    }

    .toast-content {
      min-width: auto;
      max-width: none;
    }
  }

@media (max-width: 480px) {
  .referrals-main {
    padding: 16px 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .info-card {
    padding: 16px;
    gap: 16px;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .card-value {
    font-size: 20px;
  }
  
  .refer-earn-section {
    padding: 20px;
  }
  
  .refer-title {
    font-size: 20px;
  }
  
  .referrals-table th,
  .referrals-table td {
    padding: 12px 8px;
    font-size: 14px;
  }
}
</style>
