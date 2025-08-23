require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

async function testMercadoPagoDetailed() {
  console.log('🔍 Teste Detalhado da API do Mercado Pago\n');
  
  try {
    // 1. Configuração
    const config = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918'
    });
    
    console.log('1️⃣ Configuração:');
    console.log('   - Access Token:', config.accessToken ? '✅ Configurado' : '❌ Não configurado');
    
    // 2. Criar instância de pagamento
    const payment = new Payment(config);
    console.log('   - Instância Payment criada: ✅ OK');
    
    // 3. Dados de teste
    const testData = {
      transaction_amount: 10.00,
      description: 'Teste PIX - Detalhado',
      payment_method_id: 'pix',
      external_reference: `test_detailed_${Date.now()}`,
      payer: {
        email: 'teste@exemplo.com',
        first_name: 'Usuário',
        last_name: 'Teste',
        identification: {
          type: 'CPF',
          number: '11144477735'
        }
      },
      date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('\n2️⃣ Dados de teste:');
    console.log('   - Valor:', testData.transaction_amount);
    console.log('   - Descrição:', testData.description);
    console.log('   - Método:', testData.payment_method_id);
    console.log('   - CPF:', testData.payer.identification.number);
    
    // 4. Criar pagamento
    console.log('\n3️⃣ Criando pagamento...');
    const pixPayment = await payment.create({
      body: testData,
      requestOptions: {
        idempotencyKey: `test_detailed_${Date.now()}`
      }
    });
    
    // 5. Analisar resposta detalhadamente
    console.log('\n4️⃣ Análise da resposta:');
    console.log('   - Tipo da resposta:', typeof pixPayment);
    console.log('   - Propriedades da resposta:', Object.keys(pixPayment));
    
    if (pixPayment.status !== undefined) {
      console.log('   - Status:', pixPayment.status);
    }
    
    if (pixPayment.headers !== undefined) {
      console.log('   - Headers:', Object.keys(pixPayment.headers));
    }
    
    if (pixPayment.body !== undefined) {
      console.log('   - Body presente: ✅');
      console.log('   - Chaves do body:', Object.keys(pixPayment.body));
      
      if (pixPayment.body.point_of_interaction) {
        console.log('   - point_of_interaction: ✅ Presente');
        console.log('   - Chaves do point_of_interaction:', Object.keys(pixPayment.body.point_of_interaction));
        
        if (pixPayment.body.point_of_interaction.transaction_data) {
          console.log('   - transaction_data: ✅ Presente');
          console.log('   - Chaves do transaction_data:', Object.keys(pixPayment.body.point_of_interaction.transaction_data));
          
          const pixData = pixPayment.body.point_of_interaction.transaction_data;
          console.log('   - QR Code:', pixData.qr_code ? '✅ Presente' : '❌ Ausente');
          console.log('   - QR Code Base64:', pixData.qr_code_base64 ? '✅ Presente' : '❌ Ausente');
          console.log('   - Ticket URL:', pixData.ticket_url ? '✅ Presente' : '❌ Ausente');
        } else {
          console.log('   - transaction_data: ❌ Ausente');
        }
      } else {
        console.log('   - point_of_interaction: ❌ Ausente');
      }
    } else {
      console.log('   - Body ausente: ❌');
      console.log('   - Resposta completa:', JSON.stringify(pixPayment, null, 2));
    }
    
    console.log('\n✅ Teste detalhado concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Se for erro da API, tentar extrair mais informações
    if (error.response) {
      console.log('\n🔍 Detalhes do erro da API:');
      console.log('   - Status:', error.response.status);
      console.log('   - Headers:', error.response.headers);
      console.log('   - Data:', error.response.data);
    }
  }
}

// Executar teste
testMercadoPagoDetailed();
