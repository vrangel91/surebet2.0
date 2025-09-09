import { ref, computed, onMounted, onUnmounted } from 'vue'

// Estado global do sidebar
const sidebarCollapsed = ref(false)

export function useSidebarState() {
  // Computed para verificar se o sidebar está colapsado
  const isCollapsed = computed(() => sidebarCollapsed.value)
  
  // Função para alternar o estado do sidebar
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // Função para definir o estado do sidebar
  const setSidebarState = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }
  
  // Função para obter a largura atual do sidebar
  const getSidebarWidth = computed(() => {
    return sidebarCollapsed.value ? 80 : 280
  })
  
  // Função para obter a largura da área de conteúdo
  const getContentWidth = computed(() => {
    return `calc(100vw - ${getSidebarWidth.value}px)`
  })
  
  // Função para obter o offset da área de conteúdo
  const getContentOffset = computed(() => {
    return `${getSidebarWidth.value}px`
  })
  
  return {
    isCollapsed,
    toggleSidebar,
    setSidebarState,
    getSidebarWidth,
    getContentWidth,
    getContentOffset
  }
}

// Exportar o estado global para uso em outros componentes
export { sidebarCollapsed }

