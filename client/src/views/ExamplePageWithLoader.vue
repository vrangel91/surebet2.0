<template>
  <div class="example-page">
    <div class="page-header">
      <h1>Exemplo de Página com Loader</h1>
      <p>Esta página demonstra como usar o sistema de loader otimizado</p>
    </div>

    <div class="page-content">
      <div class="demo-section">
        <h3>Loader da Página (não bloqueia o sidebar)</h3>
        <div class="demo-buttons">
          <button @click="loadData" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Carregando...' : 'Carregar Dados' }}
          </button>
          <button @click="refreshData" class="btn btn-secondary" :disabled="isLoading">
            {{ isLoading ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>

        <div v-if="dataLoaded" class="data-display">
          <h4>Dados carregados com sucesso!</h4>
          <p>Timestamp: {{ lastLoadTime }}</p>
        </div>
      </div>

      <div class="demo-section">
        <h3>Configurações do Loader</h3>
        <div class="config-options">
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
    </div>

    <!-- Loader da página -->
    <PageLoader :isLoading="isLoading" :text="loaderText" :size="loaderSize" :position="loaderPosition" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import PageLoader from '@/components/Loaders/PageLoader.vue'
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

    // Configurações do loader
    const loaderText = ref('Carregando dados...')
    const loaderSize = ref('medium')
    const loaderPosition = ref('center')

    // Usar o composable do loader
    const { isLoading, withPageLoader } = usePageLoader({
      text: loaderText.value
    })

    // Função para carregar dados
    const loadData = async () => {
      await withPageLoader(async () => {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 2000))
        dataLoaded.value = true
        lastLoadTime.value = new Date().toLocaleString()
      }, 'Carregando dados...')
    }

    // Função para atualizar dados
    const refreshData = async () => {
      await withPageLoader(async () => {
        // Simular atualização
        await new Promise(resolve => setTimeout(resolve, 1500))
        lastLoadTime.value = new Date().toLocaleString()
      }, 'Atualizando dados...')
    }

    return {
      // Estado
      dataLoaded,
      lastLoadTime,

      // Configuração do loader
      loaderText,
      loaderSize,
      loaderPosition,

      // Computed
      isLoading,

      // Métodos
      loadData,
      refreshData
    }
  }
}
</script>

<style scoped>
.example-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  min-height: 400px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-header p {
  color: var(--text-secondary);
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.demo-section h3 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--text-button-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-overlay);
  transform: translateY(-1px);
}

.data-display {
  background: var(--bg-overlay);
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid var(--accent-primary);
}

.data-display h4 {
  color: var(--accent-primary);
  margin-bottom: 8px;
}

.data-display p {
  color: var(--text-secondary);
  margin: 0;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-options label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
}

/* Responsividade */
@media (max-width: 768px) {
  .example-page {
    padding: 15px;
  }

  .demo-buttons {
    flex-direction: column;
  }

  .config-options {
    gap: 12px;
  }
}
</style>