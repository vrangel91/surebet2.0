const axios = require('axios');

async function testSessionDebug() {
  console.log('🔍 Debugando Problema de Sessão...\n');

  try {
    // 1. Fazer login
    console.log('📤 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado, token obtido');
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // 2. Verificar se o token é válido JWT
    console.log('\n🔍 Verificando JWT...');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('📋 Payload JWT válido:');
        console.log('   - userId:', payload.userId);
        console.log('   - is_admin:', payload.is_admin);
        console.log('   - exp:', new Date(payload.exp * 1000).toLocaleString());
      } catch (e) {
        console.log('❌ Erro ao decodificar JWT');
      }
    }

    // 3. Testar rota simples primeiro
    console.log('\n🔍 Testando rota simples...');
    try {
      const simpleResponse = await axios.get('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Rota /me funcionando!');
      console.log('👤 Usuário:', simpleResponse.data.user?.email);

    } catch (simpleError) {
      console.log('❌ Erro na rota /me:');
      console.log('   Status:', simpleError.response?.status);
      console.log('   Erro:', simpleError.response?.data?.error);
    }

    // 4. Testar rota de usuários
    console.log('\n🔍 Testando rota de usuários...');
    try {
      const usersResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Rota de usuários funcionando!');
      console.log('👥 Usuários:', usersResponse.data.users?.length || 0);

    } catch (usersError) {
      console.log('❌ Erro na rota de usuários:');
      console.log('   Status:', usersError.response?.status);
      console.log('   Erro:', usersError.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Dados:', error.response.data);
    }
  }
}

testSessionDebug();
