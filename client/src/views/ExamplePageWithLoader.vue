<template>
  <div class="page-container">
    <!-- Header da página -->
    <div class="page-header">
      <h1>Exemplo de Página com Loader</h1>
      <p>Esta página demonstra como usar o loader dentro da página</p>
    </div>

    <!-- Conteúdo principal com loader -->
    <div class="page-content" style="position: relative;">
      <!-- Conteúdo da página -->
      <div class="content-section">
        <h2>Dados da API</h2>
        <div v-if="!dataLoaded" class="no-data">
          <p>Nenhum dado carregado ainda</p>
          <button @click="loadData" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Carregando...' : 'Carregar Dados' }}
          </button>
        </div>
        
        <div v-else class="data-display">
          <h3>Dados carregados com sucesso!</h3>
          <p>Timestamp: {{ lastLoadTime }}</p>
          <button @click="refreshData" class="btn btn-secondary" :disabled="isLoading">
            {{ isLoading ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
      </div>

      <!-- Seção de configurações -->
      <div class="content-section">
        <h2>Configurações do Loader</h2>
        <div class="loader-config">
          <label>
            Texto do Loader:
            <input v-model="loaderText" type="text" class="form-input" />
          </label>
          <label>
            Tamanho:
            <select v-model="loaderSize" class="form-select">
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </label>
          <label>
            Posição:
            <select v-model="loaderPosition" class="form-select">
              <option value="center">Centro</option>
              <option value="top">Topo</option>
              <option value="bottom">Inferior</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Loader da página -->
      <PageLoader 
        :isLoading="isLoading"
        :text="loaderText"
        :size="loaderSize"
        :position="loaderPosition"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import PageLoader from '@/components/PageLoader.vue'
import { usePageLoader } from '@/composables/usePageLoader'

export default {
  name: 'ExamplePageWithLoader',
  components: {
    PageLoader
  },
  setup() {
    // Estado da página
    const dataLoaded = ref(false)
    const lastLoadTime = ref(null)
    
    // Configuração do loader
    const loaderText = ref('Carregando dados...')
    const loaderSize = ref('medium')
    const loaderPosition = ref('center')
    
    // Usar o composable do loader
    const { isLoading, showLoader, hideLoader, withLoader } = usePageLoader({
      text: loaderText.value,
      size: loaderSize.value,
      position: loaderPosition.value
    })

    // Simular carregamento de dados
    const loadData = async () => {
      await withLoader(async () => {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simular dados carregados
        dataLoaded.value = true
        lastLoadTime.value = new Date().toLocaleString()
      }, {
        text: 'Carregando dados da API...',
        size: 'large',
        position: 'center'
      })
    }

    // Atualizar dados
    const refreshData = async () => {
      await withLoader(async () => {
        // Simular atualização
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        lastLoadTime.value = new Date().toLocaleString()
      }, {
        text: 'Atualizando dados...',
        size: 'medium',
        position: 'center'
      })
    }

    // Carregar dados automaticamente ao montar a página
    onMounted(() => {
      // Opcional: carregar dados automaticamente
      // loadData()
    })

    return {
      // Estado
      dataLoaded,
      lastLoadTime,
      isLoading,
      
      // Configuração do loader
      loaderText,
      loaderSize,
      loaderPosition,
      
      // Métodos
      loadData,
      refreshData
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
}

.page-header h1 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.page-header p {
  color: var(--text-secondary);
  font-size: 16px;
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
}

.content-section {
  background-color: var(--bg-secondary);
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.content-section h2 {
  margin-bottom: 16px;
  color: var(--text-primary);
  font-size: 20px;
}

.content-section h3 {
  margin-bottom: 12px;
  color: var(--text-primary);
  font-size: 18px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.data-display {
  padding: 20px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--success-color);
}

.loader-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.loader-config label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--secondary-hover);
}

/* Responsivo */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .loader-config {
    grid-template-columns: 1fr;
  }
  
  .content-section {
    padding: 16px;
  }
}
</style>
