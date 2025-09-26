<template>
  <div class="toast-container">
    <Toast v-for="toast in toasts" :key="toast.id" :visible="toast.visible" :type="toast.type" :title="toast.title"
      :message="toast.message" :duration="toast.duration" :auto-close="toast.autoClose"
      @close="removeToast(toast.id)" />
  </div>
</template>

<script>
import Toast from './Toast.vue'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ToastContainer',
  components: {
    Toast
  },
  setup() {
    const { toasts, removeToast } = useToast()

    return {
      toasts,
      removeToast
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;

  /* Allow clicks on toasts */
  :deep(.toast) {
    pointer-events: auto;
  }
}
</style>
