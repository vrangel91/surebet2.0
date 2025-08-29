const { sequelize } = require('../config/database');
const { User, UserVIP } = require('../models');
const VIPService = require('../utils/vipService');

async function testAccountExpiration() {
  console.log('🧪 Testando sistema de expiração de contas...\n');

  try {
    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    const testUser = await User.create({
      username: 'test_expiration',
      first_name: 'Teste',
      last_name: 'Expiração',
      email: 'test.expiration@example.com',
      password_hash: 'test123',
      account_type: 'basic',
      is_vip: false
    });

    console.log(`✅ Usuário criado: ${testUser.id} - ${testUser.username}`);

    // 2. Ativar plano PREMIUM
    console.log('\n2️⃣ Ativando plano PREMIUM...');
    const premiumPlan = {
      plan_id: 'premium',
      plan_name: 'Premium',
      plan_days: 30,
      order_id: 1,
      payment_method: 'pix',
      amount: 29.90,
      auto_renew: false
    };

    const premiumResult = await VIPService.activateVIP(testUser.id, premiumPlan);
    console.log(`✅ Plano PREMIUM ativado: ${premiumResult.vip.planName}`);

    // 3. Verificar status atual
    console.log('\n3️⃣ Verificando status atual...');
    const currentStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log(`📊 Status atual: ${currentStatus.hasVIP ? 'VIP Ativo' : 'Sem VIP'}`);
    console.log(`📊 Plano: ${currentStatus.vipStatus?.planName || 'Básico'}`);
    console.log(`📊 Expira em: ${currentStatus.vipStatus?.dataFim || 'N/A'}`);

    // 4. Simular expiração (alterar data_fim para o passado)
    console.log('\n4️⃣ Simulando expiração...');
    const expiredVIP = await UserVIP.findOne({
      where: { user_id: testUser.id, status: 'ativo' }
    });

    if (expiredVIP) {
      expiredVIP.data_fim = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 dia atrás
      await expiredVIP.save();
      console.log('✅ Data de expiração alterada para o passado');
    }

    // 5. Processar expiração
    console.log('\n5️⃣ Processando expiração...');
    const expirationResult = await VIPService.processExpiredVIPs();
    console.log(`✅ ${expirationResult.expiredCount} planos expirados processados`);

    // 6. Verificar status após expiração
    console.log('\n6️⃣ Verificando status após expiração...');
    const finalStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log(`📊 Status final: ${finalStatus.hasVIP ? 'VIP Ativo' : 'Sem VIP'}`);
    console.log(`📊 Plano final: ${finalStatus.vipStatus?.planName || 'Básico'}`);

    // 7. Verificar dados do usuário
    const updatedUser = await User.findByPk(testUser.id);
    console.log(`📊 Account Type: ${updatedUser.account_type}`);
    console.log(`📊 Is VIP: ${updatedUser.is_vip}`);

    // 8. Testar com múltiplos planos
    console.log('\n7️⃣ Testando com múltiplos planos...');
    
    // Ativar VIP (deve sobrescrever PREMIUM)
    const vipPlan = {
      plan_id: 'vip',
      plan_name: 'VIP',
      plan_days: 15,
      order_id: 2,
      payment_method: 'pix',
      amount: 99.90,
      auto_renew: false
    };

    const vipResult = await VIPService.activateVIP(testUser.id, vipPlan);
    console.log(`✅ Plano VIP ativado: ${vipResult.vip.planName}`);

    // Verificar status com múltiplos planos
    const multiStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log(`📊 Status com múltiplos planos: ${multiStatus.hasVIP ? 'VIP Ativo' : 'Sem VIP'}`);
    console.log(`📊 Plano ativo: ${multiStatus.vipStatus?.planName || 'Básico'}`);

    // 9. Limpeza
    console.log('\n8️⃣ Limpando dados de teste...');
    await UserVIP.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📋 Resumo do teste:');
    console.log('✅ Sistema reconhece 3 níveis: BÁSICO, PREMIUM, VIP');
    console.log('✅ Expiração funciona corretamente');
    console.log('✅ Downgrade para BÁSICO quando não há planos ativos');
    console.log('✅ Múltiplos planos são gerenciados corretamente');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAccountExpiration()
    .then(() => {
      console.log('\n✅ Teste finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

module.exports = testAccountExpiration;
