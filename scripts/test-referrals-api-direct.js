const axios = require('axios');

// Configuração do teste
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoidGVzdGVAdGVzdGUuY29tIiwiaXNfYWRtaW4iOmZhbHNlLCJpc192aXAiOmZhbHNlLCJpYXQiOjE3NTY3Mzg0OTYsImV4cCI6MTc1NzM0MzI5Nn0.-Y1p8QhSZHWQOzp_EsKp2OCixXhe9xlP-VAgl0jI1DY';

async function testReferralsAPIDirect() {
  console.log('🧪 Testando API de Referências diretamente...\n');
  
  try {
    // Testar API de status de referências com token válido
    console.log('1️⃣ Testando API de status de referências...');
    const response = await axios.get(`${BASE_URL}/api/referrals/my-status`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ API funcionando corretamente');
      console.log('📊 Dados retornados:', response.data);
      
      if (response.data.success && response.data.referralData) {
        const data = response.data.referralData;
        console.log('\n📋 Resumo dos dados:');
        console.log('   - Código de referência:', data.referralCode);
        console.log('   - Saldo de comissões:', data.commissionBalance);
        console.log('   - Total ganho:', data.totalEarned);
        console.log('   - Usuários indicados:', data.referredUsers.length);
        console.log('   - Link de afiliado:', data.affiliateLink);
      }
    } else {
      console.log('❌ Status inesperado:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.response) {
      console.error('📡 Resposta da API:', error.response.status, error.response.statusText);
      console.error('📊 Dados da resposta:', error.response.data);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testReferralsAPIDirect();
}

module.exports = { testReferralsAPIDirect };
