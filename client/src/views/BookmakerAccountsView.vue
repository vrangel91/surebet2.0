<template>
  <div class="accounts-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header -->
      <div class="accounts-header">
        <h1 class="accounts-title">
          <svg class="accounts-icon" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.708 2.825L15 11.105V5.383zm-.034 6.876l-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
          </svg>
          Gerenciamento de Contas
        </h1>
        <p class="accounts-subtitle">Gerencie suas contas de casas de apostas e saldos</p>
      </div>

      <!-- Botão Adicionar Conta -->
      <div class="actions-section">
        <button @click="showAddModal = true" class="add-account-btn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Adicionar Conta
        </button>
      </div>

      <!-- Estatísticas Gerais -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-number">{{ accounts.length }}</span>
          <span class="stat-label">Total de Contas</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ formatCurrency(totalBalance) }}</span>
          <span class="stat-label">Saldo Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ activeAccounts }}</span>
          <span class="stat-label">Contas Ativas</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ formatCurrency(totalTransactions) }}</span>
          <span class="stat-label">Total Transações</span>
        </div>
      </div>

      <!-- Lista de Contas -->
      <div class="accounts-section">
        <h3>Suas Contas</h3>
        
        <!-- Indicador de carregamento -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="loading-spinner">⏳</div>
          <span>Carregando contas...</span>
        </div>
        
        <div v-else-if="accounts.length === 0" class="no-accounts">
          <p>Nenhuma conta encontrada. Clique em "Adicionar Conta" para começar.</p>
        </div>
        
        <div v-else class="accounts-grid">
          <div 
            v-for="account in accounts" 
            :key="account.id" 
            class="account-card"
            :class="{ inactive: account.status !== 'active' }"
          >
            <div class="account-header">
              <div class="account-info">
                <h4 class="account-name">{{ account.bookmaker_name }}</h4>
                <span class="account-status" :class="account.status">
                  {{ getStatusText(account.status) }}
                </span>
              </div>
              <div class="account-actions">
                <button @click="editAccount(account)" class="action-btn edit" title="Editar conta">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.5-.5V9h-.5a.5.5 0 0 1-.5-.5V8h-.5a.5.5 0 0 1-.5-.5V7h-.5a.5.5 0 0 1-.5-.5V6H1a.5.5 0 0 1-.5-.5V5H.5a.5.5 0 0 1-.5-.5V4H.5a.5.5 0 0 1-.5-.5V3H.5a.5.5 0 0 1-.5-.5V2H.5a.5.5 0 0 1-.5-.5V1H.5a.5.5 0 0 1-.5-.5H0v1h.5a.5.5 0 0 1 .5.5V2h.5a.5.5 0 0 1 .5.5V3h.5a.5.5 0 0 1 .5.5V4h.5a.5.5 0 0 1 .5.5V5h.5a.5.5 0 0 1 .5.5V6h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V8h.5a.5.5 0 0 1 .5.5V9h.5a.5.5 0 0 1 .5.5V10h.5a.5.5 0 0 1 .5.5V11h.5a.5.5 0 0 1 .5.5V12h.5a.5.5 0 0 1 .5.5V13h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1-.5.5H6v-.5a.5.5 0 0 1 .5-.5H7v-.5a.5.5 0 0 1 .5-.5H8v-.5a.5.5 0 0 1 .5-.5H9v-.5a.5.5 0 0 1 .5-.5h.5z"/>
                  </svg>
                </button>
                <button @click="deleteAccount(account)" class="action-btn delete" title="Excluir conta">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="account-balance">
              <span class="balance-label">Saldo:</span>
              <span class="balance-amount" :class="{ 'has-balance': parseFloat(account.balance) > 0 }">
                {{ formatCurrency(account.balance) }}
              </span>
              <span v-if="parseFloat(account.balance) > 0" class="balance-warning">
                ⚠️ Saldo disponível
              </span>
            </div>
            
            <div class="account-details">
              <div class="detail-item">
                <span class="detail-label">Moeda:</span>
                <span class="detail-value">{{ account.currency }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Criada em:</span>
                <span class="detail-value">{{ formatDate(account.created_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Última atualização:</span>
                <span class="detail-value">{{ formatDate(account.last_updated) }}</span>
              </div>
            </div>
            
            <div class="account-notes" v-if="account.notes">
              <span class="notes-label">Observações:</span>
              <p class="notes-text">{{ account.notes }}</p>
            </div>
            
            <div class="account-transactions">
              <button @click="viewTransactions(account)" class="transactions-btn">
                Ver Transações
              </button>
              <button @click="openWithdrawModal(account)" class="withdraw-btn" :disabled="account.status !== 'active'">
                Saque
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Adicionar/Editar Conta -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Editar Conta' : 'Adicionar Nova Conta' }}</h3>
            <button @click="closeModal" class="close-btn">×</button>
          </div>
          
          <form class="modal-form">
            <div class="form-group">
              <label for="bookmaker_name">Nome da Casa de Apostas *</label>
              <input 
                id="bookmaker_name"
                v-model="formData.bookmaker_name"
                type="text"
                placeholder="Ex: Bet365, William Hill..."
              >
            </div>
            
            <div class="form-group">
              <label for="balance">Saldo Inicial</label>
              <input 
                id="balance"
                v-model="formData.balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                @input="handleBalanceInput"
              >
            </div>
            
            <div class="form-group">
              <label for="currency">Moeda</label>
              <select id="currency" v-model="formData.currency">
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="notes">Observações</label>
              <textarea 
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Observações sobre a conta..."
              ></textarea>
            </div>
            
            <div class="form-group" v-if="showEditModal">
              <label for="status">Status</label>
              <select id="status" v-model="formData.status">
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="cancel-btn">Cancelar</button>
              <button type="button" class="save-btn" :disabled="isLoading" @click="saveAccount">
                {{ isLoading ? 'Salvando...' : (showEditModal ? 'Atualizar' : 'Criar') }}
                <span v-if="isLoading" class="loading-spinner">⏳</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Saque -->
      <div v-if="showWithdrawModal" class="modal-overlay" @click="closeWithdrawModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Saque - {{ selectedAccount?.bookmaker_name }}</h3>
            <button @click="closeWithdrawModal" class="close-btn">×</button>
          </div>
          
          <form @submit.prevent="processWithdraw" class="modal-form">
                         <div class="form-group">
               <label for="withdraw_amount">Valor do Saque *</label>
               <input 
                 id="withdraw_amount"
                 v-model="withdrawData.amount"
                 type="number"
                 step="0.01"
                 min="0.01"
                 required
                 placeholder="0.00"
                 @input="handleWithdrawAmountInput"
               >
               <small class="form-help">Saldo disponível: {{ formatCurrency(selectedAccount?.balance || 0) }}</small>
             </div>
            
            <div class="form-group">
              <label for="withdraw_description">Descrição (opcional)</label>
              <textarea 
                id="withdraw_description"
                v-model="withdrawData.description"
                rows="2"
                placeholder="Descrição do saque..."
              ></textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeWithdrawModal" class="cancel-btn">Cancelar</button>
              <button type="submit" class="withdraw-submit-btn" :disabled="isLoading">
                {{ isLoading ? 'Processando...' : 'Confirmar Saque' }}
              </button>
            </div>
          </form>
        </div>
      </div>

             <!-- Modal de Transações -->
       <div v-if="showTransactionsModal" class="modal-overlay" @click="closeTransactionsModal">
         <div class="modal-content large" @click.stop>
           <div class="modal-header">
             <h3>Histórico de Transações - {{ selectedAccount?.bookmaker_name }}</h3>
             <button @click="closeTransactionsModal" class="close-btn">×</button>
           </div>
           
           <div class="transactions-content">
             <div v-if="transactions.length === 0" class="no-transactions">
               <p>Nenhuma transação encontrada para esta conta.</p>
             </div>
             
             <div v-else class="transactions-list">
               <div 
                 v-for="transaction in transactions" 
                 :key="transaction.id"
                 class="transaction-item"
                 :class="transaction.transaction_type"
               >
                 <div class="transaction-info">
                   <div class="transaction-type">
                     <span class="type-badge" :class="transaction.transaction_type">
                       {{ getTransactionTypeText(transaction.transaction_type) }}
                     </span>
                   </div>
                   <div class="transaction-amount">
                     <span class="amount" :class="transaction.transaction_type">
                       {{ transaction.transaction_type === 'withdrawal' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
                     </span>
                   </div>
                 </div>
                 
                 <div class="transaction-details">
                   <div class="transaction-description">
                     {{ transaction.description }}
                   </div>
                   <div class="transaction-date">
                     {{ formatDateTime(transaction.created_at) }}
                   </div>
                   <div class="transaction-balance">
                     Saldo após: {{ formatCurrency(transaction.balance_after) }}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

       <!-- Modal de Confirmação de Exclusão -->
       <div v-if="showDeleteConfirmModal" class="modal-overlay" @click="closeDeleteConfirmModal">
         <div class="modal-content delete-confirm" @click.stop>
           <div class="modal-header delete-header">
             <div class="delete-icon">
               <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                 <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
               </svg>
             </div>
             <h3>Confirmar Exclusão de Conta</h3>
             <button @click="closeDeleteConfirmModal" class="close-btn">×</button>
           </div>
           
           <div class="delete-content">
             <div class="account-summary">
               <div class="account-info-row">
                 <span class="info-label">Nome da Conta:</span>
                 <span class="info-value">{{ accountToDelete?.bookmaker_name }}</span>
               </div>
               <div class="account-info-row">
                 <span class="info-label">Saldo Atual:</span>
                 <span class="info-value balance-value">{{ formatCurrency(accountToDelete?.balance) }}</span>
               </div>
               <div class="account-info-row">
                 <span class="info-label">Status:</span>
                 <span class="info-value status-value" :class="accountToDelete?.status">
                   {{ getStatusText(accountToDelete?.status) }}
                 </span>
               </div>
               <div class="account-info-row">
                 <span class="info-label">Criada em:</span>
                 <span class="info-value">{{ formatDate(accountToDelete?.created_at) }}</span>
               </div>
             </div>

             <div v-if="deleteValidation.warnings.length > 0" class="delete-warnings">
               <h4>⚠️ Avisos Importantes:</h4>
               <ul class="warnings-list">
                 <li v-for="warning in deleteValidation.warnings" :key="warning" class="warning-item">
                   {{ warning }}
                 </li>
               </ul>
             </div>

             <div class="delete-consequences">
               <h4>🔒 Esta ação irá:</h4>
               <ul class="consequences-list">
                 <li>Marcar a conta como inativa (soft delete)</li>
                 <li>Preservar histórico de transações</li>
                 <li>Atualizar totalizadores da dashboard</li>
                 <li>Registrar log de auditoria</li>
               </ul>
             </div>

             <div class="delete-actions">
               <button @click="closeDeleteConfirmModal" class="cancel-delete-btn">
                 <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                   <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                 </svg>
                 Cancelar
               </button>
               <button @click="confirmDeleteAccount" class="confirm-delete-btn" :disabled="isLoading">
                 <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                 </svg>
                 {{ isLoading ? 'Excluindo...' : 'Confirmar Exclusão' }}
                 <span v-if="isLoading" class="loading-spinner">⏳</span>
               </button>
             </div>
           </div>
         </div>
       </div>
    </main>

    <!-- Sistema de Notificações Toast -->
    <div class="toast-container">
             <div 
         v-for="toast in toasts" 
         :key="toast.id"
         :data-toast-id="toast.id"
         class="toast-notification"
         :class="toast.type"
       >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.97a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
          <svg v-else-if="toast.type === 'warning'" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button @click="removeToast(toast.id)" class="toast-close">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        <div class="toast-progress" :style="{ width: `${toast.progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Sidebar from '../components/Sidebar.vue'
import { http } from '../utils/http'

export default {
  name: 'BookmakerAccountsView',
  components: {
    Sidebar
  },
  
  data() {
    return {
      sidebarCollapsed: false,
      accounts: [],
      isLoading: false,
      showAddModal: false,
      showEditModal: false,
             showWithdrawModal: false,
       showTransactionsModal: false,
       showDeleteConfirmModal: false,
       selectedAccount: null,
       accountToDelete: null,
       deleteValidation: {
         canDelete: true,
         reason: '',
         warnings: []
       },
       transactions: [],
      formData: {
        bookmaker_name: '',
        balance: '',
        currency: 'BRL',
        notes: '',
        status: 'active'
      },
      withdrawData: {
        amount: '',
        description: ''
      },
      toasts: [] // Array para armazenar as notificações
    }
  },
  
  computed: {
    ...mapGetters([
      'isAdmin',
      'userCredits',
      'canUseSystem'
    ]),
    
    currentUser() {
      return this.$store.getters.currentUser
    },
    
    hasCredits() {
      return this.userCredits > 0 && this.canUseSystem
    },
    
    totalBalance() {
      return this.accounts.reduce((total, account) => {
        return total + parseFloat(account.balance || 0)
      }, 0)
    },
    
    activeAccounts() {
      return this.accounts.filter(account => account.status === 'active').length
    },
    
    totalTransactions() {
      return this.transactions.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount || 0)
      }, 0)
    }
  },
  
  async mounted() {
    this.loadAccounts()
  },
  
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    openGlossary() {
      // Implementar se necessário
    },
    
    async loadAccounts() {
      try {
        console.log('🔄 Carregando contas...')
        this.isLoading = true
        const response = await http.get('/api/bookmaker-accounts')
        console.log('📊 Resposta da API:', response)
        
        if (response && response.data) {
          this.accounts = response.data.data || response.data || []
          console.log('✅ Contas carregadas:', this.accounts.length)
          console.log('📋 Lista de contas:', this.accounts)
          
          // Forçar atualização do Vue após carregar dados
          this.$nextTick(() => {
            this.$forceUpdate()
            console.log('🔄 Vue atualizado após carregar contas')
          })
        } else {
          this.accounts = []
          console.log('⚠️ Nenhuma conta encontrada')
        }
      } catch (error) {
                 console.error('❌ Erro ao carregar contas:', error)
         this.showToast('Erro', 'Erro ao carregar contas', 'error')
        this.accounts = []
      } finally {
        this.isLoading = false
      }
    },
    
         editAccount(account) {
       console.log('✏️ Editando conta:', account)
       console.log('🖱️ Clique detectado no botão editar')
       
       // Verificar se conta pode ser editada
       if (account.status === 'suspended') {
         this.showToast('Aviso', 'Contas suspensas não podem ser editadas. Entre em contato com o suporte.', 'warning')
         return
       }
       
       this.selectedAccount = account
       this.formData = {
         bookmaker_name: account.bookmaker_name,
         balance: account.balance,
         currency: account.currency,
         notes: account.notes || '',
         status: account.status
       }
       
       // Verificar limitações de edição
       const warnings = []
       if (parseFloat(account.balance) > 0) {
         warnings.push('💰 Conta possui saldo - alterações limitadas')
       }
       
       if (warnings.length > 0) {
         console.log('⚠️ Avisos de edição:', warnings)
       }
       
       this.showEditModal = true
       console.log('📝 Dados do formulário:', this.formData)
       console.log('📊 Estado do modal - showEditModal:', this.showEditModal)
     },
    
              async deleteAccount(account) {
       console.log('🗑️ Tentando excluir conta:', account)
       console.log('🖱️ Clique detectado no botão excluir')
       
       // Validações pré-exclusão
       const validationResult = await this.validateAccountForDeletion(account)
       this.deleteValidation = validationResult
       
       if (!validationResult.canDelete) {
         this.showToast('Erro', `Não é possível excluir esta conta:\n\n${validationResult.reason}`, 'error')
         return
       }
       
       // Abrir modal de confirmação
       this.accountToDelete = account
       this.showDeleteConfirmModal = true
       console.log('📋 Modal de confirmação aberto')
     },

     async confirmDeleteAccount() {
       if (!this.accountToDelete) return
       
       try {
         console.log('🔄 Iniciando exclusão...')
         this.isLoading = true
         
         const response = await http.delete(`/api/bookmaker-accounts/${this.accountToDelete.id}`)
         console.log('✅ Resposta da exclusão:', response)
         
         console.log('✅ Conta excluída com sucesso')
         this.showToast('Sucesso', 'Conta excluída com sucesso', 'success')
         
         // Registrar log de auditoria
         await this.logAuditAction('DELETE_ACCOUNT', this.accountToDelete.id, {
           account_name: this.accountToDelete.bookmaker_name,
           balance: this.accountToDelete.balance,
           status: this.accountToDelete.status
         })
         
         // Fechar modal
         this.closeDeleteConfirmModal()
         
         // Recarregar contas e atualizar dashboard
         console.log('🔄 Recarregando lista após exclusão...')
         await this.loadAccounts()
         this.updateDashboardTotals()
         console.log('✅ Lista e dashboard atualizados após exclusão')
         
         // Forçar atualização do Vue
         this.$forceUpdate()
         console.log('🔄 Forçando atualização do Vue')
         
         // Aguardar um pouco e forçar nova atualização
         setTimeout(async () => {
           console.log('🔄 Recarregando lista novamente...')
           await this.loadAccounts()
           this.updateDashboardTotals()
           this.$forceUpdate()
           console.log('🔄 Segunda atualização forçada do Vue')
         }, 200)
         
       } catch (error) {
         console.error('❌ Erro ao excluir conta:', error)
         this.showToast('Erro', error.response?.data?.message || 'Erro ao excluir conta', 'error')
       } finally {
         this.isLoading = false
       }
     },
    
    async saveAccount() {
      // Proteção contra cliques duplos
      if (this.isLoading) {
        console.log('⚠️ Operação já em andamento, ignorando clique')
        return
      }
      
      console.log('saveAccount chamado', this.formData)
      
             // Validação avançada
       const validation = this.validateAccountForEdit(this.formData, this.selectedAccount)
       if (!validation.isValid) {
         console.error('❌ Validação falhou:', validation.errors)
         this.showToast('Erro', `Erro de validação:\n\n${validation.errors.join('\n')}`, 'error')
         return
       }
      
      try {
        this.isLoading = true
        console.log('Enviando dados:', this.formData)
        
        // Preparar dados para envio
        const dataToSend = {
          ...this.formData,
          balance: this.formData.balance ? parseFloat(this.formData.balance) : 0.00
        }
        
        let response
        if (this.showEditModal) {
          console.log('🔄 Atualizando conta ID:', this.selectedAccount.id)
          console.log('📤 Dados para atualização:', dataToSend)
          response = await http.put(`/api/bookmaker-accounts/${this.selectedAccount.id}`, dataToSend)
                     console.log('✅ Resposta da atualização:', response)
           console.log('✅ Conta atualizada com sucesso')
           this.showToast('Sucesso', 'Conta atualizada com sucesso', 'success')
           
           // Registrar log de auditoria
           await this.logAuditAction('UPDATE_ACCOUNT', this.selectedAccount.id, {
             account_name: this.formData.bookmaker_name,
             changes: this.getChangesSummary(this.selectedAccount, this.formData)
           })
        } else {
          console.log('🆕 Criando nova conta')
          console.log('📤 Dados para criação:', dataToSend)
          response = await http.post('/api/bookmaker-accounts', dataToSend)
                     console.log('✅ Resposta da criação:', response)
           console.log('✅ Conta criada com sucesso')
           this.showToast('Sucesso', 'Conta criada com sucesso', 'success')
           
           // Registrar log de auditoria
           await this.logAuditAction('CREATE_ACCOUNT', response.data?.id, {
             account_name: this.formData.bookmaker_name,
             initial_balance: this.formData.balance,
             currency: this.formData.currency
           })
        }
        
        // Definir loading como false antes de fechar modal
        this.isLoading = false
        
        // Fechar modal após sucesso
        console.log('🎉 Sucesso! Fechando modal...')
        this.closeModal()
        
        // Recarregar contas imediatamente
        console.log('🔄 Recarregando contas...')
        await this.loadAccounts()
        console.log('✅ Processo concluído')
        
             } catch (error) {
         console.error('❌ Erro ao salvar conta:', error)
         this.showToast('Erro', error.response?.data?.message || 'Erro ao salvar conta', 'error')
         
         // Não reabrir modal automaticamente em caso de erro
         // O usuário pode tentar novamente se quiser
         console.log('⚠️ Modal não será reaberto automaticamente')
       } finally {
         this.isLoading = false
       }
    },
    
         async processWithdraw() {
       // Validação do valor do saque
       const withdrawAmount = parseFloat(this.withdrawData.amount)
       const availableBalance = parseFloat(this.selectedAccount?.balance || 0)
       
       if (!withdrawAmount || withdrawAmount <= 0) {
         this.showToast('Erro', 'Por favor, insira um valor válido para o saque', 'error')
         return
       }
       
       if (withdrawAmount > availableBalance) {
         this.showToast('Erro', `Valor do saque (${this.formatCurrency(withdrawAmount)}) excede o saldo disponível (${this.formatCurrency(availableBalance)})`, 'error')
         return
       }
       
       try {
         this.isLoading = true
         await http.post(`/api/bookmaker-accounts/${this.selectedAccount.id}/withdraw`, this.withdrawData)
                  console.log('✅ Saque realizado com sucesso')
          this.showToast('Sucesso', `Saque de ${this.formatCurrency(withdrawAmount)} realizado com sucesso`, 'success')
         this.closeWithdrawModal()
         this.loadAccounts()
       } catch (error) {
         console.error('❌ Erro ao realizar saque:', error)
          this.showToast('Erro', error.response?.data?.message || 'Erro ao realizar saque', 'error')
       } finally {
         this.isLoading = false
       }
     },
    
    async viewTransactions(account) {
      try {
        this.selectedAccount = account
        const response = await http.get(`/api/bookmaker-accounts/${account.id}/transactions`)
        this.transactions = response.data.data.transactions || []
        this.showTransactionsModal = true
      } catch (error) {
        console.error('❌ Erro ao carregar transações:', error)
         this.showToast('Erro', 'Erro ao carregar transações', 'error')
      }
    },
    
    openWithdrawModal(account) {
      this.selectedAccount = account
      this.withdrawData = {
        amount: '',
        description: ''
      }
      this.showWithdrawModal = true
    },
    
         handleBalanceInput(event) {
       // Garantir que o valor seja um número válido
       const value = event.target.value
       if (value === '' || value === null || value === undefined) {
         this.formData.balance = ''
       } else {
         const numValue = parseFloat(value)
         if (!isNaN(numValue) && numValue >= 0) {
           this.formData.balance = numValue
         }
       }
     },

     handleWithdrawAmountInput(event) {
       // Permitir digitação livre, apenas validar se é um número válido
       const value = event.target.value
       
       // Permitir campo vazio
       if (value === '' || value === null || value === undefined) {
         this.withdrawData.amount = ''
         return
       }
       
       // Verificar se é um número válido
       const numValue = parseFloat(value)
       if (!isNaN(numValue) && numValue >= 0) {
         this.withdrawData.amount = value // Manter o valor original para permitir decimais
       }
       // Se não for um número válido, não fazer nada (permitir que o usuário continue digitando)
     },
    
    closeModal() {
      console.log('🔒 Fechando modal...')
      this.showAddModal = false
      this.showEditModal = false
      this.selectedAccount = null
      this.isLoading = false
      this.formData = {
        bookmaker_name: '',
        balance: '',
        currency: 'BRL',
        notes: '',
        status: 'active'
      }
      console.log('✅ Modal fechado')
      console.log('📊 Estado atual - showAddModal:', this.showAddModal, 'showEditModal:', this.showEditModal)
    },
    
    closeWithdrawModal() {
      this.showWithdrawModal = false
      this.selectedAccount = null
      this.withdrawData = {
        amount: '',
        description: ''
      }
    },
    
         closeTransactionsModal() {
       this.showTransactionsModal = false
       this.selectedAccount = null
       this.transactions = []
     },

     closeDeleteConfirmModal() {
       this.showDeleteConfirmModal = false
       this.accountToDelete = null
       this.deleteValidation = {
         canDelete: true,
         reason: '',
         warnings: []
       }
     },
    
    getStatusText(status) {
      const statusMap = {
        active: 'Ativa',
        inactive: 'Inativa',
        suspended: 'Suspensa'
      }
      return statusMap[status] || status
    },
    
    getTransactionTypeText(type) {
      const typeMap = {
        deposit: 'Depósito',
        withdrawal: 'Saque',
        adjustment: 'Ajuste'
      }
      return typeMap[type] || type
    },
    
    formatCurrency(value) {
      if (!value && value !== 0) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleDateString('pt-BR')
    },
    
         formatDateTime(dateString) {
       if (!dateString) return 'Nunca'
       return new Date(dateString).toLocaleString('pt-BR')
     },
     
     // Validação pré-exclusão de conta
     async validateAccountForDeletion(account) {
       console.log('🔍 Validando conta para exclusão:', account)
       
       const validations = {
         canDelete: true,
         reason: '',
         warnings: []
       }
       
       // Verificar se conta possui saldo > 0
       if (parseFloat(account.balance) > 0) {
         validations.warnings.push(`💰 Saldo disponível: ${this.formatCurrency(account.balance)}`)
         validations.reason = `Esta conta possui saldo disponível. Recomendamos sacar o valor antes da exclusão.`
       }
       
       // Verificar se conta está ativa
       if (account.status === 'active') {
         validations.warnings.push('⚠️ Conta está ativa')
       }
       
       // Verificar se há transações recentes (últimos 30 dias)
       try {
         const response = await http.get(`/api/bookmaker-accounts/${account.id}/transactions`)
         const transactions = response.data.data.transactions || []
         const recentTransactions = transactions.filter(t => {
           const transactionDate = new Date(t.created_at)
           const thirtyDaysAgo = new Date()
           thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
           return transactionDate > thirtyDaysAgo
         })
         
         if (recentTransactions.length > 0) {
           validations.warnings.push(`📊 ${recentTransactions.length} transação(ões) nos últimos 30 dias`)
         }
       } catch (error) {
         console.warn('⚠️ Não foi possível verificar transações:', error)
       }
       
       // Se há avisos, mas não é bloqueante
       if (validations.warnings.length > 0 && parseFloat(account.balance) > 0) {
         validations.canDelete = false
       }
       
       console.log('✅ Validação concluída:', validations)
       return validations
     },
     
     // Construir mensagem de confirmação de exclusão
     buildDeletionConfirmationMessage(account) {
       const balance = this.formatCurrency(account.balance)
       const status = this.getStatusText(account.status)
       
       let message = `🗑️ CONFIRMAR EXCLUSÃO DE CONTA\n\n`
       message += `📋 Nome: ${account.bookmaker_name}\n`
       message += `💰 Saldo: ${balance}\n`
       message += `📊 Status: ${status}\n`
       message += `📅 Criada em: ${this.formatDate(account.created_at)}\n\n`
       
       if (parseFloat(account.balance) > 0) {
         message += `⚠️ ATENÇÃO: Esta conta possui saldo disponível!\n`
         message += `Recomendamos sacar o valor antes da exclusão.\n\n`
       }
       
       message += `🔒 Esta ação irá:\n`
       message += `• Marcar a conta como inativa\n`
       message += `• Preservar histórico de transações\n`
       message += `• Atualizar totalizadores\n\n`
       
       message += `Tem certeza que deseja continuar?`
       
       return message
     },
     
     // Validação para edição de conta
     validateAccountForEdit(formData, originalAccount) {
       console.log('🔍 Validando dados para edição:', formData)
       
       const errors = []
       
       // Validação do nome
       if (!formData.bookmaker_name || formData.bookmaker_name.trim().length < 3) {
         errors.push('Nome deve ter pelo menos 3 caracteres')
       }
       
       if (formData.bookmaker_name && formData.bookmaker_name.trim().length > 50) {
         errors.push('Nome deve ter no máximo 50 caracteres')
       }
       
       // Validação de moeda
       const validCurrencies = ['BRL', 'USD', 'EUR']
       if (!validCurrencies.includes(formData.currency)) {
         errors.push('Moeda inválida')
       }
       
       // Validação de mudança de moeda
       if (originalAccount && formData.currency !== originalAccount.currency) {
         if (parseFloat(originalAccount.balance) > 0) {
           errors.push('Não é possível alterar a moeda de uma conta com saldo')
         }
       }
       
       // Validação de status
       const validStatuses = ['active', 'inactive', 'suspended']
       if (!validStatuses.includes(formData.status)) {
         errors.push('Status inválido')
       }
       
       // Validação de mudança de status
       if (originalAccount && formData.status !== originalAccount.status) {
         if (originalAccount.status === 'inactive' && formData.status === 'active') {
           // Verificar limite de contas ativas (exemplo: máximo 5)
           const activeAccounts = this.accounts.filter(a => a.status === 'active').length
           if (activeAccounts >= 5) {
             errors.push('Limite máximo de 5 contas ativas atingido')
           }
         }
       }
       
                console.log('✅ Validação de edição concluída:', errors)
         return {
           isValid: errors.length === 0,
           errors: errors
         }
       },
       
       // Registrar log de auditoria
       async logAuditAction(action, accountId, details) {
         try {
           const auditData = {
             action: action,
             account_id: accountId,
             details: details,
             timestamp: new Date().toISOString(),
             user_id: this.currentUser?.id
           }
           
           console.log('📝 Log de auditoria:', auditData)
           
           // Aqui você pode implementar o envio para o backend
           // await http.post('/api/audit-logs', auditData)
           
         } catch (error) {
           console.warn('⚠️ Erro ao registrar log de auditoria:', error)
         }
       },
       
       // Atualizar totalizadores da dashboard
       updateDashboardTotals() {
         console.log('🔄 Atualizando totalizadores da dashboard...')
         
         // Forçar recálculo dos computed properties
         this.$forceUpdate()
         
         // Atualizar estatísticas
         const stats = {
           totalAccounts: this.accounts.length,
           activeAccounts: this.activeAccounts,
           totalBalance: this.totalBalance,
           totalTransactions: this.totalTransactions
         }
         
         console.log('📊 Novas estatísticas:', stats)
       },
       
       // Obter resumo de mudanças para auditoria
       getChangesSummary(originalAccount, newData) {
         const changes = []
         
         if (originalAccount.bookmaker_name !== newData.bookmaker_name) {
           changes.push(`Nome: "${originalAccount.bookmaker_name}" → "${newData.bookmaker_name}"`)
         }
         
         if (originalAccount.currency !== newData.currency) {
           changes.push(`Moeda: ${originalAccount.currency} → ${newData.currency}`)
         }
         
         if (originalAccount.status !== newData.status) {
           changes.push(`Status: ${this.getStatusText(originalAccount.status)} → ${this.getStatusText(newData.status)}`)
         }
         
         if (originalAccount.notes !== newData.notes) {
           changes.push('Observações alteradas')
         }
         
         return changes.length > 0 ? changes : ['Nenhuma mudança detectada']
       },

               // Sistema de Notificações Toast
        showToast(title, message, type = 'info') {
          const id = Date.now()
          const toast = {
            id,
            title,
            message,
            type,
            visible: true,
            progress: 0
          }
          
          this.toasts.push(toast)

          // Aguardar um frame para garantir que o DOM foi atualizado
          this.$nextTick(() => {
            // Forçar a animação de entrada
            const toastElement = document.querySelector(`[data-toast-id="${id}"]`)
            if (toastElement) {
              toastElement.style.transform = 'translateX(0)'
              toastElement.style.opacity = '1'
            }
          })

          this.startToastProgress(id)
        },

       startToastProgress(id) {
         const toast = this.toasts.find(t => t.id === id)
         if (!toast) return

         const duration = 3000 // 3 segundos
         const interval = 10 // 10ms interval
         const steps = duration / interval

         let currentStep = 0
         const progressInterval = setInterval(() => {
           currentStep++
           toast.progress = (currentStep / steps) * 100
           if (currentStep >= steps) {
             clearInterval(progressInterval)
             this.removeToast(id)
           }
         }, interval)
       },

               removeToast(id) {
          const toastElement = document.querySelector(`[data-toast-id="${id}"]`)
          if (toastElement) {
            // Animar a saída
            toastElement.style.transform = 'translateX(100%)'
            toastElement.style.opacity = '0'
            
            // Remover após a animação
            setTimeout(() => {
              const index = this.toasts.findIndex(t => t.id === id)
              if (index !== -1) {
                this.toasts.splice(index, 1)
              }
            }, 400)
          } else {
            // Fallback se o elemento não for encontrado
            const index = this.toasts.findIndex(t => t.id === id)
            if (index !== -1) {
              this.toasts.splice(index, 1)
            }
          }
        }
  }
}
</script>

<style scoped>
.accounts-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
  width: 100%;
  align-items: stretch;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: auto;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  height: 100vh;
}

.accounts-header {
  text-align: center;
  margin-bottom: 32px;
}

.accounts-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.accounts-icon {
  width: 36px;
  height: 36px;
  color: #00ff88;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

.accounts-subtitle {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
}

.actions-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.add-account-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-account-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 8px;
}

.stat-label {
  color: #cccccc;
  font-size: 14px;
}

.accounts-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.accounts-section h3 {
  color: #ffffff;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #cccccc;
  font-size: 16px;
}

.loading-indicator .loading-spinner {
  font-size: 20px;
  animation: spin 1s linear infinite;
}

.no-accounts {
  text-align: center;
  padding: 40px;
  color: #cccccc;
  font-size: 16px;
}

.no-accounts p {
  margin: 0;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.account-card {
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 255, 136, 0.3);
}

.account-card.inactive {
  opacity: 0.6;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.account-info {
  flex: 1;
}

.account-name {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.account-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.account-status.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.account-status.inactive {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.account-status.suspended {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.account-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  position: relative;
}

.action-btn.edit {
  color: #ffc107;
}

.action-btn.edit:hover {
  background: rgba(255, 193, 7, 0.2);
}

.action-btn.delete {
  color: #ff4757;
}

.action-btn.delete:hover {
  background: rgba(255, 71, 87, 0.2);
}

.account-balance {
  margin-bottom: 16px;
}

.balance-label {
  color: #cccccc;
  font-size: 14px;
  margin-right: 8px;
}

 .balance-amount {
   color: #00ff88;
   font-size: 24px;
   font-weight: 700;
 }
 
 .balance-amount.has-balance {
   color: #ffc107;
   text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
 }
 
 .balance-warning {
   display: block;
   color: #ffc107;
   font-size: 12px;
   font-weight: 600;
   margin-top: 4px;
   text-align: center;
   background: rgba(255, 193, 7, 0.1);
   padding: 4px 8px;
   border-radius: 4px;
   border: 1px solid rgba(255, 193, 7, 0.3);
 }

.account-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #cccccc;
  font-size: 14px;
}

.detail-value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.account-notes {
  margin-bottom: 16px;
}

.notes-label {
  color: #cccccc;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.notes-text {
  color: #ffffff;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.account-transactions {
  display: flex;
  gap: 12px;
}

.transactions-btn,
.withdraw-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transactions-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.transactions-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.withdraw-btn {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: #ffffff;
}

.withdraw-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.withdraw-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-form {
  padding: 0 24px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00ff88;
}

.form-help {
  display: block;
  color: #cccccc;
  font-size: 12px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.save-btn,
.withdraw-submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.withdraw-submit-btn {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: #ffffff;
}

.withdraw-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.save-btn:disabled,
.withdraw-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  margin-left: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transactions Modal */
.transactions-content {
  padding: 0 24px 24px 24px;
}

.no-transactions {
  text-align: center;
  padding: 40px;
  color: #cccccc;
}

.transactions-list {
  max-height: 400px;
  overflow-y: auto;
}

.transaction-item {
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.transaction-item.deposit {
  border-left: 4px solid #00ff88;
}

.transaction-item.withdrawal {
  border-left: 4px solid #ff4757;
}

.transaction-item.adjustment {
  border-left: 4px solid #ffc107;
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.transaction-type {
  display: flex;
  align-items: center;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.deposit {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.type-badge.withdrawal {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.type-badge.adjustment {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.transaction-amount {
  text-align: right;
}

.amount {
  font-size: 18px;
  font-weight: 700;
}

.amount.deposit {
  color: #00ff88;
}

.amount.withdrawal {
  color: #ff4757;
}

.amount.adjustment {
  color: #ffc107;
}

.transaction-details {
  font-size: 14px;
}

.transaction-description {
  color: #ffffff;
  margin-bottom: 4px;
}

.transaction-date {
  color: #cccccc;
  margin-bottom: 4px;
}

 .transaction-balance {
   color: #cccccc;
   font-size: 12px;
 }

 /* Modal de Confirmação de Exclusão */
 .modal-content.delete-confirm {
   max-width: 600px;
   background: linear-gradient(135deg, rgba(42, 42, 42, 0.95), rgba(26, 26, 26, 0.95));
   border: 1px solid rgba(255, 71, 87, 0.3);
   box-shadow: 0 8px 32px rgba(255, 71, 87, 0.2);
 }

 .delete-header {
   background: linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(255, 71, 87, 0.05));
   border-bottom: 1px solid rgba(255, 71, 87, 0.2);
   padding: 24px 24px 20px 24px;
   margin-bottom: 0;
   display: flex;
   align-items: center;
   gap: 16px;
 }

 .delete-icon {
   color: #ff4757;
   filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.5));
 }

 .delete-header h3 {
   color: #ff4757;
   margin: 0;
   flex: 1;
 }

 .delete-content {
   padding: 24px;
 }

 .account-summary {
   background: rgba(255, 255, 255, 0.05);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 24px;
 }

 .account-info-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 12px;
   padding: 8px 0;
   border-bottom: 1px solid rgba(255, 255, 255, 0.05);
 }

 .account-info-row:last-child {
   margin-bottom: 0;
   border-bottom: none;
 }

 .info-label {
   color: #cccccc;
   font-size: 14px;
   font-weight: 500;
 }

 .info-value {
   color: #ffffff;
   font-size: 14px;
   font-weight: 600;
 }

 .balance-value {
   color: #ffc107;
   text-shadow: 0 0 8px rgba(255, 193, 7, 0.3);
 }

 .status-value {
   padding: 4px 8px;
   border-radius: 12px;
   font-size: 12px;
   font-weight: 600;
   text-transform: uppercase;
 }

 .status-value.active {
   background: rgba(0, 255, 136, 0.2);
   color: #00ff88;
 }

 .status-value.inactive {
   background: rgba(255, 193, 7, 0.2);
   color: #ffc107;
 }

 .status-value.suspended {
   background: rgba(255, 71, 87, 0.2);
   color: #ff4757;
 }

 .delete-warnings {
   background: rgba(255, 193, 7, 0.1);
   border: 1px solid rgba(255, 193, 7, 0.3);
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 24px;
 }

 .delete-warnings h4 {
   color: #ffc107;
   margin: 0 0 16px 0;
   font-size: 16px;
   font-weight: 600;
   display: flex;
   align-items: center;
   gap: 8px;
 }

 .warnings-list {
   margin: 0;
   padding-left: 20px;
 }

 .warning-item {
   color: #ffc107;
   font-size: 14px;
   margin-bottom: 8px;
   line-height: 1.4;
 }

 .warning-item:last-child {
   margin-bottom: 0;
 }

 .delete-consequences {
   background: rgba(255, 71, 87, 0.1);
   border: 1px solid rgba(255, 71, 87, 0.3);
   border-radius: 8px;
   padding: 20px;
   margin-bottom: 24px;
 }

 .delete-consequences h4 {
   color: #ff4757;
   margin: 0 0 16px 0;
   font-size: 16px;
   font-weight: 600;
   display: flex;
   align-items: center;
   gap: 8px;
 }

 .consequences-list {
   margin: 0;
   padding-left: 20px;
 }

 .consequences-list li {
   color: #ffffff;
   font-size: 14px;
   margin-bottom: 8px;
   line-height: 1.4;
 }

 .consequences-list li:last-child {
   margin-bottom: 0;
 }

 .delete-actions {
   display: flex;
   gap: 16px;
   justify-content: flex-end;
   margin-top: 24px;
 }

 .cancel-delete-btn,
 .confirm-delete-btn {
   padding: 12px 24px;
   border: none;
   border-radius: 8px;
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.3s ease;
   display: flex;
   align-items: center;
   gap: 8px;
 }

 .cancel-delete-btn {
   background: rgba(255, 255, 255, 0.1);
   color: #ffffff;
   border: 1px solid rgba(255, 255, 255, 0.2);
 }

 .cancel-delete-btn:hover {
   background: rgba(255, 255, 255, 0.2);
   transform: translateY(-1px);
 }

 .confirm-delete-btn {
   background: linear-gradient(135deg, #ff4757, #ff6b7a);
   color: #ffffff;
   border: 1px solid rgba(255, 71, 87, 0.3);
   box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
 }

 .confirm-delete-btn:hover:not(:disabled) {
   background: linear-gradient(135deg, #ff6b7a, #ff4757);
   transform: translateY(-1px);
   box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);
 }

 .confirm-delete-btn:disabled {
   opacity: 0.6;
   cursor: not-allowed;
   transform: none;
 }

/* Sistema de Notificações Toast */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

 .toast-notification {
   background: linear-gradient(135deg, rgba(42, 42, 42, 0.95), rgba(26, 26, 26, 0.95));
   backdrop-filter: blur(10px);
   color: #ffffff;
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 16px 20px;
   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
   display: flex;
   align-items: center;
   gap: 12px;
   opacity: 0;
   transform: translateX(100%);
   transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
   width: 320px;
   box-sizing: border-box;
   position: relative;
   overflow: hidden;
   margin-bottom: 8px;
 }

 .toast-notification[style*="translateX(0)"] {
   opacity: 1;
   transform: translateX(0);
 }

 .toast-notification.success {
   border-left: 4px solid #00ff88;
   box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2);
 }

 .toast-notification.success .toast-icon {
   color: #00ff88;
 }

 .toast-notification.error {
   border-left: 4px solid #ff4757;
   box-shadow: 0 8px 32px rgba(255, 71, 87, 0.2);
 }

 .toast-notification.error .toast-icon {
   color: #ff4757;
 }

 .toast-notification.warning {
   border-left: 4px solid #ffc107;
   box-shadow: 0 8px 32px rgba(255, 193, 7, 0.2);
 }

 .toast-notification.warning .toast-icon {
   color: #ffc107;
 }

 .toast-notification.info {
   border-left: 4px solid #007bff;
   box-shadow: 0 8px 32px rgba(0, 123, 255, 0.2);
 }

 .toast-notification.info .toast-icon {
   color: #007bff;
 }

.toast-icon {
  flex-shrink: 0;
}

.toast-content {
  flex-grow: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

.toast-message {
  font-size: 14px;
  color: #cccccc;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

 .toast-progress {
   position: absolute;
   bottom: 0;
   left: 0;
   height: 3px;
   background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
   border-radius: 0 0 12px 12px;
   transition: width 0.1s linear;
   box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
 }

 .toast-notification.success .toast-progress {
   background: linear-gradient(90deg, #00ff88, rgba(0, 255, 136, 0.3));
 }

 .toast-notification.error .toast-progress {
   background: linear-gradient(90deg, #ff4757, rgba(255, 71, 87, 0.3));
 }

 .toast-notification.warning .toast-progress {
   background: linear-gradient(90deg, #ffc107, rgba(255, 193, 7, 0.3));
 }

 .toast-notification.info .toast-progress {
   background: linear-gradient(90deg, #007bff, rgba(0, 123, 255, 0.3));
 }

 /* Responsividade */
 @media (max-width: 768px) {
   .main-content {
     padding: 16px;
   }
   
   .accounts-grid {
     grid-template-columns: 1fr;
   }
   
   .stats-section {
     grid-template-columns: repeat(2, 1fr);
   }
   
   .modal-content {
     margin: 10px;
   }
   
   .account-transactions {
     flex-direction: column;
   }

   /* Toast notifications responsivas */
   .toast-container {
     top: 10px;
     right: 10px;
     left: 10px;
   }

       .toast-notification {
      width: 100%;
      max-width: none;
    }

    /* Modal de confirmação responsivo */
    .modal-content.delete-confirm {
      margin: 10px;
      max-width: none;
    }

    .delete-actions {
      flex-direction: column;
      gap: 12px;
    }

    .cancel-delete-btn,
    .confirm-delete-btn {
      width: 100%;
      justify-content: center;
    }

    .account-info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .info-value {
      margin-left: 16px;
    }
  }
</style>
