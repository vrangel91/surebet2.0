<template>
  <div class="search-controls">
    <button class="control-btn" :class="{ active: isSearching }" @click="$emit('toggle-search')">
      <span class="control-text">{{
        isSearching ? "Pausar" : "Retomar"
      }}</span>
    </button>

    <button class="control-btn" :class="{ active: soundEnabled }" @click="$emit('toggle-sound')">
      <span class="control-text">{{
        soundEnabled ? "Som On" : "Som Off"
      }}</span>
    </button>

    <button class="control-btn refresh-btn" @click="$emit('manual-refresh')" :disabled="loading">
      <span class="control-text">
        <span v-if="!loading">Atualizar</span>
        <span v-else>⏳ Carregando...</span>
      </span>
    </button>

    <button class="control-btn filter-toggle-btn" @click="$emit('toggle-filter-overlay')">
      <span class="control-text">Filtros</span>
    </button>

    <button v-if="pinnedCardsCount > 0" class="control-btn pinned-indicator" @click="$emit('scroll-to-pinned-cards')"
      title="Ir para cards fixos">
      <MapPin class="control-icon" size="16" />
      <span class="control-text">{{ pinnedCardsCount }}</span>
    </button>
  </div>
</template>

<script>
import { MapPin } from "lucide-vue-next";

export default {
  name: "SearchControls",
  components: {
    MapPin,
  },
  props: {
    isSearching: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    pinnedCardsCount: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "toggle-search",
    "toggle-sound",
    "manual-refresh",
    "toggle-filter-overlay",
    "scroll-to-pinned-cards",
  ],
};
</script>

<style lang="scss" scoped>
.search-controls {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  align-items: center;
  margin: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  &.active {
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    border-color: #00ff88;
    color: #1a1a1a;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 255, 136, 0.3);

    &:hover {
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  .control-text {
    font-size: 13px;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }

  .control-icon {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
}

.refresh-btn {
  &:disabled {
    background: var(--bg-disabled);
    border-color: var(--border-disabled);
  }
}

.filter-toggle-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-color: #00ff88;
  color: #1a1a1a;
  font-weight: 600;

  &:hover {
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
  }
}

.pinned-indicator {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  border-color: #ffc107;
  color: #1a1a1a;
  font-weight: 600;
  animation: pulse 2s infinite;

  &:hover {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    border-color: #ffc107;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .search-controls {
    margin: 0 var(--spacing-md) var(--spacing-lg) var(--spacing-md);
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }

  .control-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 12px;

    .control-text {
      font-size: 12px;
    }
  }
}

@media (max-width: 480px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-btn {
    justify-content: center;
    padding: var(--spacing-sm);
  }
}

/* Animações */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 170, 0, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(255, 170, 0, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 170, 0, 0);
  }
}
</style>
