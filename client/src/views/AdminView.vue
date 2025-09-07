<template>
  <RouteGuard :requiresAuth="true" :requiresAdmin="true">
    <div class="admin-container">
      <!-- Sidebar Reutilizável -->
      <Sidebar 
        :sidebarCollapsed="sidebarCollapsed"
        @toggle-sidebar="handleSidebarToggle"
        @sidebar-state-loaded="handleSidebarStateLoaded"
      />

      <!-- Conteúdo Principal -->
      <main class="main-content">
        <!-- Header Global -->
        <Header />
        
        <!-- Header do Conteúdo -->
        <header class="content-header">
          <div class="header-left">
            <h2 class="page-title">Painel Administrativo</h2>
            <p class="page-subtitle">Gerenciamento de usuários e tickets</p>
          </div>
          <div class="header-actions">
            <button class="refresh-btn" @click="refreshData" title="Atualizar dados">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L7.5 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H1a7 7 0 1 1 7 7v-2a5 5 0 0 0 0-10z"/>
              </svg>
            </button>
            
            <!-- Botão de Forçar Atualização PWA -->
            <button 
              class="force-update-btn" 
              @click="forcePWAUpdate" 
              :disabled="updatingPWA"
              :title="updatingPWA ? 'Atualizando...' : 'Forçar atualização PWA para todos os usuários'"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L7.5 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H1a7 7 0 1 1 7 7v-2a5 5 0 0 0 0-10z"/>
              </svg>
              {{ updatingPWA ? 'Atualizando...' : 'Forçar Atualização PWA' }}
            </button>
            
            <button class="new-user-btn" @click="showCreateUserModal = true">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Novo Usuário
            </button>
          </div>
        </header>

        <!-- Main Content -->
        <div class="admin-main">
          <!-- Dashboard Stats -->
          <div class="dashboard-stats">
            <div class="stat-card">
              <div class="stat-icon users-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.totalUsers }}</div>
                <div class="stat-label">Total de Usuários</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon vip-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.vipUsers }}</div>
                <div class="stat-label">Usuários VIP</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon tickets-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
                  <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.totalTickets }}</div>
                <div class="stat-label">Total de Tickets</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon open-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
                  <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardStats.openTickets }}</div>
                <div class="stat-label">Tickets Abertos</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs-container">
            <div class="tabs-header">
              <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
              >
                Usuários
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'tickets' }"
                @click="activeTab = 'tickets'"
              >
                Tickets
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'notifications' }"
                @click="activeTab = 'notifications'"
              >
                📢 Notificações
              </button>
            </div>

            <!-- Users Tab -->
            <div v-if="activeTab === 'users'" class="tab-content">
              <div class="section-header">
                <h3 class="section-title">Gerenciamento de Usuários</h3>
                <div class="filter-controls">
                  <input 
                    v-model="userSearchQuery" 
                    type="text" 
                    placeholder="Buscar por nome ou email..."
                    class="search-input"
                  >
                  <select v-model="userStatusFilter" class="status-filter">
                    <option value="">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </div>
              </div>

              <div class="users-list">
                <!-- Loading State -->
                <div v-if="loading" class="loading-users">
                  <div class="loading-spinner"></div>
                  <p>Carregando usuários...</p>
                </div>
                
                <!-- Empty State -->
                <div v-else-if="filteredUsers.length === 0" class="empty-users">
                  <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
                  </svg>
                  <h4>Nenhum usuário encontrado</h4>
                  <p>Não há usuários que correspondam aos filtros selecionados</p>
                </div>

                <div v-for="user in filteredUsers" :key="user.id" class="user-card">
                  <div class="user-header">
                    <div class="user-info">
                      <h4 class="user-name">{{ user.name }}</h4>
                      <span class="user-email">{{ user.email }}</span>
                      <span class="user-id">#{{ user.id }}</span>
                    </div>
                    <div class="user-status" :class="user.status">
                      <span class="status-badge">{{ getUserStatusText(user.status) }}</span>
                    </div>
                  </div>
                  
                  <div class="user-content">
                    <div class="user-meta">
                      <span class="user-plan">{{ user.plan || 'Sem plano' }}</span>
                      <span class="user-created">{{ formatDate(user.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="user-actions">
                    <button 
                      class="action-btn toggle-btn" 
                      :class="user.status === 'active' ? 'deactivate-btn' : 'activate-btn'"
                      @click="toggleUserStatus(user)"
                      :title="user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path v-if="user.status === 'active'" d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 8 3zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V3.5a.5.5 0 0 1 .5-.5z"/>
                        <path v-if="user.status === 'active'" d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V8.5a.5.5 0 0 1 .5-.5z"/>
                        <path v-if="user.status === 'inactive'" d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 8 3zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V3.5a.5.5 0 0 1 .5-.5z"/>
                        <path v-if="user.status === 'inactive'" d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V8.5a.5.5 0 0 1 .5-.5z"/>
                        <path v-if="user.status === 'inactive'" d="M8 13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5v-1A.5.5 0 0 1 8 13zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11v-1a.5.5 0 0 1 .5-.5z"/>
                      </svg>
                      {{ user.status === 'active' ? 'Desativar' : 'Ativar' }}
                    </button>
                    <button class="action-btn edit-btn" @click="editUser(user)">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.5-.5V9h-.5a.5.5 0 0 1-.5-.5V8h-.5a.5.5 0 0 1-.5-.5V7h-.5a.5.5 0 0 1-.5-.5V6h-.5a.5.5 0 0 1-.5-.5V5h-.5a.5.5 0 0 1-.5-.5V4h-.5a.5.5 0 0 1-.5-.5V3h-.5a.5.5 0 0 1-.5-.5V2h-.5a.5.5 0 0 1-.5-.5V1h-.5a.5.5 0 0 1-.5-.5V0H1a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V1a.5.5 0 0 0-.5-.5H1z"/>
                      </svg>
                      Editar
                    </button>
                    <button class="action-btn delete-btn" @click="deleteUser(user)">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tickets Tab -->
            <div v-if="activeTab === 'tickets'" class="tab-content">
              <div class="section-header">
                <h3 class="section-title">Gerenciamento de Tickets</h3>
                <div class="filter-controls">
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Buscar por ID, título ou usuário..."
                    class="search-input"
                  >
                  <select v-model="statusFilter" class="status-filter">
                    <option value="">Todos os Status</option>
                    <option value="open">Abertos</option>
                    <option value="in_progress">Em Andamento</option>
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
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
                  </svg>
                  <h4>Nenhum ticket encontrado</h4>
                  <p>Não há tickets que correspondam aos filtros selecionados</p>
                </div>

                <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card admin-ticket" @click="openTicket(ticket)">
                  <div class="ticket-header">
                    <div class="ticket-info">
                      <h4 class="ticket-title">{{ ticket.subject }}</h4>
                      <span class="ticket-id">#{{ ticket.id }}</span>
                      <span class="ticket-user">{{ ticket.userName }}</span>
                    </div>
                    <div class="ticket-status" :class="ticket.status">
                      <span class="status-badge">{{ getStatusText(ticket.status) }}</span>
                    </div>
                  </div>
                  
                  <div class="ticket-content">
                    <p class="ticket-description">{{ ticket.messages && ticket.messages[0] ? ticket.messages[0].content.substring(0, 100) + (ticket.messages[0].content.length > 100 ? '...' : '') : 'Sem descrição' }}</p>
                  </div>
                  
                  <div class="ticket-footer">
                    <div class="ticket-meta">
                      <span class="ticket-category">{{ getCategoryText(ticket.category) }}</span>
                      <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
                      <span class="ticket-messages">{{ ticket.messages.length }} mensagens</span>
                    </div>
                    <div class="ticket-priority" :class="ticket.priority">
                      <span class="priority-badge">{{ getPriorityText(ticket.priority) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Tab -->
            <div v-if="activeTab === 'notifications'" class="tab-content">
              <AdminNotificationPanel />
            </div>
          </div>
        </div>
      </main>

      <!-- Ticket Detail Modal -->
      <div v-if="showTicketDetailModal" class="modal-overlay" @click="closeTicketDetailModal">
        <div class="ticket-detail-modal admin-modal" @click.stop>
          <div class="modal-header">
            <h3>Ticket #{{ selectedTicket?.id }} - {{ selectedTicket?.title }}</h3>
            <div class="modal-actions">
              <button 
                v-if="selectedTicket?.status !== 'closed'" 
                class="close-ticket-btn" 
                @click="closeTicket"
              >
                Fechar Ticket
              </button>
              <button class="close-btn" @click="closeTicketDetailModal">×</button>
            </div>
          </div>
          
          <div class="modal-body" v-if="selectedTicket">
            <div class="ticket-detail-header">
              <div class="ticket-detail-meta">
                <span class="status-badge" :class="selectedTicket.status">{{ getStatusText(selectedTicket.status) }}</span>
                <span class="priority-badge" :class="selectedTicket.priority">{{ getPriorityText(selectedTicket.priority) }}</span>
                <span class="category-badge">{{ getCategoryText(selectedTicket.category) }}</span>
              </div>
            </div>
            
            <div class="ticket-detail-content">
              <div class="ticket-info-grid">
                <div class="info-item">
                  <label>Usuário:</label>
                  <span>{{ selectedTicket.userName }}</span>
                </div>
                <div class="info-item">
                  <label>Criado em:</label>
                  <span>{{ formatDate(selectedTicket.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <label>Última atualização:</label>
                  <span>{{ formatDate(selectedTicket.updatedAt) }}</span>
                </div>
                <div class="info-item">
                  <label>Mensagens:</label>
                  <span>{{ selectedTicket.messages.length }}</span>
                </div>
              </div>
            
              <div class="ticket-description-section">
                <h5>Descrição</h5>
                <p>{{ selectedTicket.messages && selectedTicket.messages[0] ? selectedTicket.messages[0].content : 'Sem descrição' }}</p>
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
                    placeholder="Digite sua resposta como administrador..."
                    rows="3"
                  ></textarea>
                  <button class="send-message-btn" @click="sendAdminMessage" :disabled="!newMessage.trim()">
                    Responder como Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- Create User Modal -->
      <div v-if="showCreateUserModal" class="modal-overlay" @click="closeCreateUserModal">
        <div class="user-modal" @click.stop>
          <div class="modal-header">
            <h3>Criar Novo Usuário</h3>
            <button class="close-btn" @click="closeCreateUserModal">×</button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="createUser">
              <div class="form-group">
                <label for="user-name">Nome</label>
                <input 
                  id="user-name"
                  v-model="newUser.name" 
                  type="text" 
                  class="form-input"
                  placeholder="Nome completo"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="user-email">Email</label>
                <input 
                  id="user-email"
                  v-model="newUser.email" 
                  type="email" 
                  class="form-input"
                  placeholder="email@exemplo.com"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="user-password">Senha</label>
                <input 
                  id="user-password"
                  v-model="newUser.password" 
                  type="password" 
                  class="form-input"
                  placeholder="Senha"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="user-plan">Plano</label>
                <select id="user-plan" v-model="newUser.plan" class="form-select">
                  <option value="">Sem plano</option>
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeCreateUserModal">Cancelar</button>
                <button type="submit" class="submit-btn">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div v-if="showEditUserModal" class="modal-overlay" @click="closeEditUserModal">
        <div class="user-modal" @click.stop>
          <div class="modal-header">
            <h3>Editar Usuário</h3>
            <button class="close-btn" @click="closeEditUserModal">×</button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="form-group">
                <label for="edit-user-name">Nome</label>
                <input 
                  id="edit-user-name"
                  v-model="editingUser.name" 
                  type="text" 
                  class="form-input"
                  placeholder="Nome completo"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="edit-user-email">Email</label>
                <input 
                  id="edit-user-email"
                  v-model="editingUser.email" 
                  type="email" 
                  class="form-input"
                  placeholder="email@exemplo.com"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="edit-user-plan">Plano</label>
                <select id="edit-user-plan" v-model="editingUser.plan" class="form-select">
                  <option value="">Sem plano</option>
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="edit-user-status">Status</label>
                <select id="edit-user-status" v-model="editingUser.status" class="form-select">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeEditUserModal">Cancelar</button>
                <button type="submit" class="submit-btn">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete User Confirmation Modal -->
      <div v-if="showDeleteUserModal" class="modal-overlay" @click="closeDeleteUserModal">
        <div class="confirmation-modal" @click.stop>
          <div class="modal-header">
            <h3>Confirmar Exclusão</h3>
            <button class="close-btn" @click="closeDeleteUserModal">×</button>
          </div>
          
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?</p>
            <p>Esta ação não pode ser desfeita.</p>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeDeleteUserModal">Cancelar</button>
              <button type="button" class="delete-btn" @click="confirmDeleteUser">Excluir</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PWA Force Update Modal -->
      <PWAForceUpdateModal 
        :show="showPWAForceUpdateModal"
        @close="closePWAForceUpdateModal"
        @confirm="handlePWAForceUpdate"
      />

      <!-- Glossary Modal -->

    </div>
  </RouteGuard>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import PWAForceUpdateModal from '../components/PWAForceUpdateModal.vue'
import AdminNotificationPanel from '../components/AdminNotificationPanel.vue'

import RouteGuard from '../components/RouteGuard.vue'
import { mapGetters } from 'vuex'
import { adminAPI } from '@/api/admin'
import axios from '@/utils/axios'

export default {
  name: 'AdminView',
  components: {
    Sidebar,
    Header,
    PWAForceUpdateModal,
    AdminNotificationPanel,
    RouteGuard
  },
  mounted() {
    console.log('🚀 Componente AdminView montado, verificando permissões...')
    console.log('👤 Usuário atual:', this.$store.getters.currentUser)
    console.log('👑 É admin?', this.$store.getters.isAdmin)
    console.log('🔑 Token disponível:', !!this.$store.getters.authToken)
    
    // Verificar se o usuário é admin
    if (!this.$store.getters.isAdmin) {
      console.error('🚫 Acesso negado: Usuário não é administrador')
      return
    }
    
    console.log('✅ Permissões verificadas, iniciando carregamento...')
    
    // Pequeno delay para garantir que o componente esteja totalmente montado
    setTimeout(() => {
      this.refreshData()
    }, 100)
  },
  data() {
    return {
      sidebarCollapsed: false,

      showTicketDetailModal: false,
      showCreateUserModal: false,
      showEditUserModal: false,
      showDeleteUserModal: false,
      showPWAForceUpdateModal: false,
      activeTab: 'users',
      statusFilter: '',
      priorityFilter: '',
      categoryFilter: '',
      searchQuery: '',
      userSearchQuery: '',
      userStatusFilter: '',
      selectedTicket: null,
      newMessage: '',
      userToDelete: null,
      
      newUser: {
        name: '',
        email: '',
        password: '',
        plan: ''
      },
      
      editingUser: {
        name: '',
        email: '',
        plan: '',
        status: 'active'
      },
      
      // Dados dos usuários carregados do banco
      users: [],
      loading: false,
      
      tickets: [],
      
      // Estado da atualização PWA
      updatingPWA: false
    }
  },
  
  computed: {
    ...mapGetters([
      'currentUser',
      'isAdmin'
    ]),
    
    dashboardStats() {
      const totalTickets = this.tickets.length
      const openTickets = this.tickets.filter(t => t.status === 'open').length
      const pendingTickets = this.tickets.filter(t => t.status === 'in_progress' || t.status === 'pending').length
      const closedTickets = this.tickets.filter(t => t.status === 'closed').length
      
      // Mock data para demonstração (será substituído por API real)
      const avgResponseTime = '2h 30m'
      const totalUsers = this.users.length
      const vipUsers = this.users.filter(u => u.plan === 'vip' || u.plan === 'premium' || u.account_type === 'vip').length
      
      console.log('📊 Dashboard Stats calculadas:', { 
        totalTickets, 
        openTickets, 
        pendingTickets, 
        closedTickets, 
        totalUsers, 
        vipUsers 
      })
      
      return { 
        totalTickets, 
        openTickets, 
        pendingTickets, 
        closedTickets, 
        avgResponseTime, 
        totalUsers, 
        vipUsers 
      }
    },
    
    filteredTickets() {
      let filtered = this.tickets

      // Filtro por status
      if (this.statusFilter) {
        if (this.statusFilter === 'in_progress') {
          // Aceitar tanto 'in_progress' quanto 'pending' para compatibilidade
          filtered = filtered.filter(ticket => ticket.status === 'in_progress' || ticket.status === 'pending')
        } else {
          filtered = filtered.filter(ticket => ticket.status === this.statusFilter)
        }
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
    
    filteredUsers() {
      let filtered = this.users

      // Filtro por status
      if (this.userStatusFilter) {
        filtered = filtered.filter(user => user.status === this.userStatusFilter)
      }

      // Filtro por busca
      if (this.userSearchQuery) {
        const query = this.userSearchQuery.toLowerCase()
        filtered = filtered.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  },
  
  methods: {
    // Carregar usuários do banco de dados
    async loadUsers() {
      console.log('🔍 Carregando usuários...')
      this.loading = true
      try {
        // Verificar se o token está disponível
        const token = this.$store.getters.authToken
        console.log('🔑 Token disponível para usuários:', !!token)
        
        const response = await axios.get('/api/users')
        console.log('📊 Resposta da API usuários:', response.data)
        console.log('📊 Tipo da resposta:', typeof response.data)
        console.log('📊 Propriedades da resposta:', Object.keys(response.data))
        
        // Verificar se a resposta tem a estrutura esperada
        if (response.data && response.data.success && Array.isArray(response.data.users)) {
          this.users = response.data.users.map(user => ({
            id: user.id,
            name: user.name || user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuário',
            email: user.email,
            status: user.status || 'active',
            plan: user.account_type || user.plan || '',
            createdAt: user.created_at || user.createdAt || new Date().toISOString()
          }))
          console.log('✅ Usuários carregados:', this.users.length)
          console.log('📊 Primeiro usuário:', this.users[0])
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response.data)
          console.warn('⚠️ Estrutura esperada: { success: true, users: [...] }')
          console.warn('⚠️ Estrutura recebida:', response.data)
          this.users = []
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
        this.users = []
      } finally {
        this.loading = false
      }
    },

    // Carregar tickets do banco de dados
    async loadTickets() {
      console.log('🔍 Carregando tickets...')
      try {
        const response = await axios.get('/api/tickets')
        console.log('📊 Resposta da API tickets:', response.data)
        console.log('📊 Tipo da resposta tickets:', typeof response.data)
        console.log('📊 Propriedades da resposta tickets:', Object.keys(response.data))
        
        // Verificar se a resposta tem a estrutura esperada
        if (response.data && response.data.success && Array.isArray(response.data.tickets)) {
          this.tickets = response.data.tickets
          console.log('✅ Tickets carregados:', this.tickets.length)
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response.data)
          console.warn('⚠️ Estrutura esperada: { success: true, tickets: [...] }')
          console.warn('⚠️ Estrutura recebida:', response.data)
          this.tickets = []
        }
      } catch (error) {
        console.error('❌ Erro ao carregar tickets:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
        this.tickets = []
      }
    },
    
    // Atualizar dados
    async refreshData() {
      console.log('🔄 Iniciando refreshData...')
      try {
        await Promise.all([
          this.loadUsers(),
          this.loadTickets()
        ])
        console.log('✅ refreshData concluído com sucesso')
      } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error)
      }
    },
    
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    


    openTicket(ticket) {
      this.selectedTicket = ticket
      this.showTicketDetailModal = true
    },
    
    closeTicketDetailModal() {
      this.showTicketDetailModal = false
      this.selectedTicket = null
      this.newMessage = ''
    },

    async sendAdminMessage() {
      if (!this.newMessage.trim()) return
      
      try {
        console.log('📤 [AdminView] Enviando mensagem como admin...')
        console.log('🆔 [AdminView] Ticket ID:', this.selectedTicket.id)
        console.log('💬 [AdminView] Mensagem:', this.newMessage)
        
        // Chamar API para adicionar mensagem
        const response = await axios.post(`/api/tickets/${this.selectedTicket.id}/messages`, {
          message: this.newMessage,  // ✅ Corrigido: usar 'message' em vez de 'content'
          is_internal: false  // Mensagem visível para o usuário
        })
        
        console.log('📥 [AdminView] Resposta da API:', response.data)
        
        if (response.data.success) {
          // Adicionar mensagem ao ticket
          this.selectedTicket.messages.push(response.data.data)
          this.selectedTicket.updatedAt = new Date().toISOString()
          
          // Atualizar status para "Em andamento" se ainda estiver aberto
          if (this.selectedTicket.status === 'open') {
            this.selectedTicket.status = 'in_progress'
          }
          
          this.newMessage = ''
          this.showToastNotification('Mensagem enviada com sucesso!', 'success')
          console.log('✅ [AdminView] Mensagem enviada com sucesso')
        } else {
          console.error('❌ [AdminView] Erro na resposta da API:', response.data)
          this.showToastNotification('Erro ao enviar mensagem', 'error')
        }
      } catch (error) {
        console.error('❌ [AdminView] Erro ao enviar mensagem:', error)
        console.error('📋 [AdminView] Detalhes do erro:', error.response?.data)
        this.showToastNotification('Erro ao enviar mensagem', 'error')
      }
    },

    async closeTicket() {
      if (this.selectedTicket) {
        try {
          console.log('🔒 [AdminView] Fechando ticket...')
          console.log('🆔 [AdminView] Ticket ID:', this.selectedTicket.id)
          
          const response = await axios.patch(`/api/tickets/${this.selectedTicket.id}/status`, {
            status: 'closed'
          })
          
          console.log('📥 [AdminView] Resposta da API (fechar ticket):', response.data)
          
          if (response.data.success) {
            this.selectedTicket.status = 'closed'
            this.selectedTicket.updatedAt = new Date().toISOString()
            this.showToastNotification('Ticket fechado com sucesso!', 'success')
            console.log('✅ [AdminView] Ticket fechado com sucesso')
          } else {
            console.error('❌ [AdminView] Erro na resposta da API:', response.data)
            this.showToastNotification('Erro ao fechar ticket', 'error')
          }
        } catch (error) {
          console.error('❌ [AdminView] Erro ao fechar ticket:', error)
          console.error('📋 [AdminView] Detalhes do erro:', error.response?.data)
          this.showToastNotification('Erro ao fechar ticket', 'error')
        }
      }
    },
    
    // User Management Methods
    closeCreateUserModal() {
      this.showCreateUserModal = false
      this.resetNewUser()
    },
    
    closeEditUserModal() {
      this.showEditUserModal = false
      this.editingUser = {
        name: '',
        email: '',
        plan: '',
        status: 'active'
      }
    },
    
    closeDeleteUserModal() {
      this.showDeleteUserModal = false
      this.userToDelete = null
    },
    
    resetNewUser() {
      this.newUser = {
        name: '',
        email: '',
        password: '',
        plan: ''
      }
    },
    
    // Formatar data para exibição
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('pt-BR')
    },
    
    async createUser() {
      try {
        // Validar dados
        if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
          alert('Por favor, preencha todos os campos obrigatórios.')
          return
        }
        
        // Preparar dados para a API
        const userData = {
          username: this.newUser.name.split(' ')[0] || this.newUser.name,
          first_name: this.newUser.name.split(' ')[0] || this.newUser.name,
          last_name: this.newUser.name.split(' ').slice(1).join(' ') || '',
          email: this.newUser.email,
          password: this.newUser.password,
          account_type: this.newUser.plan || 'basic',
          status: 'active'
        }
        
        // Chamar API para criar usuário
        const response = await axios.post('/api/users', userData)
        
        if (response.data.success) {
          // Recarregar lista de usuários
          await this.loadUsers()
          this.closeCreateUserModal()
          alert('Usuário criado com sucesso!')
        } else {
          alert('Erro ao criar usuário: ' + (response.data.error || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        alert('Erro ao criar usuário: ' + (error.response?.data?.error || error.message))
      }
    },
    
    editUser(user) {
      this.editingUser = { 
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: user.status
      }
      this.showEditUserModal = true
    },
    
    async saveUser() {
      try {
        // Validar dados
        if (!this.editingUser.name || !this.editingUser.email) {
          alert('Por favor, preencha todos os campos obrigatórios.')
          return
        }
        
        // Preparar dados para a API
        const userData = {
          name: this.editingUser.name,
          email: this.editingUser.email,
          account_type: this.editingUser.plan || 'basic',
          status: this.editingUser.status
        }
        
        // Chamar API para atualizar usuário
        const response = await axios.put(`/api/users/${this.editingUser.id}`, userData)
        
        if (response.data.success) {
          // Recarregar lista de usuários
          await this.loadUsers()
          this.closeEditUserModal()
          alert('Usuário atualizado com sucesso!')
        } else {
          alert('Erro ao atualizar usuário: ' + (response.data.error || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        alert('Erro ao atualizar usuário: ' + (error.response?.data?.error || error.message))
      }
    },
    
    deleteUser(user) {
      this.userToDelete = user
      this.showDeleteUserModal = true
    },
    
    async confirmDeleteUser() {
      if (this.userToDelete) {
        try {
          // Chamar API para excluir usuário
          const response = await axios.delete(`/api/users/${this.userToDelete.id}`)
          
          if (response.data.success) {
            // Recarregar lista de usuários
            await this.loadUsers()
            this.closeDeleteUserModal()
            alert('Usuário excluído com sucesso!')
          } else {
            alert('Erro ao excluir usuário: ' + (response.data.error || 'Erro desconhecido'))
          }
        } catch (error) {
          console.error('Erro ao excluir usuário:', error)
          alert('Erro ao excluir usuário: ' + (error.response?.data?.error || error.message))
        }
      }
    },
    
    async toggleUserStatus(user) {
      try {
        const newStatus = user.status === 'active' ? 'inactive' : 'active'
        const statusText = newStatus === 'active' ? 'ativado' : 'desativado'
        
        // Chamar API para atualizar status
        const response = await axios.patch(`/api/users/${user.id}/status`, {
          status: newStatus
        })
        
        if (response.data.success) {
          // Atualizar status localmente
          user.status = newStatus
          alert(`Usuário ${statusText} com sucesso!`)
        } else {
          alert('Erro ao alterar status: ' + (response.data.error || 'Erro desconhecido'))
        }
      } catch (error) {
        console.error('Erro ao alterar status:', error)
        alert('Erro ao alterar status: ' + (error.response?.data?.error || error.message))
      }
    },
    
    getUserStatusText(status) {
      const statusMap = {
        active: 'Ativo',
        inactive: 'Inativo'
      }
      return statusMap[status] || status
    },
    
    getStatusText(status) {
      const statusMap = {
        open: 'Aberto',
        in_progress: 'Em Andamento',
        pending: 'Em Andamento',  // Fallback para compatibilidade
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

    getCategoryText(category) {
      const categoryMap = {
        financial: 'Financeiro',
        technical: 'Técnico',
        support: 'Suporte',
        billing: 'Cobrança',
        feature: 'Sugestão',
        other: 'Outro'
      }
      return categoryMap[category] || category
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
      // Sistema de notificação simples usando alert temporariamente
      // TODO: Implementar sistema de toast mais elegante
      if (type === 'error') {
        alert(`❌ ${message}`)
      } else if (type === 'success') {
        alert(`✅ ${message}`)
      } else {
        alert(`ℹ️ ${message}`)
      }
    },
    
    // Forçar atualização PWA para todos os usuários
    forcePWAUpdate() {
      this.showPWAForceUpdateModal = true
    },
    
    // Fechar modal de atualização PWA
    closePWAForceUpdateModal() {
      this.showPWAForceUpdateModal = false
    },
    
    // Manipular confirmação de atualização PWA
    async handlePWAForceUpdate(data) {
      if (this.updatingPWA) return
      
      try {
        this.updatingPWA = true
        
        // Chamar API para forçar atualização
        const response = await adminAPI.forcePWAUpdate({
          reason: data.reason,
          timestamp: data.timestamp,
          admin: this.currentUser?.email || 'Unknown'
        })
        
        if (response.success) {
          this.showToastNotification(
            '✅ Atualização PWA forçada com sucesso! Todos os usuários serão atualizados.',
            'success'
          )
          
          // Log da ação
          console.log('🔄 [ADMIN] Atualização PWA forçada:', {
            admin: this.currentUser?.email || 'Unknown',
            timestamp: data.timestamp,
            reason: data.reason,
            affectedUsers: response.affectedUsers || 'Unknown'
          })
        } else {
          throw new Error(response.error || 'Erro desconhecido')
        }
        
      } catch (error) {
        console.error('❌ Erro ao forçar atualização PWA:', error)
        this.showToastNotification(
          `❌ Erro ao forçar atualização PWA: ${error.response?.data?.error || error.message}`,
          'error'
        )
      } finally {
        this.updatingPWA = false
      }
    }
  }
}
</script>

<style scoped>
.admin-container {
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

/* Admin Main Content */
.admin-main {
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.refresh-btn {
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--bg-quaternary, #4a4a4a);
  transform: translateY(-1px);
}

.refresh-btn svg {
  width: 18px;
  height: 18px;
}

.new-user-btn {
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

.new-user-btn:hover {
  background: #00cc6a;
  transform: translateY(-1px);
}

.force-update-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.force-update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e55a2b, #e57a3a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.force-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.force-update-btn:disabled:hover {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  transform: none;
  box-shadow: none;
}

/* Animação de loading para o botão */
.force-update-btn:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Dashboard Stats */
.dashboard-stats {
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

.tickets-icon {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.open-icon {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.pending-icon,
.in-progress-icon {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
}

.time-icon {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #ffffff;
}

.users-icon {
  background: linear-gradient(135deg, #6f42c1, #5a32a3);
  color: #ffffff;
}

.vip-icon {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #1a1a1a;
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

/* Tabs */
.tabs-container {
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: var(--bg-primary, #1a1a1a);
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-secondary, #888888);
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #00ff88;
  border-bottom-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.tab-content {
  padding: 24px;
}

/* Users Management */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-users {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary, #a0a0a0);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-tertiary, #3a3a3a);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-users {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #888888);
}

.empty-users svg {
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-users h4 {
  font-size: 20px;
  margin: 0 0 8px 0;
}

.empty-users p {
  font-size: 14px;
  margin: 0;
}

.user-card {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.user-card:hover {
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateY(-1px);
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.user-email {
  font-size: 14px;
  color: var(--text-secondary, #888888);
}

.user-id {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-family: monospace;
}

.user-status {
  display: flex;
  align-items: center;
}

.user-content {
  margin-bottom: 16px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-plan,
.user-created {
  font-size: 12px;
  color: var(--text-secondary, #888888);
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.edit-btn:hover {
  background: rgba(0, 123, 255, 0.3);
}

.delete-btn {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
}

.activate-btn {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.activate-btn:hover {
  background: rgba(40, 167, 69, 0.3);
}

.deactivate-btn {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.deactivate-btn:hover {
  background: rgba(255, 193, 7, 0.3);
}

/* Tickets Management */
.tickets-management {
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
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
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
  border-color: #00ff88;
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

.admin-ticket {
  border-left: 4px solid transparent;
}

.admin-ticket.priority-urgent {
  border-left-color: #dc3545;
}

.admin-ticket.priority-high {
  border-left-color: #ff6b35;
}

.admin-ticket.priority-medium {
  border-left-color: #ffc107;
}

.admin-ticket.status-in_progress {
  border-left-color: #ff6b35;
}

.admin-ticket.priority-low {
  border-left-color: #6c757d;
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

.ticket-user {
  font-size: 12px;
  color: #00ff88;
  font-weight: 600;
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

.status-badge.pending,
.status-badge.in_progress {
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
.ticket-date,
.ticket-messages {
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

.ticket-detail-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.admin-modal {
  max-width: 1000px;
}

.user-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.confirmation-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
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

.modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.close-ticket-btn {
  background: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-ticket-btn:hover {
  background: #c82333;
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

/* Ticket Detail Styles */
.ticket-detail-header {
  margin-bottom: 24px;
}

.ticket-detail-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
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

.message-item.support,
.message-item.admin {
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

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
}

.form-input,
.form-select {
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
.form-select:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
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

.delete-btn {
  background: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #c82333;
}

/* Responsividade */
@media (max-width: 768px) {
  .admin-main {
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
  
  .dashboard-stats {
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
  .admin-main {
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
