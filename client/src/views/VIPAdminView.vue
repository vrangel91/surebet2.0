<template>
  <div class="vip-admin-page" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="toggleSidebar" />
    
    <!-- Conteúdo Principal -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Header Global -->
      <Header />
      
      <!-- Verificação de Acesso -->
      <div v-if="!isAdmin" class="access-denied">
        <div class="access-denied-content">
          <div class="access-denied-icon">
            <AlertTriangle size="64" />
          </div>
          <h1>Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
          <p>Apenas administradores podem acessar a Administração VIP.</p>
          <button @click="$router.push('/')" class="btn btn-primary">
            Voltar ao Início
          </button>
        </div>
      </div>
      
      <!-- Conteúdo da Administração VIP (apenas para admins) -->
      <div v-else>
      <!-- Header da Página -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>
              <Crown class="header-icon" size="24" />
              Administração VIP
            </h1>
            <p class="header-subtitle">Gerencie usuários VIP, cron jobs e relatórios</p>
          </div>
                     <div class="header-actions">
             <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
               <RefreshCw class="btn-icon" size="16" />
               Atualizar
             </button>
             <button @click="showActivateModal = true" class="btn btn-primary">
               <Plus class="btn-icon" size="16" />
               Ativar VIP
             </button>
           </div>
        </div>
      </header>

             <!-- Estatísticas -->
       <section class="stats-section">
         <div v-if="loading" class="loading-indicator">
           <div class="loading-spinner"></div>
           <p>Carregando dados...</p>
         </div>
         <div v-else class="stats-grid">
           <div class="stat-card">
             <div class="stat-icon vip">
               <Crown size="20" />
             </div>
             <div class="stat-content">
               <h3>{{ stats.activeVIPs || 0 }}</h3>
               <p>VIPs Ativos</p>
             </div>
           </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <Clock size="20" />
            </div>
            <div class="stat-content">
              <h3>{{ stats.expiringSoon || 0 }}</h3>
              <p>Expirando em 7 dias</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon danger">
              <AlertTriangle size="20" />
            </div>
            <div class="stat-content">
              <h3>{{ stats.expiredToday || 0 }}</h3>
              <p>Expirados Hoje</p>
            </div>
          </div>
          
                     <div class="stat-card">
             <div class="stat-icon success">
               <DollarSign size="20" />
             </div>
             <div class="stat-content">
               <h3>R$ {{ formatCurrency(stats.totalRevenue || 0) }}</h3>
               <p>Receita Total</p>
               <small class="stat-subtitle">Este mês: R$ {{ formatCurrency(stats.thisMonthRevenue || 0) }}</small>
             </div>
           </div>
        </div>
      </section>
      </div>

      <!-- Tabs de Navegação -->
      <section class="tabs-section">
        <div class="tabs-nav">
          <button 
            @click="activeTab = 'active'" 
            :class="['tab-btn', { active: activeTab === 'active' }]"
          >
            <Crown class="tab-icon" size="16" />
            VIPs Ativos
            <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
          </button>
          <button 
            @click="activeTab = 'expiring'" 
            :class="['tab-btn', { active: activeTab === 'expiring' }]"
          >
            <Clock class="tab-icon" size="16" />
            Expirando em Breve
          </button>
          <button 
            @click="activeTab = 'history'" 
            :class="['tab-btn', { active: activeTab === 'history' }]"
          >
            <History class="tab-icon" size="16" />
            Histórico
            <span v-if="historyFiltersCount > 0" class="filter-badge">{{ historyFiltersCount }}</span>
          </button>
          <button 
            @click="activeTab = 'cron'" 
            :class="['tab-btn', { active: activeTab === 'cron' }]"
          >
            <Settings class="tab-icon" size="16" />
            Cron Jobs
          </button>
          <button 
            @click="activeTab = 'reports'" 
            :class="['tab-btn', { active: activeTab === 'reports' }]"
          >
            <BarChart3 class="tab-icon" size="16" />
            Relatórios
          </button>
        </div>
      </section>

      <!-- Conteúdo das Tabs -->
      <section class="tab-content">
        <!-- Tab: VIPs Ativos -->
        <div v-if="activeTab === 'active'" class="tab-pane">
          <div class="table-container">
            <div class="table-header">
              <div class="table-title">
                <h3>VIPs Ativos ({{ activeVIPs.length }})</h3>
                <div v-if="hasActiveFilters" class="filtered-results">
                  <span class="filtered-count">{{ filteredActiveVIPs.length }} resultado(s) encontrado(s)</span>
                  <button @click="clearFilters" class="btn btn-secondary btn-sm">
                    Limpar Filtros
                  </button>
                </div>
              </div>
              <div class="table-actions">
                <div class="filters-row">
                  <input 
                    v-model="searchTerm" 
                    type="text" 
                    placeholder="Buscar usuário..." 
                    class="search-input"
                  />
                  <select 
                    v-model="planFilter" 
                    class="filter-select"
                  >
                    <option value="all">Todos os Planos</option>
                    <option v-for="plan in availablePlans.filter(p => p !== 'all')" :key="plan" :value="plan">
                      {{ plan }}
                    </option>
                  </select>
                  <select 
                    v-model="statusFilter" 
                    class="filter-select"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativo</option>
                    <option value="expiring">Expirando</option>
                    <option value="expired">Expirado</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Plano</th>
                    <th>Início</th>
                    <th>Expiração</th>
                    <th>Dias Restantes</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredActiveVIPs.length === 0">
                    <td colspan="7" class="no-results">
                      <div class="no-results-content">
                        <User size="48" class="no-results-icon" />
                        <h4>Nenhum usuário encontrado</h4>
                        <p>Tente ajustar os filtros ou a busca para encontrar resultados.</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-else v-for="vip in filteredActiveVIPs" :key="vip.id">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          <User size="16" />
                        </div>
                        <div class="user-details">
                          <span class="user-name">{{ vip.user?.first_name }} {{ vip.user?.last_name }}</span>
                          <span class="user-email">{{ vip.user?.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="plan-badge" :class="vip.planName?.toLowerCase()">
                        {{ vip.planName }}
                      </span>
                    </td>
                    <td>{{ formatDate(vip.dataInicio) }}</td>
                    <td>
                      <span :class="getExpirationClass(vip.dataFim)">
                        {{ formatDate(vip.dataFim) }}
                      </span>
                    </td>
                    <td>
                      <span class="days-remaining" :class="getDaysRemainingClass(vip.dataFim)">
                        {{ getDaysRemaining(vip.dataFim) }} dias
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="getVIPStatus(vip.dataFim).class">
                        {{ getVIPStatus(vip.dataFim).label }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button @click="editVIP(vip)" class="btn-icon info" title="Editar">
                          <Settings size="14" />
                        </button>
                        <button @click="renewVIP(vip)" class="btn-icon" title="Renovar">
                          <RefreshCw size="14" />
                        </button>
                        <button @click="deactivateVIP(vip)" class="btn-icon danger" title="Desativar">
                          <X size="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Expirando em Breve -->
        <div v-if="activeTab === 'expiring'" class="tab-pane">
          <div class="table-container">
            <div class="table-header">
              <h3>Expirando em Breve ({{ expiringVIPs.length }})</h3>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Plano</th>
                    <th>Expiração</th>
                    <th>Dias Restantes</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vip in expiringVIPs" :key="vip.id">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          <User size="16" />
                        </div>
                        <div class="user-details">
                          <span class="user-name">{{ vip.user?.first_name }} {{ vip.user?.last_name }}</span>
                          <span class="user-email">{{ vip.user?.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="plan-badge" :class="vip.planName?.toLowerCase()">
                        {{ vip.planName }}
                      </span>
                    </td>
                    <td>{{ formatDate(vip.dataFim) }}</td>
                    <td>
                      <span class="days-remaining" :class="getDaysRemainingClass(vip.dataFim)">
                        {{ getDaysRemaining(vip.dataFim) }} dias
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button @click="renewVIP(vip)" class="btn-icon" title="Renovar">
                          <RefreshCw size="14" />
                        </button>
                        <button @click="sendExpirationNotification(vip)" class="btn-icon warning" title="Enviar Notificação">
                          <Bell size="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Histórico -->
        <div v-if="activeTab === 'history'" class="tab-pane">
          <div class="table-container">
            <div class="table-header">
              <div class="table-title">
                <h3>Histórico Completo ({{ vipHistory.length }})</h3>
                <div v-if="hasActiveHistoryFilters" class="filtered-results">
                  <span class="filtered-count">{{ filteredVIPHistory.length }} resultado(s) encontrado(s)</span>
                  <button @click="clearFilters" class="btn btn-secondary btn-sm">
                    Limpar Filtros
                  </button>
                </div>
              </div>
              <div class="table-actions">
                <div class="filters-row">
                  <input 
                    v-model="historySearchTerm" 
                    type="text" 
                    placeholder="Buscar usuário..." 
                    class="search-input"
                  />
                  <select v-model="planFilter" class="filter-select">
                    <option value="all">Todos os Planos</option>
                    <option v-for="plan in availablePlans.filter(p => p !== 'all')" :key="plan" :value="plan">
                      {{ plan }}
                    </option>
                  </select>
                  <select v-model="dateRangeFilter" class="filter-select">
                    <option value="all">Todos os Períodos</option>
                    <option value="week">Última Semana</option>
                    <option value="month">Último Mês</option>
                    <option value="quarter">Último Trimestre</option>
                    <option value="year">Último Ano</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Plano</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredVIPHistory.length === 0">
                    <td colspan="7" class="no-results">
                      <div class="no-results-content">
                        <History size="48" class="no-results-icon" />
                        <h4>Nenhum histórico encontrado</h4>
                        <p>Tente ajustar os filtros ou a busca para encontrar resultados.</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-else v-for="vip in filteredVIPHistory" :key="vip.id">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          <User size="16" />
                        </div>
                        <div class="user-details">
                          <span class="user-name">{{ vip.user?.first_name }} {{ vip.user?.last_name }}</span>
                          <span class="user-email">{{ vip.user?.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="plan-badge" :class="vip.planName?.toLowerCase()">
                        {{ vip.planName }}
                      </span>
                    </td>
                    <td>{{ formatDate(vip.dataInicio) }}</td>
                    <td>{{ formatDate(vip.dataFim) }}</td>
                    <td>
                      <span class="status-badge" :class="vip.status">
                        {{ vip.status }}
                      </span>
                    </td>
                    <td>R$ {{ formatCurrency(vip.amount || 0) }}</td>
                    <td>
                      <div class="action-buttons">
                        <button @click="reactivateFromHistory(vip)" class="btn-icon success" title="Reativar">
                          <RefreshCw size="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Cron Jobs -->
        <div v-if="activeTab === 'cron'" class="tab-pane">
          <div class="cron-section">
            <div class="cron-header">
              <h3>Controle de Cron Jobs</h3>
              <div class="cron-status">
                <span class="status-indicator" :class="{ active: cronStatus.isRunning }">
                  {{ cronStatus.isRunning ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </div>
            
            <div class="cron-controls">
              <button @click="initializeCronJobs" class="btn btn-success" :disabled="cronStatus.isRunning">
                <Play class="btn-icon" size="16" />
                Inicializar Cron Jobs
              </button>
              <button @click="stopCronJobs" class="btn btn-danger" :disabled="!cronStatus.isRunning">
                <Square class="btn-icon" size="16" />
                Parar Cron Jobs
              </button>
              <button @click="processExpiredVIPs" class="btn btn-warning">
                <RefreshCw class="btn-icon" size="16" />
                Processar VIPs Expirados
              </button>
              <button @click="generateWeeklyReport" class="btn btn-info">
                <FileText class="btn-icon" size="16" />
                Gerar Relatório Semanal
              </button>
            </div>
            
            <div class="cron-info">
              <h4>Informações dos Cron Jobs</h4>
              <div class="cron-details">
                <p><strong>Status:</strong> 
                  <span :class="cronStatus.isRunning ? 'status-running' : 'status-stopped'">
                    {{ cronStatus.isRunning ? 'Executando' : 'Parado' }}
                  </span>
                </p>
                <p><strong>Inicializado:</strong> {{ cronStatus.initialized ? 'Sim' : 'Não' }}</p>
                <p><strong>Total de Jobs:</strong> {{ cronStatus.totalJobs || 0 }}</p>
                <p><strong>Última Execução:</strong> {{ formatCronDate(cronStatus.lastExecution) }}</p>
                <p><strong>Próxima Execução:</strong> {{ formatCronDate(cronStatus.nextExecution) }}</p>
                
                <div v-if="cronStatus.jobs && Object.keys(cronStatus.jobs).length > 0" class="jobs-details">
                  <h5>Jobs Ativos:</h5>
                  <div v-for="(job, name) in cronStatus.jobs" :key="name" class="job-item">
                    <span class="job-name">{{ name }}</span>
                    <span class="job-status" :class="job.running ? 'running' : 'stopped'">
                      {{ job.running ? 'Ativo' : 'Parado' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Relatórios -->
        <div v-if="activeTab === 'reports'" class="tab-pane">
          <div class="reports-section">
            <div class="reports-header">
              <div class="header-left">
                <h3>Relatórios e Métricas</h3>
                <div v-if="hasReportsData" class="last-generated">
                  <Clock size="14" />
                  <span>Última atualização: {{ formatLastGenerated() }}</span>
                </div>
              </div>
              <div class="date-filters">
                <input v-model="reportStartDate" type="date" class="date-input" />
                <span>até</span>
                <input v-model="reportEndDate" type="date" class="date-input" />
                <button @click="generateReports" class="btn btn-primary" :disabled="reportsLoading">
                  <BarChart3 class="btn-icon" size="16" />
                  {{ reportsLoading ? 'Gerando...' : 'Gerar Relatórios' }}
                </button>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="reportsLoading" class="reports-loading">
              <div class="loading-spinner"></div>
              <p>Gerando relatórios...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="reportsError" class="reports-error">
              <div class="error-icon">
                <AlertTriangle size="48" />
              </div>
              <h4>Erro ao gerar relatórios</h4>
              <p>{{ reportsError }}</p>
              <button @click="generateReports" class="btn btn-secondary">
                Tentar Novamente
              </button>
            </div>
            
            <!-- Reports Content -->
            <div v-else-if="hasReportsData" class="reports-grid">
              <div class="report-card">
                <h4>Relatório de Receita</h4>
                <div class="report-content">
                  <p><strong>Receita Total:</strong> R$ {{ formatCurrency(reports.revenue?.summary?.totalRevenue || 0) }}</p>
                  <p><strong>Média por Transação:</strong> R$ {{ formatCurrency(reports.revenue?.summary?.avgRevenue || 0) }}</p>
                  <p><strong>Total de Transações:</strong> {{ reports.revenue?.summary?.totalTransactions || 0 }}</p>
                  <p><strong>Usuários Únicos:</strong> {{ reports.revenue?.summary?.uniqueUsers || 0 }}</p>
                </div>
              </div>
              
              <div class="report-card">
                <h4>Relatório de Conversão</h4>
                <div class="report-content">
                  <p><strong>Taxa de Conversão:</strong> {{ formatPercentage(reports.conversion?.metrics?.conversionRate || 0) }}%</p>
                  <p><strong>Primeira vez VIP:</strong> {{ reports.conversion?.metrics?.firstTimeVIPs || 0 }}</p>
                  <p><strong>Renovações:</strong> {{ reports.conversion?.metrics?.renewals || 0 }}</p>
                  <p><strong>Total de Usuários:</strong> {{ reports.conversion?.metrics?.totalUsers || 0 }}</p>
                </div>
              </div>
              
              <div class="report-card">
                <h4>Relatório de Retenção</h4>
                <div class="report-content">
                  <p><strong>Taxa de Retenção:</strong> {{ formatPercentage(reports.retention?.metrics?.retentionRate || 0) }}%</p>
                  <p><strong>VIPs Expirados:</strong> {{ reports.retention?.metrics?.totalExpired || 0 }}</p>
                  <p><strong>Renovados após Expiração:</strong> {{ reports.retention?.metrics?.renewedAfterExpiry || 0 }}</p>
                  <p><strong>Renovados antes da Expiração:</strong> {{ reports.retention?.metrics?.renewedBeforeExpiry || 0 }}</p>
                </div>
              </div>
              
              <div class="report-card">
                <h4>Relatório por Planos</h4>
                <div class="report-content">
                  <div v-if="reports.plans && reports.plans.length > 0">
                    <div v-for="plan in reports.plans" :key="plan.planId" class="plan-stat">
                      <span class="plan-name">{{ plan.planName }}</span>
                      <span class="plan-count">{{ plan.activations }}</span>
                    </div>
                    <div class="plan-summary">
                      <p><strong>Total de Ativações:</strong> {{ reports.plans?.summary?.totalActivations || 0 }}</p>
                      <p><strong>Receita Total:</strong> R$ {{ formatCurrency(reports.plans?.summary?.totalRevenue || 0) }}</p>
                    </div>
                  </div>
                  <div v-else class="no-data">
                    <p>Nenhum dado disponível para planos</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Data State -->
            <div v-else class="reports-no-data">
              <div class="no-data-icon">
                <BarChart3 size="64" />
              </div>
              <h4>Nenhum relatório gerado</h4>
              <p>Clique em "Gerar Relatórios" para visualizar as métricas do período selecionado.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal de Ativação de VIP -->
    <div v-if="showActivateModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ativar VIP</h3>
          <button @click="showActivateModal = false" class="modal-close">
            <X size="20" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Selecionar Usuário</label>
            <select v-model="activateForm.userId" class="form-select" @change="checkExistingVIP">
              <option value="">Selecione um usuário...</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
              </option>
            </select>
            <div v-if="existingVIPInfo" class="existing-vip-info">
              <p><strong>VIP Ativo:</strong> {{ existingVIPInfo.planName }} - Expira em {{ formatDate(existingVIPInfo.dataFim) }}</p>
              <p>Novos dias serão somados ao prazo atual.</p>
            </div>
          </div>
          
          <div class="form-group">
            <label>Tipo de Plano</label>
            <select v-model="activateForm.planType" class="form-select">
              <option value="">Selecione um plano...</option>
              
              <!-- Planos dinâmicos do banco de dados -->
              <optgroup 
                v-for="(categoryPlans, category) in groupedPlans" 
                :key="category" 
                :label="category"
              >
                <option 
                  v-for="plan in categoryPlans" 
                  :key="plan.id" 
                  :value="plan.type || plan.name"
                >
                  {{ plan.display_name }}
                </option>
              </optgroup>
            </select>
          </div>
          
          <div class="form-group">
            <label>Duração (dias)</label>
            <input v-model="activateForm.duration" type="number" class="form-input" min="1" />
          </div>
          
          <div class="form-group">
            <label>Valor (R$)</label>
            <input v-model="activateForm.amount" type="number" class="form-input" min="0" step="0.01" />
          </div>
          
          <div class="form-group">
            <label>
              <input v-model="activateForm.autoRenew" type="checkbox" class="form-checkbox" />
              Renovação Automática
            </label>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="activateForm.notes" class="form-textarea" placeholder="Observações sobre a ativação..."></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showActivateModal = false" class="btn btn-secondary">Cancelar</button>
          <button @click="activateVIP" class="btn btn-primary" :disabled="!canActivateVIP">
            {{ existingVIPInfo ? 'Renovar VIP' : 'Ativar VIP' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Edição de VIP -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Editar VIP</h3>
          <button @click="showEditModal = false" class="modal-close">
            <X size="20" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Usuário</label>
            <input :value="editForm.userName" class="form-input" disabled />
          </div>
          
          <div class="form-group">
            <label>Tipo de Plano</label>
            <select v-model="editForm.planType" class="form-select">
              <option value="">Selecione um plano...</option>
              
              <!-- Planos dinâmicos do banco de dados -->
              <optgroup 
                v-for="(categoryPlans, category) in groupedPlans" 
                :key="category" 
                :label="category"
              >
                <option 
                  v-for="plan in categoryPlans" 
                  :key="plan.id" 
                  :value="plan.type || plan.name"
                >
                  {{ plan.display_name }}
                </option>
              </optgroup>
            </select>
          </div>
          
          <div class="form-group">
            <label>Duração (dias)</label>
            <input v-model="editForm.duration" type="number" class="form-input" min="1" />
          </div>
          
          <div class="form-group">
            <label>Valor (R$)</label>
            <input v-model="editForm.amount" type="number" class="form-input" min="0" step="0.01" />
          </div>
          
          <div class="form-group">
            <label>
              <input v-model="editForm.autoRenew" type="checkbox" class="form-checkbox" />
              Renovação Automática
            </label>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="editForm.notes" class="form-textarea" placeholder="Observações..."></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn btn-secondary">Cancelar</button>
          <button @click="updateVIP" class="btn btn-primary" :disabled="!canUpdateVIP">
            Atualizar VIP
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
 import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import axios from '@/utils/axios'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { 
  Crown, 
  RefreshCw, 
  Plus, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  History, 
  Settings, 
  BarChart3, 
  User, 
  X, 
  Bell, 
  Play, 
  Square, 
  FileText 
} from 'lucide-vue-next'

export default {
  name: 'VIPAdminView',
  components: {
    Sidebar,
    Header,
    Crown,
    RefreshCw,
    Plus,
    Clock,
    AlertTriangle,
    DollarSign,
    History,
    Settings,
    BarChart3,
    User,
    X,
    Bell,
    Play,
    Square,
    FileText
  },
  setup() {
    const store = useStore()
    console.log('🏪 Store inicializado:', !!store)
    console.log('🔑 Token no store:', !!store.getters.authToken)
    console.log('🔑 Token valor:', store.getters.authToken)
    console.log('🔑 Token localStorage:', localStorage.getItem('authToken'))
    console.log('👤 Usuário atual:', store.getters.currentUser)
    console.log('👑 É admin?', store.getters.isAdmin)
    console.log('🔐 Está autenticado?', store.getters.isAuthenticated)
    
    const loading = ref(false)
    const activeTab = ref('active')
    const showActivateModal = ref(false)
    const sidebarCollapsed = ref(false)
    
    // Data
    const stats = ref({ activeVIPs: 0, expiringSoon: 0, expiredToday: 0, totalRevenue: 0, thisMonthRevenue: 0 })
    const activeVIPs = ref([])
    const expiringVIPs = ref([])
    const vipHistory = ref([])
    const availableUsers = ref([])
    const cronStatus = ref({ isRunning: false })
    const reports = ref({})
    const reportsLoading = ref(false)
    const reportsError = ref('')
    const searchTerm = ref('')
    const historySearchTerm = ref('')
    
    // Sistema de planos
    const plans = ref([])
    
    // Filtros adicionais
    const statusFilter = ref('all')
    const planFilter = ref('all')
    const dateRangeFilter = ref('all')
    
    // Form
    const activateForm = reactive({
      userId: '',
      planType: '',
      duration: 30,
      amount: 0,
      autoRenew: false,
      notes: ''
    })
    
    // Form de edição
    const editForm = reactive({
      id: null,
      userId: '',
      planType: '',
      duration: 0,
      amount: 0,
      autoRenew: false,
      notes: ''
    })
    
    const showEditModal = ref(false)
    
    // Informações de VIP existente
    const existingVIPInfo = ref(null)
    
    // Date filters for reports
    const reportStartDate = ref('')
    const reportEndDate = ref('')
    
    // Computed
    const filteredActiveVIPs = computed(() => {
      let filtered = activeVIPs.value
      
      // Filtro por busca
      if (searchTerm.value) {
        filtered = filtered.filter(vip => 
          vip.user?.first_name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          vip.user?.last_name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          vip.user?.email?.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
      }
      
      // Filtro por plano
      if (planFilter.value !== 'all') {
        filtered = filtered.filter(vip => vip.planName?.toLowerCase() === planFilter.value.toLowerCase())
      }
      
      // Filtro por status
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(vip => {
          const daysRemaining = getDaysRemaining(vip.dataFim)
          
          switch (statusFilter.value) {
            case 'active':
              return daysRemaining > 7 // Mais de 7 dias restantes
            case 'expiring':
              return daysRemaining <= 7 && daysRemaining > 0 // 7 dias ou menos, mas ainda não expirou
            case 'expired':
              return daysRemaining <= 0 // Já expirou
            default:
              return true
          }
        })
      }
      
      // Ordenar por data de expiração (mais próxima primeiro)
      return filtered.sort((a, b) => new Date(a.dataFim) - new Date(b.dataFim))
    })
    
    const filteredVIPHistory = computed(() => {
      let filtered = vipHistory.value
      
      // Filtro por busca
      if (historySearchTerm.value) {
        filtered = filtered.filter(vip => 
          vip.user?.first_name?.toLowerCase().includes(historySearchTerm.value.toLowerCase()) ||
          vip.user?.last_name?.toLowerCase().includes(historySearchTerm.value.toLowerCase()) ||
          vip.user?.email?.toLowerCase().includes(historySearchTerm.value.toLowerCase())
        )
      }
      
      // Filtro por plano
      if (planFilter.value !== 'all') {
        filtered = filtered.filter(vip => vip.planName?.toLowerCase() === planFilter.value.toLowerCase())
      }
      
      // Filtro por período
      if (dateRangeFilter.value !== 'all') {
        const now = new Date()
        const startDate = new Date()
        
        switch (dateRangeFilter.value) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        filtered = filtered.filter(vip => new Date(vip.dataFim) >= startDate)
      }
      
      return filtered.sort((a, b) => new Date(b.dataFim) - new Date(a.dataFim))
    })
    
    const availablePlans = computed(() => {
      const plans = [...new Set(activeVIPs.value.map(vip => vip.planName).filter(Boolean))]
      return ['all', ...plans]
    })
    
    // Planos agrupados por categoria para os modais
    const groupedPlans = computed(() => {
      console.log('🔍 [groupedPlans] Computed executado')
      console.log('📊 [groupedPlans] plans.value.length:', plans.value.length)
      console.log('📊 [groupedPlans] store.getters.plansLoaded:', store.getters.plansLoaded)
      console.log('📊 [groupedPlans] store.getters.allPlans.length:', store.getters.allPlans?.length || 0)
      
      if (!plans.value.length && !store.getters.plansLoaded) {
        console.log('⚠️ [groupedPlans] Nenhum plano disponível, retornando objeto vazio')
        return {}
      }
      
      const plansData = store.getters.plansLoaded ? store.getters.allPlans : plans.value
      console.log('📊 [groupedPlans] plansData.length:', plansData?.length || 0)
      console.log('📊 [groupedPlans] plansData:', plansData)
      
      const grouped = plansData.reduce((groups, plan) => {
        const category = plan.category || 'Outros'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(plan)
        return groups
      }, {})
      
      console.log('📊 [groupedPlans] Resultado agrupado:', grouped)
      return grouped
    })
    
    // Função para obter o status atual de um VIP baseado na data de expiração
    const getVIPStatus = (endDate) => {
      const daysRemaining = getDaysRemaining(endDate)
      
      if (daysRemaining <= 0) {
        return { status: 'expired', label: 'Expirado', class: 'expired' }
      } else if (daysRemaining <= 1) {
        return { status: 'critical', label: 'Crítico (1 dia)', class: 'critical' }
      } else if (daysRemaining <= 3) {
        return { status: 'urgent', label: 'Urgente (≤3 dias)', class: 'urgent' }
      } else if (daysRemaining <= 7) {
        return { status: 'expiring', label: 'Expirando (≤7 dias)', class: 'warning' }
      } else {
        return { status: 'active', label: 'Ativo', class: 'active' }
      }
    }
    
    // Verificar se há filtros ativos
    const hasActiveFilters = computed(() => {
      return searchTerm.value || planFilter.value !== 'all' || statusFilter.value !== 'all'
    })
    
    const hasActiveHistoryFilters = computed(() => {
      return historySearchTerm.value || planFilter.value !== 'all' || dateRangeFilter.value !== 'all'
    })
    
    // Contar filtros ativos para exibir no badge
    const activeFiltersCount = computed(() => {
      let count = 0
      if (searchTerm.value) count++
      if (planFilter.value !== 'all') count++
      if (statusFilter.value !== 'all') count++
      return count
    })
    
         const historyFiltersCount = computed(() => {
       let count = 0
       if (historySearchTerm.value) count++
       if (planFilter.value !== 'all') count++
       if (dateRangeFilter.value !== 'all') count++
       return count
     })
     
     // Verificar se há dados de relatórios
     const hasReportsData = computed(() => {
       return reports.value && Object.keys(reports.value).length > 0 && 
              (reports.value.revenue || reports.value.conversion || reports.value.retention || reports.value.plans)
     })
    
    // Computed para validação
    const canActivateVIP = computed(() => {
      return activateForm.userId && 
             activateForm.duration > 0 && 
             activateForm.amount >= 0 &&
             activateForm.planType && 
             activateForm.planType !== ''
    })
    
    const canUpdateVIP = computed(() => {
      return editForm.duration > 0 && 
             editForm.amount >= 0 &&
             editForm.planType && 
             editForm.planType !== ''
    })
    
    // Methods
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    const checkExistingVIP = () => {
      if (!activateForm.userId) {
        existingVIPInfo.value = null
        return
      }
      
      const existingVIP = activeVIPs.value.find(vip => vip.userId === activateForm.userId)
      existingVIPInfo.value = existingVIP || null
      
      if (existingVIP) {
        // Preencher formulário com dados existentes
        activateForm.planType = getPlanTypeFromName(existingVIP.planName) || 'premium'
        activateForm.amount = existingVIP.amount || 0
        activateForm.autoRenew = existingVIP.autoRenew || false
        activateForm.notes = existingVIP.notes || ''
      }
    }
    

    
    const refreshData = async () => {
      console.log('🔄 Iniciando refreshData...')
      loading.value = true
      try {
        // Carregar dados em sequência para identificar qual está falhando
        console.log('📊 Carregando estatísticas...')
        try {
          await loadStats()
        } catch (error) {
          console.log('⚠️ Erro ao carregar estatísticas, continuando...')
        }
        
        console.log('👑 Carregando VIPs ativos...')
        await loadActiveVIPs()
        
        console.log('⏰ Carregando VIPs expirando...')
        try {
          await loadExpiringVIPs()
        } catch (error) {
          console.log('⚠️ Erro ao carregar VIPs expirando, continuando...')
        }
        
        console.log('📜 Carregando histórico...')
        try {
          await loadHistory()
        } catch (error) {
          console.log('⚠️ Erro ao carregar histórico, continuando...')
        }
        
        console.log('👥 Carregando usuários...')
        try {
          await loadUsers()
        } catch (error) {
          console.log('⚠️ Erro ao carregar usuários, continuando...')
        }
        
        console.log('⚙️ Carregando status dos cron jobs...')
        try {
          await loadCronStatus()
        } catch (error) {
          console.log('⚠️ Erro ao carregar status dos cron jobs, continuando...')
        }
        
        console.log('✅ refreshData concluído com sucesso')
      } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadStats = async () => {
      try {
        console.log('📊 Carregando estatísticas VIP...')
        const response = await axios.get('/api/users/vip-statistics')
        console.log('📊 Resposta das estatísticas:', response.data)
        
        if (response.data.success && response.data.statistics) {
          stats.value = {
            activeVIPs: response.data.statistics.activeVIPs || 0,
            expiringSoon: response.data.statistics.expiringSoon || 0,
            expiredToday: response.data.statistics.expiredToday || 0,
            totalRevenue: response.data.statistics.totalRevenue || 0,
            thisMonthRevenue: response.data.statistics.thisMonthRevenue || 0,
            thisMonth: response.data.statistics.thisMonth || 0
          }
          console.log('✅ Estatísticas carregadas:', stats.value)
        } else {
          console.warn('⚠️ Resposta das estatísticas não contém dados válidos:', response.data)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
      }
    }
    
    const loadActiveVIPs = async () => {
      console.log('🔍 Carregando VIPs ativos...')
      try {
        // Verificar se o token está disponível
        const token = store.getters.authToken
        console.log('🔑 Token disponível:', !!token)
        
        const response = await axios.get('/api/vip/active')
        console.log('📊 Resposta da API VIPs ativos:', response.data)
        activeVIPs.value = response.data.activeVIPs || []
        console.log('✅ VIPs ativos carregados:', activeVIPs.value.length)
        
        // Log detalhado da estrutura dos dados
        if (activeVIPs.value.length > 0) {
          console.log('🔍 Estrutura do primeiro VIP:', activeVIPs.value[0])
          console.log('🆔 IDs dos VIPs:', activeVIPs.value.map(vip => ({ id: vip.id, userId: vip.userId })))
        }
      } catch (error) {
        console.error('❌ Erro ao carregar VIPs ativos:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
      }
    }
    
    const loadExpiringVIPs = async () => {
      try {
        const response = await axios.get('/api/vip/expiring-soon')
        expiringVIPs.value = response.data.expiringVIPs || []
      } catch (error) {
        console.error('Erro ao carregar VIPs expirando:', error)
      }
    }
    
    const loadHistory = async () => {
      try {
        const response = await axios.get('/api/vip/history/all')
        vipHistory.value = response.data.vipHistory || []
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
    
    const loadUsers = async () => {
      console.log('🔍 Carregando usuários...')
      try {
        // Verificar se o token está disponível
        const token = store.getters.authToken
        console.log('🔑 Token disponível para usuários:', !!token)
        
        const response = await axios.get('/api/users')
        console.log('📊 Resposta da API usuários:', response.data)
        availableUsers.value = response.data.users || []
        console.log('✅ Usuários carregados:', availableUsers.value.length)
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error)
        console.error('📋 Detalhes do erro:', error.response?.data)
      }
    }
    
    const loadCronStatus = async () => {
      try {
        console.log('📊 Carregando status dos cron jobs...')
        const response = await axios.get('/api/vip/cron/status')
        console.log('✅ Status dos cron jobs:', response.data)
        
        if (response.data.status) {
          cronStatus.value = response.data.status
        } else {
          cronStatus.value = { isRunning: false, initialized: false, totalJobs: 0 }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar status dos cron jobs:', error)
        cronStatus.value = { isRunning: false, initialized: false, totalJobs: 0 }
      }
    }
    
    const activateVIP = async () => {
      if (!canActivateVIP.value) return
      
      try {
        // Validações
        if (activateForm.duration <= 0) {
          alert('A duração deve ser maior que zero.')
          return
        }
        
        if (activateForm.amount < 0) {
          alert('O valor não pode ser negativo.')
          return
        }
        
        // Mapear os dados do formulário para o formato esperado pelo backend
        const planId = getPlanId(activateForm.planType)
        const planName = getPlanDisplayName(activateForm.planType)
        
        const payload = {
          userId: activateForm.userId,
          planId: planId,
          planName: planName,
          planDays: activateForm.duration,
          amount: activateForm.amount,
          paymentMethod: 'admin_activation',
          autoRenew: activateForm.autoRenew,
          notes: activateForm.notes
        }
        
        // Se já existe VIP ativo, renovar em vez de criar novo
        if (existingVIPInfo.value) {
          await axios.post(`/api/vip/renew/${activateForm.userId}`, payload)
        } else {
          await axios.post('/api/vip/activate', payload)
        }
        
        showActivateModal.value = false
        existingVIPInfo.value = null
        refreshData()
        
        // Reset form
        Object.assign(activateForm, {
          userId: '',
          planType: '',
          duration: 30,
          amount: 0,
          autoRenew: false,
          notes: ''
        })
        
        alert(existingVIPInfo.value ? 'VIP renovado com sucesso!' : 'VIP ativado com sucesso!')
      } catch (error) {
        console.error('Erro ao ativar VIP:', error)
        alert('Erro ao processar solicitação. Verifique os dados e tente novamente.')
      }
    }
    
    const renewVIP = async (vip) => {
      try {
        console.log('🔄 [Frontend] Renovando VIP:', vip)
        console.log('🆔 [Frontend] User ID:', vip.userId)
        
        // Mapear os dados para o formato esperado pelo backend
        const planId = getPlanId(vip.planName?.toLowerCase())
        const planName = vip.planName || 'Premium'
        const planDays = 30 // Padrão de 30 dias para renovação
        
        const payload = {
          planId: planId,
          planName: planName,
          planDays: planDays,
          orderId: `renew_${Date.now()}`, // ID único para a renovação
          paymentMethod: 'admin_renewal',
          amount: vip.amount || 0,
          autoRenew: vip.autoRenew || false,
          notes: `Renovação administrativa - ${new Date().toLocaleString('pt-BR')}`
        }
        
        console.log('📤 [Frontend] Enviando requisição para:', `/api/vip/renew/${vip.userId}`)
        console.log('📤 [Frontend] Payload:', payload)
        
        const response = await axios.post(`/api/vip/renew/${vip.userId}`, payload)
        
        console.log('✅ [Frontend] Resposta da API:', response.data)
        
        refreshData()
        alert('VIP renovado com sucesso!')
      } catch (error) {
        console.error('❌ [Frontend] Erro ao renovar VIP:', error)
        console.error('📋 [Frontend] Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method
        })
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
        alert(`Erro ao renovar VIP: ${errorMessage}`)
      }
    }
    
    const deactivateVIP = async (vip) => {
      if (!confirm(`Tem certeza que deseja desativar o VIP de ${vip.user?.first_name}?`)) {
        return
      }
      
      try {
        await axios.patch(`/api/vip/cancel/${vip.userId}`, {
          reason: 'Cancelamento administrativo'
        })
        refreshData()
      } catch (error) {
        console.error('Erro ao desativar VIP:', error)
      }
    }
    
    const sendExpirationNotification = async (vip) => {
      try {
        await axios.post(`/api/vip/notify-expiration/${vip.userId}`)
        alert('Notificação enviada com sucesso!')
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }
    }
    
    const editVIP = (vip) => {
      console.log('✏️ [Frontend] Editando VIP:', vip)
      console.log('🆔 [Frontend] ID do VIP:', vip.id)
      
      editForm.id = vip.id
      editForm.userId = vip.userId
      editForm.userName = `${vip.user?.first_name} ${vip.user?.last_name} (${vip.user?.email})`
      editForm.planType = getPlanTypeFromName(vip.planName) || 'premium'
      editForm.duration = vip.planDays || 30
      editForm.amount = vip.amount || 0
      editForm.autoRenew = vip.autoRenew || false
      editForm.notes = vip.notes || ''
      
      console.log('📝 [Frontend] Formulário preenchido:', editForm)
      
      showEditModal.value = true
    }
    
    const updateVIP = async () => {
      if (!canUpdateVIP.value) return
      
      try {
        console.log('🔄 [Frontend] Iniciando atualização de VIP...')
        console.log('📝 [Frontend] Dados do formulário:', editForm)
        
        // Validações
        if (editForm.duration <= 0) {
          alert('A duração deve ser maior que zero.')
          return
        }
        
        if (editForm.amount < 0) {
          alert('O valor não pode ser negativo.')
          return
        }
        
        if (!editForm.id) {
          console.error('❌ [Frontend] ID do VIP não encontrado')
          alert('Erro: ID do VIP não encontrado.')
          return
        }
        
        const planName = getPlanDisplayName(editForm.planType)
        
        const payload = {
          planName: planName,
          planDays: editForm.duration,
          amount: editForm.amount,
          autoRenew: editForm.autoRenew,
          notes: editForm.notes
        }
        
        console.log('📤 [Frontend] Enviando requisição para:', `/api/vip/update/${editForm.id}`)
        console.log('📤 [Frontend] Payload:', payload)
        
        const response = await axios.put(`/api/vip/update/${editForm.id}`, payload)
        
        console.log('✅ [Frontend] Resposta da API:', response.data)
        
        showEditModal.value = false
        refreshData()
        alert('VIP atualizado com sucesso!')
      } catch (error) {
        console.error('❌ [Frontend] Erro ao atualizar VIP:', error)
        console.error('📋 [Frontend] Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method
        })
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
        alert(`Erro ao atualizar VIP: ${errorMessage}`)
      }
    }
    
    const reactivateFromHistory = async (vip) => {
      if (!confirm(`Reativar VIP de ${vip.user?.first_name} ${vip.user?.last_name}?`)) {
        return
      }
      
      try {
        // Preencher formulário de ativação com dados do histórico
        activateForm.userId = vip.userId
        activateForm.planType = getPlanTypeFromName(vip.planName) || 'premium'
        activateForm.duration = 30 // Padrão de 30 dias
        activateForm.amount = vip.amount || 0
        activateForm.autoRenew = false
        activateForm.notes = `Reativação a partir do histórico - ${vip.notes || ''}`
        
        // Fechar modal de histórico e abrir modal de ativação
        showActivateModal.value = true
        
        // Verificar se já existe VIP ativo
        checkExistingVIP()
      } catch (error) {
        console.error('Erro ao preparar reativação:', error)
        alert('Erro ao preparar reativação. Tente novamente.')
      }
    }
    
    const clearFilters = () => {
      searchTerm.value = ''
      historySearchTerm.value = ''
      statusFilter.value = 'all'
      planFilter.value = 'all'
      dateRangeFilter.value = 'all'
    }
    
    const initializeCronJobs = async () => {
      try {
        console.log('🚀 Iniciando cron jobs...')
        const response = await axios.post('/api/vip/cron/initialize')
        console.log('✅ Resposta da inicialização:', response.data)
        
        if (response.data.success) {
          alert(`✅ ${response.data.message}\nTotal de jobs: ${response.data.totalJobs}`)
        } else {
          alert('⚠️ Cron jobs não foram inicializados corretamente')
        }
        
        await loadCronStatus()
      } catch (error) {
        console.error('❌ Erro ao inicializar cron jobs:', error)
        alert(`❌ Erro ao inicializar cron jobs: ${error.response?.data?.error || error.message}`)
      }
    }
    
    const stopCronJobs = async () => {
      try {
        console.log('🛑 Parando cron jobs...')
        const response = await axios.post('/api/vip/cron/stop')
        console.log('✅ Resposta da parada:', response.data)
        
        if (response.data.success) {
          alert(`✅ ${response.data.message}\nJobs parados: ${response.data.totalStopped}`)
        } else {
          alert('⚠️ Cron jobs não foram parados corretamente')
        }
        
        await loadCronStatus()
      } catch (error) {
        console.error('❌ Erro ao parar cron jobs:', error)
        alert(`❌ Erro ao parar cron jobs: ${error.response?.data?.error || error.message}`)
      }
    }
    
    const processExpiredVIPs = async () => {
      try {
        await axios.post('/api/vip/cron/process-expired')
        refreshData()
      } catch (error) {
        console.error('Erro no processamento manual:', error)
      }
    }
    
    const generateWeeklyReport = async () => {
      try {
        await axios.post('/api/vip/cron/weekly-report')
        alert('Relatório semanal gerado com sucesso!')
      } catch (error) {
        console.error('Erro ao gerar relatório:', error)
      }
    }
    
         const generateReports = async () => {
       try {
         reportsLoading.value = true
         reportsError.value = ''
         
         const startDate = reportStartDate.value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
         const endDate = reportEndDate.value || new Date().toISOString().split('T')[0]
         
         console.log('📊 Gerando relatórios para o período:', { startDate, endDate })
         
         const [revenueRes, conversionRes, retentionRes, plansRes] = await Promise.all([
           axios.get(`/api/vip/reports/revenue?startDate=${startDate}&endDate=${endDate}`),
           axios.get(`/api/vip/reports/conversion?startDate=${startDate}&endDate=${endDate}`),
           axios.get(`/api/vip/reports/retention?startDate=${startDate}&endDate=${endDate}`),
           axios.get(`/api/vip/reports/plans?startDate=${startDate}&endDate=${endDate}`)
         ])
         
         console.log('📊 Respostas dos relatórios:', {
           revenue: revenueRes.data,
           conversion: conversionRes.data,
           retention: retentionRes.data,
           plans: plansRes.data
         })
         
         reports.value = {
           revenue: revenueRes.data.report || revenueRes.data,
           conversion: conversionRes.data.report || conversionRes.data,
           retention: retentionRes.data.report || retentionRes.data,
           plans: plansRes.data.report || plansRes.data
         }
         
         // Log detalhado dos dados para debug
         console.log('📊 Dados dos relatórios processados:', {
           revenue: reports.value.revenue,
           conversion: reports.value.conversion,
           retention: reports.value.retention,
           plans: reports.value.plans
         })
         
         console.log('✅ Relatórios gerados com sucesso:', reports.value)
         
       } catch (error) {
         console.error('❌ Erro ao gerar relatórios:', error)
         reportsError.value = error.response?.data?.error || error.message || 'Erro desconhecido ao gerar relatórios'
       } finally {
         reportsLoading.value = false
       }
     }
    
    // Utility methods
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('pt-BR')
    }
    
    // Funções auxiliares para mapeamento de planos (agora usando dados do banco)
    const getPlanId = (planType) => {
      // Primeiro tentar usar o store
      if (store.getters.plansLoaded) {
        const plan = store.getters.getPlanByType(planType)
        return plan ? plan.id : 2 // Default para premium
      }
      
      // Fallback para dados locais se disponíveis
      const plan = plans.value.find(p => p.type === planType || p.name === planType)
      if (plan) {
        return plan.id
      }
      
      // Fallback final
      return 2 // Default para premium
    }
    
    const getPlanDisplayName = (planType) => {
      // Primeiro tentar usar o store
      if (store.getters.plansLoaded) {
        return store.getters.getPlanDisplayName(planType)
      }
      
      // Fallback para dados locais se disponíveis
      const plan = plans.value.find(p => p.type === planType || p.name === planType)
      if (plan) {
        return plan.display_name
      }
      
      // Fallback final
      return planType || 'Plano Desconhecido'
    }
    
    const getPlanTypeFromName = (planName) => {
      // Primeiro tentar usar o store
      if (store.getters.plansLoaded) {
        const plan = store.getters.getPlanByDisplayName(planName)
        return plan ? plan.type : 'premium'
      }
      
      // Fallback para dados locais se disponíveis
      const plan = plans.value.find(p => p.display_name === planName)
      if (plan) {
        return plan.type
      }
      
      // Fallback final
      return 'premium'
    }
    
    // Carregar planos do banco de dados
    const loadPlans = async () => {
      try {
        console.log('📋 [VIPAdmin] Carregando planos...')
        
        // Tentar carregar diretamente da API
        const response = await axios.get('/api/plans', {
          timeout: 10000
        })
        
        if (response.data && response.data.success && response.data.plans) {
          plans.value = response.data.plans
          // Atualizar store também
          store.dispatch('setPlans', response.data.plans)
          console.log('✅ [VIPAdmin] Planos carregados da API:', plans.value.length)
        } else {
          console.warn('⚠️ [VIPAdmin] Resposta da API inválida:', response.data)
          plans.value = []
        }
      } catch (error) {
        console.error('❌ [VIPAdmin] Erro ao carregar planos:', error)
        console.error('📋 [VIPAdmin] Detalhes do erro:', error.response?.data)
        
        // Fallback: usar dados hardcoded temporariamente
        console.log('🔄 [VIPAdmin] Usando dados hardcoded como fallback')
        plans.value = [
          { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30 },
          { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30 },
          { id: 3, name: 'vip', display_name: 'Plano VIP', type: 'vip', category: 'Básicos', price: 99.90, duration_days: 30 },
          { id: 4, name: 'pre-daily', display_name: 'Pré-Jogo Diário', type: 'pre-daily', category: 'Pré-Jogo', price: 19.90, duration_days: 1 },
          { id: 5, name: 'pre-weekly', display_name: 'Pré-Jogo Semanal', type: 'pre-weekly', category: 'Pré-Jogo', price: 39.90, duration_days: 7 },
          { id: 6, name: 'pre-monthly', display_name: 'Pré-Jogo Mensal', type: 'pre-monthly', category: 'Pré-Jogo', price: 79.90, duration_days: 30 },
          { id: 7, name: 'pre-yearly', display_name: 'Pré-Jogo Anual', type: 'pre-yearly', category: 'Pré-Jogo', price: 299.90, duration_days: 365 },
          { id: 8, name: 'live-daily', display_name: 'Live Diário', type: 'live-daily', category: 'Live', price: 19.90, duration_days: 1 },
          { id: 9, name: 'live-weekly', display_name: 'Live Semanal', type: 'live-weekly', category: 'Live', price: 39.90, duration_days: 7 },
          { id: 10, name: 'live-monthly', display_name: 'Live Mensal', type: 'live-monthly', category: 'Live', price: 79.90, duration_days: 30 },
          { id: 11, name: 'live-yearly', display_name: 'Live Anual', type: 'live-yearly', category: 'Live', price: 299.90, duration_days: 365 },
          { id: 12, name: 'prelive-daily', display_name: 'Pré+Live Diário', type: 'prelive-daily', category: 'Pré+Live', price: 29.90, duration_days: 1 },
          { id: 13, name: 'prelive-weekly', display_name: 'Pré+Live Semanal', type: 'prelive-weekly', category: 'Pré+Live', price: 59.90, duration_days: 7 },
          { id: 14, name: 'prelive-monthly', display_name: 'Pré+Live Mensal', type: 'prelive-monthly', category: 'Pré+Live', price: 119.90, duration_days: 30 },
          { id: 15, name: 'prelive-yearly', display_name: 'Pré+Live Anual', type: 'prelive-yearly', category: 'Pré+Live', price: 399.90, duration_days: 365 },
          { id: 16, name: 'valuebet-daily', display_name: 'Valuebet Diário', type: 'valuebet-daily', category: 'Valuebet', price: 19.90, duration_days: 1 },
          { id: 17, name: 'valuebet-weekly', display_name: 'Valuebet Semanal', type: 'valuebet-weekly', category: 'Valuebet', price: 39.90, duration_days: 7 },
          { id: 18, name: 'valuebet-monthly', display_name: 'Valuebet Mensal', type: 'valuebet-monthly', category: 'Valuebet', price: 79.90, duration_days: 30 },
          { id: 19, name: 'valuebet-yearly', display_name: 'Valuebet Anual', type: 'valuebet-yearly', category: 'Valuebet', price: 299.90, duration_days: 365 },
          { id: 20, name: 'full-daily', display_name: 'Full Diário', type: 'full-daily', category: 'Full', price: 39.90, duration_days: 1 },
          { id: 21, name: 'full-weekly', display_name: 'Full Semanal', type: 'full-weekly', category: 'Full', price: 79.90, duration_days: 7 },
          { id: 22, name: 'full-monthly', display_name: 'Full Mensal', type: 'full-monthly', category: 'Full', price: 159.90, duration_days: 30 },
          { id: 23, name: 'full-yearly', display_name: 'Full Anual', type: 'full-yearly', category: 'Full', price: 599.90, duration_days: 365 }
        ]
        console.log('✅ [VIPAdmin] Planos hardcoded carregados:', plans.value.length)
      }
    }
    
         const formatCurrency = (value) => {
       return parseFloat(value || 0).toFixed(2)
     }
     
     const formatPercentage = (value) => {
       return parseFloat(value || 0).toFixed(2)
     }
     
     const formatLastGenerated = () => {
       if (!reports.value || !reports.value.revenue?.generatedAt) {
         return 'Nunca'
       }
       return new Date(reports.value.revenue.generatedAt).toLocaleString('pt-BR')
     }
    
    const formatCronDate = (date) => {
      if (!date) return 'N/A'
      try {
        return new Date(date).toLocaleString('pt-BR')
      } catch (error) {
        return 'Data inválida'
      }
    }
    
    const getExpirationClass = (endDate) => {
      const days = getDaysRemaining(endDate)
      if (days <= 3) return 'text-danger'
      if (days <= 7) return 'text-warning'
      return 'text-success'
    }
    
    const getDaysRemaining = (endDate) => {
      if (!endDate) return 0
      const end = new Date(endDate)
      const now = new Date()
      const diffTime = end - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    }
    
    const getDaysRemainingClass = (endDate) => {
      const days = getDaysRemaining(endDate)
      if (days <= 0) return 'expired'
      if (days <= 1) return 'critical'
      if (days <= 3) return 'urgent'
      if (days <= 7) return 'warning'
      return 'success'
    }
    
         // Lifecycle
     onMounted(async () => {
       console.log('🚀 Componente VIPAdminView montado, verificando permissões...')
       console.log('🔑 Token no store:', !!store.getters.authToken)
       console.log('👤 Usuário atual:', store.getters.currentUser)
       console.log('👑 É admin?', store.getters.isAdmin)
       console.log('🔐 Está autenticado?', store.getters.isAuthenticated)
       
       // Debug detalhado do usuário
       const currentUser = store.getters.currentUser
       if (currentUser) {
         console.log('🔍 Detalhes completos do usuário:', {
           id: currentUser.id,
           email: currentUser.email,
           is_admin: currentUser.is_admin,
           role: currentUser.role,
           accountType: currentUser.accountType,
           rawUser: currentUser
         })
       }
       
       // Carregar planos do banco de dados
       await loadPlans()
       
       // Verificar se o usuário é admin
       if (!store.getters.isAdmin) {
         console.error('🚫 Acesso negado: Usuário não é administrador')
         console.error('🔍 Detalhes do usuário:', {
           user: store.getters.currentUser,
           isAdmin: store.getters.isAdmin,
           isAuthenticated: store.getters.isAuthenticated,
           token: !!store.getters.authToken
         })
         
         // Tentar carregar dados mesmo assim para debug
         console.log('⚠️ Tentando carregar dados mesmo sem ser admin para debug...')
         setTimeout(() => {
           refreshData()
         }, 100)
         return
       }
       
       console.log('✅ Permissões verificadas, iniciando carregamento...')
       
       // Pequeno delay para garantir que o componente esteja totalmente montado
       setTimeout(() => {
         console.log('⏰ Executando refreshData após delay...')
         refreshData()
       }, 100)
       
       // Set default date range for reports
       const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
       reportStartDate.value = thirtyDaysAgo.toISOString().split('T')[0]
       reportEndDate.value = new Date().toISOString().split('T')[0]
     })
     
     // Watch para gerar relatórios automaticamente quando a aba for alterada
     watch(activeTab, (newTab) => {
       if (newTab === 'reports' && !hasReportsData.value) {
         console.log('📊 Aba de relatórios aberta, gerando relatórios automaticamente...')
         // Pequeno delay para garantir que a aba esteja renderizada
         setTimeout(() => {
           generateReports()
         }, 300)
       }
     })
    
    return {
      isAdmin: store.getters.isAdmin,
      loading,
      activeTab,
      showActivateModal,
      showEditModal,
      sidebarCollapsed,
      stats,
      activeVIPs,
      expiringVIPs,
      vipHistory,
      availableUsers,
      cronStatus,
             reports,
       reportsLoading,
       reportsError,
       hasReportsData,
       searchTerm,
       historySearchTerm,
      statusFilter,
      planFilter,
      dateRangeFilter,
      activateForm,
      editForm,
      existingVIPInfo,
      reportStartDate,
      reportEndDate,
      filteredActiveVIPs,
      filteredVIPHistory,
      availablePlans,
      groupedPlans,
      plans,
      getVIPStatus,
      hasActiveFilters,
      hasActiveHistoryFilters,
      activeFiltersCount,
      historyFiltersCount,
      canActivateVIP,
      canUpdateVIP,
      toggleSidebar,
      refreshData,
      checkExistingVIP,
      activateVIP,
      editVIP,
      updateVIP,
      renewVIP,
      deactivateVIP,
      reactivateFromHistory,
      sendExpirationNotification,
      clearFilters,
      initializeCronJobs,
      stopCronJobs,
      processExpiredVIPs,
      generateWeeklyReport,
      generateReports,
      loadPlans,
             formatDate,
       formatCurrency,
       formatPercentage,
       formatLastGenerated,
       formatCronDate,
      getExpirationClass,
      getDaysRemaining,
      getDaysRemainingClass
    }
  }
}
</script>

<style lang="scss" scoped>
/* Responsividade para sidebar fixo */
@media (max-width: 1023px) {
  .vip-admin-page {
    margin-left: 0; /* Remove margem em mobile/tablet */
  }
}
.vip-admin-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  width: calc(100% - 280px); /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px; /* Espaço para o sidebar fixo */
  transition: margin-left 0.3s ease;
  box-sizing: border-box;
  
  &.sidebar-collapsed {
    margin-left: 80px; /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px); /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }
}

.main-content {
  flex: 1;  
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 40px; /* Adiciona espaço para o scroll */
  
  /* Estilização da barra de scroll para Webkit (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.6);
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

// Header da Página
.page-header {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 32px 24px 32px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  width: calc(100% - 64px);
  max-width: calc(100% - 64px);
  overflow: hidden;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  }
  
  .header-title {
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-primary, #ffffff);
      
      .header-icon {
        color: #ffd700;
      }
    }
    
    .header-subtitle {
      margin: 8px 0 0 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 14px;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  }
}

// Botões
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-1px);
    }
  }
  
  &.btn-secondary {
    background: var(--bg-tertiary, #3a3a3a);
    color: var(--text-primary, #ffffff);
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    
    &:hover:not(:disabled) {
      background: var(--bg-quaternary, #4a4a4a);
    }
  }
  
  &.btn-success {
    background: linear-gradient(135deg, #28a745, #1e7e34);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e7e34, #155724);
      transform: translateY(-1px);
    }
  }
  
  &.btn-danger {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #c82333, #a71e2a);
      transform: translateY(-1px);
    }
  }
  
  &.btn-warning {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #212529;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e0a800, #d39e00);
      transform: translateY(-1px);
    }
  }
  
  &.btn-info {
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #138496, #117a8b);
      transform: translateY(-1px);
    }
  }
  
  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

// Estatísticas
.stats-section {
  margin-bottom: 24px;
  padding: 0 32px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bg-tertiary, #3a3a3a);
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  p {
    color: var(--text-secondary, #a0a0a0);
    font-size: 16px;
    margin: 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
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
    color: white;
    
    &.vip {
      background: linear-gradient(135deg, #ffd700, #ffb347);
    }
    
    &.warning {
      background: linear-gradient(135deg, #ffc107, #e0a800);
    }
    
    &.danger {
      background: linear-gradient(135deg, #dc3545, #c82333);
    }
    
    &.success {
      background: linear-gradient(135deg, #28a745, #1e7e34);
    }
  }
  
  .stat-content {
    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    
         p {
       margin: 4px 0 0 0;
       color: var(--text-secondary, #a0a0a0);
       font-size: 14px;
     }
     
     .stat-subtitle {
       margin: 2px 0 0 0;
       color: var(--text-tertiary, #808080);
       font-size: 11px;
       font-weight: 400;
     }
  }
}

// Tabs
.tabs-section {
  margin-bottom: 24px;
  padding: 0 32px;
}

.tabs-nav {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #a0a0a0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  min-width: 120px;
  
  &:hover {
    background: var(--bg-tertiary, #3a3a3a);
    color: var(--text-primary, #ffffff);
  }
  
  &.active {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  
  .tab-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  .filter-badge {
    background: #dc3545;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 600;
    margin-left: 4px;
    min-width: 16px;
    text-align: center;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

// Conteúdo das Tabs
.tab-content {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  overflow: visible;
  margin: 0 32px;
  margin-bottom: 40px; /* Adiciona margem inferior para evitar corte */
}

.tab-pane {
  padding: 24px;
  min-height: 400px; /* Garante altura mínima para o conteúdo */
}

// Tabelas
.table-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .table-title {
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary, #ffffff);
      }
      
      .filtered-results {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
        
        .filtered-count {
          color: var(--text-secondary, #a0a0a0);
          font-size: 14px;
        }
      }
    }
    
    .table-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  min-width: 200px;
  
  &::placeholder {
    color: var(--text-secondary, #a0a0a0);
  }
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
}

.filters-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  margin-bottom: 20px; /* Adiciona margem inferior */
  
  /* Estilização da barra de scroll horizontal */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-tertiary, #3a3a3a);
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  }
  
  th {
    background: var(--bg-quaternary, #4a4a4a);
    font-weight: 600;
    color: var(--text-primary, #ffffff);
    font-size: 14px;
  }
  
  td {
    color: var(--text-primary, #ffffff);
    font-size: 14px;
  }
  
  tr:hover {
    background: var(--bg-quaternary, #4a4a4a);
  }
  
  .no-results {
    text-align: center;
    padding: 40px 20px;
    
    .no-results-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      
      .no-results-icon {
        color: var(--text-secondary, #a0a0a0);
        opacity: 0.5;
      }
      
      h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary, #ffffff);
      }
      
      p {
        margin: 0;
        color: var(--text-secondary, #a0a0a0);
        font-size: 14px;
        text-align: center;
        max-width: 300px;
      }
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-quaternary, #4a4a4a);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary, #a0a0a0);
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
    
    .user-name {
      font-weight: 500;
      color: var(--text-primary, #ffffff);
    }
    
    .user-email {
      font-size: 12px;
      color: var(--text-secondary, #a0a0a0);
    }
  }
}

.plan-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  &.premium {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
  }
  
  &.vip {
    background: linear-gradient(135deg, #ffd700, #ffb347);
    color: #1a1a1a;
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  
  &.active {
    background: linear-gradient(135deg, #28a745, #1e7e34);
    color: white;
  }
  
  &.expired {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
  }
  
  &.warning {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #212529;
  }
  
  &.critical {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    animation: pulse 1s ease-in-out infinite;
  }
  
  &.urgent {
    background: linear-gradient(135deg, #fd7e14, #e55a00);
    color: white;
    animation: pulse 2s ease-in-out infinite;
  }
  
  &.cancelled {
    background: var(--bg-quaternary, #4a4a4a);
    color: var(--text-secondary, #a0a0a0);
  }
}

.days-remaining {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  
  &.expired {
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
  }
  
  &.critical {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    animation: pulse 1s ease-in-out infinite;
  }
  
  &.urgent {
    background: linear-gradient(135deg, #fd7e14, #e55a00);
    color: white;
    animation: pulse 2s ease-in-out infinite;
  }
  
  &.warning {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #212529;
  }
  
  &.success {
    background: linear-gradient(135deg, #28a745, #1e7e34);
    color: white;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  
  .btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: var(--bg-quaternary, #4a4a4a);
    color: var(--text-secondary, #a0a0a0);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: var(--bg-quinary, #5a5a5a);
      color: var(--text-primary, #ffffff);
    }
    
    &.danger:hover {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
    }
    
    &.warning:hover {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: #212529;
    }
    
    &.info:hover {
      background: linear-gradient(135deg, #17a2b8, #138496);
      color: white;
    }
  }
}

// Cron Jobs
.cron-section {
  .cron-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
  }
  
  .cron-status {
    .status-indicator {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      background: var(--bg-quaternary, #4a4a4a);
      color: var(--text-secondary, #a0a0a0);
      
      &.active {
        background: linear-gradient(135deg, #28a745, #1e7e34);
        color: white;
      }
    }
  }
  
  .cron-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  
  .cron-info {
    background: var(--bg-tertiary, #3a3a3a);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
    
         .cron-details {
       p {
         margin: 8px 0;
         color: var(--text-secondary, #a0a0a0);
         font-size: 14px;
         
         strong {
           color: var(--text-primary, #ffffff);
         }
         
         .status-running {
           color: #28a745;
           font-weight: 600;
         }
         
         .status-stopped {
           color: #dc3545;
           font-weight: 600;
         }
       }
       
       .jobs-details {
         margin-top: 16px;
         padding-top: 16px;
         border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
         
         h5 {
           margin: 0 0 12px 0;
           font-size: 14px;
           font-weight: 600;
           color: var(--text-primary, #ffffff);
         }
         
         .job-item {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 8px 0;
           border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.05));
           
           &:last-child {
             border-bottom: none;
           }
           
           .job-name {
             color: var(--text-primary, #ffffff);
             font-weight: 500;
             text-transform: capitalize;
           }
           
           .job-status {
             padding: 4px 8px;
             border-radius: 12px;
             font-size: 11px;
             font-weight: 600;
             text-transform: uppercase;
             
             &.running {
               background: #28a745;
               color: white;
             }
             
             &.stopped {
               background: #dc3545;
               color: white;
             }
           }
         }
       }
     }
  }
}

// Relatórios
.reports-section {
  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .header-left {
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary, #ffffff);
      }
      
      .last-generated {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-secondary, #a0a0a0);
        font-size: 12px;
        
        span {
          font-style: italic;
        }
      }
    }
  }
  
  .date-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    
    @media (max-width: 768px) {
      flex-wrap: wrap;
    }
    
    span {
      color: var(--text-secondary, #a0a0a0);
      font-size: 14px;
    }
  }
  
  .date-input {
    padding: 8px 12px;
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    background: var(--bg-tertiary, #3a3a3a);
    color: var(--text-primary, #ffffff);
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }
  
  // Loading State
  .reports-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--bg-tertiary, #3a3a3a);
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    p {
      color: var(--text-secondary, #a0a0a0);
      font-size: 16px;
      margin: 0;
    }
  }
  
  // Error State
  .reports-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    
    .error-icon {
      color: #dc3545;
      margin-bottom: 16px;
      opacity: 0.8;
    }
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
    
    p {
      margin: 0 0 20px 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 14px;
      max-width: 400px;
      line-height: 1.5;
    }
  }
  
  // No Data State
  .reports-no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    
    .no-data-icon {
      color: var(--text-secondary, #a0a0a0);
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }
    
    p {
      margin: 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 14px;
      max-width: 400px;
      line-height: 1.5;
    }
  }
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.report-card {
  background: var(--bg-tertiary, #3a3a3a);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #ffffff);
  }
  
  .report-content {
    p {
      margin: 8px 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 14px;
      
      strong {
        color: var(--text-primary, #ffffff);
      }
    }
    
         .plan-stat {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 8px 0;
       border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
       
       &:last-child {
         border-bottom: none;
       }
       
       .plan-name {
         color: var(--text-primary, #ffffff);
         font-weight: 500;
       }
       
       .plan-count {
         color: var(--text-secondary, #a0a0a0);
         font-weight: 600;
       }
     }
     
     .no-data {
       text-align: center;
       padding: 20px;
       
       p {
         margin: 0;
         color: var(--text-secondary, #a0a0a0);
         font-size: 14px;
         font-style: italic;
       }
     }
     
     .plan-summary {
       margin-top: 16px;
       padding-top: 16px;
       border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
       
       p {
         margin: 8px 0;
         color: var(--text-secondary, #a0a0a0);
         font-size: 13px;
         
         strong {
           color: var(--text-primary, #ffffff);
         }
       }
     }
  }
}

// Modal
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
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  
  /* Estilização da barra de scroll para Webkit */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #ffffff);
  }
  
  .modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-tertiary, #3a3a3a);
    border-radius: 6px;
    color: var(--text-secondary, #a0a0a0);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-quaternary, #4a4a4a);
      color: var(--text-primary, #ffffff);
    }
  }
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary, #ffffff);
    font-size: 14px;
  }
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: var(--text-secondary, #a0a0a0);
  }
}

.form-checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #007bff;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: var(--text-secondary, #a0a0a0);
  }
}

.existing-vip-info {
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-quaternary, #4a4a4a);
  border-radius: 6px;
  border-left: 4px solid #ffc107;
  
  p {
    margin: 4px 0;
    font-size: 13px;
    color: var(--text-secondary, #a0a0a0);
    
    strong {
      color: var(--text-primary, #ffffff);
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

// Tela de Acesso Negado
.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  
  .access-denied-content {
    text-align: center;
    max-width: 500px;
    
    .access-denied-icon {
      color: #dc3545;
      margin-bottom: 24px;
      opacity: 0.8;
    }
    
    h1 {
      margin: 0 0 16px 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary, #ffffff);
    }
    
    p {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: var(--text-secondary, #a0a0a0);
      line-height: 1.5;
      
      &:last-of-type {
        margin-bottom: 32px;
      }
    }
  }
}

// Responsividade
@media (max-width: 768px) {
  .page-header {
    margin: 16px 20px 16px 20px;
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
  }
  
  .stats-section {
    padding: 0 20px;
  }
  
  .tabs-section {
    padding: 0 20px;
  }
  
  .tab-content {
    margin: 0 20px;
  }
  
  .main-content {
    margin-left: 80px;
    
    &.sidebar-collapsed {
      margin-left: 280px;
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-nav {
    .tab-btn {
      min-width: auto;
      flex: 1;
    }
  }
  
  .cron-controls {
    flex-direction: column;
    
    .btn {
      width: 100%;
    }
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 0;
    padding: 12px;
    
    &.sidebar-collapsed {
      margin-left: 0;
    }
  }
  
  .page-header {
    padding: 16px;
    
    .header-content {
      gap: 12px;
    }
    
    .header-title h1 {
      font-size: 24px;
    }
  }
  
  .tab-pane {
    padding: 16px;
  }
  
  .data-table {
    th, td {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
}

/* Estilos globais para scrollbars em toda a página */
.vip-admin-page {
  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.1);
}

/* Estilização global de scrollbars para Webkit (Chrome, Safari, Edge) */
.vip-admin-page ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.vip-admin-page ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.vip-admin-page ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vip-admin-page ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.6);
}

.vip-admin-page ::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.1);
}

/* Scrollbar para elementos específicos */
.tab-pane,
.table-container,
.cron-section,
.reports-section {
  /* Removido scroll individual para manter apenas o scroll principal */
}

/* Scrollbar para tabelas com muitos dados */
.data-table {
  min-width: 900px; /* Garante que tabelas largas tenham scroll horizontal */
  width: 100%;
}

/* Garante que o container da tabela tenha scroll horizontal */
.table-container {
  overflow-x: auto;
  overflow-y: visible;
}
</style>
