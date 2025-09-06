<template>
  <transition name="loader-fade">
    <div v-if="isLoading" class="page-loader">
      <div class="page-loader-container">
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
  </transition>
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
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    position: {
      type: String,
      default: 'center', // center, top, bottom
      validator: (value) => ['center', 'top', 'bottom'].includes(value)
    }
  }
}
</script>

<style scoped>
.page-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(1px);
  border-radius: inherit;
}

/* Posicionamento */
.page-loader[data-position="top"] {
  align-items: flex-start;
  padding-top: 20px;
}

.page-loader[data-position="bottom"] {
  align-items: flex-end;
  padding-bottom: 20px;
}

.page-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

/* Tamanhos do spinner */
.page-loader[data-size="small"] .spinner {
  width: 24px;
  height: 24px;
}

.page-loader[data-size="medium"] .spinner {
  width: 40px;
  height: 40px;
}

.page-loader[data-size="large"] .spinner {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top: 2px solid #00ff88;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: #007bff;
  animation-delay: -0.4s;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: #ffc107;
  animation-delay: -0.8s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.loader-text p {
  margin: 0;
  opacity: 0.9;
}

/* Tamanhos do texto */
.page-loader[data-size="small"] .loader-text {
  font-size: 12px;
}

.page-loader[data-size="medium"] .loader-text {
  font-size: 14px;
}

.page-loader[data-size="large"] .loader-text {
  font-size: 16px;
}

/* Transições de entrada e saída */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

/* Tema escuro */
.dark .page-loader-container {
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tema claro */
.light .page-loader-container {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.light .loader-text {
  color: #333;
}

/* Responsivo */
@media (max-width: 768px) {
  .page-loader-container {
    padding: 16px;
    gap: 12px;
  }
  
  .page-loader[data-size="large"] .spinner {
    width: 50px;
    height: 50px;
  }
}
</style>
