import { ref, reactive } from 'vue'

const toasts = reactive([])
let toastId = 0

export function useToast() {
  const showToast = (options) => {
    const id = ++toastId
    const toast = {
      id,
      visible: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false
    }
    
    toasts.push(toast)
    
    // Auto remove after duration
    if (toast.autoClose) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
    }
  }
  
  const clearAllToasts = () => {
    toasts.splice(0, toasts.length)
  }
  
  // Convenience methods
  const success = (title, message, options = {}) => {
    return showToast({ type: 'success', title, message, ...options })
  }
  
  const error = (title, message, options = {}) => {
    return showToast({ type: 'error', title, message, ...options })
  }
  
  const warning = (title, message, options = {}) => {
    return showToast({ type: 'warning', title, message, ...options })
  }
  
  const info = (title, message, options = {}) => {
    return showToast({ type: 'info', title, message, ...options })
  }
  
  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}
