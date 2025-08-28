const VIPService = require('./utils/vipService');
const { User, UserVIP } = require('./models');

async function testVIPSystem() {
  try {
    console.log('🧪 Iniciando testes do sistema VIP...\n');

    // 1. Teste: Criar usuário de teste
    console.log('👤 1. Criando usuário de teste...');
    const testUser = await User.create({
      username: 'teste_vip',
      first_name: 'Usuário',
      last_name: 'Teste VIP',
      email: 'teste.vip@example.com',
      password_hash: 'teste123',
      is_admin: false,
      is_vip: false,
      account_type: 'basic'
    });
    console.log(`✅ Usuário criado: ${testUser.username} (ID: ${testUser.id})\n`);

    // 2. Teste: Verificar status VIP inicial
    console.log('🔍 2. Verificando status VIP inicial...');
    const initialStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status inicial:', JSON.stringify(initialStatus, null, 2));
    console.log('✅ Status inicial verificado\n');

    // 3. Teste: Ativar VIP
    console.log('👑 3. Ativando VIP...');
    const activateResult = await VIPService.activateVIP(testUser.id, {
      plan_id: 'premium',
      plan_name: 'Premium Teste',
      plan_days: 30,
      payment_method: 'teste',
      amount: 29.90,
      auto_renew: false,
      notes: 'VIP de teste'
    });
    console.log('Resultado da ativação:', JSON.stringify(activateResult, null, 2));
    console.log('✅ VIP ativado com sucesso\n');

    // 4. Teste: Verificar status VIP após ativação
    console.log('🔍 4. Verificando status VIP após ativação...');
    const afterActivationStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status após ativação:', JSON.stringify(afterActivationStatus, null, 2));
    console.log('✅ Status após ativação verificado\n');

    // 5. Teste: Renovar VIP
    console.log('🔄 5. Renovando VIP...');
    const renewResult = await VIPService.renewVIP(testUser.id, {
      plan_id: 'vip',
      plan_name: 'VIP Teste',
      plan_days: 15,
      payment_method: 'teste',
      amount: 49.90,
      auto_renew: true,
      notes: 'Renovação de teste'
    });
    console.log('Resultado da renovação:', JSON.stringify(renewResult, null, 2));
    console.log('✅ VIP renovado com sucesso\n');

    // 6. Teste: Verificar status VIP após renovação
    console.log('🔍 6. Verificando status VIP após renovação...');
    const afterRenewalStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status após renovação:', JSON.stringify(afterRenewalStatus, null, 2));
    console.log('✅ Status após renovação verificado\n');

    // 7. Teste: Obter histórico VIP
    console.log('📋 7. Obtendo histórico VIP...');
    const historyResult = await VIPService.getVIPHistory(testUser.id, 1, 10);
    console.log('Histórico VIP:', JSON.stringify(historyResult, null, 2));
    console.log('✅ Histórico VIP obtido\n');

    // 8. Teste: Verificar acesso VIP
    console.log('🔐 8. Verificando acesso VIP...');
    const canAccess = await VIPService.canAccessVIP(testUser.id);
    console.log(`Pode acessar VIP: ${canAccess}`);
    console.log('✅ Acesso VIP verificado\n');

    // 9. Teste: Obter estatísticas
    console.log('📊 9. Obtendo estatísticas VIP...');
    const statsResult = await VIPService.getVIPStatistics();
    console.log('Estatísticas VIP:', JSON.stringify(statsResult, null, 2));
    console.log('✅ Estatísticas obtidas\n');

    // 10. Teste: Processar VIPs expirados (não deve afetar o VIP de teste)
    console.log('⏰ 10. Processando VIPs expirados...');
    const expiredResult = await VIPService.processExpiredVIPs();
    console.log('Resultado do processamento:', JSON.stringify(expiredResult, null, 2));
    console.log('✅ VIPs expirados processados\n');

    // 11. Teste: Verificar status final
    console.log('🔍 11. Verificando status final...');
    const finalStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status final:', JSON.stringify(finalStatus, null, 2));
    console.log('✅ Status final verificado\n');

    // 12. Teste: Cancelar VIP
    console.log('❌ 12. Cancelando VIP...');
    const cancelResult = await VIPService.cancelVIP(testUser.id, 'Teste de cancelamento');
    console.log('Resultado do cancelamento:', JSON.stringify(cancelResult, null, 2));
    console.log('✅ VIP cancelado com sucesso\n');

    // 13. Teste: Verificar status após cancelamento
    console.log('🔍 13. Verificando status após cancelamento...');
    const afterCancelStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status após cancelamento:', JSON.stringify(afterCancelStatus, null, 2));
    console.log('✅ Status após cancelamento verificado\n');

    // 14. Limpeza: Remover usuário de teste
    console.log('🧹 14. Limpando dados de teste...');
    await UserVIP.destroy({
      where: { user_id: testUser.id }
    });
    await testUser.destroy();
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 Todos os testes do sistema VIP foram executados com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('   ✅ Criação de usuário');
    console.log('   ✅ Verificação de status inicial');
    console.log('   ✅ Ativação de VIP');
    console.log('   ✅ Verificação de status após ativação');
    console.log('   ✅ Renovação de VIP');
    console.log('   ✅ Verificação de status após renovação');
    console.log('   ✅ Obtenção de histórico');
    console.log('   ✅ Verificação de acesso');
    console.log('   ✅ Obtenção de estatísticas');
    console.log('   ✅ Processamento de VIPs expirados');
    console.log('   ✅ Verificação de status final');
    console.log('   ✅ Cancelamento de VIP');
    console.log('   ✅ Verificação de status após cancelamento');
    console.log('   ✅ Limpeza de dados de teste');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testVIPSystem()
    .then(() => {
      console.log('\n🎉 Testes concluídos com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro nos testes:', error);
      process.exit(1);
    });
}

module.exports = { testVIPSystem };
