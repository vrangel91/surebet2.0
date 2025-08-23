<template>
  <div class="login-loading-overlay" v-if="isVisible">
    <div class="loading-container">
      <div class="logo-container">
        <img class="loading-logo" src="@/assets/img/logo.png" alt="SureStake Logo" width="150" height="150">
        <div class="logo-glow"></div>
      </div>
      <div class="loading-text">
        <span class="loading-title">Carregando...</span>
        <span class="loading-subtitle">Preparando seu dashboard</span>
      </div>
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginLoading',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.login-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  text-align: center;
}

.logo-container {
  position: relative;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.loading-logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 12px;
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.5));
  animation: logoPulse 2s ease-in-out infinite alternate;
}

@keyframes logoPulse {
  from {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 15px rgba(0, 255, 136, 0.3));
  }
  to {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 25px rgba(0, 255, 136, 0.6));
  }
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 80px;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite alternate;
}

@keyframes glowPulse {
  from {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.loading-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
  to {
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  }
}

.loading-subtitle {
  color: #00ff88;
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
}

.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 255, 136, 0.2);
  border-top: 3px solid #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
