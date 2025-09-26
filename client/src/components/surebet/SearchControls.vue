<template>
  <div class="search-controls">
    <button class="control-btn" :class="{ active: isSearching }" @click="$emit('toggle-search')">
      <span class="control-text">{{
        isSearching ? "Pausar" : "Retomar"
        }}</span>
    </button>

    <button class="control-btn sound-btn" :class="{ active: soundEnabled }" @click="$emit('toggle-sound')">
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
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 40px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--button-primary-bg);
    color: var(--button-primary-text);
    border-color: var(--accent-primary);
    font-weight: 600;
    box-shadow: var(--shadow-button);

    &:hover {
      background: var(--button-primary-hover);
      transform: translateY(-1px);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-disabled);
    border-color: var(--border-disabled);
    color: var(--text-disabled);

    &:hover {
      transform: none;
      background: var(--bg-disabled);
    }
  }

  .control-text {
    font-size: 14px;
    font-weight: inherit;
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
    color: var(--text-disabled);
  }
}

.filter-toggle-btn {
  background: var(--button-info-bg);
  color: var(--button-info-text);
  border-color: var(--info-color);
  font-weight: 600;

  &:hover {
    background: var(--button-info-hover);
    border-color: var(--info-color);
  }
}

.sound-btn {
  &.active {
    background: var(--button-primary-bg);
    color: var(--button-primary-text);
    border-color: var(--accent-primary);
    font-weight: 600;
    box-shadow: var(--shadow-button);

    &:hover {
      background: var(--button-primary-hover);
    }
  }
}

.pinned-indicator {
  background: var(--button-warning-bg);
  color: var(--button-warning-text);
  border-color: var(--warning-color);
  font-weight: 600;
  animation: pulse 2s infinite;

  &:hover {
    background: var(--button-warning-hover);
    border-color: var(--warning-color);
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
    box-shadow: 0 0 0 0 var(--warning-color-alpha);
  }

  70% {
    box-shadow: 0 0 0 10px transparent;
  }

  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
</style>
