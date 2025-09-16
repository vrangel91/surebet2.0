/**
 * Composable para gerenciar status VIP com cache
 * Otimiza verificações de VIP para melhor performance
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

export function useVIPStatus() {
  const store = useStore();
  const vipStatus = ref(null);
  const isLoading = ref(false);
  const lastCheck = ref(null);
  const cacheTTL = 5 * 60 * 1000; // 5 minutos
  const checkInterval = ref(null);

  // Cache local para evitar verificações desnecessárias
  const localCache = {
    data: null,
    timestamp: null,
    ttl: cacheTTL
  };

  /**
   * Verifica se o cache local é válido
   */
  const isCacheValid = () => {
    if (!localCache.data || !localCache.timestamp) return false;
    return Date.now() - localCache.timestamp < localCache.ttl;
  };

  /**
   * Busca status VIP da API
   */
  const fetchVIPStatus = async (forceRefresh = false) => {
    // Verificar cache local primeiro
    if (!forceRefresh && isCacheValid()) {
      vipStatus.value = localCache.data;
      return localCache.data;
    }

    // Verificar se já está carregando
    if (isLoading.value) {
      return vipStatus.value;
    }

    try {
      isLoading.value = true;
      
      const response = await fetch('/api/users/vip-status', {
        headers: {
          'Authorization': `Bearer ${store.state.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        vipStatus.value = data.data;
        lastCheck.value = Date.now();
        
        // Atualizar cache local
        localCache.data = data.data;
        localCache.timestamp = Date.now();
        
        // Atualizar store do Vuex
        store.commit('setVIPStatus', data.data);
        
        return data.data;
      } else {
        throw new Error(data.message || 'Erro ao verificar status VIP');
      }
    } catch (error) {
      console.error('Erro ao verificar status VIP:', error);
      
      // Em caso de erro, usar dados do store se disponíveis
      if (store.state.vipStatus.isVIP !== undefined) {
        vipStatus.value = store.state.vipStatus;
        return store.state.vipStatus;
      }
      
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Verifica status VIP com cache inteligente
   */
  const checkVIPStatus = async (forceRefresh = false) => {
    // Se já temos dados válidos no cache, retornar imediatamente
    if (!forceRefresh && isCacheValid() && vipStatus.value) {
      return vipStatus.value;
    }

    // Se não temos dados e não está carregando, buscar
    if (!isLoading.value) {
      return await fetchVIPStatus(forceRefresh);
    }

    // Se está carregando, retornar dados atuais
    return vipStatus.value;
  };

  /**
   * Inicia verificação automática do status VIP
   */
  const startAutoCheck = (interval = 300000) => { // 5 minutos por padrão
    if (checkInterval.value) {
      clearInterval(checkInterval.value);
    }

    checkInterval.value = setInterval(async () => {
      try {
        await fetchVIPStatus(true); // Força refresh
      } catch (error) {
        console.warn('Erro na verificação automática VIP:', error);
      }
    }, interval);
  };

  /**
   * Para verificação automática
   */
  const stopAutoCheck = () => {
    if (checkInterval.value) {
      clearInterval(checkInterval.value);
      checkInterval.value = null;
    }
  };

  /**
   * Invalida cache local
   */
  const invalidateCache = () => {
    localCache.data = null;
    localCache.timestamp = null;
  };

  // Computed properties
  const isVIP = computed(() => {
    return vipStatus.value?.isVIP || false;
  });

  const isVIPExpired = computed(() => {
    if (!vipStatus.value?.isVIP || !vipStatus.value?.expiration) return false;
    return new Date(vipStatus.value.expiration) <= new Date();
  });

  const vipDaysRemaining = computed(() => {
    if (!vipStatus.value?.isVIP || !vipStatus.value?.expiration) return 0;
    
    const now = new Date();
    const expiration = new Date(vipStatus.value.expiration);
    const diffTime = expiration - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  });

  const canUseVIPFeatures = computed(() => {
    return isVIP.value && !isVIPExpired.value;
  });

  // Inicializar com dados do store se disponíveis
  onMounted(async () => {
    // Tentar usar dados do store primeiro
    if (store.state.vipStatus.isVIP !== undefined) {
      vipStatus.value = store.state.vipStatus;
      localCache.data = store.state.vipStatus;
      localCache.timestamp = Date.now();
    }

    // Verificar se precisa atualizar
    if (!isCacheValid()) {
      try {
        await fetchVIPStatus();
      } catch (error) {
        console.warn('Erro ao verificar status VIP inicial:', error);
      }
    }

    // Iniciar verificação automática
    startAutoCheck();
  });

  onUnmounted(() => {
    stopAutoCheck();
  });

  return {
    // Estado
    vipStatus,
    isLoading,
    lastCheck,
    
    // Computed
    isVIP,
    isVIPExpired,
    vipDaysRemaining,
    canUseVIPFeatures,
    
    // Métodos
    checkVIPStatus,
    fetchVIPStatus,
    startAutoCheck,
    stopAutoCheck,
    invalidateCache
  };
}
