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
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useVIPStatus } from '../composables/useVIPStatus';

export default {
  name: 'RouteGuardOptimized',
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
  setup(props) {
    const store = useStore();
    const isInitialized = ref(false);
    
    // Usar composable VIP apenas se necessário
    const { isVIP, canUseVIPFeatures, checkVIPStatus } = props.requiresVIP 
      ? useVIPStatus() 
      : { isVIP: computed(() => false), canUseVIPFeatures: computed(() => false), checkVIPStatus: () => Promise.resolve() };

    // Computed properties otimizadas
    const isAuthenticated = computed(() => store.state.isAuthenticated);
    const isAdmin = computed(() => store.state.user?.is_admin === true);

    const isAuthorized = computed(() => {
      if (props.requiresAdmin) {
        return isAuthenticated.value && isAdmin.value;
      }
      if (props.requiresVIP) {
        return isAuthenticated.value && canUseVIPFeatures.value;
      }
      if (props.requiresAuth) {
        return isAuthenticated.value;
      }
      return true;
    });
    
    const hasRequiredLevel = computed(() => {
      if (props.requiresAdmin) return isAdmin.value;
      if (props.requiresVIP) return canUseVIPFeatures.value;
      return true;
    });
    
    const message = computed(() => {
      if (props.customMessage) return props.customMessage;
      
      if (!isAuthenticated.value) {
        return 'Você precisa estar logado para acessar esta página.';
      }
      
      if (props.requiresAdmin && !isAdmin.value) {
        return 'Você precisa ter permissões de administrador para acessar esta página.';
      }
      
      if (props.requiresVIP && !canUseVIPFeatures.value) {
        return 'Você precisa ter uma conta VIP para acessar esta página.';
      }
      
      return 'Você não tem permissão para acessar esta página.';
    });

    // Verificar status VIP apenas se necessário e uma vez
    onMounted(async () => {
      if (props.requiresVIP && !isInitialized.value) {
        try {
          await checkVIPStatus();
          isInitialized.value = true;
        } catch (error) {
          console.warn('Erro ao verificar status VIP:', error);
          isInitialized.value = true; // Marcar como inicializado mesmo com erro
        }
      } else {
        isInitialized.value = true;
      }
    });

    return {
      isAuthenticated,
      isAuthorized,
      hasRequiredLevel,
      message,
      isInitialized
    };
  },
  methods: {
    goToLogin() {
      // Salva a rota atual para redirecionar após login
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath);
      this.$router.push('/login');
    },
    
    goToUpgrade() {
      // Salva a rota atual para redirecionar após upgrade
      localStorage.setItem('redirectAfterUpgrade', this.$route.fullPath);
      this.$router.push('/plans');
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
};
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
