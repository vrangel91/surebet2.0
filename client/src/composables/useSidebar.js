import { ref, onMounted } from 'vue';

export function useSidebar() {
  const sidebarCollapsed = ref(false);
  
  const handleSidebarToggle = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    saveSidebarState();
  };
  
  const handleSidebarStateLoaded = (state) => {
    sidebarCollapsed.value = state;
  };
  
  const saveSidebarState = () => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed.value));
    } catch (error) {
      console.error('Erro ao salvar estado do sidebar:', error);
    }
  };
  
  const loadSidebarState = () => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        sidebarCollapsed.value = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar estado do sidebar:', error);
    }
  };
  
  onMounted(() => {
    loadSidebarState();
  });
  
  return {
    sidebarCollapsed,
    handleSidebarToggle,
    handleSidebarStateLoaded,
    saveSidebarState,
    loadSidebarState,
  };
}

