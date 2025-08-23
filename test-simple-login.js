const axios = require('axios');

async function testSimpleLogin() {
  console.log('🔐 Testando login simples...\n');
  
  try {
    const loginData = {
      email: 'admin@surestake.com',
      password: 'admin123'
    };

    console.log('📤 Enviando requisição de login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login realizado com sucesso!');
    console.log('   - Status:', response.status);
    console.log('   - Token:', response.data.token ? '✅ Presente' : '❌ Ausente');
    
    return response.data;

  } catch (error) {
    console.log('❌ Erro no login:');
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Dados:', JSON.stringify(error.response.data, null, 2));
      
      // Se for erro 500, tentar ver mais detalhes
      if (error.response.status === 500) {
        console.log('\n🔍 Erro 500 - Verificando se há mais detalhes...');
        console.log('   - Headers:', JSON.stringify(error.response.headers, null, 2));
      }
    } else if (error.request) {
      console.log('   - Erro de conexão:', error.message);
    } else {
      console.log('   - Erro:', error.message);
    }
    
    throw error;
  }
}

// Executar teste
testSimpleLogin()
  .then(() => {
    console.log('\n🚀 Login funcionando!');
  })
  .catch(() => {
    console.log('\n💥 Login falhou');
  });
