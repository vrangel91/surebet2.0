const axios = require('axios');

async function testAdminToken() {
  console.log('🔐 Testando Token de Administrador...\n');

  try {
    // 1. Fazer login
    console.log('📤 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado, token obtido');

    // 2. Testar rota que requer admin
    console.log('\n🔍 Testando rota que requer admin...');
    
    try {
      const adminResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Rota de usuários acessada com sucesso!');
      console.log('📊 Status:', adminResponse.status);
      console.log('👥 Usuários encontrados:', adminResponse.data.users?.length || 0);

    } catch (adminError) {
      console.log('❌ Erro ao acessar rota de usuários:');
      console.log('   Status:', adminError.response?.status);
      console.log('   Erro:', adminError.response?.data?.error);
    }

    // 3. Testar exclusão de usuário
    console.log('\n🗑️ Testando exclusão de usuário...');
    
    try {
      const deleteResponse = await axios.delete('http://localhost:3001/api/users/999', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Rota de exclusão acessada com sucesso!');
      console.log('📊 Status:', deleteResponse.status);

    } catch (deleteError) {
      if (deleteError.response?.status === 404) {
        console.log('✅ Rota de exclusão funcionando (usuário 999 não existe)');
      } else {
        console.log('❌ Erro ao acessar rota de exclusão:');
        console.log('   Status:', deleteError.response?.status);
        console.log('   Erro:', deleteError.response?.data?.error);
      }
    }

    // 4. Verificar dados do token
    console.log('\n🔍 Verificando dados do token...');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('📋 Payload do token:');
        console.log('   - userId:', payload.userId);
        console.log('   - email:', payload.email);
        console.log('   - is_admin:', payload.is_admin);
        console.log('   - is_vip:', payload.is_vip);
        console.log('   - exp:', new Date(payload.exp * 1000).toLocaleString());
      } catch (e) {
        console.log('❌ Erro ao decodificar payload do token');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Dados:', error.response.data);
    }
  }
}

testAdminToken();
