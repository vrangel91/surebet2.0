<template>
  <div v-if="showModal" class="modal-overlay" @click="$emit('close-modal')">
    <div class="modal-content saved-filters-modal" @click.stop>
      <div class="modal-header">
        <h3>Filtros Salvos</h3>
        <button class="close-btn" @click="$emit('close-modal')">×</button>
      </div>
      <div class="modal-body">
        <div v-if="savedFilters.length === 0" class="empty-filters">
          <p>Nenhum filtro salvo ainda.</p>
          <p>Salve seus filtros favoritos para reutilizá-los rapidamente!</p>
        </div>
        <div v-else class="saved-filters-list">
          <div v-for="(filter, index) in savedFilters" :key="index" class="saved-filter-item">
            <div class="filter-info">
              <h4 class="filter-name">{{ filter.name }}</h4>
              <div class="filter-details">
                <span class="filter-detail">
                  <strong>{{ filter.houses.length }}</strong> casas
                </span>
                <span class="filter-detail">
                  <strong>{{ filter.sports.length }}</strong> esportes
                </span>
                <span class="filter-detail">
                  <strong>{{ filter.currencies.length }}</strong> moedas
                </span>
                <span class="filter-detail">
                  Lucro: <strong>{{ filter.minProfit }}% - {{ filter.maxProfit }}%</strong>
                </span>
                <span class="filter-detail">
                  <strong>{{ filter.marketsCount }}</strong> mercados
                </span>
              </div>
            </div>
            <div class="filter-actions">
              <button @click="$emit('load-filter', filter)" class="load-btn">
                Carregar
              </button>
              <button @click="$emit('delete-filter', index)" class="delete-btn">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SavedFiltersModal",
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    savedFilters: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "close-modal",
    "load-filter",
    "delete-filter",
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
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
}

.saved-filters-modal {
  max-width: 700px;
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

.empty-filters {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);

  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
      font-size: 13px;
      opacity: 0.8;
    }
  }
}

.saved-filters-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }
}

.filter-info {
  flex: 1;
}

.filter-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.filter-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-detail {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;

  strong {
    color: var(--accent-color);
    font-weight: 600;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.load-btn,
.delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-btn {
  background: var(--accent-color);
  color: var(--text-inverse);

  &:hover {
    background: var(--accent-hover);
  }
}

.delete-btn {
  background: var(--error-color);
  color: var(--text-inverse);

  &:hover {
    background: var(--error-hover);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-body {
    padding: 16px;
  }

  .saved-filter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }

  .filter-details {
    gap: 8px;
  }

  .filter-detail {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .filter-details {
    flex-direction: column;
    gap: 4px;
  }

  .load-btn,
  .delete-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
