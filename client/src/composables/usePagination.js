import { ref, computed, watch } from 'vue'

export function usePagination(items, options = {}) {
  const {
    itemsPerPage = 50,
    maxVisiblePages = 5,
    enableAutoLoad = true,
    loadMoreThreshold = 100 // pixels from bottom
  } = options
  
  // Estado da paginação
  const currentPage = ref(1)
  const isLoading = ref(false)
  const hasMore = ref(true)
  
  // Computed para itens da página atual
  const currentPageItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.value.slice(0, end)
  })
  
  // Computed para total de páginas
  const totalPages = computed(() => {
    return Math.ceil(items.value.length / itemsPerPage)
  })
  
  // Computed para verificar se há mais itens
  const canLoadMore = computed(() => {
    return currentPageItems.value.length < items.value.length
  })
  
  // Computed para páginas visíveis
  const visiblePages = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value
    
    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, current - half)
      let end = Math.min(total, start + maxVisiblePages - 1)
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  })
  
  // Métodos
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  
  function previousPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  function loadMore() {
    if (canLoadMore.value && !isLoading.value) {
      isLoading.value = true
      
      // Simular carregamento
      setTimeout(() => {
        currentPage.value++
        isLoading.value = false
      }, 300)
    }
  }
  
  function reset() {
    currentPage.value = 1
    isLoading.value = false
    hasMore.value = true
  }
  
  // Auto-load quando próximo do final
  function handleScroll(event) {
    if (!enableAutoLoad) return
    
    const { scrollTop, scrollHeight, clientHeight } = event.target
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    if (distanceFromBottom < loadMoreThreshold && canLoadMore.value && !isLoading.value) {
      loadMore()
    }
  }
  
  // Watch para resetar quando items mudam
  watch(items, () => {
    reset()
  }, { deep: true })
  
  return {
    // Estado
    currentPage,
    isLoading,
    hasMore,
    
    // Computed
    currentPageItems,
    totalPages,
    canLoadMore,
    visiblePages,
    
    // Métodos
    goToPage,
    nextPage,
    previousPage,
    loadMore,
    reset,
    handleScroll
  }
}
