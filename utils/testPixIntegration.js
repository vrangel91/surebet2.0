const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configuração do Mercado Pago
const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918'
});

/**
 * Teste de integração PIX com Mercado Pago
 * Este arquivo testa a criação de pagamentos PIX para identificar problemas
 */
async function testPixIntegration() {
  console.log('🧪 Iniciando teste de integração PIX...');
  
  try {
    // 1. Testar configuração básica
    console.log('1️⃣ Verificando configuração do Mercado Pago...');
    console.log('   - Access Token:', mercadopagoConfig.accessToken ? '✅ Configurado' : '❌ Não configurado');
    
    if (!mercadopagoConfig.accessToken) {
      throw new Error('Access Token não configurado');
    }

    // 2. Testar criação de pagamento PIX
    console.log('2️⃣ Testando criação de pagamento PIX...');
    
    const payment = new Payment(mercadopagoConfig);
    const testPayment = await payment.create({
      body: {
        transaction_amount: 10.00,
        description: 'Teste PIX - Integração',
        payment_method_id: 'pix',
        external_reference: `test_${Date.now()}`,
        payer: {
          email: 'teste@exemplo.com',
          first_name: 'Usuário',
          last_name: 'Teste',
          identification: {
            type: 'CPF',
            number: '12345678901'
          }
        },
        date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      requestOptions: {
        idempotencyKey: `test_pix_${Date.now()}`
      }
    });

    // 3. Verificar resposta
    console.log('3️⃣ Verificando resposta da API...');
    console.log('   - Status da resposta:', testPayment.status || 'N/A');
    console.log('   - Headers:', testPayment.headers ? '✅ Presentes' : '❌ Ausentes');
    console.log('   - Body:', testPayment.body ? '✅ Presente' : '❌ Ausente');
    
    if (testPayment.body) {
      console.log('   - Chaves do body:', Object.keys(testPayment.body));
      
      if (testPayment.body.point_of_interaction) {
        console.log('   - point_of_interaction: ✅ Presente');
        console.log('   - Chaves do point_of_interaction:', Object.keys(testPayment.body.point_of_interaction));
        
        if (testPayment.body.point_of_interaction.transaction_data) {
          console.log('   - transaction_data: ✅ Presente');
          console.log('   - Chaves do transaction_data:', Object.keys(testPayment.body.point_of_interaction.transaction_data));
          
          const pixData = testPayment.body.point_of_interaction.transaction_data;
          console.log('   - QR Code:', pixData.qr_code ? '✅ Presente' : '❌ Ausente');
          console.log('   - QR Code Base64:', pixData.qr_code_base64 ? '✅ Presente' : '❌ Ausente');
          console.log('   - Ticket URL:', pixData.ticket_url ? '✅ Presente' : '❌ Ausente');
        } else {
          console.log('   - transaction_data: ❌ Ausente');
        }
      } else {
        console.log('   - point_of_interaction: ❌ Ausente');
      }
    }

    // 4. Testar com retry em caso de falha
    if (!testPayment.body || !testPayment.body.point_of_interaction) {
      console.log('4️⃣ Tentando novamente com retry...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const retryPayment = await payment.create({
        body: {
          transaction_amount: 10.00,
          description: 'Teste PIX - Retry',
          payment_method_id: 'pix',
          external_reference: `test_retry_${Date.now()}`,
          payer: {
            email: 'teste@exemplo.com',
            first_name: 'Usuário',
            last_name: 'Teste',
            identification: {
              type: 'CPF',
              number: '12345678901'
            }
          },
          date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        requestOptions: {
          idempotencyKey: `test_pix_retry_${Date.now()}`
        }
      });
      
      console.log('   - Retry - Body:', retryPayment.body ? '✅ Presente' : '❌ Ausente');
      if (retryPayment.body) {
        console.log('   - Retry - Chaves:', Object.keys(retryPayment.body));
      }
    }

    console.log('✅ Teste de integração concluído!');
    
    // 5. Resumo dos resultados
    console.log('\n📊 RESUMO DO TESTE:');
    console.log('   - Configuração: ✅ OK');
    console.log('   - Criação de pagamento: ✅ OK');
    console.log('   - Estrutura da resposta:', testPayment.body ? '✅ OK' : '❌ PROBLEMA');
    
    if (testPayment.body && testPayment.body.point_of_interaction && testPayment.body.point_of_interaction.transaction_data) {
      console.log('   - Dados PIX: ✅ OK');
      console.log('   - Status: SUCCESS');
    } else {
      console.log('   - Dados PIX: ❌ PROBLEMA');
      console.log('   - Status: FAILED');
      console.log('   - Recomendação: Verificar logs do Mercado Pago e configurações da conta');
    }

  } catch (error) {
    console.error('❌ Erro no teste de integração:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    console.log('\n🔧 DIAGNÓSTICO:');
    if (error.message.includes('401')) {
      console.log('   - Problema: Token de acesso inválido ou expirado');
      console.log('   - Solução: Verificar MERCADOPAGO_ACCESS_TOKEN no .env');
    } else if (error.message.includes('403')) {
      console.log('   - Problema: Sem permissão para criar pagamentos');
      console.log('   - Solução: Verificar permissões da conta no Mercado Pago');
    } else if (error.message.includes('422')) {
      console.log('   - Problema: Dados inválidos na requisição');
      console.log('   - Solução: Verificar formato dos dados enviados');
    } else {
      console.log('   - Problema: Erro desconhecido');
      console.log('   - Solução: Verificar logs completos e status da API');
    }
  }
}

/**
 * Teste específico para verificar se a API está respondendo
 */
async function testApiConnection() {
  console.log('🌐 Testando conexão com API do Mercado Pago...');
  
  try {
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mercadopagoConfig.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   - Status:', response.status);
    console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('   - Métodos de pagamento disponíveis:', data.length);
      console.log('   - PIX disponível:', data.some(method => method.id === 'pix') ? '✅ Sim' : '❌ Não');
    } else {
      console.log('   - Erro na resposta:', response.statusText);
    }
    
  } catch (error) {
    console.error('   - Erro na conexão:', error.message);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  (async () => {
    await testApiConnection();
    console.log('\n' + '='.repeat(50) + '\n');
    await testPixIntegration();
  })();
}

module.exports = {
  testPixIntegration,
  testApiConnection
};
