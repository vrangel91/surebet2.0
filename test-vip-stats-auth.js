const axios = require('axios');

async function testVIPStats() {
  try {
    console.log('🧪 Testando API de estatísticas VIP...');
    
    // Primeiro, fazer login para obter um token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login bem-sucedido, token obtido');
      const token = loginResponse.data.token;
      
      // Testar a API de estatísticas VIP com o token
      console.log('📊 Testando API de estatísticas VIP...');
      const statsResponse = await axios.get('http://localhost:3001/api/users/vip-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Resposta da API de estatísticas:');
      console.log('Status:', statsResponse.status);
      console.log('Dados:', JSON.stringify(statsResponse.data, null, 2));
      
    } else {
      console.error('❌ Login falhou - nenhum token retornado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testVIPStats();
