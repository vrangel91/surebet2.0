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
            <div class="section-header">
              <h3 class="section-title">Gerenciamento de Usuários</h3>
              <div class="filter-controls">
                <input v-model="userSearchQuery" type="text" placeholder="Buscar por nome ou email..."
                  class="search-input">
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
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
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
                    <span class="user-plan">{{ getPlanDisplayName(user.plan) || 'Sem plano' }}</span>
                    <!-- Debug: {{ user.plan }} -->
                    <span class="user-role" :class="user.account_type">{{ getUserRoleText(user.account_type) }}</span>
                    <span class="user-created">{{ formatDate(user.createdAt) }}</span>
                  </div>
                </div>

                <div class="user-actions">
                  <button class="action-btn toggle-btn"
                    :class="user.status === 'active' ? 'deactivate-btn' : 'activate-btn'"
                    @click="toggleUserStatus(user)"
                    :title="user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path v-if="user.status === 'active'"
                        d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 8 3zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V3.5a.5.5 0 0 1 .5-.5z" />
                      <path v-if="user.status === 'active'"
                        d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V8.5a.5.5 0 0 1 .5-.5z" />
                      <path v-if="user.status === 'inactive'"
                        d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 8 3zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V3.5a.5.5 0 0 1 .5-.5z" />
                      <path v-if="user.status === 'inactive'"
                        d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11V8.5a.5.5 0 0 1 .5-.5z" />
                      <path v-if="user.status === 'inactive'"
                        d="M8 13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5v-1A.5.5 0 0 1 8 13zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H11v-1a.5.5 0 0 1 .5-.5z" />
                    </svg>
                    {{ user.status === 'active' ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button class="action-btn edit-btn" @click="editUser(user)">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path
                        d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.5-.5V9h-.5a.5.5 0 0 1-.5-.5V8h-.5a.5.5 0 0 1-.5-.5V7h-.5a.5.5 0 0 1-.5-.5V6h-.5a.5.5 0 0 1-.5-.5V5h-.5a.5.5 0 0 1-.5-.5V4h-.5a.5.5 0 0 1-.5-.5V3h-.5a.5.5 0 0 1-.5-.5V2h-.5a.5.5 0 0 1-.5-.5V1h-.5a.5.5 0 0 1-.5-.5V0H1a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V1a.5.5 0 0 0-.5-.5H1z" />
                    </svg>
                    Editar
                  </button>
                  <button class="action-btn password-btn" @click="changePassword(user)">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path
                        d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                    Senha
                  </button>
                  <button class="action-btn delete-btn" @click="deleteUser(user)">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path
                        d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                      <path fill-rule="evenodd"
                        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
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
                <input v-model="searchQuery" type="text" placeholder="Buscar por ID, título ou usuário..."
                  class="search-input">
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
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
                </svg>
                <h4>Nenhum ticket encontrado</h4>
                <p>Não há tickets que correspondam aos filtros selecionados</p>
              </div>

              <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card admin-ticket"
                @click="openTicket(ticket)">
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
                  <p class="ticket-description">{{ ticket.messages?.[0]?.content ?
                    ticket.messages[0].content.substring(0, 100) + (ticket.messages[0].content.length > 100 ? '...' :
                      '') :
                    'Sem descrição' }}</p>
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

          <!-- Payments Tab -->
          <div v-if="activeTab === 'payments'" class="tab-content">
            <div class="section-header">
              <h3 class="section-title">Gerenciamento de Pagamentos</h3>
              <div class="filter-controls">
                <input v-model="paymentSearchQuery" type="text"
                  placeholder="Buscar por usuário, email ou ID do pagamento..." class="search-input">
                <select v-model="paymentPlanFilter" class="status-filter">
                  <option value="">Todos os Planos</option>
                  <template v-for="(plans, category) in groupedPlans" :key="category">
                    <optgroup :label="category">
                      <option v-for="plan in plans" :key="plan.id" :value="plan.type">
                        {{ plan.display_name || plan.name }}
                      </option>
                    </optgroup>
                  </template>
                </select>
                <select v-model="paymentStatusFilter" class="status-filter">
                  <option value="">Todos os Status</option>
                  <option value="approved">Aprovado</option>
                  <option value="pending">Pendente</option>
                  <option value="rejected">Rejeitado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <select v-model="paymentPeriodFilter" class="status-filter">
                  <option value="">Todos os Períodos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                  <option value="year">Este Ano</option>
                </select>
              </div>
            </div>

            <div class="payments-list">
              <!-- Loading State -->
              <div v-if="loadingPayments" class="loading-payments">
                <div class="loading-spinner"></div>
                <p>Carregando pagamentos...</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredPayments.length === 0" class="empty-payments">
                <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
                </svg>
                <h4>Nenhum pagamento encontrado</h4>
                <p>Não há pagamentos que correspondam aos filtros selecionados</p>
              </div>

              <div v-for="payment in filteredPayments" :key="payment.id" class="payment-card">
                <div class="payment-header">
                  <div class="payment-info">
                    <h4 class="payment-user">{{ payment.userName }}</h4>
                    <span class="payment-email">{{ payment.userEmail }}</span>
                    <span class="payment-id">#{{ payment.id }}</span>
                  </div>
                  <div class="payment-status" :class="payment.status">
                    <span class="status-badge">{{ getPaymentStatusText(payment.status) }}</span>
                  </div>
                </div>

                <div class="payment-content">
                  <div class="payment-details">
                    <div class="payment-plan">
                      <span class="plan-label">Plano:</span>
                      <span class="plan-name">{{ getPlanDisplayName(payment.planId) }}</span>
                    </div>
                    <div class="payment-amount">
                      <span class="amount-label">Valor:</span>
                      <span class="amount-value">R$ {{ payment.amount.toFixed(2) }}</span>
                    </div>
                    <div class="payment-method">
                      <span class="method-label">Método:</span>
                      <span class="method-name">{{ getPaymentMethodText(payment.paymentMethod) }}</span>
                    </div>
                  </div>
                </div>

                <div class="payment-footer">
                  <div class="payment-meta">
                    <span class="payment-date">{{ formatDate(payment.createdAt) }}</span>
                    <span class="payment-expires" v-if="payment.expiresAt">
                      Expira em: {{ formatDate(payment.expiresAt) }}
                    </span>
                  </div>
                  <div class="payment-actions">
                    <button class="action-btn view-btn" @click="viewPaymentDetails(payment)">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path
                          d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                        <path
                          d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                      </svg>
                      Ver Detalhes
                    </button>
                    <button v-if="payment.status === 'pending'" class="action-btn approve-btn"
                      @click="approvePayment(payment)">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path
                          d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                      Aprovar
                    </button>
                    <button v-if="payment.status === 'pending'" class="action-btn reject-btn"
                      @click="rejectPayment(payment)">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path
                          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                      </svg>
                      Rejeitar
                    </button>
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
                <option value="moderator">Moderador</option>
              </select>
              <div v-if="validationErrors.account_type" class="field-error">
                {{ validationErrors.account_type }}
              </div>
              <small class="form-help">
                <strong>Usuário:</strong> Acesso padrão ao sistema<br>
                <strong>Moderador:</strong> Pode gerenciar tickets e usuários<br>
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
          <h3>Detalhes do Pagamento #{{ selectedPayment?.id }}</h3>
          <button class="close-btn" @click="closePaymentDetailModal">×</button>
        </div>

        <div class="modal-body" v-if="selectedPayment">
          <div class="payment-detail-header">
            <div class="payment-detail-meta">
              <span class="status-badge" :class="selectedPayment.status">{{ getPaymentStatusText(selectedPayment.status)
              }}</span>
              <span class="amount-badge">R$ {{ selectedPayment.amount.toFixed(2) }}</span>
              <span class="plan-badge">{{ getPlanDisplayName(selectedPayment.planId) }}</span>
            </div>
          </div>

          <div class="payment-detail-content">
            <div class="payment-info-grid">
              <div class="info-item">
                <label>Usuário:</label>
                <span>{{ selectedPayment.userName }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ selectedPayment.userEmail }}</span>
              </div>
              <div class="info-item">
                <label>Plano:</label>
                <span>{{ getPlanDisplayName(selectedPayment.planId) }}</span>
              </div>
              <div class="info-item">
                <label>Valor:</label>
                <span>R$ {{ selectedPayment.amount.toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <label>Método de Pagamento:</label>
                <span>{{ getPaymentMethodText(selectedPayment.paymentMethod) }}</span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span class="status-text" :class="selectedPayment.status">{{
                  getPaymentStatusText(selectedPayment.status)
                }}</span>
              </div>
              <div class="info-item">
                <label>Data do Pagamento:</label>
                <span>{{ formatDate(selectedPayment.createdAt) }}</span>
              </div>
              <div class="info-item" v-if="selectedPayment.expiresAt">
                <label>Expira em:</label>
                <span>{{ formatDate(selectedPayment.expiresAt) }}</span>
              </div>
              <div class="info-item" v-if="selectedPayment.paymentId">
                <label>ID do Pagamento:</label>
                <span class="payment-id-text">{{ selectedPayment.paymentId }}</span>
              </div>
              <div class="info-item" v-if="selectedPayment.description">
                <label>Descrição:</label>
                <span>{{ selectedPayment.description }}</span>
              </div>
            </div>

            <div class="payment-actions-section" v-if="selectedPayment.status === 'pending'">
              <h5>Ações Administrativas</h5>
              <div class="admin-actions">
                <button class="approve-payment-btn" @click="approvePayment(selectedPayment)">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                  </svg>
                  Aprovar Pagamento
                </button>
                <button class="reject-payment-btn" @click="rejectPayment(selectedPayment)">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                  Rejeitar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PWA Force Update Modal -->
    <PWAForceUpdateModal :show="showPWAForceUpdateModal" @close="closePWAForceUpdateModal"
      @confirm="handlePWAForceUpdate" />

    <!-- Glossary Modal -->

  </div>
</template>

<script>
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'
import PWAForceUpdateModal from '../components/PWA/PWAForceUpdateModal.vue'
import AdminNotificationPanel from '../components/Admin/AdminNotificationPanel.vue'

import { mapGetters } from 'vuex'
import { adminAPI } from '@/api/admin'
import axios from '@/utils/axios'

export default {
  name: 'AdminView',
  components: {
    Sidebar,
    Header,
    PWAForceUpdateModal,
    AdminNotificationPanel
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
            account_type: user.account_type || 'user', // Manter account_type para tipo de conta
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
        account_type: user.account_type || 'user'
      }
      console.log('Frontend: Editando usuário:', this.editingUser)

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
          account_type: this.editingUser.account_type || 'user',
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
      // Sistema de notificação melhorado
      const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
      const title = type === 'error' ? 'Erro' : type === 'success' ? 'Sucesso' : 'Informação'

      // Usar alert melhorado com título
      alert(`${icon} ${title}\n\n${message}`)

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
  border-top: 4px solid var(--info);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.user-card:hover {
  border-color: var(--accent-strong);
  transform: translateY(-1px);
}

.user-header {
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

.user-role {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.user-role.user {
  background: var(--info-light);
  color: var(--info);
}

.user-role.admin {
  background: var(--warning-light);
  color: var(--warning);
}

.user-role.moderator {
  background: var(--success-light);
  color: var(--success);
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    justify-content: center;
    gap: 4px;
  }
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
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 10px;
    gap: 4px;
  }
}

.edit-btn {
  background: var(--info-light);
  color: var(--info);
}

.edit-btn:hover {
  background: var(--info-medium);
}

.delete-btn {
  background: var(--error-light);
  color: var(--error);
}

.delete-btn:hover {
  background: var(--error-medium);
}

.activate-btn {
  background: var(--success-light);
  color: var(--success);
}

.activate-btn:hover {
  background: var(--success-medium);
}

.deactivate-btn {
  background: var(--warning-light);
  color: var(--warning);
}

.deactivate-btn:hover {
  background: var(--warning-medium);
}

.password-btn {
  background: var(--purple-light);
  color: var(--purple);
}

.password-btn:hover {
  background: var(--purple-medium);
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

/* Payment Management Styles */
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-payments {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary, #a0a0a0);
}

.empty-payments {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #888888);
}

.empty-payments svg {
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-payments h4 {
  font-size: 20px;
  margin: 0 0 8px 0;
}

.empty-payments p {
  font-size: 14px;
  margin: 0;
}

.payment-card {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.payment-card:hover {
  border-color: var(--accent-strong);
  transform: translateY(-1px);
}

.payment-header {
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

.payment-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-user {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.payment-email {
  font-size: 14px;
  color: var(--text-secondary, #888888);
}

.payment-id {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-family: monospace;
}

.payment-status {
  display: flex;
  align-items: center;
}

.payment-content {
  margin-bottom: 16px;
}

.payment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.payment-plan,
.payment-amount,
.payment-method {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-label,
.amount-label,
.method-label {
  font-size: 12px;
  color: var(--text-secondary, #888888);
  font-weight: 600;
}

.plan-name,
.amount-value,
.method-name {
  font-size: 14px;
  color: var(--text-primary, #ffffff);
}

.amount-value {
  font-weight: 600;
  color: var(--accent-primary);
}

.payment-footer {
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

.payment-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.payment-date,
.payment-expires {
  font-size: 12px;
  color: var(--text-secondary, #888888);
}

.payment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    justify-content: center;
    gap: 4px;
  }
}

.view-btn {
  background: var(--info-light);
  color: var(--info);
}

.view-btn:hover {
  background: var(--info-medium);
}

.approve-btn {
  background: var(--success-light);
  color: var(--success);
}

.approve-btn:hover {
  background: var(--success-medium);
}

.reject-btn {
  background: var(--error-light);
  color: var(--error);
}

.reject-btn:hover {
  background: var(--error-medium);
}

/* Payment Detail Modal Styles */
.payment-detail-modal {
  max-width: 800px;
}

.payment-detail-header {
  margin-bottom: 24px;
}

.payment-detail-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.amount-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: var(--success-light);
  color: var(--accent-primary);
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
}
</style>
