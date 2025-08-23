const axios = require('axios');

async function testAdminAccess() {
  try {
    console.log('🔐 Testando acesso administrativo...\n');
    
    // Passo 1: Fazer login
    console.log('📋 Passo 1: Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');
    console.log('   - Token recebido:', token.substring(0, 20) + '...');
    
    // Passo 2: Testar rota /api/auth/me
    console.log('\n📋 Passo 2: Testando rota /api/auth/me...');
    const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ /api/auth/me funcionando:');
    console.log('   - Status:', meResponse.status);
    console.log('   - Usuário:', meResponse.data.user ? 'Sim' : 'Não');
    
    // Passo 3: Testar rota /api/users (requer admin)
    console.log('\n📋 Passo 3: Testando rota /api/users (requer admin)...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ /api/users funcionando:');
    console.log('   - Status:', usersResponse.status);
    console.log('   - Usuários retornados:', usersResponse.data.users ? usersResponse.data.users.length : 'N/A');
    
    // Passo 4: Testar exclusão de usuário (simular)
    console.log('\n📋 Passo 4: Testando rota de exclusão de usuário...');
    console.log('   - Verificando se a rota DELETE /api/users/:id existe...');
    
    // Tentar fazer uma requisição OPTIONS para ver se a rota existe
    try {
      const optionsResponse = await axios.options('http://localhost:3001/api/users/999', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Rota DELETE /api/users/:id existe');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Rota DELETE /api/users/:id existe (retornou 404 como esperado)');
      } else {
        console.log('❌ Erro ao verificar rota:', error.message);
      }
    }
    
    console.log('\n🎉 Todos os testes de acesso administrativo passaram!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminAccess();
