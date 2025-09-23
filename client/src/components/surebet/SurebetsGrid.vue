<template>
  <div class="surebets-list">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Carregando surebets...</p>
    </div>

    <div v-else-if="filteredSurebetsByMarket.length === 0" class="empty-state">
      <div class="animated-container">
        <!-- Mensagem principal animada -->
        <div class="main-message">
          <h2 class="animated-text">Nenhum Surebet Disponível</h2>
          <div class="pulse-dot"></div>
        </div>

        <!-- Submensagem com efeito de digitação -->
        <p class="typing-text">
          Aguardando novas oportunidades de arbitragem...
        </p>

        <!-- Estatísticas animadas -->
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-number" :data-target="lastCheckCount">
              {{ lastCheckCount }}
            </div>
            <div class="stat-label">Verificações</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" :data-target="uptimeMinutes">
              {{ uptimeMinutes }}
            </div>
            <div class="stat-label">Minutos Online</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="surebets-grid">
      <SurebetCard v-for="(surebet, index) in paginatedSurebets" :key="index" :surebet="surebet"
        :isPinned="isPinned(surebet)" :bookmaker-accounts="bookmakerAccounts" :round-values="roundValues"
        :is-loading-accounts="isLoadingAccounts" @add-to-reports="$emit('add-to-reports', $event)"
        @toggle-pin="$emit('toggle-pin', $event)" @balance-debited="$emit('balance-debited', $event)"
        @refresh-accounts="$emit('refresh-accounts')" />
    </div>

    <!-- Botão "Ver mais" para paginação -->
    <div v-if="hasMoreItems" class="load-more-container">
      <button @click="$emit('load-more-cards')" :disabled="isLoadingMore" class="load-more-btn"
        :class="{ loading: isLoadingMore }">
        <span v-if="!isLoadingMore">
          Ver mais ({{ remainingItemsCount }} restantes)
        </span>
        <span v-else class="loading-content">
          <div class="spinner"></div>
          Carregando...
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import SurebetCard from "../SurebetCard.vue";

export default {
  name: "SurebetsGrid",
  components: {
    SurebetCard,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    filteredSurebetsByMarket: {
      type: Array,
      default: () => [],
    },
    paginatedSurebets: {
      type: Array,
      default: () => [],
    },
    hasMoreItems: {
      type: Boolean,
      default: false,
    },
    isLoadingMore: {
      type: Boolean,
      default: false,
    },
    remainingItemsCount: {
      type: Number,
      default: 0,
    },
    lastCheckCount: {
      type: Number,
      default: 0,
    },
    uptimeMinutes: {
      type: Number,
      default: 0,
    },
    bookmakerAccounts: {
      type: Object,
      default: () => ({}),
    },
    roundValues: {
      type: Boolean,
      default: false,
    },
    isLoadingAccounts: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "add-to-reports",
    "toggle-pin",
    "balance-debited",
    "refresh-accounts",
    "load-more-cards",
  ],
  methods: {
    isPinned(surebet) {
      // Esta função deve ser implementada no componente pai
      // Por enquanto, retorna false
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.surebets-list {
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: var(--text-secondary);
    font-size: 16px;
    margin: 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 400px;
}

.animated-container {
  max-width: 500px;
  width: 100%;
}

.main-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.animated-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  animation: fadeInUp 1s ease-out;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.typing-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 40px 0;
  animation: fadeInUp 1s ease-out 0.5s both;
}

.stats-container {
  display: flex;
  gap: 40px;
  justify-content: center;
  animation: fadeInUp 1s ease-out 1s both;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 8px;
  animation: countUp 2s ease-out 1.5s both;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.surebets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  background: transparent;
  color: var(--accent-color);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;

  &:hover:not(:disabled) {
    background: var(--accent-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.loading {
    background: var(--accent-color);
    color: white;
  }
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsividade */
@media (max-width: 768px) {
  .surebets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stats-container {
    flex-direction: column;
    gap: 20px;
  }

  .animated-text {
    font-size: 20px;
  }

  .stat-number {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .surebets-list {
    padding: 16px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .load-more-btn {
    min-width: 160px;
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>

