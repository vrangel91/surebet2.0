<template>
  <div class="loader-example">
    <h3>Exemplos de Uso do Loader</h3>
    
    <div class="example-section">
      <h4>1. Controle Manual</h4>
      <button @click="showLoader" class="btn btn-primary">Mostrar Loader</button>
      <button @click="hideLoader" class="btn btn-secondary">Esconder Loader</button>
    </div>

    <div class="example-section">
      <h4>2. Com Função Assíncrona</h4>
      <button @click="simulateApiCall" class="btn btn-success">
        Simular Chamada API
      </button>
    </div>

    <div class="example-section">
      <h4>3. Múltiplas Requisições</h4>
      <button @click="simulateMultipleCalls" class="btn btn-warning">
        Simular Múltiplas Chamadas
      </button>
    </div>

    <div class="example-section">
      <h4>4. Com Tratamento de Erro</h4>
      <button @click="simulateError" class="btn btn-danger">
        Simular Erro
      </button>
    </div>

    <div class="example-section">
      <h4>Estado Atual do Loader</h4>
      <p :class="{ 'loading': isLoading }">
        {{ isLoading ? '🔄 Carregando...' : '✅ Pronto' }}
      </p>
    </div>
  </div>
</template>

<script>
import { useLoader } from '@/composables/useLoader'

export default {
  name: 'LoaderExample',
  setup() {
    const { isLoading, showLoader, hideLoader, withLoader, withLoaderMultiple, forceHideLoader } = useLoader()

    // Simular chamada de API
    const simulateApiCall = () => {
      withLoader(async () => {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('✅ API call completed')
      })
    }

    // Simular múltiplas chamadas
    const simulateMultipleCalls = () => {
      const apiCalls = [
        () => new Promise(resolve => setTimeout(() => resolve('Call 1'), 1000)),
        () => new Promise(resolve => setTimeout(() => resolve('Call 2'), 1500)),
        () => new Promise(resolve => setTimeout(() => resolve('Call 3'), 800))
      ]

      withLoaderMultiple(apiCalls).then(results => {
        console.log('✅ All calls completed:', results)
      })
    }

    // Simular erro
    const simulateError = () => {
      withLoader(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        throw new Error('Erro simulado!')
      }).catch(error => {
        console.error('❌ Error occurred:', error.message)
        alert('Erro simulado! O loader foi automaticamente escondido.')
      })
    }

    return {
      isLoading,
      showLoader,
      hideLoader,
      simulateApiCall,
      simulateMultipleCalls,
      simulateError
    }
  }
}
</script>

<style scoped>
.loader-example {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.example-section h4 {
  margin-bottom: 15px;
  color: #333;
}

.btn {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}

.loading {
  color: #007bff;
  font-weight: bold;
}
</style>
