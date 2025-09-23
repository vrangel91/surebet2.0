import { ref, onMounted, onUnmounted } from 'vue';
import { API_CONFIG, buildApiUrl } from '../utils/apiConfig.js';

export function useSurebetsSSE(onDataUpdate = null) {
  const eventSource = ref(null);
  const sseConnected = ref(false);
  const sseRetryCount = ref(0);
  const pollingInterval = ref(null);
  const lastRequestTime = ref(0);
  const requestLatency = ref(0);
  
  // Sistemas de otimização
  const adaptivePolling = ref({
    baseInterval: 5000,
    currentInterval: 5000,
    maxInterval: 30000,
    minInterval: 2000,
    backoffMultiplier: 1.5,
    successCount: 0,
    errorCount: 0,
  });
  
  const smartCache = ref({
    data: new Map(),
    timestamps: new Map(),
    ttl: 30000, // 30 segundos
  });
  
  const rateLimiter = ref({
    requests: [],
    maxRequests: 10,
    timeWindow: 60000, // 1 minuto
  });
  
  const connectSSE = () => {
    try {
      // Usar a nova API sempregreen
      const sseUrl = buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS);
      
      console.log('🔌 Conectando SSE:', sseUrl);
      eventSource.value = new EventSource(sseUrl);
      
      eventSource.value.onopen = () => {
        console.log('SSE conectado');
        sseConnected.value = true;
        sseRetryCount.value = 0;
      };
      
      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSSEMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem SSE:', error);
        }
      };
      
      eventSource.value.addEventListener('full', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSSEMessage(data);
        } catch (error) {
          console.error('Erro ao processar evento SSE full:', error);
        }
      });
      
      eventSource.value.onerror = (error) => {
        console.error('Erro SSE:', error);
        sseConnected.value = false;
        scheduleReconnect();
      };
    } catch (error) {
      console.error('Erro ao conectar SSE:', error);
      scheduleReconnect();
    }
  };
  
  const scheduleReconnect = () => {
    if (sseRetryCount.value < 5) {
      const delay = Math.min(1000 * Math.pow(2, sseRetryCount.value), 30000);
      sseRetryCount.value++;
      
      setTimeout(() => {
        console.log(`Tentando reconectar SSE (tentativa ${sseRetryCount.value})`);
        connectSSE();
      }, delay);
    }
  };
  
  const handleSSEMessage = (data) => {
    // Lógica para processar mensagens SSE
    console.log('Mensagem SSE recebida:', data);
    // Atualizar cache com novos dados
    updateCache('surebets', data);
    
    // Notificar sobre a atualização dos dados
    if (onDataUpdate && typeof onDataUpdate === 'function') {
      onDataUpdate(data);
    }
  };
  
  const startPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
    }
    
    pollingInterval.value = setInterval(() => {
      if (!sseConnected.value) {
        fetchSurebets();
      }
    }, adaptivePolling.value.currentInterval);
  };
  
  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
  };
  
  const fetchSurebets = async () => {
    const now = Date.now();
    
    // Rate limiting
    if (!canMakeRequest(now)) {
      console.log('Rate limit atingido, pulando requisição');
      return;
    }
    
    try {
      lastRequestTime.value = now;
      const startTime = performance.now();
      
      // Usar a nova API sempregreen
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      // Processar dados SSE
      const text = await response.text();
      const lines = text.split('\n');
      let eventData = null;
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            eventData = JSON.parse(line.substring(6)); // Remove 'data: '
            break;
          } catch (parseError) {
            console.error("Erro ao parsear dados SSE:", parseError);
          }
        }
      }
      
      if (!eventData) {
        throw new Error("Nenhum dado válido encontrado na resposta SSE");
      }
      
      const endTime = performance.now();
      requestLatency.value = endTime - startTime;
      
      // Atualizar cache
      updateCache('surebets', eventData);
      
      // Ajustar polling baseado na latência
      adjustPollingInterval(true);
      
      return eventData;
    } catch (error) {
      console.error('Erro ao buscar surebets:', error);
      adjustPollingInterval(false);
      throw error;
    }
  };
  
  const canMakeRequest = (now) => {
    const requests = rateLimiter.value.requests;
    const timeWindow = rateLimiter.value.timeWindow;
    
    // Remover requisições antigas
    const validRequests = requests.filter(time => now - time < timeWindow);
    rateLimiter.value.requests = validRequests;
    
    // Verificar se pode fazer nova requisição
    if (validRequests.length >= rateLimiter.value.maxRequests) {
      return false;
    }
    
    // Adicionar nova requisição
    rateLimiter.value.requests.push(now);
    return true;
  };
  
  const updateCache = (key, data) => {
    const now = Date.now();
    smartCache.value.data.set(key, data);
    smartCache.value.timestamps.set(key, now);
  };
  
  const getCachedData = (key) => {
    const timestamp = smartCache.value.timestamps.get(key);
    const now = Date.now();
    
    if (timestamp && (now - timestamp) < smartCache.value.ttl) {
      return smartCache.value.data.get(key);
    }
    
    return null;
  };
  
  const adjustPollingInterval = (success) => {
    if (success) {
      adaptivePolling.value.successCount++;
      adaptivePolling.value.errorCount = 0;
      
      // Diminuir intervalo se muitas sucessos consecutivos
      if (adaptivePolling.value.successCount > 3) {
        adaptivePolling.value.currentInterval = Math.max(
          adaptivePolling.value.currentInterval * 0.9,
          adaptivePolling.value.minInterval
        );
      }
    } else {
      adaptivePolling.value.errorCount++;
      adaptivePolling.value.successCount = 0;
      
      // Aumentar intervalo se muitos erros consecutivos
      if (adaptivePolling.value.errorCount > 2) {
        adaptivePolling.value.currentInterval = Math.min(
          adaptivePolling.value.currentInterval * adaptivePolling.value.backoffMultiplier,
          adaptivePolling.value.maxInterval
        );
      }
    }
    
    // Reiniciar polling com novo intervalo
    if (pollingInterval.value) {
      startPolling();
    }
  };
  
  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
    }
    stopPolling();
  };
  
  onMounted(() => {
    connectSSE();
    startPolling();
  });
  
  onUnmounted(() => {
    disconnect();
  });
  
  return {
    eventSource,
    sseConnected,
    sseRetryCount,
    pollingInterval,
    lastRequestTime,
    requestLatency,
    adaptivePolling,
    smartCache,
    rateLimiter,
    connectSSE,
    disconnect,
    fetchSurebets,
    startPolling,
    stopPolling,
    getCachedData,
    updateCache,
  };
}
