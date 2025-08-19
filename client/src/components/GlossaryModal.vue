<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header do Modal -->
      <div class="modal-header">
        <h2 class="modal-title">Glosário de Mercados e Casas</h2>
        <button class="modal-close" @click="closeModal">
          <span>✕</span>
        </button>
      </div>

      <!-- Conteúdo do Modal -->
      <div class="modal-body">
        <div class="glossary-table">
          <div class="table-header">
            <div class="header-cell">SINAL DA APOSTA</div>
            <div class="header-cell">MERCADO</div>
          </div>
          
          <div class="table-body">
            <div class="table-row" v-for="(item, index) in glossaryData" :key="index">
              <div class="table-cell signal-cell">{{ item.signal }}</div>
              <div class="table-cell market-cell">{{ item.market }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlossaryModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      glossaryData: [
        { signal: 'T1 vence gols', market: 'time 1 ganha' },
        { signal: 'T2 vence gols', market: 'time 2 ganha' },
        { signal: 'Empate/T2', market: 'empate ou time 2 vence' },
        { signal: 'T1/empate', market: 'empate ou time 1 vence' },
        { signal: 'H1', market: 'handicap asiático para o 1º time' },
        { signal: 'H2', market: 'handicap asiático para o 2º time' },
        { signal: 'EH1', market: 'handicap europeu para o 1º time' },
        { signal: 'EH2', market: 'handicap europeu para o 2º time' },
        { signal: 'DNB', market: 'Empate devolve a aposta' },
        { signal: 'Lay', market: 'Contra o resultado' },
        { signal: 'Sim ambos marcam', market: 'ambos os times marcam gols' },
        { signal: 'Não ambos marcam', market: 'ambos os times não marcam gols' },
        { signal: 'Total ≤', market: 'igual ou acima' },
        { signal: 'Total ≥', market: 'igual ou abaixo' },
        { signal: 'H2(margem) ≤', market: 'handicap asiático igual ou acima' },
        { signal: 'H2(margem) ≥', market: 'handicap asiático igual ou abaixo' },
        { signal: 'barrack', market: 'Mapa 1' }
      ]
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-hover);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-tertiary);
}

.modal-title {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.modal-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.glossary-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.header-cell {
  padding: 16px 20px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  background-color: var(--bg-secondary);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--bg-hover);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 16px 20px;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.signal-cell {
  font-weight: 500;
  color: var(--accent-primary);
}

.market-cell {
  color: var(--text-secondary);
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .header-cell,
  .table-cell {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
  
  .glossary-table {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  
  .header-cell:first-child,
  .table-cell:first-child {
    border-bottom: 1px solid var(--border-primary);
  }
  
  .signal-cell {
    background-color: var(--bg-tertiary);
  }
}
</style>
