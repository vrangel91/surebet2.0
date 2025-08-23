const axios = require('axios');

async function testLoginDetailed() {
  try {
    console.log('🔐 Testando login com detalhes...\n');
    
    // Dados de teste
    const loginData = {
      email: 'admin@surestake.com',
      password: 'admin123'
    };
    
    console.log('📤 Enviando requisição de login...');
    console.log('   - URL: http://localhost:3001/api/auth/login');
    console.log('   - Dados:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ Login bem-sucedido!');
    console.log('   - Status:', response.status);
    console.log('   - Token recebido:', response.data.token ? 'Sim' : 'Não');
    console.log('   - Dados do usuário:', response.data.user ? 'Sim' : 'Não');
    
    if (response.data.user) {
      console.log('   - Usuário ID:', response.data.user.id);
      console.log('   - Usuário Email:', response.data.user.email);
      console.log('   - Is Admin:', response.data.user.is_admin);
      console.log('   - Is VIP:', response.data.user.is_vip);
    }
    
  } catch (error) {
    console.error('\n❌ Erro no login:');
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Dados:', JSON.stringify(error.response.data, null, 2));
      console.error('   - Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('   - Erro de rede:', error.message);
    } else {
      console.error('   - Erro:', error.message);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Dica: Verifique se o servidor está rodando na porta 3001');
    }
  }
}

testLoginDetailed();
