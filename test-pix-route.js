const axios = require('axios');

async function testPixRoute() {
  console.log('🧪 Testando rota PIX da API...\n');
  
  try {
    const testData = {
      userId: 'test123',
      planId: 1,
      planName: 'Plano Teste',
      planDays: 30,
      amount: 10.00,
      customerData: {
        email: 'teste@exemplo.com',
        firstName: 'Usuário',
        lastName: 'Teste',
        cpf: '11144477735'
      }
    };

    console.log('📤 Enviando requisição para /api/orders/pix...');
    console.log('   - Dados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/orders/pix', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('\n✅ Resposta recebida:');
    console.log('   - Status:', response.status);
    console.log('   - Dados:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ Erro na requisição:');
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   - Erro de conexão:', error.message);
    } else {
      console.log('   - Erro:', error.message);
    }
  }
}

// Executar teste
testPixRoute();
