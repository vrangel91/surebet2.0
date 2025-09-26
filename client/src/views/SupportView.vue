<template>
  <div class="support-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

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
            <path
              d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
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
                <path
                  d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
                <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ticketsStats.open }}</div>
              <div class="stat-label">Tickets Abertos</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ticketsStats.in_progress }}</div>
              <div class="stat-label">Em Andamento</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon closed-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ticketsStats.closed }}</div>
              <div class="stat-label">Fechados</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon time-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ticketsStats.avgResponseTime }}</div>
              <div class="stat-label">Tempo Médio Resposta</div>
            </div>
          </div>

          <!-- QR Code do Telegram -->
          <div class="stat-card telegram-qr-card">
            <div class="telegram-qr">
              <img src="@/assets/qrocodetelegram.png" alt="QR Code Telegram" class="qr-image"
                title="Entre no nosso grupo do Telegram" />
              <div class="qr-content">
                <div class="qr-text">Telegram</div>
                <div class="qr-subtitle">Suporte Rápido</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tickets List -->
        <div class="tickets-section">
          <div class="section-header">
            <h3 class="section-title">Meus Tickets</h3>
            <div class="filter-controls">
              <input v-model="searchQuery" type="text" placeholder="Buscar por ID ou título..." class="search-input">
              <select v-model="statusFilter" class="status-filter">
                <option value="">Todos os Status</option>
                <option value="open">Abertos</option>
                <option value="pending">Em Andamento</option>
                <option value="closed">Fechados</option>
              </select>
              <select v-model="priorityFilter" class="priority-filter">
                <option value="">Todas as Prioridades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
              <select v-model="categoryFilter" class="category-filter">
                <option value="">Todas as Categorias</option>
                <option value="financial">Financeiro</option>
                <option value="technical">Técnico</option>
                <option value="support">Suporte</option>
                <option value="billing">Cobrança</option>
                <option value="feature">Sugestão</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <div class="tickets-list">
            <div v-if="filteredTickets.length === 0" class="empty-tickets">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
              </svg>
              <h4>Nenhum ticket encontrado</h4>
              <p>Crie seu primeiro ticket de suporte para começar</p>
            </div>

            <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card" @click="openTicket(ticket)">
              <div class="ticket-header">
                <div class="ticket-info">
                  <h4 class="ticket-title">{{ ticket.subject }}</h4>
                  <span class="ticket-id">#{{ ticket.id }}</span>
                </div>
                <div class="ticket-status" :class="ticket.status">
                  <span class="status-badge">{{ getStatusText(ticket.status) }}</span>
                </div>
              </div>

              <div class="ticket-content">
                <p class="ticket-description">{{ ticket.messages && ticket.messages[0] ?
                  ticket.messages[0].content.substring(0, 100) + (ticket.messages[0].content.length > 100 ? '...' : '')
                  : 'Sem descrição' }}</p>
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
          <form @submit.prevent="createNewTicket">
            <div class="form-group">
              <label for="ticket-title">Assunto</label>
              <input id="ticket-title" v-model="newTicket.subject" type="text" class="form-input"
                placeholder="Descreva brevemente o problema" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="ticket-category">Categoria</label>
                <select id="ticket-category" v-model="newTicket.category" class="form-select" required>
                  <option value="">Selecione uma categoria</option>
                  <option value="financial">Financeiro</option>
                  <option value="technical">Técnico</option>
                  <option value="support">Suporte</option>
                  <option value="billing">Cobrança/Pagamento</option>
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
              <label for="ticket-description">Mensagem</label>
              <textarea id="ticket-description" v-model="newTicket.message" class="form-textarea"
                placeholder="Descreva detalhadamente o problema ou solicitação..." rows="6" required></textarea>
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
            <h4>{{ selectedTicket.subject }}</h4>
            <div class="ticket-detail-meta">
              <span class="status-badge" :class="selectedTicket.status">{{ getStatusText(selectedTicket.status)
              }}</span>
              <span class="priority-badge" :class="selectedTicket.priority">{{ getPriorityText(selectedTicket.priority)
              }}</span>
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
              <p>{{ selectedTicket.messages && selectedTicket.messages[0] ? selectedTicket.messages[0].content : 'Sem
                descrição' }}</p>
            </div>

            <div class="ticket-messages-section">
              <h5>Mensagens</h5>
              <div class="messages-list">
                <div v-for="message in selectedTicket.messages" :key="message.id" class="message-item"
                  :class="message.type">
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
                <div v-if="selectedTicket.status === 'closed'" class="ticket-closed-notice">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                  <span>Este ticket está fechado. Não é possível enviar novas mensagens.</span>
                </div>
                <template v-else>
                  <textarea v-model="newMessage" class="message-input" placeholder="Digite sua mensagem..."
                    rows="3"></textarea>
                  <button class="send-message-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                    Enviar Mensagem
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Glossary Modal -->

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script>
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'
import ToastContainer from '../components/UI/ToastContainer.vue'

import { mapGetters, mapActions } from 'vuex'
import { useToast } from '@/composables/useToast'

export default {
  name: 'SupportView',
  components: {
    Sidebar,
    Header,
    ToastContainer
  },
  data() {
    return {
      sidebarCollapsed: false,

      showNewTicketModal: false,
      showTicketDetailModal: false,
      statusFilter: '',
      priorityFilter: '',
      categoryFilter: '',
      searchQuery: '',
      selectedTicket: null,
      newMessage: '',
      isSubmitting: false,

      newTicket: {
        title: '',
        category: '',
        priority: '',
        description: ''
      },

      // Dados mockados para demonstração
      tickets: [
        {
          id: 1,
          title: 'Problema com login',
          description: 'Não consigo fazer login na minha conta',
          category: 'technical',
          priority: 'high',
          status: 'open',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          userId: 1,
          userName: 'João Silva',
          messages: [
            {
              id: 1,
              author: 'João Silva',
              content: 'Não consigo fazer login na minha conta',
              type: 'user',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        },
        {
          id: 2,
          title: 'Dúvida sobre pagamento',
          description: 'Como funciona o sistema de pagamento?',
          category: 'financial',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          userId: 2,
          userName: 'Maria Santos',
          messages: [
            {
              id: 1,
              author: 'Maria Santos',
              content: 'Como funciona o sistema de pagamento?',
              type: 'user',
              createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
              id: 2,
              author: 'Suporte Técnico',
              content: 'Olá! Nossos pagamentos são processados via PIX e cartão de crédito. Posso te ajudar com algo específico?',
              type: 'support',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        },
        {
          id: 3,
          title: 'Problema com notificações',
          description: 'Não estou recebendo notificações de surebets',
          category: 'technical',
          priority: 'low',
          status: 'closed',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          userId: 3,
          userName: 'Carlos Oliveira',
          messages: [
            {
              id: 1,
              author: 'Carlos Oliveira',
              content: 'Não estou recebendo notificações de surebets no meu celular',
              type: 'user',
              createdAt: new Date(Date.now() - 259200000).toISOString()
            },
            {
              id: 2,
              author: 'Suporte Técnico',
              content: 'Olá Carlos! Verifiquei sua conta e as notificações estão ativas. Pode verificar se o app tem permissão para notificações nas configurações do seu dispositivo?',
              type: 'support',
              createdAt: new Date(Date.now() - 216000000).toISOString()
            },
            {
              id: 3,
              author: 'Carlos Oliveira',
              content: 'Perfeito! Era isso mesmo. Obrigado pela ajuda!',
              type: 'user',
              createdAt: new Date(Date.now() - 172800000).toISOString()
            }
          ]
        }
      ]
    }
  },

  computed: {
    ...mapGetters([
      'currentUser',
      'isAdmin'
    ]),

    ticketsStats() {
      const open = this.tickets.filter(t => t.status === 'open').length
      const pending = this.tickets.filter(t => t.status === 'pending').length
      const closed = this.tickets.filter(t => t.status === 'closed').length

      // Calcular tempo médio de resposta (mockado - será implementado com API real)
      const avgResponseTime = '2h 30m'

      return { open, pending, closed, avgResponseTime }
    },

    filteredTickets() {
      let filtered = this.tickets

      // Filtro por status
      if (this.statusFilter) {
        filtered = filtered.filter(ticket => ticket.status === this.statusFilter)
      }

      // Filtro por prioridade
      if (this.priorityFilter) {
        filtered = filtered.filter(ticket => ticket.priority === this.priorityFilter)
      }

      // Filtro por categoria
      if (this.categoryFilter) {
        filtered = filtered.filter(ticket => ticket.category === this.categoryFilter)
      }

      // Filtro por busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(ticket =>
          ticket.id.toString().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.userName.toLowerCase().includes(query)
        )
      }

      return filtered
    },

    isFormValid() {
      return this.newTicket.subject &&
        this.newTicket.category &&
        this.newTicket.priority &&
        this.newTicket.message
    }
  },

  async mounted() {
    // Carregar tickets do usuário
    await this.loadUserTickets()
  },

  methods: {
    ...mapActions([
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
        subject: '',
        category: '',
        priority: '',
        message: ''
      }
    },

    async createNewTicket() {
      this.isSubmitting = true

      try {
        // Chamar API para criar ticket
        const response = await this.$store.dispatch('createTicket', {
          subject: this.newTicket.subject,
          message: this.newTicket.message,
          category: this.newTicket.category,
          priority: this.newTicket.priority
        })

        // Adicionar ticket à lista
        this.tickets.unshift(response)

        // Fechar modal
        this.closeNewTicketModal()

        // Mostrar notificação
        this.showToastNotification('Ticket criado com sucesso!', 'success')

      } catch (error) {
        console.error('Erro ao criar ticket:', error)
        this.showToastNotification('Erro ao criar ticket. Tente novamente.', 'error')
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

      // Verificar se o ticket está fechado
      if (this.selectedTicket.status === 'closed') {
        this.showToastNotification('Não é possível enviar mensagens em tickets fechados.', 'error')
        return
      }

      try {
        // Chamar API para adicionar mensagem
        const response = await this.$store.dispatch('addMessageToTicket', {
          ticketId: this.selectedTicket.id,
          message: this.newMessage
        })

        // Adicionar mensagem ao ticket
        this.selectedTicket.messages.push(response)
        this.selectedTicket.updatedAt = new Date().toISOString()

        // Atualizar status para "Em andamento" se ainda estiver aberto
        if (this.selectedTicket.status === 'open') {
          this.selectedTicket.status = 'in_progress'
        }

        this.newMessage = ''

      } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        this.showToastNotification('Erro ao enviar mensagem. Tente novamente.', 'error')
      }
    },

    getStatusText(status) {
      const statusMap = {
        open: 'Aberto',
        in_progress: 'Em Andamento',
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
    },

    showToastNotification(message, type = 'info') {
      const { success, error, warning, info } = useToast()

      if (type === 'success') {
        success('Sucesso!', message)
      } else if (type === 'error') {
        error('Erro!', message)
      } else if (type === 'warning') {
        warning('Atenção!', message)
      } else {
        info('Informação', message)
      }
    },

    // Carregar tickets do usuário da API
    async loadUserTickets() {
      try {
        const response = await fetch('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tickets) {
            this.tickets = data.tickets
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tickets:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* Importação removida para evitar conflitos de build */

.support-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px);
  /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px;
  /* Espaço para o sidebar fixo */
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px);
    /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }

  /* Melhorias para responsividade */
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 100%;
    margin-left: 0;

    &.sidebar-collapsed {
      width: 100%;
      max-width: 100%;
      margin-left: 0;
    }
  }
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  /* Scroll suave no iOS */

  /* Melhorias para responsividade */
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
    overflow-x: hidden;
  }
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
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.new-ticket-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-ticket-btn:hover {
  background: var(--accent-secondary);
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
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
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
}

.pending-icon {
  background: linear-gradient(135deg, var(--warning), var(--warning-hover));
  color: var(--bg-primary);
}

.closed-icon {
  background: linear-gradient(135deg, var(--text-secondary), var(--text-tertiary));
  color: var(--bg-primary);
}

.time-icon {
  background: linear-gradient(135deg, var(--info), var(--info-hover));
  color: var(--bg-primary);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* QR Code do Telegram */
.telegram-qr-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;
}

.telegram-qr-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.1), rgba(var(--accent-primary-rgb), 0.05));
  pointer-events: none;
}

.telegram-qr {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.qr-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--bg-primary);
  padding: 8px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-primary);
}

.telegram-qr-card:hover .qr-image {
  transform: scale(1.05);
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

.qr-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qr-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.qr-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}

/* Tickets Section */
.tickets-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
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
  color: var(--text-primary);
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input,
.status-filter,
.priority-filter,
.category-filter {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-input {
  min-width: 200px;
  cursor: text;
}

.search-input:focus,
.status-filter:focus,
.priority-filter:focus,
.category-filter:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-secondary);
}

/* Melhorar visibilidade dos options nos selects */
.status-filter option,
.priority-filter option,
.category-filter option {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
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
  color: var(--text-secondary);
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
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ticket-card:hover {
  border-color: rgba(var(--accent-primary-rgb), 0.3);
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
  color: var(--text-primary);
  margin: 0;
}

.ticket-id {
  font-size: 12px;
  color: var(--text-secondary);
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
  background: rgba(var(--accent-primary-rgb), 0.2);
  color: var(--accent-primary);
}

.status-badge.pending {
  background: rgba(var(--warning-rgb), 0.2);
  color: var(--warning);
}

.status-badge.closed {
  background: rgba(var(--text-secondary-rgb), 0.2);
  color: var(--text-secondary);
}

.ticket-content {
  margin-bottom: 16px;
}

.ticket-description {
  font-size: 14px;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.low {
  background: rgba(var(--text-secondary-rgb), 0.2);
  color: var(--text-secondary);
}

.priority-badge.medium {
  background: rgba(var(--warning-rgb), 0.2);
  color: var(--warning);
}

.priority-badge.high {
  background: rgba(var(--error-rgb), 0.2);
  color: var(--error);
}

.priority-badge.urgent {
  background: rgba(var(--error-rgb), 0.3);
  color: var(--error);
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
  z-index: 9999;
  padding: 20px;
}



.ticket-modal,
.ticket-detail-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
}

.ticket-detail-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
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
  background: var(--bg-primary);
  color: var(--text-primary);
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
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-secondary);
}

/* Melhorar visibilidade dos options nos selects do formulário */
.form-select option {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
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
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--bg-secondary);
}

.submit-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
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
  color: var(--text-primary);
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
  background: var(--bg-primary);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.info-item span {
  font-size: 14px;
  color: var(--text-primary);
}

.ticket-description-section,
.ticket-messages-section {
  margin-bottom: 24px;
}

.ticket-description-section h5,
.ticket-messages-section h5 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.ticket-description-section p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  padding: 16px;
  background: var(--bg-primary);
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
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-left-color: var(--accent-primary);
}

.message-item.support {
  background: rgba(var(--warning-rgb), 0.1);
  border-left-color: var(--warning);
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
  color: var(--text-primary);
}

.message-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.message-content {
  font-size: 14px;
  color: var(--text-secondary);
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
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.message-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.send-message-btn {
  align-self: flex-end;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-message-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
}

.send-message-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ticket Closed Notice */
.ticket-closed-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--text-secondary-rgb), 0.1);
  border: 1px solid rgba(var(--text-secondary-rgb), 0.3);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.ticket-closed-notice svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

/* Media queries para telas muito grandes */
@media (min-width: 1400px) {
  .support-container {
    width: calc(100% - 280px);
    max-width: calc(100% - 280px);
  }

  .content-header {
    padding: 32px 40px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 18px;
  }

  .support-main {
    padding: 40px 32px;
  }

  .stats-cards {
    gap: 32px;
    margin-bottom: 40px;
  }

  .stat-card {
    padding: 32px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-value {
    font-size: 36px;
  }

  .stat-label {
    font-size: 16px;
  }

  .tickets-section {
    padding: 32px;
  }

  .section-title {
    font-size: 28px;
  }

  .qr-image {
    width: 70px;
    height: 70px;
  }

  .qr-text {
    font-size: 20px;
  }

  .qr-subtitle {
    font-size: 14px;
  }
}

/* Media queries para telas médias */
@media (min-width: 1200px) and (max-width: 1399px) {
  .content-header {
    padding: 28px 32px;
  }

  .page-title {
    font-size: 32px;
  }

  .support-main {
    padding: 32px 28px;
  }

  .stats-cards {
    gap: 24px;
    margin-bottom: 32px;
  }

  .stat-card {
    padding: 28px;
  }

  .tickets-section {
    padding: 28px;
  }
}

/* Media queries para tablets em landscape */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .filter-controls {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .search-input,
  .status-filter,
  .priority-filter,
  .category-filter {
    min-width: 150px;
  }
}

/* Media queries para tablets em portrait */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .status-filter,
  .priority-filter,
  .category-filter {
    width: 100%;
  }
}

/* Responsividade */
@media (max-width: 1023px) {
  .support-container {
    margin-left: 0;
    /* Remove margem em mobile/tablet */
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .support-main {
    padding: 24px 16px;
    -webkit-overflow-scrolling: touch;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .new-ticket-btn {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 15px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px;
    flex-direction: row;
    align-items: center;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 13px;
  }

  .telegram-qr {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .qr-image {
    width: 50px;
    height: 50px;
  }

  .qr-text {
    font-size: 16px;
  }

  .qr-subtitle {
    font-size: 11px;
  }

  .tickets-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .search-input,
  .status-filter,
  .priority-filter,
  .category-filter {
    min-width: auto;
    width: 100%;
    padding: 10px 12px;
    font-size: 15px;
    /* Evita zoom no iOS */
  }

  .ticket-card {
    padding: 16px;
  }

  .ticket-title {
    font-size: 15px;
  }

  .ticket-description {
    font-size: 13px;
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

  .modal-overlay {
    padding: 16px;
  }

  .ticket-modal,
  .ticket-detail-modal {
    max-width: 100%;
    width: 100%;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .support-main {
    padding: 16px 12px;
  }

  .content-header {
    padding: 16px 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .new-ticket-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .stats-cards {
    gap: 12px;
    margin-bottom: 20px;
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

  .stat-label {
    font-size: 12px;
  }

  .qr-image {
    width: 40px;
    height: 40px;
  }

  .qr-text {
    font-size: 14px;
  }

  .qr-subtitle {
    font-size: 10px;
  }

  .tickets-section {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .search-input,
  .status-filter,
  .priority-filter,
  .category-filter {
    padding: 8px 10px;
    font-size: 14px;
  }

  .ticket-card {
    padding: 14px;
  }

  .ticket-title {
    font-size: 14px;
  }

  .ticket-description {
    font-size: 12px;
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

  .status-badge,
  .priority-badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .modal-overlay {
    padding: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    padding: 10px;
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* Media queries para telas muito pequenas */
@media (max-width: 320px) {
  .support-main {
    padding: 12px 8px;
  }

  .content-header {
    padding: 12px 8px;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .new-ticket-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .stats-cards {
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 12px;
    gap: 8px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }

  .qr-image {
    width: 36px;
    height: 36px;
  }

  .qr-text {
    font-size: 13px;
  }

  .qr-subtitle {
    font-size: 9px;
  }

  .tickets-section {
    padding: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .search-input,
  .status-filter,
  .priority-filter,
  .category-filter {
    padding: 6px 8px;
    font-size: 13px;
  }

  .ticket-card {
    padding: 12px;
  }

  .ticket-title {
    font-size: 13px;
  }

  .ticket-description {
    font-size: 11px;
  }

  .ticket-id {
    font-size: 10px;
  }

  .status-badge,
  .priority-badge {
    font-size: 9px;
    padding: 2px 4px;
  }

  .ticket-category,
  .ticket-date {
    font-size: 10px;
  }

  .modal-overlay {
    padding: 8px;
  }

  .modal-header {
    padding: 12px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-body {
    padding: 12px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    padding: 8px;
    font-size: 13px;
  }

  .form-group label {
    font-size: 13px;
  }

  .cancel-btn,
  .submit-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .ticket-detail-header h4 {
    font-size: 16px;
  }

  .info-item label {
    font-size: 11px;
  }

  .info-item span {
    font-size: 12px;
  }

  .ticket-description-section h5,
  .ticket-messages-section h5 {
    font-size: 14px;
  }

  .message-author {
    font-size: 12px;
  }

  .message-date {
    font-size: 10px;
  }

  .message-content {
    font-size: 12px;
  }

  .message-input {
    padding: 8px;
    font-size: 13px;
    min-height: 60px;
  }

  .send-message-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
