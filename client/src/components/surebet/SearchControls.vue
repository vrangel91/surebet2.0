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
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
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
    background: linear-gradient(90deg, transparent, var(--accent-color-alpha), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background: var(--accent-color-alpha);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);

    &::before {
      left: 100%;
    }
  }

  &.active {
    background: var(--accent-gradient);
    border-color: var(--accent-color);
    color: var(--text-inverse);
    font-weight: 600;
    box-shadow: var(--shadow-accent);

    &:hover {
      background: var(--accent-gradient);
      transform: translateY(-2px);
      box-shadow: var(--shadow-accent-hover);
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
  background: var(--accent-gradient);
  border-color: var(--accent-color);
  color: var(--text-inverse);
  font-weight: 600;

  &:hover {
    background: var(--accent-gradient);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-accent-hover);
  }
}

.pinned-indicator {
  background: var(--warning-gradient);
  border-color: var(--warning-color);
  color: var(--text-inverse);
  font-weight: 600;
  animation: pulse 2s infinite;

  &:hover {
    background: var(--warning-gradient);
    border-color: var(--warning-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-warning);
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
