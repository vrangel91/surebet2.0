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
      searchTerm: '',
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showPasswordModal: false,
      userToDelete: null,
      showPassword: false,
      showConfirmPassword: false,
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
    ...mapGetters(['allUsers', 'isAdmin']),
    
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
    }
  },
  
  mounted() {
    if (!this.isAdmin) {
      this.$router.push('/')
    }
  },
  
  methods: {
    ...mapActions(['createUser', 'updateUserData', 'deleteUserData']),
    
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
