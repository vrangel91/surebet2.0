<template>
  <div class="loader-example">
    <h2>Exemplos de Loader</h2>
    
    <!-- Exemplo 1: Loader dentro da página -->
    <div class="example-section">
      <h3>1. Loader dentro da página (PageLoader)</h3>
      <div class="example-container" style="position: relative; height: 200px; border: 1px solid #ccc; border-radius: 8px;">
        <div class="content">
          <p>Conteúdo da página aqui...</p>
          <button @click="togglePageLoader" class="btn">
            {{ pageLoader.isLoading.value ? 'Esconder' : 'Mostrar' }} Page Loader
          </button>
        </div>
        
        <!-- PageLoader dentro do container -->
        <PageLoader v-bind="pageLoader.loaderProps.value" />
      </div>
    </div>

    <!-- Exemplo 2: LoaderOverlay em modo página -->
    <div class="example-section">
      <h3>2. LoaderOverlay em modo página</h3>
      <div class="example-container" style="position: relative; height: 200px; border: 1px solid #ccc; border-radius: 8px;">
        <div class="content">
          <p>Conteúdo da página aqui...</p>
          <button @click="toggleOverlayLoader" class="btn">
            {{ overlayLoader.isLoading.value ? 'Esconder' : 'Mostrar' }} Overlay Loader
          </button>
        </div>
        
        <!-- LoaderOverlay em modo página -->
        <LoaderOverlay 
          :isLoading="overlayLoader.isLoading.value" 
          :pageMode="true"
          text="Carregando dados..."
        />
      </div>
    </div>

    <!-- Exemplo 3: Loader com função assíncrona -->
    <div class="example-section">
      <h3>3. Loader com função assíncrona</h3>
      <div class="example-container" style="position: relative; height: 200px; border: 1px solid #ccc; border-radius: 8px;">
        <div class="content">
          <p>Simular carregamento de dados...</p>
          <button @click="simulateAsyncOperation" class="btn" :disabled="asyncLoader.isLoading.value">
            {{ asyncLoader.isLoading.value ? 'Carregando...' : 'Simular Carregamento' }}
          </button>
        </div>
        
        <!-- PageLoader para operação assíncrona -->
        <PageLoader v-bind="asyncLoader.loaderProps.value" />
      </div>
    </div>

    <!-- Exemplo 4: Diferentes tamanhos e posições -->
    <div class="example-section">
      <h3>4. Diferentes tamanhos e posições</h3>
      <div class="example-container" style="position: relative; height: 300px; border: 1px solid #ccc; border-radius: 8px;">
        <div class="content">
          <div class="controls">
            <label>
              Tamanho:
              <select v-model="customSize">
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </label>
            <label>
              Posição:
              <select v-model="customPosition">
                <option value="center">Centro</option>
                <option value="top">Topo</option>
                <option value="bottom">Inferior</option>
              </select>
            </label>
            <button @click="toggleCustomLoader" class="btn">
              {{ customLoader.isLoading.value ? 'Esconder' : 'Mostrar' }} Custom Loader
            </button>
          </div>
        </div>
        
        <!-- PageLoader customizado -->
        <PageLoader 
          v-bind="customLoader.loaderProps.value"
          :size="customSize"
          :position="customPosition"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import PageLoader from './PageLoader.vue'
import LoaderOverlay from './LoaderOverlay.vue'
import { usePageLoader } from '@/composables/usePageLoader'

export default {
  name: 'LoaderExample',
  components: {
    PageLoader,
    LoaderOverlay
  },
  setup() {
    // Exemplo 1: PageLoader básico
    const pageLoader = usePageLoader({
      text: 'Carregando página...',
      size: 'medium',
      position: 'center'
    })

    // Exemplo 2: LoaderOverlay em modo página
    const overlayLoader = usePageLoader({
      text: 'Carregando dados...',
      size: 'large',
      position: 'center'
    })

    // Exemplo 3: Loader para operação assíncrona
    const asyncLoader = usePageLoader({
      text: 'Processando dados...',
      size: 'medium',
      position: 'center'
    })

    // Exemplo 4: Loader customizado
    const customLoader = usePageLoader()
    const customSize = ref('medium')
    const customPosition = ref('center')

    // Métodos para controlar os loaders
    const togglePageLoader = () => {
      if (pageLoader.isLoading.value) {
        pageLoader.hideLoader()
      } else {
        pageLoader.showLoader()
      }
    }

    const toggleOverlayLoader = () => {
      if (overlayLoader.isLoading.value) {
        overlayLoader.hideLoader()
      } else {
        overlayLoader.showLoader()
      }
    }

    const simulateAsyncOperation = async () => {
      await asyncLoader.withLoader(async () => {
        // Simular operação assíncrona
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('Operação concluída!')
      })
    }

    const toggleCustomLoader = () => {
      if (customLoader.isLoading.value) {
        customLoader.hideLoader()
      } else {
        customLoader.showLoader({
          text: `Loader ${customSize.value} na posição ${customPosition.value}`,
          size: customSize.value,
          position: customPosition.value
        })
      }
    }

    return {
      pageLoader,
      overlayLoader,
      asyncLoader,
      customLoader,
      customSize,
      customPosition,
      togglePageLoader,
      toggleOverlayLoader,
      simulateAsyncOperation,
      toggleCustomLoader
    }
  }
}
</script>

<style scoped>
.loader-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 30px;
}

.example-section h3 {
  margin-bottom: 10px;
  color: #333;
}

.example-container {
  background-color: #f8f9fa;
  padding: 20px;
}

.content {
  position: relative;
  z-index: 1;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.controls select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Tema escuro */
.dark .example-container {
  background-color: #2d3748;
}

.dark .example-section h3 {
  color: #e2e8f0;
}

.dark .controls select {
  background-color: #4a5568;
  border-color: #718096;
  color: #e2e8f0;
}
</style>