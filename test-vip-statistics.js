const axios = require('axios');

// Configuração do axios para testes
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
});

// Função para testar as estatísticas VIP
async function testVIPStatistics() {
  console.log('🧪 Testando Estatísticas VIP...\n');
  
  try {
    // Teste 1: Verificar se a rota está acessível (sem token)
    console.log('📊 Teste 1: Verificando acesso sem token...');
    try {
      const response = await api.get('/api/users/vip-statistics');
      console.log('❌ ERRO: Rota acessível sem token!');
      console.log('Resposta:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ SUCESSO: Rota protegida por autenticação');
      } else {
        console.log('⚠️ AVISO: Erro inesperado:', error.message);
      }
    }
    
    console.log('');
    
    // Teste 2: Verificar estrutura da resposta (com token mock)
    console.log('📊 Teste 2: Verificando estrutura da resposta...');
    console.log('ℹ️ Para testar com token real, faça login na aplicação e use o token');
    console.log('ℹ️ Token deve ser enviado no header: Authorization: Bearer <token>');
    
    console.log('');
    
    // Teste 3: Verificar se a tabela user_vip existe
    console.log('📊 Teste 3: Verificando estrutura do banco...');
    console.log('ℹ️ Verifique se a tabela user_vip existe e tem os campos:');
    console.log('   - status (enum: ativo, inativo, expirado, cancelado)');
    console.log('   - data_fim (timestamp)');
    console.log('   - amount (decimal)');
    console.log('   - created_at (timestamp)');
    
    console.log('');
    
    // Teste 4: Verificar queries SQL
    console.log('📊 Teste 4: Verificando queries SQL...');
    console.log('ℹ️ As seguintes queries devem funcionar no PostgreSQL:');
    console.log('');
    console.log('1. VIPs ativos:');
    console.log('   SELECT COUNT(*) as count FROM user_vip WHERE status = \'ativo\' AND data_fim > NOW()');
    console.log('');
    console.log('2. Expirando em 7 dias:');
    console.log('   SELECT COUNT(*) as count FROM user_vip WHERE status = \'ativo\' AND data_fim BETWEEN NOW() AND NOW() + INTERVAL \'7 days\'');
    console.log('');
    console.log('3. Expirados hoje:');
    console.log('   SELECT COUNT(*) as count FROM user_vip WHERE status = \'ativo\' AND DATE(data_fim) = CURRENT_DATE');
    console.log('');
    console.log('4. Receita total:');
    console.log('   SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM user_vip WHERE amount IS NOT NULL AND amount > 0');
    
    console.log('');
    console.log('✅ Teste de estrutura concluído!');
    console.log('ℹ️ Para testar com dados reais, faça login na aplicação e verifique o console');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Função para testar com token real (se fornecido)
async function testWithToken(token) {
  if (!token) {
    console.log('❌ Token não fornecido para teste completo');
    return;
  }
  
  console.log('🔑 Testando com token real...\n');
  
  try {
    const response = await api.get('/api/users/vip-statistics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.statistics) {
      const stats = response.data.statistics;
      console.log('\n📊 Estatísticas extraídas:');
      console.log(`👑 VIPs Ativos: ${stats.activeVIPs}`);
      console.log(`⏰ Expirando em 7 dias: ${stats.expiringSoon}`);
      console.log(`❌ Expirados hoje: ${stats.expiredToday}`);
      console.log(`💰 Receita total: R$ ${stats.totalRevenue}`);
      console.log(`📅 Receita deste mês: R$ ${stats.thisMonthRevenue}`);
      console.log(`📊 VIPs criados este mês: ${stats.thisMonth}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar com token:', error.response?.data || error.message);
  }
}

// Executar testes
async function runTests() {
  await testVIPStatistics();
  
  // Se um token for fornecido como argumento da linha de comando
  const token = process.argv[2];
  if (token) {
    console.log('\n' + '='.repeat(50) + '\n');
    await testWithToken(token);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testVIPStatistics, testWithToken };
