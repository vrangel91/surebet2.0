<template>
  <div v-if="show" class="payment-success-notification">
    <div class="notification-content">
      <div class="success-icon">
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      </div>
      <div class="notification-text">
        <h4>Pagamento Confirmado!</h4>
        <p>Seu plano {{ planName }} foi ativado com sucesso</p>
      </div>
      <button class="close-btn" @click="close">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccessNotification',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    planName: {
      type: String,
      default: 'VIP'
    },
    autoClose: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      progress: 0,
      interval: null
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.startProgress()
        if (this.autoClose) {
          setTimeout(() => {
            this.close()
          }, this.duration)
        }
      } else {
        this.stopProgress()
      }
    }
  },
  methods: {
    startProgress() {
      this.progress = 0
      const increment = 100 / (this.duration / 50)
      this.interval = setInterval(() => {
        this.progress += increment
        if (this.progress >= 100) {
          this.stopProgress()
        }
      }, 50)
    },
    stopProgress() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    close() {
      this.$emit('close')
    }
  },
  beforeUnmount() {
    this.stopProgress()
  }
}
</script>

<style scoped>
.payment-success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.success-icon {
  flex-shrink: 0;
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.notification-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  transition: width 0.1s linear;
}

@media (max-width: 768px) {
  .payment-success-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>
