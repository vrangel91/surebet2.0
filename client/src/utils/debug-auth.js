// Utilitário para debugar autenticação
export function debugAuth() {
  console.log('🔍 === DEBUG AUTENTICAÇÃO ===');
  
  // Verificar localStorage
  const authToken = localStorage.getItem('authToken');
  console.log('🔑 Token no localStorage:', authToken ? 'Sim' : 'Não');
  if (authToken) {
    console.log('   - Token:', authToken.substring(0, 50) + '...');
  }
  
  // Verificar store (se disponível)
  if (window.store) {
    console.log('📦 Store disponível:', 'Sim');
    console.log('   - authToken:', window.store.state.authToken ? 'Sim' : 'Não');
    console.log('   - isAuthenticated:', window.store.state.isAuthenticated);
    console.log('   - user:', window.store.state.user);
  } else {
    console.log('📦 Store disponível:', 'Não');
  }
  
  // Verificar se está na página de login
  const isLoginPage = window.location.pathname === '/login';
  console.log('📄 Página atual:', window.location.pathname);
  console.log('🔐 É página de login:', isLoginPage);
  
  // Verificar se há token no header das requisições
  console.log('🌐 === TESTE DE REQUISIÇÃO ===');
  
  // Fazer uma requisição de teste para a API de referências
  if (authToken) {
    fetch('/api/referrals/my-status', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      console.log('📡 Resposta da API:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('📊 Dados da resposta:', data);
    })
    .catch(error => {
      console.error('❌ Erro na requisição:', error);
    });
  } else {
    console.log('⚠️ Nenhum token disponível para teste');
  }
  
  console.log('🔍 === FIM DEBUG ===');
}

// Função para limpar dados de autenticação (para teste)
export function clearAuth() {
  console.log('🧹 Limpando dados de autenticação...');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('✅ Dados limpos');
  window.location.reload();
}

// Função para simular login (para teste)
export function simulateLogin() {
  console.log('🎭 Simulando login...');
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoidGVzdGVAdGVzdGUuY29tIiwiaXNfYWRtaW4iOmZhbHNlLCJpc192aXAiOmZhbHNlLCJpYXQiOjE3NTY3Mzg0OTYsImV4cCI6MTc1NzM0MzI5Nn0.-Y1p8QhSZHWQOzp_EsKp2OCixXhe9xlP-VAgl0jI1DY';
  localStorage.setItem('authToken', mockToken);
  console.log('✅ Token simulado salvo');
}

// Expor funções globalmente para debug no console
window.debugAuth = debugAuth;
window.clearAuth = clearAuth;
window.simulateLogin = simulateLogin;
