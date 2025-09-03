<template>
  <div v-if="isVisible" class="vip-blocked-modal-overlay">
    <div class="vip-blocked-modal">
      <div class="modal-header">
        <div class="warning-icon">⚠️</div>
        <h2>Acesso VIP Bloqueado</h2>
      </div>
      
      <div class="modal-content">
        <div class="status-info">
          <div class="status-item">
            <span class="label">Status:</span>
            <span class="value error">{{ statusMessage }}</span>
          </div>
          
          <div v-if="expirationDate" class="status-item">
            <span class="label">Expirou em:</span>
            <span class="value">{{ formatDate(expirationDate) }}</span>
          </div>
          
          <div v-if="offlineTime" class="status-item">
            <span class="label">Tempo offline:</span>
            <span class="value">{{ formatOfflineTime(offlineTime) }}</span>
          </div>
        </div>
        
        <div class="message">
          <p v-if="reason === 'VIP expirado'">
            Seu plano VIP expirou. Para continuar usando os recursos premium, 
            renove sua assinatura.
          </p>
          
          <p v-else-if="reason === 'Tempo offline excedido'">
            Você ficou offline por muito tempo. É necessário validar seu status VIP 
            online para continuar.
          </p>
          
          <p v-else-if="reason === 'Cache expirado'">
            Os dados de cache expiraram. Conecte-se à internet para validar 
            seu status VIP.
          </p>
          
          <p v-else>
            Seu acesso VIP foi bloqueado por motivos de segurança. 
            Entre em contato com o suporte se acredita que isso seja um erro.
          </p>
        </div>
        
        <div class="actions">
          <button 
            v-if="canRetryOnline" 
            @click="retryOnline" 
            class="btn-primary"
          >
            🔄 Tentar Online
          </button>
          
          <button 
            @click="goToLogin" 
            class="btn-secondary"
          >
            🔐 Fazer Login
          </button>
          
          <button 
            @click="contactSupport" 
            class="btn-outline"
          >
            📞 Suporte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import vipSecurityManager from '@/utils/vipSecurityManager';

export default {
  name: 'VIPBlockedModal',
  
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      default: 'Acesso bloqueado'
    },
    expirationDate: {
      type: String,
      default: null
    },
    offlineTime: {
      type: Number,
      default: null
    }
  },
  
  setup(props, { emit }) {
    const router = useRouter();
    const retryCount = ref(0);
    const maxRetries = 3;
    
    // Mensagem baseada no motivo do bloqueio
    const statusMessage = computed(() => {
      switch (props.reason) {
        case 'VIP expirado':
          return 'VIP Expirado';
        case 'Tempo offline excedido':
          return 'Offline por muito tempo';
        case 'Cache expirado':
          return 'Cache Expirado';
        case 'Dados corrompidos':
          return 'Dados Corrompidos';
        default:
          return 'Acesso Bloqueado';
      }
    });
    
    // Verificar se pode tentar online
    const canRetryOnline = computed(() => {
      return navigator.onLine && retryCount.value < maxRetries;
    });
    
    // Tentar validar online
    const retryOnline = async () => {
      if (!canRetryOnline.value) {
        return;
      }
      
      try {
        retryCount.value++;
        console.log(`🔄 [VIP Blocked] Tentativa ${retryCount.value}/${maxRetries}`);
        
        // Tentar validar VIP online
        const result = await vipSecurityManager.checkVIPAccess();
        
        if (result.access) {
          console.log('✅ [VIP Blocked] VIP validado com sucesso!');
          emit('vip-validated', result);
          return;
        }
        
        // Se falhou, mostrar erro
        if (retryCount.value >= maxRetries) {
          console.log('❌ [VIP Blocked] Máximo de tentativas atingido');
        }
        
      } catch (error) {
        console.error('❌ [VIP Blocked] Erro ao tentar online:', error);
      }
    };
    
    // Ir para página de login
    const goToLogin = () => {
      router.push('/login');
      emit('close');
    };
    
    // Contatar suporte
    const contactSupport = () => {
      // Abrir link de suporte ou redirecionar
      window.open('mailto:suporte@surestake.com?subject=Problema%20VIP', '_blank');
    };
    
    // Formatar data
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    };
    
    // Formatar tempo offline
    const formatOfflineTime = (milliseconds) => {
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };
    
    // Monitorar mudanças de conectividade
    const handleOnline = () => {
      if (props.isVisible && canRetryOnline.value) {
        console.log('🌐 [VIP Blocked] Conexão restaurada - permitindo retry');
      }
    };
    
    onMounted(() => {
      window.addEventListener('online', handleOnline);
    });
    
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline);
    });
    
    return {
      statusMessage,
      canRetryOnline,
      retryOnline,
      goToLogin,
      contactSupport,
      formatDate,
      formatOfflineTime
    };
  }
};
</script>

<style scoped>
.vip-blocked-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.vip-blocked-modal {
  background: var(--bg-secondary, #2a2a2a);
  border: 2px solid var(--error-color, #ff4444);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  padding: 24px;
  border-radius: 14px 14px 0 0;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.modal-content {
  padding: 24px;
}

.status-info {
  background: var(--bg-primary, #1a1a1a);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color, #333);
}

.status-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: var(--text-secondary, #ccc);
}

.value {
  font-weight: 600;
}

.value.error {
  color: var(--error-color, #ff4444);
}

.message {
  background: var(--bg-primary, #1a1a1a);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border-left: 4px solid var(--warning-color, #ffaa00);
}

.message p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary, #fff);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.btn-secondary {
  background: var(--primary-color, #00ff88);
  color: var(--bg-primary, #1a1a1a);
}

.btn-secondary:hover {
  background: var(--primary-hover, #00cc6a);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary, #fff);
  border: 2px solid var(--border-color, #333);
}

.btn-outline:hover {
  background: var(--border-color, #333);
  transform: translateY(-2px);
}

/* Responsividade */
@media (max-width: 600px) {
  .vip-blocked-modal {
    margin: 20px;
    max-width: none;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
