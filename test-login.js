const axios = require('axios');

async function testLogin() {
  console.log('🔐 Testando login com usuário administrador...\n');
  
  try {
    const loginData = {
      email: 'admin@surestake.com',
      password: 'admin123'
    };

    console.log('📤 Enviando requisição de login...');
    console.log('   - Email:', loginData.email);
    console.log('   - Senha:', loginData.password);
    
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Login realizado com sucesso!');
    console.log('   - Status:', response.status);
    console.log('   - Token:', response.data.token ? '✅ Presente' : '❌ Ausente');
    
    console.log('\n🔍 Dados do usuário:');
    console.log('   - ID:', response.data.user.id);
    console.log('   - Username:', response.data.user.username);
    console.log('   - Email:', response.data.user.email);
    console.log('   - Is Admin:', response.data.user.is_admin);
    console.log('   - Is VIP:', response.data.user.is_vip);
    console.log('   - Can Use System:', response.data.user.can_use_system);
    
    console.log('\n🎉 Login funcionando perfeitamente!');
    
    return response.data;

  } catch (error) {
    console.log('\n❌ Erro no login:');
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   - Erro de conexão:', error.message);
    } else {
      console.log('   - Erro:', error.message);
    }
    
    throw error;
  }
}

// Executar teste
testLogin()
  .then(() => {
    console.log('\n🚀 Sistema de login funcionando!');
  })
  .catch(() => {
    console.log('\n💥 Teste de login falhou');
  });
