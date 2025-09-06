<template>
  <transition name="loader-fade">
    <div v-if="isLoading" :class="['loader-overlay', { 'page-mode': pageMode }]">
      <div class="loader-container">
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
import { mapGetters } from 'vuex'

export default {
  name: 'LoaderOverlay',
  props: {
    pageMode: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'Carregando...'
    }
  },
  computed: {
    ...mapGetters(['isLoading'])
  }
}
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

/* Modo página - overlay relativo ao container pai */
.loader-overlay.page-mode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
  z-index: 1000;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: #28a745;
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
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.loader-text p {
  margin: 0;
  opacity: 0.9;
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

/* Responsividade */
@media (max-width: 768px) {
  .spinner {
    width: 50px;
    height: 50px;
  }
  
  .loader-text {
    font-size: 14px;
  }
}

/* Tema escuro/claro */
@media (prefers-color-scheme: light) {
  .loader-overlay {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .loader-text {
    color: #333;
  }
}

/* Acessibilidade */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring {
    animation: none;
  }
  
  .spinner-ring::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background-color: #007bff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
