<template>
  <div class="admin-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header -->
      <div class="admin-header">
      <h1 class="admin-title">
        <span class="admin-icon">👑</span>
        Painel de Administração
      </h1>
      <div class="admin-stats">
        <div class="stat-card">
          <span class="stat-number">{{ totalUsers }}</span>
          <span class="stat-label">Total de Usuários</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ activeUsers }}</span>
          <span class="stat-label">Usuários Ativos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ adminUsers }}</span>
          <span class="stat-label">Administradores</span>
        </div>
      </div>
    </div>

    <!-- Admin Tabs -->
    <div class="admin-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 0 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c3.39 0 6 2.145 6 4v1H5.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
        </svg>
        Usuários
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'tickets' }"
        @click="activeTab = 'tickets'"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
          <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
        </svg>
        Tickets
      </button>
    </div>

    <!-- Users Tab Content -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <!-- Actions Bar -->
      <div class="actions-bar">
        <button @click="showCreateModal = true" class="btn-primary">
          <span class="btn-icon">➕</span>
          Novo Usuário
        </button>
        <div class="search-box">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar usuários..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

    <!-- Users Table -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Função</th>
            <th>Status</th>
            <th>Último Login</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td class="user-name">
              <span class="user-avatar">{{ user.name.charAt(0) }}</span>
              {{ user.name }}
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.role]">
                {{ user.role === 'admin' ? 'Administrador' : 'Usuário' }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', user.status]">
                {{ user.status === 'active' ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>{{ formatDate(user.lastLogin) }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions-cell">
              <button @click="editUser(user)" class="btn-icon" title="Editar">
                ✏️
              </button>
              <button 
                @click="changePassword(user)" 
                class="btn-icon btn-info"
                title="Alterar Senha"
              >
                🔐
              </button>
              <button 
                @click="toggleUserStatus(user)" 
                :class="['btn-icon', user.status === 'active' ? 'btn-warning' : 'btn-success']"
                :title="user.status === 'active' ? 'Desativar' : 'Ativar'"
              >
                {{ user.status === 'active' ? '⏸️' : '▶️' }}
              </button>
              <button 
                @click="deleteUser(user)" 
                class="btn-icon btn-danger"
                title="Excluir"
                :disabled="user.role === 'admin'"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <!-- Tickets Tab Content -->
    <div v-if="activeTab === 'tickets'" class="tab-content">
      <!-- Tickets Stats -->
      <div class="tickets-stats">
        <div class="stat-card">
          <span class="stat-number">{{ allTickets.length }}</span>
          <span class="stat-label">Total de Tickets</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ openTickets.length }}</span>
          <span class="stat-label">Tickets Abertos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ pendingTickets.length }}</span>
          <span class="stat-label">Em Andamento</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ closedTickets.length }}</span>
          <span class="stat-label">Fechados</span>
        </div>
      </div>

      <!-- Tickets Actions Bar -->
      <div class="actions-bar">
        <div class="filter-controls">
          <select v-model="ticketStatusFilter" class="status-filter">
            <option value="">Todos os Status</option>
            <option value="open">Abertos</option>
            <option value="pending">Em Andamento</option>
            <option value="closed">Fechados</option>
          </select>
          <select v-model="ticketPriorityFilter" class="priority-filter">
            <option value="">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div class="search-box">
          <input
            v-model="ticketSearchTerm"
            type="text"
            placeholder="Buscar tickets..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="tickets-table-container">
        <table class="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Título</th>
              <th>Categoria</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-row">
              <td class="ticket-id">#{{ ticket.id }}</td>
              <td class="ticket-user">
                <span class="user-avatar">{{ getUserName(ticket.userEmail).charAt(0) }}</span>
                {{ getUserName(ticket.userEmail) }}
              </td>
              <td class="ticket-title">{{ ticket.title }}</td>
              <td>
                <span class="category-badge">{{ getCategoryText(ticket.category) }}</span>
              </td>
              <td>
                <span :class="['priority-badge', ticket.priority]">
                  {{ getPriorityText(ticket.priority) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', ticket.status]">
                  {{ getStatusText(ticket.status) }}
                </span>
              </td>
              <td>{{ formatDate(ticket.createdAt) }}</td>
              <td class="actions-cell">
                <button @click="viewTicket(ticket)" class="btn-icon" title="Visualizar">
                  👁️
                </button>
                <button 
                  @click="updateTicketStatus(ticket, 'pending')" 
                  v-if="ticket.status === 'open'"
                  class="btn-icon btn-warning"
                  title="Marcar como Em Andamento"
                >
                  ⏳
                </button>
                <button 
                  @click="updateTicketStatus(ticket, 'closed')" 
                  v-if="ticket.status !== 'closed'"
                  class="btn-icon btn-success"
                  title="Fechar Ticket"
                >
                  ✅
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </main>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>
        
        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-group">
            <label>Nome</label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="form-input"
              placeholder="Nome completo"
            />
          </div>
          
          <div class="form-group">
            <label>E-mail</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="form-input"
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div class="form-group">
            <label>Função</label>
            <select v-model="userForm.role" class="form-select">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="userForm.status" class="form-select">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          
          <div class="form-group" v-if="!showEditModal">
            <label>Senha</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              class="form-input"
              placeholder="Senha temporária"
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ showEditModal ? 'Atualizar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Alterar Senha</h2>
          <button @click="showPasswordModal = false" class="modal-close">✕</button>
        </div>
        
        <form @submit.prevent="savePassword" class="modal-form">
          <div class="form-group">
            <label>Usuário</label>
            <input
              :value="passwordForm.userName"
              type="text"
              disabled
              class="form-input disabled"
              placeholder="Nome do usuário"
            />
          </div>
          
          <div class="form-group">
            <label>Nova Senha</label>
            <div class="password-input-group">
              <input
                v-model="passwordForm.newPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                class="form-input"
                placeholder="Nova senha"
                minlength="6"
              />
              <button 
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
                title="Mostrar/Ocultar senha"
              >
                <svg v-if="showPassword" class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
                <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-.708-.707a3.5 3.5 0 0 0-4.474-4.474l-.707-.708z"/>
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 3.172-2.828-2.829a3.5 3.5 0 0 0-4.474-4.474L2.878 2.878a7.028 7.028 0 0 1 8.656 8.656z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Confirmar Nova Senha</label>
            <div class="password-input-group">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="form-input"
                placeholder="Confirmar nova senha"
                minlength="6"
              />
              <button 
                type="button"
                @click="toggleConfirmPasswordVisibility"
                class="password-toggle"
                title="Mostrar/Ocultar senha"
              >
                <svg v-if="showConfirmPassword" class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                </svg>
                <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m10.79 12.912-1.614-1.615a3.3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-.708-.707a3.5 3.5 0 0 0-4.474-4.474l-.707-.708z"/>
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 3.172-2.828-2.829a3.5 3.5 0 0 0-4.474-4.474L2.878 2.878a7.028 7.028 0 0 1 8.656 8.656z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showPasswordModal = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="!isPasswordFormValid">
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button @click="showDeleteModal = false" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <p>Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?</p>
          <p class="warning-text">Esta ação não pode ser desfeita.</p>
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn-danger">
            Excluir
          </button>
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
                <label>Usuário:</label>
                <span>{{ getUserName(selectedTicket.userEmail) }}</span>
              </div>
              <div class="info-item">
                <label>Categoria:</label>
                <span>{{ getCategoryText(selectedTicket.category) }}</span>
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
                  placeholder="Digite sua resposta..."
                  rows="3"
                ></textarea>
                <button class="send-message-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                  Enviar Resposta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal do Glossário -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'

export default {
  name: 'AdminView',
  components: {
    Sidebar,
    GlossaryModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      activeTab: 'users',
      searchTerm: '',
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showPasswordModal: false,
      showTicketDetailModal: false,
      userToDelete: null,
      selectedTicket: null,
      showPassword: false,
      showConfirmPassword: false,
      newMessage: '',
      ticketStatusFilter: '',
      ticketPriorityFilter: '',
      ticketSearchTerm: '',
      userForm: {
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        password: ''
      },
      passwordForm: {
        userId: '',
        userName: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  
  computed: {
    ...mapGetters([
      'allUsers', 
      'isAdmin', 
      'allTickets', 
      'openTickets', 
      'pendingTickets', 
      'closedTickets'
    ]),
    
    currentUser() {
      return this.$store.getters.currentUser
    },
    
    isPasswordFormValid() {
      return this.passwordForm.newPassword.length >= 6 && 
             this.passwordForm.newPassword === this.passwordForm.confirmPassword
    },
    
    totalUsers() {
      return this.allUsers.length
    },
    
    activeUsers() {
      return this.allUsers.filter(user => user.status === 'active').length
    },
    
    adminUsers() {
      return this.allUsers.filter(user => user.role === 'admin').length
    },
    
    filteredUsers() {
      if (!this.searchTerm) return this.allUsers
      
      const term = this.searchTerm.toLowerCase()
      return this.allUsers.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    },
    
    filteredTickets() {
      let tickets = this.allTickets
      
      if (this.ticketStatusFilter) {
        tickets = tickets.filter(ticket => ticket.status === this.ticketStatusFilter)
      }
      
      if (this.ticketPriorityFilter) {
        tickets = tickets.filter(ticket => ticket.priority === this.ticketPriorityFilter)
      }
      
      if (this.ticketSearchTerm) {
        const term = this.ticketSearchTerm.toLowerCase()
        tickets = tickets.filter(ticket => 
          ticket.title.toLowerCase().includes(term) ||
          ticket.description.toLowerCase().includes(term) ||
          ticket.userEmail.toLowerCase().includes(term)
        )
      }
      
      return tickets
    }
  },
  
  mounted() {
    if (!this.isAdmin) {
      this.$router.push('/')
    }
  },
  
  methods: {
    ...mapActions([
      'createUser', 
      'updateUserData', 
      'deleteUserData', 
      'updateTicketData', 
      'addMessageToTicket'
    ]),
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },
    
    closeGlossary() {
      this.showGlossaryModal = false
    },
    
    // Ticket Management Methods
    viewTicket(ticket) {
      this.selectedTicket = ticket
      this.showTicketDetailModal = true
    },
    
    closeTicketDetailModal() {
      this.showTicketDetailModal = false
      this.selectedTicket = null
      this.newMessage = ''
    },
    
    updateTicketStatus(ticket, newStatus) {
      this.updateTicketData({
        id: ticket.id,
        updates: { status: newStatus }
      })
    },
    
    async sendMessage() {
      if (!this.newMessage.trim()) return
      
      const message = {
        id: this.selectedTicket.messages.length + 1,
        author: 'Suporte Técnico',
        content: this.newMessage,
        type: 'support',
        createdAt: new Date().toISOString()
      }
      
      this.addMessageToTicket({
        ticketId: this.selectedTicket.id,
        message
      })
      
      this.newMessage = ''
    },
    
    getUserName(email) {
      const user = this.allUsers.find(u => u.email === email)
      return user ? user.name : email
    },
    
    getCategoryText(category) {
      const categoryMap = {
        technical: 'Problema Técnico',
        billing: 'Cobrança/Pagamento',
        account: 'Conta/Acesso',
        feature: 'Sugestão/Melhoria',
        other: 'Outro'
      }
      return categoryMap[category] || category
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
    
    getStatusText(status) {
      const statusMap = {
        open: 'Aberto',
        pending: 'Em Andamento',
        closed: 'Fechado'
      }
      return statusMap[status] || status
    },
    
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    changePassword(user) {
      this.passwordForm.userId = user.id
      this.passwordForm.userName = user.name
      this.passwordForm.newPassword = ''
      this.passwordForm.confirmPassword = ''
      this.showPassword = false
      this.showConfirmPassword = false
      this.showPasswordModal = true
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    
    savePassword() {
      if (!this.isPasswordFormValid) {
        return
      }
      
      // Simular alteração de senha
      console.log(`Alterando senha do usuário ${this.passwordForm.userName} para: ${this.passwordForm.newPassword}`)
      
      // Aqui você pode adicionar a lógica para salvar a nova senha
      // Por exemplo, chamar uma API ou atualizar o store
      
      // Fechar modal e limpar formulário
      this.showPasswordModal = false
      this.passwordForm = {
        userId: '',
        userName: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      // Mostrar mensagem de sucesso
      alert('Senha alterada com sucesso!')
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    editUser(user) {
      this.userForm = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: ''
      }
      this.showEditModal = true
    },
    
    async saveUser() {
      try {
        if (this.showEditModal) {
          // Atualizar usuário existente
          const userToUpdate = this.allUsers.find(u => u.email === this.userForm.email)
          if (userToUpdate) {
            await this.updateUserData({
              id: userToUpdate.id,
              updates: {
                name: this.userForm.name,
                role: this.userForm.role,
                status: this.userForm.status
              }
            })
          }
        } else {
          // Criar novo usuário
          await this.createUser({
            name: this.userForm.name,
            email: this.userForm.email,
            role: this.userForm.role,
            status: this.userForm.status,
            password: this.userForm.password
          })
        }
        
        this.closeModal()
        this.$toast?.success?.(this.showEditModal ? 'Usuário atualizado!' : 'Usuário criado!')
      } catch (error) {
        this.$toast?.error?.('Erro ao salvar usuário')
      }
    },
    
    toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      this.updateUserData({
        id: user.id,
        updates: { status: newStatus }
      })
    },
    
    deleteUser(user) {
      if (user.role === 'admin') {
        this.$toast?.error?.('Não é possível excluir administradores')
        return
      }
      
      this.userToDelete = user
      this.showDeleteModal = true
    },
    
    async confirmDelete() {
      try {
        await this.deleteUserData(this.userToDelete.id)
        this.showDeleteModal = false
        this.userToDelete = null
        this.$toast?.success?.('Usuário excluído!')
      } catch (error) {
        this.$toast?.error?.('Erro ao excluir usuário')
      }
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.userForm = {
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        password: ''
      }
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo .logo-icon {
  font-size: 24px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.user-profile {
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar.collapsed .user-profile {
  padding: 20px 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-avatar:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
  justify-content: center;
  align-items: center;
  display: flex;
}

.sidebar.collapsed .user-avatar {
  margin: 0 auto;
}

.user-details {
  flex: 1;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px 10px;
}

.nav-item.active .nav-link {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.glossary-btn,
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.glossary-btn:hover,
.logout-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.logout-btn {
  margin-top: 20px;
}

.logout-btn:hover {
  background: rgba(255, 68, 68, 0.1) !important;
  color: #ff4444 !important;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 80px;
}

/* Admin Tabs */
.admin-tabs {
  display: flex;
  gap: 8px;
  padding: 0 32px 24px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary, #2a2a2a);
  color: var(--text-secondary, #888888);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary, #ffffff);
}

.tab-btn.active {
  background: #00ff88;
  color: #1a1a1a;
  border-color: #00ff88;
}

.tab-btn svg {
  width: 16px;
  height: 16px;
}

.tab-content {
  padding: 24px 32px;
}

.admin-header {
  padding: 24px;
  margin-bottom: 0;
}

.admin-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
}

.admin-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 8px;
}

.stat-label {
  color: #ffffff;
  font-size: 14px;
  opacity: 0.8;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 24px 24px 24px;
  gap: 16px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
}

.search-input::placeholder {
  color: #808080;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #808080;
}

.users-table-container {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin: 0 24px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.user-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.role-badge.user {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge.inactive {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-warning:hover {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.btn-success:hover {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.btn-danger:hover {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
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

.modal-content {
  background: rgba(42, 42, 42, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: #ffffff;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #808080;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: #ffffff;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #00ff88;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background: linear-gradient(135deg, #ff4444 0%, #cc3333 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 68, 68, 0.3);
}

.delete-modal .modal-body {
  padding: 20px;
  color: #ffffff;
}

.warning-text {
  color: #ff4444;
  font-weight: 600;
  margin-top: 8px;
}

/* Password Modal Styles */
.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.password-toggle:hover {
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  transform: translateY(-50%) scale(1.1);
}

.eye-icon {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
  animation: iconFade 0.2s ease-in-out;
}

@keyframes iconFade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.form-input.disabled {
  background: rgba(26, 26, 26, 0.4);
  color: #888888;
  cursor: not-allowed;
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Tickets Styles */
.tickets-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.status-filter,
.priority-filter {
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.tickets-table-container {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  overflow: hidden;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary, #1a1a1a);
}

.tickets-table th {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.tickets-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #ffffff);
}

.tickets-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.ticket-row {
  transition: all 0.2s ease;
}

.ticket-id {
  font-family: monospace;
  font-weight: 600;
  color: #00ff88;
}

.ticket-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-title {
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-badge {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
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

/* Ticket Detail Modal Styles */
.ticket-detail-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

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
  .admin-container {
    padding: 16px;
  }
  
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .users-table {
    font-size: 12px;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
  }
  
  .admin-stats {
    grid-template-columns: 1fr;
  }
}
</style>
