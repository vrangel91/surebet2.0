const axios = require('axios');

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...\n');
    
    // Login como admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    // Dados do usuário de teste
    const timestamp = Date.now();
    const testUserData = {
      username: `teste_exclusao_${timestamp}`,
      first_name: 'Usuário',
      last_name: 'Teste',
      email: `teste.exclusao.${timestamp}@exemplo.com`,
      password: '123456',
      is_admin: false,
      is_vip: false
    };
    
    console.log('📤 Criando usuário:', testUserData.username);
    
    // Criar usuário
    const createResponse = await axios.post('http://localhost:3001/api/users', testUserData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Usuário criado com sucesso:');
    console.log('   - Status:', createResponse.status);
    console.log('   - ID:', createResponse.data.user.id);
    console.log('   - Username:', createResponse.data.user.username);
    console.log('   - Email:', createResponse.data.user.email);
    
    console.log('\n🎉 Usuário de teste criado! Agora você pode testar a exclusão.');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
}

createTestUser();
