import { ref, computed } from 'vue';

export function usePinnedCards() {
  const pinnedCards = ref([]);
  const dragMode = ref(false);
  const draggedIndex = ref(-1);
  const dragOverIndex = ref(-1);
  
  const pinnedCardsCount = computed(() => pinnedCards.value.length);
  
  const toggleDragMode = () => {
    dragMode.value = !dragMode.value;
    if (!dragMode.value) {
      draggedIndex.value = -1;
      dragOverIndex.value = -1;
    }
  };
  
  const togglePinCard = (surebet) => {
    const index = pinnedCards.value.findIndex(card => card.id === surebet.id);
    
    if (index > -1) {
      // Remover se já estiver fixado
      pinnedCards.value.splice(index, 1);
    } else if (pinnedCards.value.length < 3) {
      // Adicionar se não estiver fixado e não exceder o limite
      pinnedCards.value.push(surebet);
    }
    
    // Salvar no localStorage
    savePinnedCards();
  };
  
  const clearAllPinnedCards = () => {
    pinnedCards.value = [];
    savePinnedCards();
  };
  
  const onDragStart = (event) => {
    if (!dragMode.value) return;
    
    const index = parseInt(event.target.dataset.index);
    draggedIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
  };
  
  const onDragEnd = (event) => {
    draggedIndex.value = -1;
    dragOverIndex.value = -1;
  };
  
  const onDragEnter = (event) => {
    if (!dragMode.value) return;
    
    const index = parseInt(event.target.dataset.index);
    if (index !== draggedIndex.value) {
      dragOverIndex.value = index;
    }
  };
  
  const onDrop = (event) => {
    if (!dragMode.value) return;
    
    event.preventDefault();
    const dropIndex = parseInt(event.target.dataset.index);
    const dragIndex = draggedIndex.value;
    
    if (dragIndex !== dropIndex && dragIndex !== -1) {
      // Reordenar os cards
      const draggedCard = pinnedCards.value[dragIndex];
      pinnedCards.value.splice(dragIndex, 1);
      pinnedCards.value.splice(dropIndex, 0, draggedCard);
      
      // Salvar no localStorage
      savePinnedCards();
    }
    
    draggedIndex.value = -1;
    dragOverIndex.value = -1;
  };
  
  const savePinnedCards = () => {
    try {
      localStorage.setItem('pinnedCards', JSON.stringify(pinnedCards.value));
    } catch (error) {
      console.error('Erro ao salvar cards fixos:', error);
    }
  };
  
  const loadPinnedCards = () => {
    try {
      const saved = localStorage.getItem('pinnedCards');
      if (saved) {
        pinnedCards.value = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar cards fixos:', error);
    }
  };
  
  const scrollToPinnedCards = () => {
    const pinnedSection = document.querySelector('.pinned-cards-section');
    if (pinnedSection) {
      pinnedSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return {
    pinnedCards,
    dragMode,
    draggedIndex,
    dragOverIndex,
    pinnedCardsCount,
    toggleDragMode,
    togglePinCard,
    clearAllPinnedCards,
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDrop,
    loadPinnedCards,
    savePinnedCards,
    scrollToPinnedCards,
  };
}

