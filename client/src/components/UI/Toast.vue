<template>
  <transition name="toast" appear>
    <div v-if="visible" class="toast" :class="[`toast-${type}`, { 'toast-visible': visible }]">
      <div class="toast-content">
        <div class="toast-icon">
          <i v-if="type === 'success'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="type === 'error'" class="bi bi-x-circle-fill"></i>
          <i v-else-if="type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i v-else class="bi bi-info-circle-fill"></i>
        </div>
        <div class="toast-message">
          <div class="toast-title">{{ title }}</div>
          <div v-if="message" class="toast-description">{{ message }}</div>
        </div>
        <button class="toast-close" @click="close" aria-label="Fechar notificação">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="toast-progress" :class="`toast-progress-${type}`"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      timeoutId: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.autoClose) {
        this.startAutoClose()
      } else {
        this.clearAutoClose()
      }
    }
  },
  mounted() {
    if (this.visible && this.autoClose) {
      this.startAutoClose()
    }
  },
  beforeUnmount() {
    this.clearAutoClose()
  },
  methods: {
    close() {
      this.$emit('close')
    },
    startAutoClose() {
      this.clearAutoClose()
      this.timeoutId = setTimeout(() => {
        this.close()
      }, this.duration)
    },
    clearAutoClose() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  min-width: 300px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-modal);
  overflow: hidden;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-visible {
  transform: translateX(0);
  opacity: 1;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  position: relative;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.3;
}

.toast-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
}

.toast-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--accent-primary);
  transform-origin: left;
  animation: toastProgress linear;
}

.toast-progress-success {
  background: var(--success);
}

.toast-progress-error {
  background: var(--error);
}

.toast-progress-warning {
  background: var(--warning);
}

.toast-progress-info {
  background: var(--accent-primary);
}

/* Toast Types */
.toast-success {
  border-left: 4px solid var(--success);
}

.toast-success .toast-icon {
  color: var(--success);
}

.toast-error {
  border-left: 4px solid var(--error);
}

.toast-error .toast-icon {
  color: var(--error);
}

.toast-warning {
  border-left: 4px solid var(--warning);
}

.toast-warning .toast-icon {
  color: var(--warning);
}

.toast-info {
  border-left: 4px solid var(--accent-primary);
}

.toast-info .toast-icon {
  color: var(--accent-primary);
}

/* Animations */
@keyframes toastProgress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .toast {
    top: 12px;
    right: 12px;
    left: 12px;
  }

  .toast-content {
    padding: 12px;
    gap: 10px;
  }

  .toast-icon {
    width: 20px;
    height: 20px;
    font-size: 18px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-description {
    font-size: 12px;
  }

  .toast-close {
    width: 20px;
    height: 20px;
    font-size: 14px;
  }
}
</style>
