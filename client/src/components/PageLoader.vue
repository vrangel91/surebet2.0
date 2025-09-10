<template>
  <div v-if="isLoading" class="page-loader">
    <div class="page-loader-content">
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loader-text">
        <p>{{ text || 'Carregando...' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageLoader',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'Carregando...'
    }
  }
}
</script>

<style scoped>
.page-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 8px;
}

.page-loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top: 2px solid var(--accent-primary, #007bff);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: var(--accent-secondary, #28a745);
  animation-delay: -0.4s;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: var(--warning, #ffc107);
  animation-delay: -0.8s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-text {
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.loader-text p {
  margin: 0;
  opacity: 0.9;
}

/* Responsividade */
@media (max-width: 768px) {
  .spinner {
    width: 32px;
    height: 32px;
  }
  
  .loader-text {
    font-size: 12px;
  }
}
</style>