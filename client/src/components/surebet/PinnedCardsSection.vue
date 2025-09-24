<template>
  <div v-if="pinnedCards.length > 0" class="pinned-cards-section">
    <div class="pinned-header">
      <h3 class="pinned-title" :class="{ 'limit-reached': pinnedCards.length >= 3 }">
        <MapPin class="pin-icon" size="18" />
        Cards Fixos ({{ pinnedCards.length }}/3)
        <span v-if="pinnedCards.length >= 3" class="limit-indicator" title="Limite máximo atingido">⚠️</span>
      </h3>
      <div class="pinned-controls">
        <button class="control-btn drag-mode-btn" :class="{ active: dragMode }" @click="$emit('toggle-drag-mode')"
          title="Modo de arrastar">
          <span class="control-text">{{ dragMode ? "🔒" : "✋" }}</span>
          <span v-if="dragMode" class="drag-hint">Arraste para reorganizar</span>
        </button>
        <button class="clear-pinned-btn" @click="$emit('clear-all-pinned-cards')" title="Limpar todos os cards fixos">
          <Trash2 class="clear-icon" size="16" />
          Limpar Todos
        </button>
      </div>
    </div>
    <div class="pinned-cards-grid" :class="{ 'drag-mode': dragMode }" @dragover.prevent @drop="$emit('on-drop', $event)">
      <div v-for="(surebet, index) in pinnedCards" :key="`pinned-${index}`" class="pinned-card-wrapper" :class="{
          dragging: draggedIndex === index,
          'drag-over': dragOverIndex === index && draggedIndex !== index,
      }" :draggable="dragMode" :data-index="index" @dragstart="$emit('on-drag-start', $event, index)" 
        @dragend="$emit('on-drag-end', $event)" @dragenter="$emit('on-drag-enter', $event, index)" 
        @dragover.prevent @drop="$emit('on-drop', $event)">
        <div v-if="dragMode" class="drag-indicator">
          <span class="drag-icon">↕️</span>
        </div>
        <SurebetCard :surebet="surebet" :isPinned="true" :isDragging="dragMode"
          :bookmaker-accounts="bookmakerAccounts" :is-loading-accounts="isLoadingAccounts"
          :round-values="roundValues" @add-to-reports="$emit('add-to-reports', $event)" 
          @toggle-pin="$emit('toggle-pin', $event)" @balance-debited="$emit('balance-debited', $event)" 
          @refresh-accounts="$emit('refresh-accounts')" />
      </div>
    </div>
  </div>
</template>

<script>
import SurebetCard from "../SurebetCard.vue";
import { MapPin, Trash2 } from "lucide-vue-next";

export default {
  name: "PinnedCardsSection",
  components: {
    SurebetCard,
    MapPin,
    Trash2,
  },
  props: {
    pinnedCards: {
      type: Array,
      default: () => [],
    },
    dragMode: {
      type: Boolean,
      default: false,
    },
    draggedIndex: {
      type: Number,
      default: -1,
    },
    dragOverIndex: {
      type: Number,
      default: -1,
    },
    bookmakerAccounts: {
      type: Object,
      default: () => ({}),
    },
    isLoadingAccounts: {
      type: Boolean,
      default: false,
    },
    roundValues: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "toggle-drag-mode",
    "clear-all-pinned-cards",
    "on-drop",
    "on-drag-start",
    "on-drag-end",
    "on-drag-enter",
    "add-to-reports",
    "toggle-pin",
    "balance-debited",
    "refresh-accounts",
  ],
};
</script>

<style lang="scss" scoped>
.pinned-cards-section {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.pinned-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.pinned-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;

  &.limit-reached {
    color: var(--warning-color);
  }
}

.pin-icon {
  color: var(--accent-color);
}

.limit-indicator {
  font-size: 16px;
  margin-left: 4px;
}

.pinned-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  &.active {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: var(--text-inverse);
  }
}

.control-text {
  font-size: 12px;
}

.drag-hint {
  font-size: 10px;
  opacity: 0.8;
  margin-left: 4px;
}

.clear-pinned-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--error-color);
  border-radius: 6px;
  background: var(--error-color);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--error-hover);
    border-color: var(--error-hover);
  }
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.pinned-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  transition: all 0.3s ease;

  &.drag-mode {
    .pinned-card-wrapper {
      cursor: move;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.pinned-card-wrapper {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
  }

  &.drag-over {
    border: 2px dashed var(--accent-color);
    background: var(--accent-bg);
  }
}

.drag-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: var(--accent-color);
  color: var(--text-inverse);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.drag-icon {
  font-size: 14px;
}

/* Responsividade */
@media (max-width: 768px) {
  .pinned-cards-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .pinned-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pinned-controls {
    width: 100%;
    justify-content: space-between;
  }

  .pinned-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .pinned-title {
    font-size: 16px;
  }

  .control-btn,
  .clear-pinned-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>

