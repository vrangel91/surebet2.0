<template>
  <div v-if="showModal" class="modal-overlay" @click="$emit('close-modal')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Salvar Filtro</h3>
        <button class="close-btn" @click="$emit('close-modal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nome do Filtro:</label>
          <input :value="filterName" type="text" placeholder="Ex: Filtro Futebol BRL" class="filter-name-input"
            @input="$emit('update:filterName', $event.target.value)" @keyup.enter="$emit('save-filter')" />
        </div>
        <div class="filter-preview">
          <h4>Configuração Atual:</h4>
          <div class="preview-item">
            <strong>Casas:</strong> {{ selectedHousesCount }} selecionadas
          </div>
          <div class="preview-item">
            <strong>Esportes:</strong> {{ selectedSportsCount }} selecionados
          </div>
          <div class="preview-item">
            <strong>Moedas:</strong> {{ selectedCurrenciesCount }} selecionadas
          </div>
          <div class="preview-item">
            <strong>Lucro:</strong> {{ minProfit }}% - {{ maxProfit }}%
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close-modal')" class="cancel-btn">
          Cancelar
        </button>
        <button @click="$emit('save-filter')" class="save-btn" :disabled="!filterName.trim()">
          Salvar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SaveFilterModal",
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    filterName: {
      type: String,
      default: "",
    },
    selectedHousesCount: {
      type: Number,
      default: 0,
    },
    selectedSportsCount: {
      type: Number,
      default: 0,
    },
    selectedCurrenciesCount: {
      type: Number,
      default: 0,
    },
    minProfit: {
      type: [Number, String],
      default: 0,
    },
    maxProfit: {
      type: [Number, String],
      default: 1000,
    },
  },
  emits: [
    "close-modal",
    "update:filterName",
    "save-filter",
  ],
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-primary);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--bg-hover);
    }
  }
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .filter-name-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    &::placeholder {
      color: var(--text-secondary);
    }
  }
}

.filter-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
    font-weight: 500;
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-primary);
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-hover);
  }
}

.save-btn {
  background: var(--accent-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>

