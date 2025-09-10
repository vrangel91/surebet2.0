const axios = require('axios');

// Configuração do teste
const BASE_URL = 'http://localhost:3001';
const TEST_USER_EMAIL = 'teste@teste.com'; // Email válido do banco
const TEST_USER_PASSWORD = '123456'; // Senha padrão

async function testReferralAPI() {
  console.log('🧪 Testando APIs de Referências...\n');
  
  try {
    // 1. Testar login para obter token
    console.log('1️⃣ Testando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login falhou: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token obtido:', token.substring(0, 20) + '...\n');
    
    // 2. Testar API de status de referências
    console.log('2️⃣ Testando API de status de referências...');
    const statusResponse = await axios.get(`${BASE_URL}/api/referrals/my-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (statusResponse.data.success) {
      const data = statusResponse.data.referralData;
      console.log('✅ Status de referências obtido com sucesso');
      console.log('📊 Dados retornados:');
      console.log('   - Código de referência:', data.referralCode);
      console.log('   - Saldo de comissões:', data.commissionBalance);
      console.log('   - Total ganho:', data.totalEarned);
      console.log('   - Usuários indicados:', data.referredUsers.length);
      console.log('   - Link de afiliado:', data.affiliateLink);
    } else {
      console.log('❌ Erro ao obter status:', statusResponse.data.message);
    }
    console.log('');
    
    // 3. Testar API de histórico (deve retornar array vazio por enquanto)
    console.log('3️⃣ Testando API de histórico...');
    const historyResponse = await axios.get(`${BASE_URL}/api/referrals/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (historyResponse.data.success) {
      console.log('✅ Histórico obtido com sucesso');
      console.log('📋 Saques:', historyResponse.data.withdrawals.length);
    } else {
      console.log('❌ Erro ao obter histórico:', historyResponse.data.message);
    }
    console.log('');
    
    // 4. Testar API de saque (com valor pequeno se houver saldo)
    console.log('4️⃣ Testando API de saque...');
    const statusData = statusResponse.data.referralData;
    
    if (statusData.commissionBalance > 0) {
      const testAmount = Math.min(10.00, statusData.commissionBalance);
      console.log(`💰 Testando saque de R$ ${testAmount.toFixed(2)}...`);
      
      const withdrawResponse = await axios.post(`${BASE_URL}/api/referrals/withdraw`, {
        amount: testAmount
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (withdrawResponse.data.success) {
        console.log('✅ Saque processado com sucesso');
        console.log('💳 Novo saldo:', withdrawResponse.data.newBalance);
      } else {
        console.log('❌ Erro ao processar saque:', withdrawResponse.data.message);
      }
    } else {
      console.log('ℹ️ Usuário não possui saldo para testar saque');
    }
    
    console.log('\n🎉 Todos os testes foram executados!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    
    if (error.response) {
      console.error('📡 Resposta da API:', error.response.data);
      console.error('🔢 Status:', error.response.status);
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testReferralAPI();
}

module.exports = { testReferralAPI };
