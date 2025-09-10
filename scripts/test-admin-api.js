const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('🧪 Testando API de admin...');
    
    // Primeiro, fazer login para obter um token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Falha no login:', loginResponse.data.error);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Configurar headers para requisições autenticadas
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Testar rota de usuários
    console.log('\n📋 Buscando lista de usuários...');
    const usersResponse = await axios.get('http://localhost:3000/api/users', { headers });
    
    if (usersResponse.data.success) {
      console.log(`✅ ${usersResponse.data.users.length} usuários encontrados`);
      
      usersResponse.data.users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || user.email}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Status: ${user.status}`);
        console.log(`   - Último Login: ${user.lastLogin || 'Nunca'}`);
        console.log(`   - Criado em: ${user.createdAt}`);
      });
    } else {
      console.log('❌ Erro ao buscar usuários:', usersResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(() => {
  testAdminAPI();
}, 3000);
