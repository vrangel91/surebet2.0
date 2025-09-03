<template>
  <div class="pwa-titlebar" :class="[theme, { animated: isAnimated }]">
    <!-- Logo e Título -->
    <div class="pwa-titlebar-brand">
      <div class="pwa-titlebar-logo">S</div>
      <span class="pwa-titlebar-title">{{ title }}</span>
    </div>
    
    <!-- Controles da Janela -->
    <div class="pwa-titlebar-controls">
      <button 
        class="pwa-titlebar-button minimize" 
        @click="minimizeWindow"
        title="Minimizar"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20 14H4v-2h16v2z"/>
        </svg>
      </button>
      
      <button 
        class="pwa-titlebar-button maximize" 
        @click="toggleMaximize"
        :title="isMaximized ? 'Restaurar' : 'Maximizar'"
      >
        <svg v-if="!isMaximized" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      </button>
      
      <button 
        class="pwa-titlebar-button close" 
        @click="closeWindow"
        title="Fechar"
      >
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'PWATitleBar',
  
  props: {
    title: {
      type: String,
      default: 'SureStake'
    },
    theme: {
      type: String,
      default: 'dark',
      validator: (value) => ['dark', 'light'].includes(value)
    },
    animated: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props, { emit }) {
    const isMaximized = ref(false);
    const isAnimated = computed(() => props.animated);
    
    // Verificar se estamos em um PWA
    const isPWA = computed(() => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    });
    
    // Minimizar janela
    const minimizeWindow = () => {
      if (isPWA.value && window.electronAPI) {
        window.electronAPI.minimize();
      } else {
        emit('minimize');
      }
    };
    
    // Alternar maximizar/restaurar
    const toggleMaximize = () => {
      if (isPWA.value && window.electronAPI) {
        if (isMaximized.value) {
          window.electronAPI.unmaximize();
        } else {
          window.electronAPI.maximize();
        }
      } else {
        emit('toggle-maximize');
      }
      isMaximized.value = !isMaximized.value;
    };
    
    // Fechar janela
    const closeWindow = () => {
      if (isPWA.value && window.electronAPI) {
        window.electronAPI.close();
      } else {
        emit('close');
      }
    };
    
    // Detectar mudanças de estado da janela
    onMounted(() => {
      if (isPWA.value && window.electronAPI) {
        // Escutar eventos do Electron
        window.electronAPI.onMaximize(() => {
          isMaximized.value = true;
        });
        
        window.electronAPI.onUnmaximize(() => {
          isMaximized.value = false;
        });
      }
    });
    
    return {
      isMaximized,
      isAnimated,
      isPWA,
      minimizeWindow,
      toggleMaximize,
      closeWindow
    };
  }
};
</script>

<style scoped>
/* Estilos específicos do componente */
.pwa-titlebar {
  -webkit-app-region: drag; /* Permite arrastar a janela */
  user-select: none;
}

.pwa-titlebar-button {
  -webkit-app-region: no-drag; /* Permite clicar nos botões */
}

/* Melhorias para PWA standalone */
@media (display-mode: standalone) {
  .pwa-titlebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
  }
}

/* Melhorias para dispositivos móveis */
@media (max-width: 768px) {
  .pwa-titlebar {
    padding: 0 12px;
  }
  
  .pwa-titlebar-title {
    font-size: 13px;
  }
}
</style>
