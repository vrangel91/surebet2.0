const axios = require('axios');

async function testFinalPix() {
  console.log('🎯 Teste Final da Integração PIX - Dados Reais\n');
  
  try {
    const testData = {
      userId: 'test123',
      planId: 1,
      planName: 'Plano VIP Teste',
      planDays: 30,
      amount: 10.00,
      customerData: {
        email: 'teste@exemplo.com',
        firstName: 'Usuário',
        lastName: 'Teste',
        cpf: '11144477735' // CPF válido para teste
      }
    };

    console.log('📤 Enviando requisição PIX para /api/orders/pix...');
    console.log('   - Dados:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/orders/pix', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('\n✅ PIX criado com sucesso!');
    console.log('   - Status:', response.status);
    console.log('   - Pedido ID:', response.data.order.id);
    console.log('   - Status do Pedido:', response.data.order.status);
    console.log('   - Valor:', response.data.order.amount);
    
    console.log('\n🔍 Dados do PIX:');
    console.log('   - Payment ID:', response.data.pix.paymentId);
    console.log('   - Status PIX:', response.data.pix.status);
    console.log('   - PIX Code:', response.data.pix.pixCode ? '✅ Presente' : '❌ Ausente');
    console.log('   - PIX Code Base64:', response.data.pix.pixCodeBase64 ? '✅ Presente' : '❌ Ausente');
    console.log('   - Ticket URL:', response.data.pix.ticketUrl ? '✅ Presente' : '❌ Ausente');
    console.log('   - Expira em:', response.data.pix.expiresAt);
    
    console.log('\n🎉 Teste final concluído com sucesso!');
    console.log('\n💡 Para testar o PIX:');
    console.log('   1. Abra o Ticket URL em uma nova aba');
    console.log('   2. Use o QR Code para pagar');
    console.log('   3. Ou copie o PIX Code para seu app bancário');
    
    return response.data;

  } catch (error) {
    console.log('\n❌ Erro no teste final:');
    
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

// Executar teste final
testFinalPix()
  .then(() => {
    console.log('\n🚀 Sistema PIX funcionando perfeitamente!');
  })
  .catch(() => {
    console.log('\n💥 Teste final falhou');
  });
