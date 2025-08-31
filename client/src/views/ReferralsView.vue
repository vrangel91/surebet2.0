<template>
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
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2z"/>
                <path d="M0 7v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7H0zm3 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9z"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">R$ {{ commissionBalance.toFixed(2).replace('.', ',') }}</div>
              <button class="withdraw-btn" @click="withdrawCommission">
                + Sacar comissão
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
              Divulgue seu link de afiliado abaixo e ganhe até 25% de indicação de qualquer plano contratado, e o melhor, você recebe na hora via PIX.
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
                  <th>VALOR DO PLANO (R$)</th>
                  <th>COMISSÃO DO PLANO (R$)</th>
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
                      <span>Compartilhe seu link de afiliado para começar a ganhar comissões!</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="user in referredUsers" :key="user.id" class="user-row">
                  <td>{{ user.name }}</td>
                  <td>R$ {{ user.planValue.toFixed(2).replace('.', ',') }}</td>
                  <td>R$ {{ user.commission.toFixed(2).replace('.', ',') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Glossary Modal -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import GlossaryModal from '../components/GlossaryModal.vue'

export default {
  name: 'ReferralsView',
  components: {
    Sidebar,
    Header,
    GlossaryModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      commissionBalance: 0.00,
      affiliateLink: 'http://surestake.net.br/registro?referer_id=dee5be63-2d5c-4ecc-851b-089e67ec692f',
      linkCopied: false,
      referredUsers: [] // Array vazio para simular estado inicial
    }
  },
  
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    }
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

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    withdrawCommission() {
      if (this.commissionBalance > 0) {
        // Simula saque de comissão
        alert(`Saque de R$ ${this.commissionBalance.toFixed(2).replace('.', ',')} solicitado!`)
        this.commissionBalance = 0
      } else {
        alert('Você não possui comissões disponíveis para saque.')
      }
    },
    
    viewHistory() {
      alert('Histórico de saques - Funcionalidade em desenvolvimento')
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
    }
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

.withdraw-btn:hover {
  background: #00cc6a;
  transform: translateY(-1px);
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
