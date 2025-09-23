import { ref, computed } from 'vue';

export function useBookmakerAccounts() {
  const bookmakerAccounts = ref([]);
  const isLoadingAccounts = ref(false);
  
  const accountsCount = computed(() => bookmakerAccounts.value.length);
  
  const loadBookmakerAccounts = async () => {
    isLoadingAccounts.value = true;
    
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/bookmaker-accounts/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      bookmakerAccounts.value = data.data?.accounts || data.accounts || data;
    } catch (error) {
      console.error('Erro ao carregar contas de bookmaker:', error);
    } finally {
      isLoadingAccounts.value = false;
    }
  };
  
  const addSurebetToReports = (surebet) => {
    // Lógica para adicionar surebet aos relatórios
    console.log('Adicionando surebet aos relatórios:', surebet);
  };
  
  const handleBalanceDebited = (accountId, amount) => {
    // Lógica para lidar com débito de saldo
    const account = bookmakerAccounts.value.find(acc => acc.id === accountId);
    if (account) {
      account.balance -= amount;
    }
  };
  
  const refreshAccounts = () => {
    loadBookmakerAccounts();
  };
  
  return {
    bookmakerAccounts,
    isLoadingAccounts,
    accountsCount,
    loadBookmakerAccounts,
    addSurebetToReports,
    handleBalanceDebited,
    refreshAccounts,
  };
}

