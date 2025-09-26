<template>
  <div v-if="isAuthorized">
    <slot />
  </div>
  <div v-else class="unauthorized-access">
    <div class="unauthorized-content">
      <div class="unauthorized-icon">🚫</div>
      <h2>Acesso Negado</h2>
      <p>{{ message }}</p>
      <div class="unauthorized-actions">
        <button v-if="!isAuthenticated" @click="goToLogin" class="btn-primary">
          Fazer Login
        </button>
        <button v-else-if="!hasRequiredLevel" @click="goToUpgrade" class="btn-primary">
          Fazer Upgrade
        </button>
        <button @click="goBack" class="btn-secondary">
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RouteGuard',
  props: {
    requiresAuth: {
      type: Boolean,
      default: false
    },
    requiresVIP: {
      type: Boolean,
      default: false
    },
    requiresAdmin: {
      type: Boolean,
      default: false
    },
    customMessage: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'isVIP', 'isAdmin']),
    
    isAuthorized() {
      if (this.requiresAdmin) {
        return this.isAuthenticated && this.isAdmin
      }
      if (this.requiresVIP) {
        return this.isAuthenticated && this.isVIP
      }
      if (this.requiresAuth) {
        return this.isAuthenticated
      }
      return true
    },
    
    hasRequiredLevel() {
      if (this.requiresAdmin) return this.isAdmin
      if (this.requiresVIP) return this.isVIP
      return true
    },
    
    message() {
      if (this.customMessage) return this.customMessage
      
      if (!this.isAuthenticated) {
        return 'Você precisa estar logado para acessar esta página.'
      }
      
      if (this.requiresAdmin && !this.isAdmin) {
        return 'Você precisa ter permissões de administrador para acessar esta página.'
      }
      
      if (this.requiresVIP && !this.isVIP) {
        return 'Você precisa ter uma conta VIP para acessar esta página.'
      }
      
      return 'Você não tem permissão para acessar esta página.'
    }
  },
  methods: {
    goToLogin() {
      // Salva a rota atual para redirecionar após login
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath)
      this.$router.push('/login')
    },
    
    goToUpgrade() {
      // Salva a rota atual para redirecionar após upgrade
      localStorage.setItem('redirectAfterUpgrade', this.$route.fullPath)
      this.$router.push('/plans')
    },
    
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.unauthorized-access {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.unauthorized-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.unauthorized-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.unauthorized-content h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.unauthorized-content p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.unauthorized-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .unauthorized-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
