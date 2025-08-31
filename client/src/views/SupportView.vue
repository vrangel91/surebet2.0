<template>
  <div class="support-container">
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
          <h2 class="page-title">Suporte</h2>
          <p class="page-subtitle">Central de ajuda e tickets de suporte</p>
        </div>
        <button class="new-ticket-btn" @click="showNewTicketModal = true">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Novo Ticket
        </button>
      </header>

      <!-- Main Content -->
      <div class="support-main">
        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon open-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
                <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ openTickets.length }}</div>
              <div class="stat-label">Tickets Abertos</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pendingTickets.length }}</div>
              <div class="stat-label">Em Andamento</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon closed-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ closedTickets.length }}</div>
              <div class="stat-label">Fechados</div>
            </div>
          </div>
        </div>

        <!-- Tickets List -->
        <div class="tickets-section">
          <div class="section-header">
            <h3 class="section-title">Meus Tickets</h3>
            <div class="filter-controls">
              <select v-model="statusFilter" class="status-filter">
                <option value="">Todos os Status</option>
                <option value="open">Abertos</option>
                <option value="pending">Em Andamento</option>
                <option value="closed">Fechados</option>
              </select>
            </div>
          </div>

          <div class="tickets-list">
            <div v-if="filteredTickets.length === 0" class="empty-tickets">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
              </svg>
              <h4>Nenhum ticket encontrado</h4>
              <p>Crie seu primeiro ticket de suporte para começar</p>
            </div>

            <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card" @click="openTicket(ticket)">
              <div class="ticket-header">
                <div class="ticket-info">
                  <h4 class="ticket-title">{{ ticket.title }}</h4>
                  <span class="ticket-id">#{{ ticket.id }}</span>
                </div>
                <div class="ticket-status" :class="ticket.status">
                  <span class="status-badge">{{ getStatusText(ticket.status) }}</span>
                </div>
              </div>
              
              <div class="ticket-content">
                <p class="ticket-description">{{ ticket.description.substring(0, 100) }}{{ ticket.description.length > 100 ? '...' : '' }}</p>
              </div>
              
              <div class="ticket-footer">
                <div class="ticket-meta">
                  <span class="ticket-category">{{ ticket.category }}</span>
                  <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
                </div>
                <div class="ticket-priority" :class="ticket.priority">
                  <span class="priority-badge">{{ getPriorityText(ticket.priority) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- New Ticket Modal -->
    <div v-if="showNewTicketModal" class="modal-overlay" @click="closeNewTicketModal">
      <div class="ticket-modal" @click.stop>
        <div class="modal-header">
          <h3>Criar Novo Ticket</h3>
          <button class="close-btn" @click="closeNewTicketModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createTicket">
            <div class="form-group">
              <label for="ticket-title">Título</label>
              <input 
                id="ticket-title"
                v-model="newTicket.title" 
                type="text" 
                class="form-input"
                placeholder="Descreva brevemente o problema"
                required
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="ticket-category">Categoria</label>
                <select id="ticket-category" v-model="newTicket.category" class="form-select" required>
                  <option value="">Selecione uma categoria</option>
                  <option value="technical">Problema Técnico</option>
                  <option value="billing">Cobrança/Pagamento</option>
                  <option value="account">Conta/Acesso</option>
                  <option value="feature">Sugestão/Melhoria</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="ticket-priority">Prioridade</label>
                <select id="ticket-priority" v-model="newTicket.priority" class="form-select" required>
                  <option value="">Selecione a prioridade</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="ticket-description">Descrição</label>
              <textarea 
                id="ticket-description"
                v-model="newTicket.description" 
                class="form-textarea"
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                rows="6"
                required
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeNewTicketModal">Cancelar</button>
              <button type="submit" class="submit-btn" :disabled="!isFormValid">
                <span v-if="isSubmitting">Criando...</span>
                <span v-else>Criar Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div v-if="showTicketDetailModal" class="modal-overlay" @click="closeTicketDetailModal">
      <div class="ticket-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Ticket #{{ selectedTicket?.id }}</h3>
          <button class="close-btn" @click="closeTicketDetailModal">×</button>
        </div>
        
        <div class="modal-body" v-if="selectedTicket">
          <div class="ticket-detail-header">
            <h4>{{ selectedTicket.title }}</h4>
            <div class="ticket-detail-meta">
              <span class="status-badge" :class="selectedTicket.status">{{ getStatusText(selectedTicket.status) }}</span>
              <span class="priority-badge" :class="selectedTicket.priority">{{ getPriorityText(selectedTicket.priority) }}</span>
            </div>
          </div>
          
          <div class="ticket-detail-content">
            <div class="ticket-info-grid">
              <div class="info-item">
                <label>Categoria:</label>
                <span>{{ selectedTicket.category }}</span>
              </div>
              <div class="info-item">
                <label>Criado em:</label>
                <span>{{ formatDate(selectedTicket.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>Última atualização:</label>
                <span>{{ formatDate(selectedTicket.updatedAt) }}</span>
              </div>
            </div>
            
            <div class="ticket-description-section">
              <h5>Descrição</h5>
              <p>{{ selectedTicket.description }}</p>
            </div>
            
            <div class="ticket-messages-section">
              <h5>Mensagens</h5>
              <div class="messages-list">
                <div v-for="message in selectedTicket.messages" :key="message.id" class="message-item" :class="message.type">
                  <div class="message-header">
                    <span class="message-author">{{ message.author }}</span>
                    <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                  </div>
                  <div class="message-content">
                    {{ message.content }}
                  </div>
                </div>
              </div>
              
              <div class="new-message-section">
                <textarea 
                  v-model="newMessage" 
                  class="message-input"
                  placeholder="Digite sua mensagem..."
                  rows="3"
                ></textarea>
                <button class="send-message-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Glossary Modal -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SupportView',
  components: {
    Sidebar,
    Header,
    GlossaryModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      showNewTicketModal: false,
      showTicketDetailModal: false,
      statusFilter: '',
      selectedTicket: null,
      newMessage: '',
      isSubmitting: false,
      
      newTicket: {
        title: '',
        category: '',
        priority: '',
        description: ''
      }
    }
  },
  
  computed: {
    ...mapGetters([
      'currentUser',
      'isAdmin',
      'userTickets',
      'openTickets',
      'pendingTickets',
      'closedTickets'
    ]),
    
    filteredTickets() {
      if (!this.statusFilter) {
        return this.userTickets
      }
      return this.userTickets.filter(ticket => ticket.status === this.statusFilter)
    },
    
    isFormValid() {
      return this.newTicket.title && 
             this.newTicket.category && 
             this.newTicket.priority && 
             this.newTicket.description
    }
  },
  
  methods: {
    ...mapActions([
      'createTicket',
      'updateTicketData',
      'addMessageToTicket'
    ]),
    
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
    
    closeNewTicketModal() {
      this.showNewTicketModal = false
      this.resetNewTicket()
    },
    
    closeTicketDetailModal() {
      this.showTicketDetailModal = false
      this.selectedTicket = null
      this.newMessage = ''
    },
    
    resetNewTicket() {
      this.newTicket = {
        title: '',
        category: '',
        priority: '',
        description: ''
      }
    },
    
    async createTicket() {
      this.isSubmitting = true
      
      try {
        await this.createTicket(this.newTicket)
        this.closeNewTicketModal()
        alert('Ticket criado com sucesso!')
      } catch (error) {
        alert('Erro ao criar ticket. Tente novamente.')
      } finally {
        this.isSubmitting = false
      }
    },
    
    openTicket(ticket) {
      this.selectedTicket = ticket
      this.showTicketDetailModal = true
    },
    
    async sendMessage() {
      if (!this.newMessage.trim()) return
      
      const message = {
        id: this.selectedTicket.messages.length + 1,
        author: this.currentUser?.email || 'Usuário',
        content: this.newMessage,
        type: 'user',
        createdAt: new Date().toISOString()
      }
      
      this.addMessageToTicket({
        ticketId: this.selectedTicket.id,
        message
      })
      
      this.newMessage = ''
      
      // Simula resposta do suporte após 2 segundos
      setTimeout(() => {
        const supportMessage = {
          id: this.selectedTicket.messages.length + 1,
          author: 'Suporte Técnico',
          content: 'Recebemos sua mensagem. Nossa equipe irá analisar e responder em breve.',
          type: 'support',
          createdAt: new Date().toISOString()
        }
        
        this.addMessageToTicket({
          ticketId: this.selectedTicket.id,
          message: supportMessage
        })
      }, 2000)
    },
    
    getStatusText(status) {
      const statusMap = {
        open: 'Aberto',
        pending: 'Em Andamento',
        closed: 'Fechado'
      }
      return statusMap[status] || status
    },
    
    getPriorityText(priority) {
      const priorityMap = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        urgent: 'Urgente'
      }
      return priorityMap[priority] || priority
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date))
    }
  }
}
</script>

<style scoped>
.support-container {
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

/* Support Main Content */
.support-main {
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

.new-ticket-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-ticket-btn:hover {
  background: #00cc6a;
  transform: translateY(-1px);
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.open-icon {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.pending-icon {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
}

.closed-icon {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: #ffffff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #888888);
}

/* Tickets Section */
.tickets-section {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.status-filter {
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

/* Tickets List */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-tickets {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #888888);
}

.empty-tickets svg {
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-tickets h4 {
  font-size: 20px;
  margin: 0 0 8px 0;
}

.empty-tickets p {
  font-size: 14px;
  margin: 0;
}

.ticket-card {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ticket-card:hover {
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateY(-1px);
}

.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ticket-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticket-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.ticket-id {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-family: monospace;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.open {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.status-badge.pending {
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
}

.status-badge.closed {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

.ticket-content {
  margin-bottom: 16px;
}

.ticket-description {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  line-height: 1.5;
  margin: 0;
}

.ticket-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ticket-category,
.ticket-date {
  font-size: 12px;
  color: var(--text-secondary, #888888);
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.low {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

.priority-badge.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.priority-badge.high {
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
}

.priority-badge.urgent {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
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

.ticket-modal,
.ticket-detail-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.ticket-detail-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary, #888888);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
}

.modal-body {
  padding: 24px;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #00cc6a;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ticket Detail Styles */
.ticket-detail-header {
  margin-bottom: 24px;
}

.ticket-detail-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0 0 12px 0;
}

.ticket-detail-meta {
  display: flex;
  gap: 12px;
}

.ticket-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-weight: 600;
}

.info-item span {
  font-size: 14px;
  color: var(--text-primary, #ffffff);
}

.ticket-description-section,
.ticket-messages-section {
  margin-bottom: 24px;
}

.ticket-description-section h5,
.ticket-messages-section h5 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 12px 0;
}

.ticket-description-section p {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  line-height: 1.6;
  margin: 0;
  padding: 16px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.message-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.message-item.user {
  background: rgba(0, 255, 136, 0.1);
  border-left-color: #00ff88;
}

.message-item.support {
  background: rgba(255, 107, 53, 0.1);
  border-left-color: #ff6b35;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.message-date {
  font-size: 12px;
  color: var(--text-secondary, #888888);
}

.message-content {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  line-height: 1.5;
}

.new-message-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.message-input:focus {
  outline: none;
  border-color: #00ff88;
}

.send-message-btn {
  align-self: flex-end;
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-message-btn:hover:not(:disabled) {
  background: #00cc6a;
}

.send-message-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsividade */
@media (max-width: 768px) {
  .support-main {
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
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .ticket-info-grid {
    grid-template-columns: 1fr;
  }
  
  .ticket-detail-meta {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .support-main {
    padding: 16px 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .ticket-card {
    padding: 16px;
  }
  
  .ticket-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .ticket-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>
