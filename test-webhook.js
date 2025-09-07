const axios = require('axios');

async function testWebhook() {
  console.log('🧪 Testando webhook de pagamento...');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. Testar obter planos
    console.log('\n1️⃣ Testando /api/payments/plans...');
    const plansResponse = await axios.get(`${baseURL}/api/payments/plans`);
    console.log('✅ Planos disponíveis:', plansResponse.data);
    
    // 2. Testar simular pagamento
    console.log('\n2️⃣ Testando simulação de pagamento...');
    const paymentData = {
      userId: 1, // ID do admin
      planId: 'vip',
      paymentId: `TEST_PAY_${Date.now()}`
    };
    
    const paymentResponse = await axios.post(`${baseURL}/api/payments/simulate-payment`, paymentData);
    console.log('✅ Pagamento simulado:', paymentResponse.data);
    
    // 3. Testar status VIP
    console.log('\n3️⃣ Testando status VIP...');
    const vipStatusResponse = await axios.get(`${baseURL}/api/payments/vip-status/1`);
    console.log('✅ Status VIP:', vipStatusResponse.data);
    
    // 4. Testar webhook direto
    console.log('\n4️⃣ Testando webhook direto...');
    const webhookData = {
      event_type: 'payment.approved',
      payment_id: `WEBHOOK_PAY_${Date.now()}`,
      user_id: 1,
      plan_id: 'premium',
      amount: 49.90,
      status: 'approved',
      payment_method: 'credit_card',
      created_at: new Date().toISOString()
    };
    
    const webhookResponse = await axios.post(`${baseURL}/api/payments/webhook`, webhookData);
    console.log('✅ Webhook processado:', webhookResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
  }
}

testWebhook();
