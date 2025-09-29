<template>
  <div class="bookmaker-accounts-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <AppHeader />

      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Contas de Casas de Apostas</h2>
          <p class="page-subtitle">Gerencie suas contas de casas de apostas</p>
        </div>
        <div class="header-right">
          <button @click="showAddAccountModal = true" class="btn btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Adicionar Conta
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="accounts-main">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ accounts.length }}</h3>
              <p class="stat-label">Total de Contas</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ activeAccounts }}</h3>
              <p class="stat-label">Contas Ativas</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalBalance }}</h3>
              <p class="stat-label">Saldo Total</p>
            </div>
          </div>
        </div>

        <!-- Accounts List -->
        <div class="accounts-section">
          <div class="section-header">
            <h3 class="section-title">Suas Contas</h3>
            <div class="section-actions">
              <button @click="refreshAccounts" class="btn btn-secondary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                  <path
                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                </svg>
                Atualizar
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!Array.isArray(accounts) || accounts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <h3 class="empty-title">Nenhuma conta cadastrada</h3>
            <p class="empty-description">
              Comece adicionando suas contas de casas de apostas para gerenciar
              seus saldos e apostas.
            </p>
            <button @click="showAddAccountModal = true" class="btn btn-primary">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Adicionar Primeira Conta
            </button>
          </div>

          <!-- Accounts Grid -->
          <div v-else-if="Array.isArray(accounts) && accounts.length > 0" class="accounts-grid">
            <div v-for="account in accounts" :key="account.id" class="account-card"
              :class="{ 'account-inactive': account.status !== 'active' }">
              <div class="account-header">
                <div class="account-info">
                  <h4 class="account-name">{{ account.bookmaker_name }}</h4>
                  <p class="account-type">{{ account.currency }}</p>
                </div>
                <div class="account-status">
                  <span class="status-badge" :class="{
                    'status-active': account.status === 'active',
                    'status-inactive': account.status === 'inactive',
                    'status-suspended': account.status === 'suspended',
                  }">
                    {{
                      account.status === "active"
                        ? "Ativa"
                        : account.status === "inactive"
                          ? "Inativa"
                          : "Suspensa"
                    }}
                  </span>
                </div>
              </div>

              <div class="account-details">
                <div class="detail-item">
                  <span class="detail-label">Saldo:</span>
                  <span class="detail-value">{{
                    formatCurrency(account.balance)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Última atualização:</span>
                  <span class="detail-value">{{
                    formatDate(account.last_updated || account.updated_at)
                  }}</span>
                </div>
                <div v-if="account.notes" class="detail-item">
                  <span class="detail-label">Observações:</span>
                  <span class="detail-value">{{ account.notes }}</span>
                </div>
              </div>

              <div class="account-actions">
                <button @click="editAccount(account)" class="btn btn-sm btn-secondary">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L11.707 8l-3-3L12.146.146zM11.207 9l3-3L12.5 2.5 9.5 5.5l3 3z" />
                    <path d="M8.5 2.5l3 3L8.5 8.5l-3-3 3-3z" />
                  </svg>
                  Editar
                </button>
                <button @click="deleteAccount(account)" class="btn btn-sm btn-danger">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                    <path
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                  </svg>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Account Modal -->
      <div v-if="showAddAccountModal" class="modal-overlay">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Adicionar Nova Conta</h3>
            <button @click="closeAddAccountModal" class="modal-close">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form id="addAccountForm" @submit.prevent="addAccount" class="account-form">
              <div class="form-group">
                <label for="accountName" class="form-label">Casa de Apostas</label>
                <select v-model="newAccount.name" id="accountName" class="form-select" required>
                  <option value="">Selecione a casa de apostas</option>
                  <option v-for="house in bookmakerHouses" :key="house" :value="house">
                    {{ house }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="accountBalance" class="form-label">Saldo Inicial</label>
                <input v-model="newAccount.balance" type="number" step="0.01" id="accountBalance" class="form-input"
                  placeholder="0.00" required />
              </div>

              <div class="form-group">
                <label for="accountNotes" class="form-label">Observações (opcional)</label>
                <textarea v-model="newAccount.notes" id="accountNotes" class="form-textarea"
                  placeholder="Adicione observações sobre esta conta..." rows="3"></textarea>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button @click="closeAddAccountModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" form="addAccountForm" class="btn btn-primary" :disabled="addingAccount">
              <span v-if="addingAccount">Adicionando...</span>
              <span v-else>Adicionar Conta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Account Modal -->
      <div v-if="showEditAccountModal" class="modal-overlay">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Editar Conta</h3>
            <button @click="closeEditAccountModal" class="modal-close">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form id="editAccountForm" @submit.prevent="updateAccount">
              <div class="form-group">
                <label for="editAccountName" class="form-label">Casa de Apostas *</label>
                <select v-model="editingAccountData.name" id="editAccountName" class="form-select" required>
                  <option value="">Selecione uma casa de apostas</option>
                  <option v-for="house in bookmakerHouses" :key="house" :value="house">
                    {{ house }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="editAccountBalance" class="form-label">Saldo Atual *</label>
                <input v-model.number="editingAccountData.balance" type="number" step="0.01" id="editAccountBalance"
                  class="form-input" placeholder="0.00" required />
              </div>

              <div class="form-group">
                <label for="editAccountStatus" class="form-label">Status</label>
                <select v-model="editingAccountData.status" id="editAccountStatus" class="form-select">
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                  <option value="suspended">Suspensa</option>
                </select>
              </div>

              <div class="form-group">
                <label for="editAccountNotes" class="form-label">Observações (opcional)</label>
                <textarea v-model="editingAccountData.notes" id="editAccountNotes" class="form-textarea"
                  placeholder="Adicione observações sobre esta conta..." rows="3"></textarea>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button @click="closeEditAccountModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" form="editAccountForm" class="btn btn-primary" :disabled="editingAccount">
              <span v-if="editingAccount">Atualizando...</span>
              <span v-else>Atualizar Conta</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "@/components/Navigation/Header.vue";
import Sidebar from "@/components/Navigation/Sidebar.vue";
import { filterOptions } from "@/config/filters.js";
import { emitter } from "@/utils/emitter.js";

export default {
  name: "BookmakerAccountsView",

  components: {
    AppHeader,
    Sidebar,
  },

  data() {
    return {
      accounts: [],
      showAddAccountModal: false,
      showEditAccountModal: false,
      addingAccount: false,
      editingAccount: false,
      bookmakerHouses: filterOptions.houses, // Lista de casas de apostas
      newAccount: {
        name: "",
        balance: 0,
        notes: "",
      },
      editingAccountData: {
        id: null,
        name: "",
        balance: 0,
        notes: "",
        status: "active",
      },
      // Propriedades do sidebar
      sidebarCollapsed: false,
    };
  },

  computed: {
    activeAccounts() {
      if (!Array.isArray(this.accounts)) {
        return 0;
      }
      return this.accounts.filter((account) => account.status === "active")
        .length;
    },

    totalBalance() {
      if (!Array.isArray(this.accounts)) {
        return "0.00";
      }
      return this.accounts
        .reduce((total, account) => {
          return total + (parseFloat(account.balance) || 0);
        }, 0)
        .toFixed(2);
    },
  },

  mounted() {
    this.loadAccounts();

    // Escuta eventos de confirmação de resultados de surebets
    emitter.on('surebet-result-confirmed', this.handleSurebetResultConfirmed)
  },

  beforeUnmount() {
    // Remove listener de eventos
    emitter.off('surebet-result-confirmed', this.handleSurebetResultConfirmed)
  },

  methods: {
    // Métodos do sidebar
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    handleSidebarStateLoaded(isCollapsed) {
      this.sidebarCollapsed = isCollapsed;
    },

    async loadAccounts() {
      try {
        console.log("Carregando contas de casas de apostas...");

        const token = this.$store.getters.authToken;
        if (!token) {
          console.error("Token de autenticação não encontrado");
          this.$toast.error("Sessão expirada. Faça login novamente.");
          this.$router.push("/login");
          return;
        }

        const response = await fetch("/api/bookmaker-accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorMessage = `Erro HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("Erro HTTP:", response.status, errorData);
            errorMessage =
              errorData?.message || errorData?.error || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            console.error("Erro HTTP:", response.status, errorText);
            errorMessage = `${errorMessage}: ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
          console.log(
            "🔍 DEBUG - Resposta de carregamento:",
            JSON.stringify(data, null, 2)
          );
        } catch (parseError) {
          console.error("❌ Erro ao parsear resposta JSON:", parseError);
          throw new Error(
            "Resposta inválida do servidor - formato JSON incorreto"
          );
        }

        // Validação robusta da resposta
        if (!data || typeof data !== "object") {
          console.error("❌ Resposta inválida do servidor:", data);
          throw new Error("Resposta inválida do servidor - formato inesperado");
        }

        // Verificar sucesso de forma ultra-segura
        if (data && typeof data === "object" && data.success === true) {
          this.accounts = Array.isArray(data.data?.accounts)
            ? data.data.accounts
            : [];
          console.log("✅ Contas carregadas:", this.accounts);
        }
        // Verificar erro explícito de forma ultra-segura
        else if (
          data &&
          typeof data === "object" &&
          (data.error || data.success === false)
        ) {
          console.error("❌ Falha no carregamento das contas:", data);
          const errorMessage =
            data?.message || data?.error || "Erro ao carregar contas";
          throw new Error(errorMessage);
        }
        // Resposta inesperada
        else {
          console.error("❌ Resposta inesperada do servidor:", data);
          throw new Error(
            "Resposta inesperada do servidor - formato não reconhecido"
          );
        }
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
        this.$toast.error("Erro ao carregar contas: " + error.message);
        this.accounts = [];
      }
    },

    refreshAccounts() {
      this.loadAccounts();
    },

    async addAccount() {
      // Validações
      if (!this.newAccount.name) {
        this.$toast.error("Selecione uma casa de apostas");
        return;
      }

      if (this.newAccount.balance < 0) {
        this.$toast.error("O saldo não pode ser negativo");
        return;
      }

      this.addingAccount = true;

      try {
        console.log("Adicionando nova conta:", this.newAccount);

        const token = this.$store.getters.authToken;
        if (!token) {
          this.$toast.error("Sessão expirada. Faça login novamente.");
          this.$router.push("/login");
          return;
        }

        const requestData = {
          bookmaker_name: this.newAccount.name,
          balance: parseFloat(this.newAccount.balance) || 0,
          currency: "BRL",
          notes: this.newAccount.notes || null,
        };

        console.log("Dados enviados para API:", requestData);
        console.log("Token sendo usado:", token ? "Presente" : "Ausente");

        const response = await fetch("/api/bookmaker-accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify(requestData),
        });

        console.log("Status da resposta:", response.status);
        console.log("Headers da resposta:", response.headers);
        console.log("Response ok:", response.ok);

        // Verificar se a resposta é ok antes de tentar parsear
        if (!response.ok) {
          let errorMessage = `Erro HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("Erro HTTP:", response.status, errorData);
            errorMessage =
              errorData?.message || errorData?.error || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            console.error("Erro HTTP:", response.status, errorText);
            errorMessage = `${errorMessage}: ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
          console.log(
            "🔍 DEBUG - Resposta completa:",
            JSON.stringify(data, null, 2)
          );
          console.log("🔍 DEBUG - Tipo de data:", typeof data);
          console.log("🔍 DEBUG - data é null/undefined:", data == null);
        } catch (parseError) {
          console.error("❌ Erro ao parsear resposta JSON:", parseError);
          throw new Error(
            "Resposta inválida do servidor - formato JSON incorreto"
          );
        }

        // Validação robusta da resposta
        if (!data || typeof data !== "object") {
          console.error("❌ Resposta inválida do servidor:", data);
          throw new Error("Resposta inválida do servidor - formato inesperado");
        }

        // Logs de debug seguros
        console.log("🔍 DEBUG - data.success:", data?.success);
        console.log("🔍 DEBUG - data.error:", data?.error);
        console.log("🔍 DEBUG - data.message:", data?.message);
        console.log(
          "🔍 DEBUG - Propriedades de data:",
          data ? Object.keys(data) : "N/A"
        );

        // Verificar sucesso de forma ultra-segura
        if (data && typeof data === "object" && data.success === true) {
          console.log("✅ Sucesso na criação da conta");
          this.resetNewAccount();
          this.closeAddAccountModal();
          await this.loadAccounts();
          this.$toast.success("Conta adicionada com sucesso!");
        }
        // Verificar erro explícito de forma ultra-segura
        else if (
          data &&
          typeof data === "object" &&
          (data.error || data.success === false)
        ) {
          console.error("❌ Falha na criação da conta:", data);
          const errorMessage =
            data?.message || data?.error || "Erro ao adicionar conta";
          throw new Error(errorMessage);
        }
        // Resposta inesperada
        else {
          console.error("❌ Resposta inesperada do servidor:", data);
          throw new Error(
            "Resposta inesperada do servidor - formato não reconhecido"
          );
        }
      } catch (error) {
        console.error("Erro ao adicionar conta:", error);
        console.error("Stack trace:", error.stack);
        this.$toast.error("Erro ao adicionar conta: " + error.message);
      } finally {
        this.addingAccount = false;
      }
    },

    editAccount(account) {
      console.log("Editar conta:", account);
      this.editingAccountData = {
        id: account.id,
        name: account.bookmaker_name,
        balance: parseFloat(account.balance),
        notes: account.notes || "",
        status: account.status,
      };
      this.showEditAccountModal = true;
    },

    async updateAccount() {
      // Validações
      if (!this.editingAccountData.name) {
        this.$toast.error("Selecione uma casa de apostas");
        return;
      }

      if (this.editingAccountData.balance < 0) {
        this.$toast.error("O saldo não pode ser negativo");
        return;
      }

      this.editingAccount = true;

      try {
        console.log("Atualizando conta:", this.editingAccountData);

        const token = this.$store.getters.authToken;
        if (!token) {
          this.$toast.error("Sessão expirada. Faça login novamente.");
          this.$router.push("/login");
          return;
        }

        const response = await fetch(
          `/api/bookmaker-accounts/${this.editingAccountData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookmaker_name: this.editingAccountData.name,
              balance: parseFloat(this.editingAccountData.balance),
              currency: "BRL",
              notes: this.editingAccountData.notes || null,
              status: this.editingAccountData.status,
            }),
          }
        );

        if (!response.ok) {
          let errorMessage = `Erro HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("Erro HTTP:", response.status, errorData);
            errorMessage =
              errorData?.message || errorData?.error || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            console.error("Erro HTTP:", response.status, errorText);
            errorMessage = `${errorMessage}: ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
          console.log(
            "🔍 DEBUG - Resposta de atualização:",
            JSON.stringify(data, null, 2)
          );
        } catch (parseError) {
          console.error("❌ Erro ao parsear resposta JSON:", parseError);
          throw new Error(
            "Resposta inválida do servidor - formato JSON incorreto"
          );
        }

        // Validação robusta da resposta
        if (!data || typeof data !== "object") {
          console.error("❌ Resposta inválida do servidor:", data);
          throw new Error("Resposta inválida do servidor - formato inesperado");
        }

        // Verificar sucesso de forma ultra-segura
        if (data && typeof data === "object" && data.success === true) {
          this.closeEditAccountModal();
          await this.loadAccounts(); // Recarregar lista
          this.$toast.success("Conta atualizada com sucesso!");
          console.log("✅ Conta atualizada:", data.data);
        }
        // Verificar erro explícito de forma ultra-segura
        else if (
          data &&
          typeof data === "object" &&
          (data.error || data.success === false)
        ) {
          console.error("❌ Falha na atualização da conta:", data);
          const errorMessage =
            data?.message || data?.error || "Erro ao atualizar conta";
          throw new Error(errorMessage);
        }
        // Resposta inesperada
        else {
          console.error("❌ Resposta inesperada do servidor:", data);
          throw new Error(
            "Resposta inesperada do servidor - formato não reconhecido"
          );
        }
      } catch (error) {
        console.error("Erro ao atualizar conta:", error);
        this.$toast.error("Erro ao atualizar conta: " + error.message);
      } finally {
        this.editingAccount = false;
      }
    },

    async deleteAccount(account) {
      if (
        confirm(
          `Tem certeza que deseja excluir a conta ${account.bookmaker_name}?`
        )
      ) {
        try {
          console.log("Excluindo conta:", account);

          const token = this.$store.getters.authToken;
          if (!token) {
            this.$toast.error("Sessão expirada. Faça login novamente.");
            this.$router.push("/login");
            return;
          }

          const response = await fetch(
            `/api/bookmaker-accounts/${account.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}`;
            try {
              const errorData = await response.json();
              console.error("Erro HTTP:", response.status, errorData);
              errorMessage =
                errorData?.message || errorData?.error || errorMessage;
            } catch (e) {
              const errorText = await response.text();
              console.error("Erro HTTP:", response.status, errorText);
              errorMessage = `${errorMessage}: ${errorText}`;
            }
            throw new Error(errorMessage);
          }

          let data;
          try {
            data = await response.json();
            console.log(
              "🔍 DEBUG - Resposta de exclusão:",
              JSON.stringify(data, null, 2)
            );
          } catch (parseError) {
            console.error("❌ Erro ao parsear resposta JSON:", parseError);
            throw new Error(
              "Resposta inválida do servidor - formato JSON incorreto"
            );
          }

          // Validação robusta da resposta
          if (!data || typeof data !== "object") {
            console.error("❌ Resposta inválida do servidor:", data);
            throw new Error(
              "Resposta inválida do servidor - formato inesperado"
            );
          }

          // Verificar sucesso de forma ultra-segura
          if (data && typeof data === "object" && data.success === true) {
            await this.loadAccounts(); // Recarregar lista
            this.$toast.success("Conta excluída com sucesso!");
            console.log("✅ Conta excluída:", account.id);
          }
          // Verificar erro explícito de forma ultra-segura
          else if (
            data &&
            typeof data === "object" &&
            (data.error || data.success === false)
          ) {
            console.error("❌ Falha na exclusão da conta:", data);
            const errorMessage =
              data?.message || data?.error || "Erro ao excluir conta";
            throw new Error(errorMessage);
          }
          // Resposta inesperada
          else {
            console.error("❌ Resposta inesperada do servidor:", data);
            throw new Error(
              "Resposta inesperada do servidor - formato não reconhecido"
            );
          }
        } catch (error) {
          console.error("Erro ao excluir conta:", error);
          this.$toast.error("Erro ao excluir conta: " + error.message);
        }
      }
    },

    closeAddAccountModal() {
      this.showAddAccountModal = false;
      this.resetNewAccount();
    },

    closeEditAccountModal() {
      this.showEditAccountModal = false;
      this.resetEditingAccountData();
    },

    resetNewAccount() {
      this.newAccount = {
        name: "",
        balance: 0,
        notes: "",
      };
    },

    resetEditingAccountData() {
      this.editingAccountData = {
        id: null,
        name: "",
        balance: 0,
        notes: "",
        status: "active",
      };
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },

    formatDate(date) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    },

    // Manipula eventos de confirmação de resultados de surebets
    handleSurebetResultConfirmed(eventData) {
      try {
        console.log('💰 Resultado de surebet confirmado, atualizando saldos:', eventData)

        // Recarrega as contas para refletir os novos saldos
        this.loadAccounts()

        // Mostra notificação de sucesso com detalhes dos ajustes
        const profitText = eventData.actualProfit >= 0 ?
          `Lucro: ${this.formatCurrency(eventData.actualProfit)}` :
          `Prejuízo: ${this.formatCurrency(Math.abs(eventData.actualProfit))}`

        // Criar mensagem detalhada dos ajustes
        let adjustmentsMessage = ''
        if (eventData.balanceAdjustments && eventData.balanceAdjustments.length > 0) {
          const creditAdjustments = eventData.balanceAdjustments.filter(adj => adj.action === 'credit')
          const lossAdjustments = eventData.balanceAdjustments.filter(adj => adj.action === 'none')

          if (creditAdjustments.length > 0) {
            adjustmentsMessage += '\n\n💰 Saldos creditados:'
            creditAdjustments.forEach(adj => {
              adjustmentsMessage += `\n• ${adj.house}: +${this.formatCurrency(adj.amount)}`
            })
          }

          if (lossAdjustments.length > 0) {
            adjustmentsMessage += '\n\n❌ Apostas perdidas (débito já foi feito):'
            lossAdjustments.forEach(adj => {
              adjustmentsMessage += `\n• ${adj.house}: ${this.formatCurrency(adj.stake)}`
            })
          }
        }

        this.$toast.success(`Resultado confirmado! ${profitText}${adjustmentsMessage}`)

        console.log('✅ Saldos atualizados após confirmação de resultado')

      } catch (error) {
        console.error('❌ Erro ao processar confirmação de resultado:', error)
        this.$toast.error('Erro ao atualizar saldos após confirmação de resultado')
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* Bookmaker Accounts Page - Layout Padrão */
.bookmaker-accounts-container {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100% - 280px);
  margin-left: 280px;
  /* Espaço para o sidebar fixo */
}

/* Conteúdo Principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

/* Scrollbar personalizada */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Quando sidebar está colapsado */
.bookmaker-accounts-container.sidebar-collapsed {
  margin-left: 70px;
  width: calc(100% - 70px);
  max-width: calc(100% - 70px);
}

/* Header */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1rem 2rem 1.5rem 2rem;
  /* Adiciona padding vertical e horizontal */
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Main Content */
.accounts-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Accounts Section */
.accounts-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
  /* Aumenta padding interno */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.account-card.account-inactive {
  opacity: 0.6;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.account-type {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  text-transform: capitalize;
}

.account-status {
  margin-left: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-suspended {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.account-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.account-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-button-hover);
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

/* Form */
.account-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Responsividade */
@media (max-width: 1023px) {
  .bookmaker-accounts-container {
    margin-left: 0;
    /* Remove margem em mobile/tablet */
    width: 100%;
    /* Largura total em mobile */
    max-width: 100%;
    /* Largura máxima total em mobile */
    overflow-x: hidden;
    /* Evitar scroll horizontal */
    overflow-y: auto;
    /* Permitir scroll vertical */
    -webkit-overflow-scrolling: touch;
    /* Scroll suave no iOS */
  }
}

@media (max-width: 700px) {
  .bookmaker-accounts-container {
    width: 100vw;
    /* Largura total da viewport */
    max-width: 100vw;
    /* Largura máxima da viewport */
    margin-left: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .main-content {
    width: 100%;
    max-width: 100%;
  }

  .accounts-main {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem 1rem 1.5rem 1rem;
    /* Padding responsivo */
  }

  .header-right {
    justify-content: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .section-actions {
    justify-content: flex-start;
  }

  .account-actions {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .bookmaker-accounts-container {
    width: 100vw;
    max-width: 100vw;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .main-content {
    width: 100%;
    max-width: 100%;
    padding: 0 4px;
    /* Padding mínimo para evitar corte */
  }

  .accounts-main {
    padding: 0 4px;
    /* Padding mínimo para evitar corte */
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .account-card {
    padding: 1rem;
  }
}
</style>
