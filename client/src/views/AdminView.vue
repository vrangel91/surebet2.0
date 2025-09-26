<template>
  <div class="admin-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
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
          <h2 class="page-title">Painel Administrativo</h2>
          <p class="page-subtitle">Gerenciamento de usuários e tickets</p>
        </div>
        <div class="header-actions">
          <button class="refresh-btn" @click="refreshData" title="Atualizar dados">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L7.5 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H1a7 7 0 1 1 7 7v-2a5 5 0 0 0 0-10z" />
            </svg>
          </button>

          <!-- Botão de Forçar Atualização PWA -->
          <button class="force-update-btn" @click="forcePWAUpdate" :disabled="updatingPWA"
            :title="updatingPWA ? 'Atualizando...' : 'Forçar atualização PWA para todos os usuários'">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L7.5 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H1a7 7 0 1 1 7 7v-2a5 5 0 0 0 0-10z" />
            </svg>
            {{ updatingPWA ? 'Atualizando...' : 'Forçar Atualização PWA' }}
          </button>

          <button class="new-user-btn" @click="showCreateUserModal = true">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
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
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStats.totalUsers }}</div>
              <div class="stat-label">Total de Usuários</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon vip-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStats.vipUsers }}</div>
              <div class="stat-label">Usuários VIP</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon tickets-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStats.totalTickets }}</div>
              <div class="stat-label">Total de Tickets</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon open-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
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
            <button class="tab-btn" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
              Usuários
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'tickets' }" @click="activeTab = 'tickets'">
              Tickets
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'payments' }" @click="activeTab = 'payments'">
              💳 Pagamentos
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'notifications' }"
              @click="activeTab = 'notifications'">
              📢 Notificações
            </button>
          </div>

          <!-- Users Tab -->
          <div v-if="activeTab === 'users'" class="tab-content">
            <!-- Header Section -->
            <div class="users-header">
              <div class="header-content">
                <div class="header-title">
                  <h3 class="section-title">
                    <i class="bi bi-people-fill"></i>
                    Gerenciamento de Usuários
                  </h3>
                  <p class="section-subtitle">Gerencie usuários, permissões e acessos do sistema</p>
                </div>
                <div class="header-actions">
                  <button class="btn-primary" @click="showCreateUserModal = true">
                    <i class="bi bi-person-plus-fill"></i>
                    Novo Usuário
                  </button>
                </div>
              </div>

              <!-- Filter Controls -->
              <div class="filter-controls">
                <div class="search-container">
                  <i class="bi bi-search search-icon"></i>
                  <input v-model="userSearchQuery" type="text" placeholder="Buscar por nome, email ou ID..."
                    class="search-input">
                </div>
                <div class="filter-group">
                  <select v-model="userStatusFilter" class="filter-select">
                    <option value="">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                  <select class="filter-select">
                    <option value="">Todos os Tipos</option>
                    <option value="admin">Administradores</option>
                    <option value="user">Usuários</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Users Content -->
            <div class="users-content">
              <!-- Loading State -->
              <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando usuários...</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredUsers.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-people"></i>
                </div>
                <h4>Nenhum usuário encontrado</h4>
                <p>Não há usuários que correspondam aos filtros selecionados</p>
                <button class="btn-secondary" @click="userSearchQuery = ''; userStatusFilter = ''">
                  <i class="bi bi-arrow-clockwise"></i>
                  Limpar Filtros
                </button>
              </div>

              <!-- Users Grid -->
              <div v-else class="users-grid">
                <div v-for="user in filteredUsers" :key="user.id" class="user-card">
                  <!-- User Header -->
                  <div class="user-card-header">
                    <div class="user-avatar">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="user-info">
                      <h4 class="user-name">{{ user.name }}</h4>
                      <p class="user-email">{{ user.email }}</p>
                      <span class="user-id">ID: #{{ user.id }}</span>
                    </div>
                    <div class="user-status">
                      <span class="status-badge" :class="user.status">
                        <i class="bi bi-circle-fill"></i>
                        {{ getUserStatusText(user.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- User Details -->
                  <div class="user-card-body">
                    <div class="user-details">
                      <div class="detail-item">
                        <i class="bi bi-shield-fill-check detail-icon" :class="user.role"></i>
                        <div class="detail-content">
                          <span class="detail-label">Tipo de Conta</span>
                          <span class="detail-value" :class="user.role">{{ getUserRoleText(user.role) }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <i class="bi bi-calendar-check detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Plano</span>
                          <span class="detail-value">{{ getPlanDisplayName(user.plan) || 'Sem plano' }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <i class="bi bi-clock detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Criado em</span>
                          <span class="detail-value">{{ formatDate(user.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- User Actions -->
                  <div class="user-card-footer">
                    <div class="action-buttons">
                      <button class="action-btn toggle-btn"
                        :class="user.status === 'active' ? 'deactivate-btn' : 'activate-btn'"
                        @click="toggleUserStatus(user)"
                        :title="user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'">
                        <i class="bi" :class="user.status === 'active' ? 'bi-pause-fill' : 'bi-play-fill'"></i>
                        {{ user.status === 'active' ? 'Desativar' : 'Ativar' }}
                      </button>

                      <button class="action-btn edit-btn" @click="editUser(user)" title="Editar usuário">
                        <i class="bi bi-pencil-fill"></i>
                        Editar
                      </button>

                      <button class="action-btn password-btn" @click="changePassword(user)" title="Alterar senha">
                        <i class="bi bi-key-fill"></i>
                        Senha
                      </button>

                      <button class="action-btn delete-btn" @click="deleteUser(user)" title="Excluir usuário">
                        <i class="bi bi-trash-fill"></i>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tickets Tab -->
          <div v-if="activeTab === 'tickets'" class="tab-content">
            <!-- Header Section -->
            <div class="tickets-header">
              <div class="header-content">
                <div class="header-title">
                  <h3 class="section-title">
                    <i class="bi bi-ticket-perforated-fill"></i>
                    Gerenciamento de Tickets
                  </h3>
                  <p class="section-subtitle">Monitore e gerencie todos os tickets de suporte do sistema</p>
                </div>
                <div class="header-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ filteredTickets.length }}</div>
                    <div class="stat-label">Total</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value open">{{filteredTickets.filter(t => t.status === 'open').length}}</div>
                    <div class="stat-label">Abertos</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value in-progress">{{filteredTickets.filter(t => t.status ===
                      'in_progress').length}}</div>
                    <div class="stat-label">Em Andamento</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value closed">{{filteredTickets.filter(t => t.status === 'closed').length}}</div>
                    <div class="stat-label">Fechados</div>
                  </div>
                </div>
              </div>

              <!-- Filter Controls -->
              <div class="filter-controls">
                <div class="search-container">
                  <i class="bi bi-search search-icon"></i>
                  <input v-model="searchQuery" type="text" placeholder="Buscar por ID, título ou usuário..."
                    class="search-input">
                </div>
                <div class="filter-group">
                  <select v-model="statusFilter" class="filter-select">
                    <option value="">Todos os Status</option>
                    <option value="open">Abertos</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="closed">Fechados</option>
                  </select>
                  <select v-model="priorityFilter" class="filter-select">
                    <option value="">Todas as Prioridades</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                  <select v-model="categoryFilter" class="filter-select">
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
            </div>

            <!-- Tickets Content -->
            <div class="tickets-content">
              <!-- Empty State -->
              <div v-if="filteredTickets.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-ticket-perforated"></i>
                </div>
                <h4>Nenhum ticket encontrado</h4>
                <p>Não há tickets que correspondam aos filtros selecionados</p>
                <button class="btn-secondary"
                  @click="searchQuery = ''; statusFilter = ''; priorityFilter = ''; categoryFilter = ''">
                  <i class="bi bi-arrow-clockwise"></i>
                  Limpar Filtros
                </button>
              </div>

              <!-- Tickets Grid -->
              <div v-else class="tickets-grid">
                <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card" @click="openTicket(ticket)">
                  <!-- Ticket Header -->
                  <div class="ticket-card-header">
                    <div class="ticket-avatar">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="ticket-info">
                      <h4 class="ticket-title">{{ ticket.subject }}</h4>
                      <p class="ticket-user">{{ ticket.userName }}</p>
                      <span class="ticket-id">ID: #{{ ticket.id }}</span>
                    </div>
                    <div class="ticket-status">
                      <span class="status-badge" :class="ticket.status">
                        <i class="bi bi-circle-fill"></i>
                        {{ getStatusText(ticket.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Ticket Content -->
                  <div class="ticket-card-body">
                    <div class="ticket-description">
                      <p>{{ ticket.messages?.[0]?.content ?
                        ticket.messages[0].content.substring(0, 120) + (ticket.messages[0].content.length > 120 ? '...'
                          : '') :
                        'Sem descrição' }}</p>
                    </div>
                  </div>

                  <!-- Ticket Details -->
                  <div class="ticket-details">
                    <div class="detail-item">
                      <i class="bi bi-tag detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Categoria</span>
                        <span class="detail-value">{{ getCategoryText(ticket.category) }}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <i class="bi bi-chat-dots detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Mensagens</span>
                        <span class="detail-value">{{ ticket.messages.length }}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <i class="bi bi-clock detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Criado em</span>
                        <span class="detail-value">{{ formatDate(ticket.createdAt) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Ticket Footer -->
                  <div class="ticket-card-footer">
                    <div class="priority-section">
                      <span class="priority-badge" :class="ticket.priority">
                        <i class="bi" :class="{
                          'bi-arrow-down': ticket.priority === 'low',
                          'bi-dash': ticket.priority === 'medium',
                          'bi-arrow-up': ticket.priority === 'high',
                          'bi-exclamation-triangle': ticket.priority === 'urgent'
                        }"></i>
                        {{ getPriorityText(ticket.priority) }}
                      </span>
                    </div>
                    <div class="ticket-actions">
                      <button class="action-btn view-btn" @click.stop="openTicket(ticket)" title="Ver detalhes">
                        <i class="bi bi-eye-fill"></i>
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payments Tab -->
          <div v-if="activeTab === 'payments'" class="tab-content">
            <!-- Header Section -->
            <div class="payments-header">
              <div class="header-content">
                <div class="header-title">
                  <h3 class="section-title">
                    <i class="bi bi-credit-card-fill"></i>
                    Gerenciamento de Pagamentos
                  </h3>
                  <p class="section-subtitle">Monitore e gerencie todos os pagamentos do sistema</p>
                </div>
                <div class="header-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ filteredPayments.length }}</div>
                    <div class="stat-label">Total</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value pending">{{filteredPayments.filter(p => p.status === 'pending').length}}
                    </div>
                    <div class="stat-label">Pendentes</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value approved">{{filteredPayments.filter(p => p.status === 'approved').length}}
                    </div>
                    <div class="stat-label">Aprovados</div>
                  </div>
                </div>
              </div>

              <!-- Filter Controls -->
              <div class="filter-controls">
                <div class="search-container">
                  <i class="bi bi-search search-icon"></i>
                  <input v-model="paymentSearchQuery" type="text"
                    placeholder="Buscar por usuário, email ou ID do pagamento..." class="search-input">
                </div>
                <div class="filter-group">
                  <select v-model="paymentStatusFilter" class="filter-select">
                    <option value="">Todos os Status</option>
                    <option value="approved">Aprovado</option>
                    <option value="pending">Pendente</option>
                    <option value="rejected">Rejeitado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <select v-model="paymentPlanFilter" class="filter-select">
                    <option value="">Todos os Planos</option>
                    <template v-for="(plans, category) in groupedPlans" :key="category">
                      <optgroup :label="category">
                        <option v-for="plan in plans" :key="plan.id" :value="plan.type">
                          {{ plan.display_name || plan.name }}
                        </option>
                      </optgroup>
                    </template>
                  </select>
                  <select v-model="paymentPeriodFilter" class="filter-select">
                    <option value="">Todos os Períodos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="year">Este Ano</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Payments Content -->
            <div class="payments-content">
              <!-- Loading State -->
              <div v-if="loadingPayments" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando pagamentos...</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredPayments.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-credit-card"></i>
                </div>
                <h4>Nenhum pagamento encontrado</h4>
                <p>Não há pagamentos que correspondam aos filtros selecionados</p>
                <button class="btn-secondary"
                  @click="paymentSearchQuery = ''; paymentStatusFilter = ''; paymentPlanFilter = ''; paymentPeriodFilter = ''">
                  <i class="bi bi-arrow-clockwise"></i>
                  Limpar Filtros
                </button>
              </div>

              <!-- Payments Grid -->
              <div v-else class="payments-grid">
                <div v-for="payment in filteredPayments" :key="payment.id" class="payment-card">
                  <!-- Payment Header -->
                  <div class="payment-card-header">
                    <div class="payment-avatar">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="payment-info">
                      <h4 class="payment-user">{{ payment.userName }}</h4>
                      <p class="payment-email">{{ payment.userEmail }}</p>
                      <span class="payment-id">ID: #{{ payment.id }}</span>
                    </div>
                    <div class="payment-status">
                      <span class="status-badge" :class="payment.status">
                        <i class="bi bi-circle-fill"></i>
                        {{ getPaymentStatusText(payment.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Payment Details -->
                  <div class="payment-card-body">
                    <div class="payment-details">
                      <div class="detail-item">
                        <i class="bi bi-currency-dollar detail-icon amount"></i>
                        <div class="detail-content">
                          <span class="detail-label">Valor</span>
                          <span class="detail-value amount">R$ {{ payment.amount.toFixed(2) }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <i class="bi bi-calendar-check detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Plano</span>
                          <span class="detail-value">{{ getPlanDisplayName(payment.planId) }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <i class="bi bi-credit-card detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Método</span>
                          <span class="detail-value">{{ getPaymentMethodText(payment.paymentMethod) }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <i class="bi bi-clock detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Data</span>
                          <span class="detail-value">{{ formatDate(payment.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Payment Actions -->
                  <div class="payment-card-footer">
                    <div class="action-buttons">
                      <button class="action-btn view-btn" @click="viewPaymentDetails(payment)" title="Ver detalhes">
                        <i class="bi bi-eye-fill"></i>
                        Detalhes
                      </button>

                      <button v-if="payment.status === 'pending'" class="action-btn approve-btn"
                        @click="approvePayment(payment)" title="Aprovar pagamento">
                        <i class="bi bi-check-circle-fill"></i>
                        Aprovar
                      </button>

                      <button v-if="payment.status === 'pending'" class="action-btn reject-btn"
                        @click="rejectPayment(payment)" title="Rejeitar pagamento">
                        <i class="bi bi-x-circle-fill"></i>
                        Rejeitar
                      </button>
                    </div>
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
            <button v-if="selectedTicket?.status !== 'closed'" class="close-ticket-btn" @click="closeTicket">
              Fechar Ticket
            </button>
            <button class="close-btn" @click="closeTicketDetailModal">×</button>
          </div>
        </div>

        <div class="modal-body" v-if="selectedTicket">
          <div class="ticket-detail-header">
            <div class="ticket-detail-meta">
              <span class="status-badge" :class="selectedTicket.status">{{ getStatusText(selectedTicket.status)
                }}</span>
              <span class="priority-badge" :class="selectedTicket.priority">{{ getPriorityText(selectedTicket.priority)
                }}</span>
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
              <p>{{ selectedTicket.messages?.[0]?.content || "Sem descrição" }}</p>
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
                <textarea v-model="newMessage" class="message-input"
                  placeholder="Digite sua resposta como administrador..." rows="3"></textarea>
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
              <input id="user-name" v-model="newUser.name" type="text" class="form-input" placeholder="Nome completo"
                required>
            </div>

            <div class="form-group">
              <label for="user-email">Email</label>
              <input id="user-email" v-model="newUser.email" type="email" class="form-input"
                placeholder="email@exemplo.com" required>
            </div>

            <div class="form-group">
              <label for="user-password">Senha</label>
              <input id="user-password" v-model="newUser.password" type="password" class="form-input"
                placeholder="Senha" required>
            </div>

            <div class="form-group">
              <label for="user-plan">Plano</label>
              <select id="user-plan" v-model="newUser.plan" class="form-select">
                <option value="">Sem plano</option>
                <template v-for="(plans, category) in groupedPlans" :key="category">
                  <optgroup :label="category">
                    <option v-for="plan in plans" :key="plan.id" :value="plan.type">
                      {{ plan.display_name || plan.name }}
                    </option>
                  </optgroup>
                </template>
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
              <input id="edit-user-name" v-model="editingUser.name" @input="validateField('name', $event.target.value)"
                @blur="validateField('name', $event.target.value)" type="text" class="form-input" :class="{
                  'field-valid': fieldValidation.name.isValid && fieldValidation.name.isTouched,
                  'field-invalid': !fieldValidation.name.isValid && fieldValidation.name.isTouched
                }" placeholder="Nome completo" required>
              <div v-if="validationErrors.name" class="field-error">
                {{ validationErrors.name }}
              </div>
            </div>

            <div class="form-group">
              <label for="edit-user-email">Email</label>
              <input id="edit-user-email" v-model="editingUser.email"
                @input="validateField('email', $event.target.value)" @blur="validateField('email', $event.target.value)"
                type="email" class="form-input" :class="{
                  'field-valid': fieldValidation.email.isValid && fieldValidation.email.isTouched,
                  'field-invalid': !fieldValidation.email.isValid && fieldValidation.email.isTouched
                }" placeholder="email@exemplo.com" required>
              <div v-if="validationErrors.email" class="field-error">
                {{ validationErrors.email }}
              </div>
              <div v-if="isValidatingEmail" class="field-loading">
                Validando email...
              </div>
            </div>


            <div class="form-group">
              <label for="edit-user-status">Status</label>
              <select id="edit-user-status" v-model="editingUser.status" class="form-select">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-user-role">Tipo de Conta</label>
              <select id="edit-user-role" v-model="editingUser.account_type"
                @change="validateField('account_type', $event.target.value)" class="form-select" :class="{
                  'field-valid': fieldValidation.account_type.isValid && fieldValidation.account_type.isTouched,
                  'field-invalid': !fieldValidation.account_type.isValid && fieldValidation.account_type.isTouched
                }">
                <option value="">Selecione o tipo de conta</option>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              <div v-if="validationErrors.account_type" class="field-error">
                {{ validationErrors.account_type }}
              </div>
              <small class="form-help">
                <strong>Usuário:</strong> Acesso padrão ao sistema<br>
                <strong>Administrador:</strong> Acesso completo ao sistema
              </small>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeEditUserModal" :disabled="isSaving">
                Cancelar
              </button>
              <button type="submit" class="submit-btn" :disabled="!isFormValid()" :class="{ 'loading': isSaving }">
                <span v-if="isSaving" class="loading-spinner-small"></span>
                {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePasswordModal">
      <div class="user-modal" @click.stop>
        <div class="modal-header">
          <h3>Alterar Senha</h3>
          <button class="close-btn" @click="closeChangePasswordModal">×</button>
        </div>

        <div class="modal-body">
          <div class="password-user-info">
            <p><strong>Usuário:</strong> {{ userToChangePassword?.name || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ userToChangePassword?.email || 'N/A' }}</p>
            <p><strong>ID:</strong> {{ userToChangePassword?.id || 'N/A' }}</p>
          </div>

          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label for="new-password">Nova Senha</label>
              <input id="new-password" v-model="newPassword" type="password" class="form-input" :class="{
                'field-valid': passwordValidation.isValid && passwordValidation.isTouched,
                'field-invalid': !passwordValidation.isValid && passwordValidation.isTouched
              }" placeholder="Digite a nova senha" required @input="validatePassword" @blur="validatePassword">
              <div v-if="passwordValidation.error" class="field-error">
                {{ passwordValidation.error }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password">Confirmar Nova Senha</label>
              <input id="confirm-password" v-model="confirmPassword" type="password" class="form-input" :class="{
                'field-valid': confirmPasswordValidation.isValid && confirmPasswordValidation.isTouched,
                'field-invalid': !confirmPasswordValidation.isValid && confirmPasswordValidation.isTouched
              }" placeholder="Confirme a nova senha" required @input="validateConfirmPassword"
                @blur="validateConfirmPassword">
              <div v-if="confirmPasswordValidation.error" class="field-error">
                {{ confirmPasswordValidation.error }}
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeChangePasswordModal" :disabled="isUpdatingPassword">
                Cancelar
              </button>
              <button type="submit" class="submit-btn" :disabled="!isPasswordFormValid()"
                :class="{ 'loading': isUpdatingPassword }">
                <span v-if="isUpdatingPassword" class="loading-spinner-small"></span>
                {{ isUpdatingPassword ? 'Alterando...' : 'Alterar Senha' }}
              </button>
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

    <!-- Payment Details Modal -->
    <div v-if="showPaymentDetailModal" class="modal-overlay" @click="closePaymentDetailModal">
      <div class="payment-detail-modal admin-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-title">
              <i class="bi bi-credit-card-fill"></i>
              <h3>Detalhes do Pagamento #{{ selectedPayment?.id }}</h3>
            </div>
            <button class="close-btn" @click="closePaymentDetailModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div class="modal-body" v-if="selectedPayment">
          <!-- Payment Status Banner -->
          <div class="payment-status-banner" :class="selectedPayment.status">
            <div class="status-content">
              <div class="status-icon">
                <i class="bi" :class="{
                  'bi-check-circle-fill': selectedPayment.status === 'approved',
                  'bi-clock-fill': selectedPayment.status === 'pending',
                  'bi-x-circle-fill': selectedPayment.status === 'rejected',
                  'bi-dash-circle-fill': selectedPayment.status === 'cancelled'
                }"></i>
              </div>
              <div class="status-info">
                <h4 class="status-title">{{ getPaymentStatusText(selectedPayment.status) }}</h4>
                <p class="status-description">{{ getPaymentStatusDescription(selectedPayment.status) }}</p>
              </div>
              <div class="status-amount">
                <span class="amount-value">R$ {{ selectedPayment.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Details Grid -->
          <div class="payment-details-grid">
            <div class="detail-section">
              <h4 class="section-title">
                <i class="bi bi-person-fill"></i>
                Informações do Usuário
              </h4>
              <div class="detail-items">
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-person"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Nome</span>
                    <span class="detail-value">{{ selectedPayment.userName }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-envelope"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">{{ selectedPayment.userEmail }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="section-title">
                <i class="bi bi-credit-card-fill"></i>
                Informações do Pagamento
              </h4>
              <div class="detail-items">
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-currency-dollar"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Valor</span>
                    <span class="detail-value amount">R$ {{ selectedPayment.amount.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-calendar-check"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Plano</span>
                    <span class="detail-value">{{ getPlanDisplayName(selectedPayment.planId) }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-credit-card"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Método</span>
                    <span class="detail-value">{{ getPaymentMethodText(selectedPayment.paymentMethod) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="selectedPayment.paymentId">
                  <div class="detail-icon">
                    <i class="bi bi-hash"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">ID do Pagamento</span>
                    <span class="detail-value">{{ selectedPayment.paymentId }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="selectedPayment.description">
                  <div class="detail-icon">
                    <i class="bi bi-file-text"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Descrição</span>
                    <span class="detail-value">{{ selectedPayment.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="section-title">
                <i class="bi bi-clock-fill"></i>
                Informações Temporais
              </h4>
              <div class="detail-items">
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="bi bi-calendar-plus"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Data de Criação</span>
                    <span class="detail-value">{{ formatDate(selectedPayment.createdAt) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="selectedPayment.expiresAt">
                  <div class="detail-icon">
                    <i class="bi bi-calendar-x"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Expira em</span>
                    <span class="detail-value">{{ formatDate(selectedPayment.expiresAt) }}</span>
                  </div>
                </div>
                <div class="detail-item"
                  v-if="selectedPayment.updatedAt && selectedPayment.updatedAt !== selectedPayment.createdAt">
                  <div class="detail-icon">
                    <i class="bi bi-arrow-clockwise"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Última Atualização</span>
                    <span class="detail-value">{{ formatDate(selectedPayment.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="modal-footer" v-if="selectedPayment.status === 'pending'">
            <div class="action-buttons">
              <button class="btn-approve" @click="approvePayment(selectedPayment)">
                <i class="bi bi-check-circle-fill"></i>
                Aprovar Pagamento
              </button>
              <button class="btn-reject" @click="rejectPayment(selectedPayment)">
                <i class="bi bi-x-circle-fill"></i>
                Rejeitar Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PWA Force Update Modal -->
    <PWAForceUpdateModal :show="showPWAForceUpdateModal" @close="closePWAForceUpdateModal"
      @confirm="handlePWAForceUpdate" />

    <!-- Glossary Modal -->

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script>
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'
import PWAForceUpdateModal from '../components/PWA/PWAForceUpdateModal.vue'
import AdminNotificationPanel from '../components/Admin/AdminNotificationPanel.vue'
import ToastContainer from '../components/UI/ToastContainer.vue'

import { mapGetters } from 'vuex'
import { adminAPI } from '@/api/admin'
import axios from '@/utils/axios'
import { useToast } from '@/composables/useToast'

export default {
  name: 'AdminView',
  components: {
    Sidebar,
    Header,
    PWAForceUpdateModal,
    AdminNotificationPanel,
    ToastContainer
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
      showChangePasswordModal: false,
      showPWAForceUpdateModal: false,
      showPaymentDetailModal: false,
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
      userToChangePassword: null,
      newPassword: '',
      confirmPassword: '',
      isUpdatingPassword: false,

      // Payment management
      paymentSearchQuery: '',
      paymentPlanFilter: '',
      paymentStatusFilter: '',
      paymentPeriodFilter: '',
      selectedPayment: null,
      payments: [],
      loadingPayments: false,

      newUser: {
        name: '',
        email: '',
        password: '',
        plan: ''
      },

      editingUser: {
        name: '',
        email: '',
        status: 'active',
        account_type: 'user'
      },

      // Estados de validação
      validationErrors: {
        name: '',
        email: '',
        account_type: ''
      },

      // Estados de loading
      isSaving: false,
      isValidatingEmail: false,

      // Estados de validação em tempo real
      fieldValidation: {
        name: { isValid: false, isTouched: false },
        email: { isValid: false, isTouched: false },
        account_type: { isValid: false, isTouched: false }
      },

      // Validações de senha
      passwordValidation: {
        isValid: false,
        isTouched: false,
        error: ''
      },
      confirmPasswordValidation: {
        isValid: false,
        isTouched: false,
        error: ''
      },

      // Dados dos usuários carregados do banco
      users: [],
      loading: false,

      tickets: [],

      // Sistema de planos
      plans: [],

      // Estado da atualização PWA
      updatingPWA: false
    }
  },

  computed: {
    ...mapGetters([
      'currentUser',
      'isAdmin',
      'allPlans',
      'plansLoaded'
    ]),

    // Planos agrupados por categoria para os modais
    groupedPlans() {
      if (!this.plansLoaded && !this.plans.length) {
        return {}
      }

      const plansData = this.plansLoaded ? this.allPlans : this.plans

      return plansData.reduce((groups, plan) => {
        const category = plan.category || 'Outros'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(plan)
        return groups
      }, {})
    },

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
    },

    filteredPayments() {
      let filtered = this.payments

      // Filtro por plano
      if (this.paymentPlanFilter) {
        filtered = filtered.filter(payment => payment.planId === this.paymentPlanFilter)
      }

      // Filtro por status
      if (this.paymentStatusFilter) {
        filtered = filtered.filter(payment => payment.status === this.paymentStatusFilter)
      }

      // Filtro por período
      if (this.paymentPeriodFilter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.createdAt)

          switch (this.paymentPeriodFilter) {
            case 'today':
              return paymentDate >= today
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return paymentDate >= weekAgo
            case 'month':
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
              return paymentDate >= monthAgo
            case 'year':
              const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
              return paymentDate >= yearAgo
            default:
              return true
          }
        })
      }

      // Filtro por busca
      if (this.paymentSearchQuery) {
        const query = this.paymentSearchQuery.toLowerCase()
        filtered = filtered.filter(payment =>
          payment.id.toString().includes(query) ||
          payment.userName.toLowerCase().includes(query) ||
          payment.userEmail.toLowerCase().includes(query) ||
          (payment.paymentId && payment.paymentId.toLowerCase().includes(query))
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
        console.log('📊 Propriedades da resposta:', response.data ? Object.keys(response.data) : 'response.data é null/undefined')

        // Verificar se a resposta tem a estrutura esperada
        if (response.data && response.data.success && Array.isArray(response.data.users)) {
          this.users = response.data.users.map(user => ({
            id: user.id,
            name: user.name || user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuário',
            email: user.email,
            status: user.status, // Não definir valor padrão - usar exatamente o que vem do banco
            plan: user.plan || user.account_type || '', // Priorizar plan sobre account_type
            account_type: user.account_type || 'user', // Manter para compatibilidade com sistema de planos
            role: user.role || (user.is_admin ? 'admin' : 'user'), // Usar role baseado em is_admin
            is_admin: user.is_admin, // Campo principal para funcionalidades administrativas
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
        console.log('📊 Propriedades da resposta tickets:', response.data ? Object.keys(response.data) : 'response.data é null/undefined')

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

    // Carregar pagamentos do banco de dados
    async loadPayments() {
      console.log('🔍 Carregando pagamentos...')
      this.loadingPayments = true
      try {
        const response = await axios.get('/api/admin/payments')
        console.log('📊 Resposta da API pagamentos:', response.data)

        if (response.data && response.data.success && Array.isArray(response.data.payments)) {
          this.payments = response.data.payments.map(payment => ({
            id: payment.id,
            userId: payment.user_id,
            userName: payment.user_name || payment.userName || 'Usuário',
            userEmail: payment.user_email || payment.userEmail || '',
            planId: payment.plan_id || payment.planId || '',
            amount: parseFloat(payment.amount) || 0,
            status: payment.status || 'pending',
            paymentMethod: payment.payment_method || payment.paymentMethod || 'pix',
            paymentId: payment.payment_id || payment.paymentId || '',
            description: payment.description || '',
            createdAt: payment.created_at || payment.createdAt || new Date().toISOString(),
            expiresAt: payment.expires_at || payment.expiresAt || null
          }))
          console.log('✅ Pagamentos carregados:', this.payments.length)
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response.data)
          this.payments = []
        }
      } catch (error) {
        console.error('❌ Erro ao carregar pagamentos:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
        this.payments = []
      } finally {
        this.loadingPayments = false
      }
    },

    // Carregar planos do banco de dados
    async loadPlans() {
      console.log('🔍 Carregando planos...')
      try {
        // Se os planos já estão carregados no store, usar eles
        if (this.$store.getters.plansLoaded) {
          this.plans = this.$store.getters.allPlans
          console.log('✅ Planos carregados do store:', this.plans.length)
          return
        }

        // Caso contrário, carregar do banco
        const response = await axios.get('/api/plans')
        console.log('📊 Resposta da API planos:', response.data)

        if (response.data && response.data.success && Array.isArray(response.data.plans)) {
          this.plans = response.data.plans
          // Atualizar store também
          this.$store.dispatch('setPlans', response.data.plans)
          console.log('✅ Planos carregados:', this.plans.length)
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response.data)
          this.plans = []
        }
      } catch (error) {
        console.error('❌ Erro ao carregar planos:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
        this.plans = []
      }
    },

    // Atualizar dados
    async refreshData() {
      console.log('🔄 Iniciando refreshData...')
      try {
        await Promise.all([
          this.loadUsers(),
          this.loadTickets(),
          this.loadPayments(),
          this.loadPlans()
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
        status: 'active',
        account_type: 'user'
      }
      // Limpar estados de validação
      this.clearValidationStates()
    },

    // Limpar estados de validação
    clearValidationStates() {
      this.validationErrors = {
        name: '',
        email: '',
        account_type: ''
      }
      this.fieldValidation = {
        name: { isValid: false, isTouched: false },
        email: { isValid: false, isTouched: false },
        account_type: { isValid: false, isTouched: false }
      }
      this.isSaving = false
      this.isValidatingEmail = false
    },

    closeDeleteUserModal() {
      this.showDeleteUserModal = false
      this.userToDelete = null
    },

    // Métodos para alteração de senha
    changePassword(user) {
      // Verificar se o usuário é válido
      if (!user || !user.id) {
        this.showToastNotification('Erro: Usuário inválido selecionado', 'error')
        return
      }

      console.log('🔐 [ADMIN] Alterando senha para usuário:', user)

      this.userToChangePassword = { ...user } // Criar uma cópia para evitar referência
      this.newPassword = ''
      this.confirmPassword = ''
      this.resetPasswordValidation()
      this.showChangePasswordModal = true
    },

    closeChangePasswordModal() {
      console.log('🔐 [ADMIN] Fechando modal de alteração de senha...')
      this.showChangePasswordModal = false
      this.userToChangePassword = null
      this.newPassword = ''
      this.confirmPassword = ''
      this.resetPasswordValidation()
      this.isUpdatingPassword = false // Garantir que o estado seja limpo
    },

    resetPasswordValidation() {
      this.passwordValidation = {
        isValid: false,
        isTouched: false,
        error: ''
      }
      this.confirmPasswordValidation = {
        isValid: false,
        isTouched: false,
        error: ''
      }
    },

    validatePassword() {
      this.passwordValidation.isTouched = true

      if (!this.newPassword || this.newPassword.length < 6) {
        this.passwordValidation.error = 'A senha deve ter pelo menos 6 caracteres'
        this.passwordValidation.isValid = false
      } else if (this.newPassword.length > 50) {
        this.passwordValidation.error = 'A senha deve ter no máximo 50 caracteres'
        this.passwordValidation.isValid = false
      } else {
        this.passwordValidation.error = ''
        this.passwordValidation.isValid = true
      }

      // Revalidar confirmação se já foi tocada
      if (this.confirmPasswordValidation.isTouched) {
        this.validateConfirmPassword()
      }
    },

    validateConfirmPassword() {
      this.confirmPasswordValidation.isTouched = true

      if (!this.confirmPassword) {
        this.confirmPasswordValidation.error = 'Confirme a senha'
        this.confirmPasswordValidation.isValid = false
      } else if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordValidation.error = 'As senhas não coincidem'
        this.confirmPasswordValidation.isValid = false
      } else {
        this.confirmPasswordValidation.error = ''
        this.confirmPasswordValidation.isValid = true
      }
    },

    isPasswordFormValid() {
      return this.passwordValidation.isValid &&
        this.confirmPasswordValidation.isValid &&
        !this.isUpdatingPassword
    },

    async updatePassword() {
      try {
        // Verificar se o usuário está definido
        if (!this.userToChangePassword || !this.userToChangePassword.id) {
          this.showToastNotification('Erro: Usuário não selecionado. Feche o modal e tente novamente.', 'error')
          this.closeChangePasswordModal()
          return
        }

        // Validar formulário
        this.validatePassword()
        this.validateConfirmPassword()

        if (!this.isPasswordFormValid()) {
          this.showToastNotification('Por favor, corrija os erros nos campos de senha', 'error')
          return
        }

        if (this.isUpdatingPassword) {
          return
        }

        this.isUpdatingPassword = true

        // Chamar API para alterar senha
        console.log('🔐 [ADMIN] Enviando requisição de alteração de senha...')
        const response = await axios.patch(`/api/users/${this.userToChangePassword.id}/password`, {
          newPassword: this.newPassword
        })

        console.log('🔐 [ADMIN] Resposta da API:', response.data)
        console.log('🔐 [ADMIN] Status da resposta:', response.status)

        if (response.data.success) {
          // Log da ação para auditoria
          console.log('✅ [ADMIN] Senha alterada:', {
            userId: this.userToChangePassword.id,
            userName: this.userToChangePassword.name,
            admin: this.currentUser?.email || 'Unknown',
            timestamp: new Date().toISOString()
          })

          // Fechar modal primeiro
          this.closeChangePasswordModal()

          // Mostrar notificação de sucesso
          this.showToastNotification('Senha alterada com sucesso!', 'success')
        } else {
          this.showToastNotification('Erro ao alterar senha: ' + (response.data.error || 'Erro desconhecido'), 'error')
        }
      } catch (error) {
        console.error('Erro ao alterar senha:', error)

        let errorMessage = 'Erro ao alterar senha. Tente novamente.'

        if (error.response?.status === 404) {
          errorMessage = 'Usuário não encontrado.'
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        }

        this.showToastNotification(errorMessage, 'error')
      } finally {
        this.isUpdatingPassword = false
      }
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
          account_type: 'user', // Sempre criar como 'user' por padrão
          plan: this.newUser.plan || '', // Campo separado para plano
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
        status: user.status,
        account_type: user.role || (user.is_admin ? 'admin' : 'user')
      }
      console.log('Frontend: Editando usuário:', this.editingUser)
      console.log('Frontend: User role:', user.role, 'User is_admin:', user.is_admin)

      // Limpar estados de validação e validar campos iniciais
      this.clearValidationStates()
      this.validateAllFields()

      this.showEditUserModal = true
    },

    // Validação em tempo real
    validateField(fieldName, value) {
      this.fieldValidation[fieldName].isTouched = true

      switch (fieldName) {
        case 'name':
          if (!value || value.trim().length < 2) {
            this.validationErrors.name = 'Nome deve ter pelo menos 2 caracteres'
            this.fieldValidation.name.isValid = false
          } else {
            this.validationErrors.name = ''
            this.fieldValidation.name.isValid = true
          }
          break

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!value || !emailRegex.test(value)) {
            this.validationErrors.email = 'Email deve ter um formato válido'
            this.fieldValidation.email.isValid = false
          } else {
            this.validationErrors.email = ''
            this.fieldValidation.email.isValid = true
            // Validar se email já existe (exceto para o próprio usuário)
            this.validateEmailUniqueness(value)
          }
          break

        case 'account_type':
          if (!value) {
            this.validationErrors.account_type = 'Tipo de conta é obrigatório'
            this.fieldValidation.account_type.isValid = false
          } else {
            this.validationErrors.account_type = ''
            this.fieldValidation.account_type.isValid = true
          }
          break
      }
    },

    // Validar se email já existe
    async validateEmailUniqueness(email) {
      if (!email || this.isValidatingEmail) return

      this.isValidatingEmail = true
      try {
        // Verificar se o email já existe (exceto para o usuário atual)
        const existingUser = this.users.find(user =>
          user.email.toLowerCase() === email.toLowerCase() &&
          user.id !== this.editingUser.id
        )

        if (existingUser) {
          this.validationErrors.email = 'Este email já está sendo usado por outro usuário'
          this.fieldValidation.email.isValid = false
        } else {
          this.validationErrors.email = ''
          this.fieldValidation.email.isValid = true
        }
      } catch (error) {
        console.error('Erro ao validar email:', error)
      } finally {
        this.isValidatingEmail = false
      }
    },

    // Validar todos os campos
    validateAllFields() {
      this.validateField('name', this.editingUser.name)
      this.validateField('email', this.editingUser.email)
      this.validateField('account_type', this.editingUser.account_type)
    },

    // Verificar se todos os campos obrigatórios são válidos
    isFormValid() {
      return this.fieldValidation.name.isValid &&
        this.fieldValidation.email.isValid &&
        this.fieldValidation.account_type.isValid &&
        !this.isSaving
    },

    async saveUser() {
      try {
        // Validar todos os campos antes de enviar
        this.validateAllFields()

        // Verificar se o formulário é válido
        if (!this.isFormValid()) {
          this.showToastNotification('Por favor, corrija os erros nos campos obrigatórios', 'error')
          return
        }

        // Verificar se está salvando
        if (this.isSaving) {
          return
        }

        this.isSaving = true

        // Preparar dados para a API
        const userData = {
          name: this.editingUser.name.trim(),
          email: this.editingUser.email.toLowerCase().trim(),
          account_type: this.editingUser.account_type || 'user', // Mantido para compatibilidade com API
          status: this.editingUser.status
        }

        console.log('Frontend: Dados sendo enviados para atualização:', userData)

        // Chamar API para atualizar usuário
        const response = await axios.put(`/api/users/${this.editingUser.id}`, userData)

        if (response.data.success) {
          // Recarregar lista de usuários
          await this.loadUsers()
          this.closeEditUserModal()
          this.showToastNotification('Usuário atualizado com sucesso!', 'success')

          // Log da ação para auditoria
          console.log('✅ [ADMIN] Usuário atualizado:', {
            userId: this.editingUser.id,
            admin: this.currentUser?.email || 'Unknown',
            timestamp: new Date().toISOString(),
            changes: userData
          })
        } else {
          this.showToastNotification('Erro ao atualizar usuário: ' + (response.data.error || 'Erro desconhecido'), 'error')
        }
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)

        // Tratar diferentes tipos de erro
        let errorMessage = 'Erro ao atualizar usuário. Tente novamente.'

        if (error.response?.status === 409) {
          errorMessage = 'Este email já está sendo usado por outro usuário.'
        } else if (error.response?.status === 404) {
          errorMessage = 'Usuário não encontrado.'
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        }

        this.showToastNotification(errorMessage, 'error')
      } finally {
        this.isSaving = false
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

    getUserRoleText(role) {
      const roleMap = {
        user: 'Usuário',
        admin: 'Admin',
        moderator: 'Moderador'
      }
      return roleMap[role] || 'Usuário'
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

    // Payment management methods
    viewPaymentDetails(payment) {
      this.selectedPayment = payment
      this.showPaymentDetailModal = true
    },

    closePaymentDetailModal() {
      this.showPaymentDetailModal = false
      this.selectedPayment = null
    },

    async approvePayment(payment) {
      if (!confirm(`Tem certeza que deseja aprovar o pagamento #${payment.id} de ${payment.userName}?`)) {
        return
      }

      try {
        const response = await axios.patch(`/api/admin/payments/${payment.id}/approve`)

        if (response.data.success) {
          payment.status = 'approved'
          this.showToastNotification('Pagamento aprovado com sucesso!', 'success')
          await this.loadPayments() // Recarregar lista
        } else {
          this.showToastNotification('Erro ao aprovar pagamento', 'error')
        }
      } catch (error) {
        console.error('Erro ao aprovar pagamento:', error)
        this.showToastNotification('Erro ao aprovar pagamento', 'error')
      }
    },

    async rejectPayment(payment) {
      if (!confirm(`Tem certeza que deseja rejeitar o pagamento #${payment.id} de ${payment.userName}?`)) {
        return
      }

      try {
        const response = await axios.patch(`/api/admin/payments/${payment.id}/reject`)

        if (response.data.success) {
          payment.status = 'rejected'
          this.showToastNotification('Pagamento rejeitado com sucesso!', 'success')
          await this.loadPayments() // Recarregar lista
        } else {
          this.showToastNotification('Erro ao rejeitar pagamento', 'error')
        }
      } catch (error) {
        console.error('Erro ao rejeitar pagamento:', error)
        this.showToastNotification('Erro ao rejeitar pagamento', 'error')
      }
    },

    getPaymentStatusText(status) {
      const statusMap = {
        approved: 'Aprovado',
        pending: 'Pendente',
        rejected: 'Rejeitado',
        cancelled: 'Cancelado'
      }
      return statusMap[status] || status
    },

    getPaymentMethodText(method) {
      const methodMap = {
        pix: 'PIX',
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        boleto: 'Boleto',
        manual: 'Manual'
      }
      return methodMap[method] || method
    },

    getPaymentStatusDescription(status) {
      const descriptionMap = {
        approved: 'Pagamento aprovado e processado com sucesso',
        pending: 'Aguardando aprovação administrativa',
        rejected: 'Pagamento rejeitado pelo administrador',
        cancelled: 'Pagamento cancelado pelo usuário'
      }
      return descriptionMap[status] || 'Status não definido'
    },

    getPlanDisplayName(planId) {
      // Prioridade 1: Store Vuex (dados mais atualizados)
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByType(planId) || this.$store.getters.getPlanById(planId)
        if (plan) {
          return plan.display_name || plan.name || planId
        }
      }

      // Prioridade 2: Dados locais do componente
      if (this.plans.length > 0) {
        const plan = this.plans.find(p => p.type === planId || p.id === planId)
        if (plan) {
          return plan.display_name || plan.name || planId
        }
      }

      // Prioridade 3: Fallback para mapeamento hardcoded (compatibilidade)
      const planNames = {
        'basic': 'Plano Básico',
        'premium': 'Plano Premium',
        'vip': 'Plano VIP',
        'pre-daily': 'Pré-Jogo Diário',
        'pre-weekly': 'Pré-Jogo Semanal',
        'pre-monthly': 'Pré-Jogo Mensal',
        'pre-yearly': 'Pré-Jogo Anual',
        'live-daily': 'Live Diário',
        'live-weekly': 'Live Semanal',
        'live-monthly': 'Live Mensal',
        'live-yearly': 'Live Anual',
        'prelive-daily': 'Pré+Live Diário',
        'prelive-weekly': 'Pré+Live Semanal',
        'prelive-monthly': 'Pré+Live Mensal',
        'prelive-yearly': 'Pré+Live Anual',
        'valuebet-daily': 'Valuebet Diário',
        'valuebet-weekly': 'Valuebet Semanal',
        'valuebet-monthly': 'Valuebet Mensal',
        'valuebet-yearly': 'Valuebet Anual',
        'full-daily': 'Full Diário',
        'full-weekly': 'Full Semanal',
        'full-monthly': 'Full Mensal',
        'full-yearly': 'Full Anual'
      }
      return planNames[planId] || planId || 'Plano Desconhecido'
    },

    // Funções auxiliares para mapeamento de planos (atualizadas para usar dados dinâmicos)
    getPlanId(planType) {
      // Prioridade 1: Store Vuex
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByType(planType)
        if (plan) {
          return plan.id
        }
      }

      // Prioridade 2: Dados locais
      if (this.plans.length > 0) {
        const plan = this.plans.find(p => p.type === planType)
        if (plan) {
          return plan.id
        }
      }

      // Prioridade 3: Fallback hardcoded
      const planIdMap = {
        'basic': 1,
        'premium': 2,
        'vip': 3,
        'pre-daily': 4,
        'pre-weekly': 5,
        'pre-monthly': 6,
        'pre-yearly': 7,
        'live-daily': 8,
        'live-weekly': 9,
        'live-monthly': 10,
        'live-yearly': 11,
        'prelive-daily': 12,
        'prelive-weekly': 13,
        'prelive-monthly': 14,
        'prelive-yearly': 15,
        'valuebet-daily': 16,
        'valuebet-weekly': 17,
        'valuebet-monthly': 18,
        'valuebet-yearly': 19,
        'full-daily': 20,
        'full-weekly': 21,
        'full-monthly': 22,
        'full-yearly': 23
      }
      return planIdMap[planType] || 2 // Default para premium
    },

    getPlanTypeFromName(planName) {
      // Prioridade 1: Store Vuex
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByName(planName)
        if (plan) {
          return plan.type
        }
      }

      // Prioridade 2: Dados locais
      if (this.plans.length > 0) {
        const plan = this.plans.find(p =>
          p.display_name === planName ||
          p.name === planName ||
          p.type === planName
        )
        if (plan) {
          return plan.type
        }
      }

      // Prioridade 3: Fallback hardcoded
      const nameToTypeMap = {
        'Plano Básico': 'basic',
        'Plano Premium': 'premium',
        'Plano VIP': 'vip',
        'Pré-Jogo Diário': 'pre-daily',
        'Pré-Jogo Semanal': 'pre-weekly',
        'Pré-Jogo Mensal': 'pre-monthly',
        'Pré-Jogo Anual': 'pre-yearly',
        'Live Diário': 'live-daily',
        'Live Semanal': 'live-weekly',
        'Live Mensal': 'live-monthly',
        'Live Anual': 'live-yearly',
        'Pré+Live Diário': 'prelive-daily',
        'Pré+Live Semanal': 'prelive-weekly',
        'Pré+Live Mensal': 'prelive-monthly',
        'Pré+Live Anual': 'prelive-yearly',
        'Valuebet Diário': 'valuebet-daily',
        'Valuebet Semanal': 'valuebet-weekly',
        'Valuebet Mensal': 'valuebet-monthly',
        'Valuebet Anual': 'valuebet-yearly',
        'Full Diário': 'full-daily',
        'Full Semanal': 'full-weekly',
        'Full Mensal': 'full-monthly',
        'Full Anual': 'full-yearly'
      }
      return nameToTypeMap[planName] || 'premium'
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

      // Log da notificação
      console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`)
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
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease, width 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100% - 280px);
  margin-left: 280px;
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
  }
}

/* Responsividade para diferentes tamanhos de tela */
@media (max-width: 1200px) {
  .admin-container {
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
    margin-left: 80px;

    &.sidebar-collapsed {
      width: calc(100% - 80px);
      max-width: calc(100% - 80px);
      margin-left: 80px;
    }
  }
}

@media (max-width: 1024px) {
  .admin-container {
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
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 24px;
    gap: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px 20px;
    gap: 16px;
  }
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
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
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
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
  }
}

.new-user-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.force-update-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--warning), var(--warning-light));
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
  }
}

.force-update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--warning-dark), var(--warning));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--warning-shadow);
}

.force-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.force-update-btn:disabled:hover {
  background: linear-gradient(135deg, var(--warning), var(--warning-light));
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
  background: linear-gradient(90deg, transparent, var(--text-primary-alpha), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* Dashboard Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
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

  @media (max-width: 768px) {
    padding: 20px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
    flex-direction: column;
    text-align: center;
  }
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-primary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.tickets-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
}

.open-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
}

.pending-icon,
.in-progress-icon {
  background: linear-gradient(135deg, var(--warning), var(--warning-light));
  color: var(--text-primary);
}

.time-icon {
  background: linear-gradient(135deg, var(--info), var(--info-dark));
  color: var(--text-primary);
}

.users-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
}

.vip-icon {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #888888);

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
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
  overflow-x: auto;
  overflow-y: hidden;

  /* Scrollbar personalizada para as tabs */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }
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
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }
}

.tab-btn:hover {
  color: var(--text-primary, #ffffff);
  background: var(--text-primary-alpha-light);
}

.tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  background: var(--accent-light);
}

.tab-content {
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
}

/* Users Management - Professional Design */
.users-header {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.header-title {
  flex: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-title i {
  color: var(--accent-primary);
  font-size: 20px;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);
}

.btn-primary:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-button-hover);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-alpha);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-alpha);
}

.users-content {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
  margin-bottom: 20px;
}

.empty-icon i {
  font-size: 32px;
  color: var(--text-disabled);
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.user-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--warning), var(--accent-primary));
  background-size: 200% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.user-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.user-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-alpha);
  border-radius: 50%;
  flex-shrink: 0;
}

.user-avatar i {
  font-size: 20px;
  color: var(--accent-primary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-id {
  font-size: 11px;
  color: var(--text-disabled);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.user-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: var(--success-alpha);
  color: var(--success);
  border: 1px solid var(--success);
}

.status-badge.inactive {
  background: var(--error-alpha);
  color: var(--error);
  border: 1px solid var(--error);
}

.status-badge i {
  font-size: 8px;
}

.user-card-body {
  padding: 16px 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.detail-icon.admin {
  background: var(--accent-alpha);
  color: var(--accent-primary);
}

.detail-icon.user {
  background: var(--info-alpha);
  color: var(--info);
}

.detail-icon:not(.admin):not(.user) {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value.admin {
  color: var(--accent-primary);
}

.detail-value.user {
  color: var(--info);
}

.user-card-footer {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.toggle-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.toggle-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

.activate-btn {
  background: var(--success-alpha);
  color: var(--success);
  border: 1px solid var(--success);
}

.activate-btn:hover {
  background: var(--success);
  color: var(--bg-primary);
}

.deactivate-btn {
  background: var(--warning-alpha);
  color: var(--warning);
  border: 1px solid var(--warning);
}

.deactivate-btn:hover {
  background: var(--warning);
  color: var(--bg-primary);
}

.edit-btn {
  background: var(--info-alpha);
  color: var(--info);
  border: 1px solid var(--info);
}

.edit-btn:hover {
  background: var(--info);
  color: var(--bg-primary);
}

.password-btn {
  background: var(--accent-alpha);
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.password-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.delete-btn {
  background: var(--error-alpha);
  color: var(--error);
  border: 1px solid var(--error);
}

.delete-btn:hover {
  background: var(--error);
  color: var(--bg-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .users-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .btn-primary {
    flex: 1;
    justify-content: center;
  }

  .filter-controls {
    flex-direction: column;
    gap: 12px;
  }

  .search-container {
    min-width: auto;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-select {
    min-width: auto;
  }

  .users-content {
    padding: 20px;
  }

  .users-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .user-card-header {
    padding: 16px 16px 12px 16px;
  }

  .user-card-body {
    padding: 12px 16px;
  }

  .user-card-footer {
    padding: 12px 16px 16px 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    flex: none;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .users-header {
    padding: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .users-content {
    padding: 16px;
  }

  .user-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px 16px 12px 16px;
  }

  .user-info {
    text-align: center;
  }

  .user-status {
    align-self: center;
  }

  .user-avatar {
    align-self: center;
  }
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
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
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
  width: 100%;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }
}

.search-input {
  min-width: 200px;
  cursor: text;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
}

.search-input:focus,
.status-filter:focus,
.priority-filter:focus,
.category-filter:focus {
  outline: none;
  border-color: var(--accent-primary);
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

/* Tickets Tab - Professional Design */
.tickets-header {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
}

.header-title {
  flex: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.section-title i {
  color: var(--accent-primary);
  font-size: 22px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.header-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  min-width: 60px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.stat-value.open {
  color: var(--warning);
}

.stat-value.in-progress {
  color: var(--accent-primary);
}

.stat-value.closed {
  color: var(--success);
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-alpha);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  min-width: 140px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-alpha);
}

.tickets-content {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  color: var(--text-disabled);
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state h4 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--accent-alpha);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-1px);
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.ticket-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ticket-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary), var(--warning), var(--accent-primary));
  background-size: 200% 100%;
  animation: ticketGradient 3s ease-in-out infinite;
}

@keyframes ticketGradient {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.ticket-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.ticket-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.ticket-avatar {
  width: 40px;
  height: 40px;
  background: var(--accent-alpha);
  border: 1px solid var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.ticket-info {
  flex: 1;
  min-width: 0;
}

.ticket-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-user {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  font-weight: 500;
}

.ticket-id {
  font-size: 11px;
  color: var(--text-disabled);
  font-weight: 500;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.ticket-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.status-badge i {
  font-size: 8px;
}

.status-badge.open {
  background: var(--warning-light);
  color: var(--warning);
  border: 1px solid var(--warning);
}

.status-badge.in_progress {
  background: var(--accent-light);
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.status-badge.closed {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success);
}

.ticket-card-body {
  margin-bottom: 16px;
}

.ticket-description p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.detail-icon {
  color: var(--accent-primary);
  font-size: 14px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-label {
  font-size: 10px;
  color: var(--text-disabled);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.priority-section {
  flex: 1;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.priority-badge i {
  font-size: 10px;
}

.priority-badge.low {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success);
}

.priority-badge.medium {
  background: var(--warning-light);
  color: var(--warning);
  border: 1px solid var(--warning);
}

.priority-badge.high {
  background: var(--error-light);
  color: var(--error);
  border: 1px solid var(--error);
}

.priority-badge.urgent {
  background: var(--error);
  color: var(--bg-primary);
  border: 1px solid var(--error);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.ticket-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.view-btn {
  background: var(--accent-alpha);
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.view-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
  transform: translateY(-1px);
}

.ticket-card {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.ticket-card:hover {
  border-color: var(--accent-strong);
  transform: translateY(-1px);
}

.admin-ticket {
  border-left: 4px solid transparent;
}

.admin-ticket.priority-urgent {
  border-left-color: var(--error);
}

.admin-ticket.priority-high {
  border-left-color: var(--warning);
}

.admin-ticket.priority-medium {
  border-left-color: var(--warning-light);
}

.admin-ticket.status-in_progress {
  border-left-color: var(--warning);
}

.admin-ticket.priority-low {
  border-left-color: var(--text-secondary);
}

.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
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
  color: var(--accent-primary);
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
  background: var(--success-light);
  color: var(--accent-primary);
}

.status-badge.pending,
.status-badge.in_progress {
  background: var(--warning-light);
  color: var(--warning);
}

.status-badge.closed {
  background: var(--text-secondary-alpha);
  color: var(--text-secondary);
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
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
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
  background: var(--text-secondary-alpha);
  color: var(--text-secondary);
}

.priority-badge.medium {
  background: var(--warning-alpha);
  color: var(--warning);
}

.priority-badge.high {
  background: var(--warning-light);
  color: var(--warning);
}

.priority-badge.urgent {
  background: var(--error-light);
  color: var(--error);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-dark);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    padding-top: 20px;
  }
}

.ticket-detail-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-modal);

  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
}

.admin-modal {
  max-width: 1000px;

  @media (max-width: 768px) {
    max-width: 95vw;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
  }
}

.user-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow-modal);

  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
}

.confirmation-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px var(--shadow-modal);

  @media (max-width: 768px) {
    max-width: 95vw;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
    border-radius: 0;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    text-align: center;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: center;
    width: 100%;
    gap: 8px;
  }
}

.close-ticket-btn {
  background: var(--error);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-ticket-btn:hover {
  background: var(--error-dark);
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
  background: var(--text-primary-alpha);
  color: var(--text-primary, #ffffff);
}

.modal-body {
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
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
  background: var(--info-alpha);
  color: var(--info);
}

.ticket-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
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
  background: var(--accent-alpha);
  border-left-color: var(--accent-primary);
}

.message-item.support,
.message-item.admin {
  background: var(--warning-alpha);
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
  border-color: var(--accent-primary);
  background: var(--accent-light);
}

.form-help {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Password Change Modal Styles */
.password-user-info {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.password-user-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text-primary, #ffffff);
}

.password-user-info p:last-child {
  margin-bottom: 0;
}

.password-user-info strong {
  color: var(--accent-primary);
}

/* Estados de validação dos campos */
.field-valid {
  border-color: var(--success) !important;
  background: var(--success-alpha) !important;
}

.field-invalid {
  border-color: var(--error) !important;
  background: var(--error-alpha) !important;
}

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--error);
  font-weight: 500;
}

.field-loading {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--info);
  font-style: italic;
}

/* Spinner pequeno para botões */
.loading-spinner-small {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

/* Estados dos botões */
.submit-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--text-secondary-alpha);
  color: var(--text-secondary);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Select Options and Optgroups Styling */
.form-select option {
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  padding: 8px 12px;
  border: none;
}

.form-select optgroup {
  background: var(--bg-secondary, #2a2a2a);
  color: var(--text-primary, #ffffff);
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.form-select optgroup option {
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  padding: 6px 20px;
  font-weight: 400;
  font-size: 14px;
}

.form-select option:hover {
  background: var(--accent-alpha);
  color: var(--text-primary, #ffffff);
}

.form-select option:checked {
  background: var(--accent-primary);
  color: var(--bg-primary, #1a1a1a);
  font-weight: 600;
}

/* Status Filter Selects */
.status-filter option,
.priority-filter option,
.category-filter option {
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  padding: 8px 12px;
}

.status-filter option:hover,
.priority-filter option:hover,
.category-filter option:hover {
  background: var(--accent-alpha);
}

.status-filter option:checked,
.priority-filter option:checked,
.category-filter option:checked {
  background: var(--accent-primary);
  color: var(--bg-primary, #1a1a1a);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }
}

.cancel-btn {
  background: var(--text-primary-alpha);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
  }
}

.cancel-btn:hover {
  background: var(--text-primary-alpha-medium);
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

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
  }
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  background: var(--error);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
  }
}

.delete-btn:hover {
  background: var(--error-dark);
}

/* Payment Management - Professional Design */
.payments-header {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.header-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  min-width: 80px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-value.pending {
  color: var(--warning);
}

.stat-value.approved {
  color: var(--success);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.payments-content {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.payments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
}

.payment-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.payment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--warning), var(--accent-primary));
  background-size: 200% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

.payment-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.payment-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.payment-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-alpha);
  border-radius: 50%;
  flex-shrink: 0;
}

.payment-avatar i {
  font-size: 20px;
  color: var(--accent-primary);
}

.payment-info {
  flex: 1;
  min-width: 0;
}

.payment-user {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-email {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-id {
  font-size: 11px;
  color: var(--text-disabled);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.payment-status {
  flex-shrink: 0;
}

.payment-card-body {
  padding: 16px 20px;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.detail-icon.amount {
  background: var(--success-alpha);
  color: var(--success);
}

.detail-icon:not(.amount) {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value.amount {
  color: var(--success);
  font-weight: 600;
}

.payment-card-footer {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.view-btn {
  background: var(--accent-alpha);
  color: var(--accent-primary);

}

.view-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.approve-btn {
  background: var(--success-alpha);
  color: var(--success);
  border: 1px solid var(--success);
}

.approve-btn:hover {
  background: var(--success);
  color: var(--bg-primary);
}

.reject-btn {
  background: var(--error-alpha);
  color: var(--error);
  border: 1px solid var(--error);
}

.reject-btn:hover {
  background: var(--error);
  color: var(--bg-primary);
}

/* Payment Detail Modal - Professional Design */
.payment-detail-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  max-width: 900px;
  width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
}

.payment-detail-modal .modal-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 0;
}

.payment-detail-modal .modal-body {
  padding: 24px;
}

.modal-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  position: relative;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  color: var(--accent-primary);
  font-size: 20px;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.close-btn:hover {
  background: var(--error-alpha);
  border-color: var(--error);
  color: var(--error);
  transform: scale(1.05);
}

.close-btn i {
  font-size: 16px;
}

.payment-status-banner {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid;
}

.payment-status-banner.approved {
  background: var(--success-alpha);
  border-color: var(--success);
}

.payment-status-banner.pending {
  background: var(--warning-alpha);
  border-color: var(--warning);
}

.payment-status-banner.rejected {
  background: var(--error-alpha);
  border-color: var(--error);
}

.payment-status-banner.cancelled {
  background: var(--text-disabled-alpha);
  border-color: var(--text-disabled);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-primary);
  flex-shrink: 0;
}

.status-icon i {
  font-size: 24px;
}

.payment-status-banner.approved .status-icon i {
  color: var(--success);
}

.payment-status-banner.pending .status-icon i {
  color: var(--warning);
}

.payment-status-banner.rejected .status-icon i {
  color: var(--error);
}

.payment-status-banner.cancelled .status-icon i {
  color: var(--text-disabled);
}

.status-info {
  flex: 1;
}

.status-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.status-amount {
  flex-shrink: 0;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--success);
}

.payment-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.detail-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-title i {
  color: var(--accent-primary);
  font-size: 16px;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value.amount {
  color: var(--success);
  font-weight: 600;
}

.modal-footer {
  padding-top: 20px;
  border-top: 1px solid var(--border-primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-approve,
.btn-reject {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
}

.btn-approve {
  background: var(--success);
  color: var(--bg-primary);
}

.btn-approve:hover {
  background: var(--success-dark);
  transform: translateY(-1px);
}

.btn-reject {
  background: var(--error);
  color: var(--bg-primary);
}

.btn-reject:hover {
  background: var(--error-dark);
  transform: translateY(-1px);
}

/* Responsive Design for Payments */
@media (max-width: 768px) {
  .payments-header {
    padding: 20px;
  }

  .header-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-item {
    min-width: auto;
    flex: 1;
  }

  .payments-content {
    padding: 20px;
  }

  .payments-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .payment-card-header {
    padding: 16px 16px 12px 16px;
  }

  .payment-card-body {
    padding: 12px 16px;
  }

  .payment-card-footer {
    padding: 12px 16px 16px 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    flex: none;
    justify-content: center;
  }

  .payment-details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .detail-section {
    padding: 16px;
  }

  .status-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-approve,
  .btn-reject {
    min-width: auto;
  }

  .payment-detail-modal {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
  }

  .payment-detail-modal .modal-header {
    padding: 20px 20px 0 20px;
  }

  .payment-detail-modal .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .payments-header {
    padding: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .payments-content {
    padding: 16px;
  }

  .payment-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px 16px 12px 16px;
  }

  .payment-info {
    text-align: center;
  }

  .payment-status {
    align-self: center;
  }

  .payment-avatar {
    align-self: center;
  }

  .modal-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .modal-title {
    justify-content: center;
  }

  .payment-detail-modal {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  .payment-detail-modal .modal-header {
    padding: 16px 16px 0 16px;
  }

  .payment-detail-modal .modal-body {
    padding: 16px;
  }

  /* Tickets Responsive */
  .tickets-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-stats {
    justify-content: center;
    gap: 16px;
  }

  .filter-controls {
    flex-direction: column;
    gap: 12px;
  }

  .search-container {
    min-width: 100%;
  }

  .filter-group {
    justify-content: center;
  }

  .tickets-content {
    padding: 20px;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .ticket-card {
    padding: 16px;
  }

  .ticket-details {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .ticket-card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .ticket-actions {
    justify-content: center;
  }
}

.plan-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: var(--info-alpha);
  color: var(--info);
}

.payment-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
}

.status-text {
  font-weight: 600;
}

.status-text.approved {
  color: var(--success);
}

.status-text.pending {
  color: var(--warning);
}

.status-text.rejected {
  color: var(--error);
}

.status-text.cancelled {
  color: var(--text-secondary);
}

.payment-id-text {
  font-family: monospace;
  font-size: 12px;
  background: var(--text-primary-alpha);
  padding: 2px 6px;
  border-radius: 4px;
}

.payment-actions-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.payment-actions-section h5 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 16px 0;
}

.admin-actions {
  display: flex;
  gap: 12px;
}

.approve-payment-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--success);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-payment-btn:hover {
  background: var(--success-dark);
}

.reject-payment-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--error);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reject-payment-btn:hover {
  background: var(--error-dark);
}

/* Responsividade adicional para telas muito pequenas */
@media (max-width: 360px) {
  .admin-main {
    padding: 12px 8px;
  }

  .content-header {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-value {
    font-size: 20px;
  }

  .tab-btn {
    padding: 8px 10px;
    font-size: 12px;
  }

  .user-card,
  .ticket-card,
  .payment-card {
    padding: 10px;
  }

  .action-btn {
    padding: 6px 8px;
    font-size: 9px;
  }

  .modal-overlay {
    padding: 8px;
  }

  .modal-header,
  .modal-body {
    padding: 12px;
  }

  /* Tickets Mobile */
  .tickets-header {
    padding: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .section-title i {
    font-size: 18px;
  }

  .header-stats {
    gap: 12px;
  }

  .stat-item {
    min-width: 50px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 10px;
  }

  .tickets-content {
    padding: 16px;
  }

  .ticket-card {
    padding: 12px;
  }

  .ticket-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .ticket-title {
    font-size: 14px;
  }

  .ticket-user {
    font-size: 12px;
  }

  .ticket-id {
    font-size: 10px;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 10px;
  }

  .priority-badge {
    padding: 4px 8px;
    font-size: 10px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
