<template>
  <div v-if="showUpdateNotification" class="pwa-update-notification">
    <div class="notification-content">
      <div class="notification-icon">
        🔄
      </div>
      
      <div class="notification-text">
        <h4>Nova versão disponível!</h4>
        <p>Uma atualização do SureStake está pronta para ser instalada</p>
      </div>
      
      <div class="notification-actions">
        <button @click="updateNow" class="update-btn">
          Atualizar Agora
        </button>
        
        <button @click="dismissUpdate" class="dismiss-btn">
          Depois
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePWA } from '@/composables/usePWA';

export default {
  name: 'PWAUpdateNotification',
  
  setup() {
    const { hasUpdate, forceUpdate } = usePWA();
    
    const showUpdateNotification = ref(false);
    const dismissed = ref(false);
    
    // Verificar se há atualização
    const checkForUpdates = () => {
      if (hasUpdate.value && !dismissed.value) {
        showUpdateNotification.value = true;
      }
    };
    
    // Atualizar agora
    const updateNow = async () => {
      try {
        showUpdateNotification.value = false;
        await forceUpdate();
      } catch (error) {
        console.error('Erro ao forçar atualização PWA:', error);
        // Em caso de erro, mostrar a notificação novamente
        showUpdateNotification.value = true;
      }
    };
    
    // Fechar notificação
    const dismissUpdate = () => {
      showUpdateNotification.value = false;
      dismissed.value = true;
      
      // Salvar preferência no localStorage
      localStorage.setItem('pwa-update-dismissed', 'true');
    };
    
    // Verificar se foi fechado anteriormente
    const checkDismissedStatus = () => {
      const dismissedStorage = localStorage.getItem('pwa-update-dismissed');
      if (dismissedStorage === 'true') {
        dismissed.value = true;
      }
    };
    
    // Watcher para mudanças no hasUpdate
    const watchForUpdates = () => {
      if (hasUpdate.value && !dismissed.value) {
        showUpdateNotification.value = true;
      }
    };
    
    onMounted(() => {
      checkDismissedStatus();
      checkForUpdates();
      
      // DESABILITADO: Verificação automática que pode causar problemas
      // const interval = setInterval(checkForUpdates, 30000);
      
      onUnmounted(() => {
        // clearInterval(interval); // DESABILITADO
      });
    });
    
    return {
      showUpdateNotification,
      updateNow,
      dismissUpdate
    };
  }
};
</script>

<style scoped>
.pwa-update-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #059669, #10b981);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(5, 150, 105, 0.3);
  backdrop-filter: blur(10px);
  z-index: 9998;
  max-width: 350px;
  width: calc(100vw - 40px);
  animation: slideInRight 0.3s ease-out;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-icon {
  font-size: 24px;
  text-align: center;
  margin-bottom: 5px;
}

.notification-text h4 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.notification-text p {
  color: #d1fae5;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  text-align: center;
}

.notification-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.update-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.update-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.dismiss-btn {
  background: transparent;
  color: #d1fae5;
  border: 1px solid rgba(209, 250, 229, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.dismiss-btn:hover {
  background: rgba(209, 250, 229, 0.1);
  border-color: rgba(209, 250, 229, 0.5);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsividade */
@media (max-width: 480px) {
  .pwa-update-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
  
  .notification-actions {
    flex-direction: column;
  }
}

/* Modo escuro/claro */
@media (prefers-color-scheme: light) {
  .pwa-update-notification {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .notification-text h4 {
    color: #ffffff;
  }
  
  .notification-text p {
    color: #d1fae5;
  }
  
  .dismiss-btn {
    color: #d1fae5;
    border-color: rgba(209, 250, 229, 0.3);
  }
  
  .dismiss-btn:hover {
    background: rgba(209, 250, 229, 0.1);
    border-color: rgba(209, 250, 229, 0.5);
  }
}
</style>
