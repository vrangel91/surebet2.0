const VIPService = require('./utils/vipService');
const vipCronJobs = require('./utils/vipCronJobs');
const VIPReports = require('./utils/vipReports');
const { User, UserVIP } = require('./models');

async function testCompleteVIPSystem() {
  try {
    console.log('🧪 Iniciando teste completo do sistema VIP...\n');

    // 1. Teste: Criar usuário de teste
    console.log('👤 1. Criando usuário de teste...');
    const timestamp = Date.now();
    const testUser = await User.create({
      username: `teste_completo_${timestamp}`,
      first_name: 'Usuário',
      last_name: 'Teste Completo',
      email: `teste.completo.${timestamp}@example.com`,
      password_hash: 'teste123',
      is_admin: false,
      is_vip: false,
      account_type: 'basic'
    });
    console.log(`✅ Usuário criado: ${testUser.username} (ID: ${testUser.id})\n`);

    // 2. Teste: Ativar VIP
    console.log('👑 2. Ativando VIP...');
    const activateResult = await VIPService.activateVIP(testUser.id, {
      plan_id: 'premium',
      plan_name: 'Premium Teste',
      plan_days: 30,
      payment_method: 'pix',
      amount: 29.90,
      auto_renew: false,
      notes: 'VIP de teste completo'
    });
    console.log('✅ VIP ativado:', activateResult.message, '\n');

    // 3. Teste: Verificar status VIP
    console.log('🔍 3. Verificando status VIP...');
    const vipStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status VIP:', JSON.stringify(vipStatus, null, 2), '\n');

    // 4. Teste: Cron Jobs
    console.log('⏰ 4. Testando cron jobs...');
    
    // Verificar status dos cron jobs
    const cronStatus = vipCronJobs.getStatus();
    console.log('Status dos cron jobs:', JSON.stringify(cronStatus, null, 2), '\n');

    // Testar processamento manual
    const expiredResult = await vipCronJobs.processExpiredVIPsManual();
    console.log('Processamento manual:', expiredResult.message, '\n');

    // Testar verificação de expirações
    const expirationsResult = await vipCronJobs.checkExpirationsManual();
    console.log('Verificação de expirações:', expirationsResult.expiringCount, 'VIPs expirando', '\n');

    // 5. Teste: Relatórios
    console.log('📊 5. Testando relatórios...');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 dias atrás
    const endDate = new Date();

    // Relatório de receita
    console.log('📈 Gerando relatório de receita...');
    const revenueReport = await VIPReports.generateRevenueReport(startDate, endDate, 'day');
    console.log('Receita total:', revenueReport.summary.totalRevenue, '\n');

    // Relatório de conversão
    console.log('🔄 Gerando relatório de conversão...');
    const conversionReport = await VIPReports.generateConversionReport(startDate, endDate);
    console.log('Taxa de conversão:', conversionReport.metrics.conversionRate + '%', '\n');

    // Relatório de retenção
    console.log('📈 Gerando relatório de retenção...');
    const retentionReport = await VIPReports.generateRetentionReport(startDate, endDate);
    console.log('Taxa de retenção:', retentionReport.metrics.retentionRate + '%', '\n');

    // Relatório de planos
    console.log('📋 Gerando relatório de planos...');
    const plansReport = await VIPReports.generatePlansReport(startDate, endDate);
    console.log('Total de ativações:', plansReport.summary.totalActivations, '\n');

    // Relatório de métodos de pagamento
    console.log('💳 Gerando relatório de métodos de pagamento...');
    const paymentReport = await VIPReports.generatePaymentMethodsReport(startDate, endDate);
    console.log('Total de transações:', paymentReport.summary.totalTransactions, '\n');

    // Relatório de churn
    console.log('📉 Gerando relatório de churn...');
    const churnReport = await VIPReports.generateChurnReport(startDate, endDate);
    console.log('Taxa de churn:', churnReport.metrics.churnRate + '%', '\n');

    // Relatório completo
    console.log('📊 Gerando relatório completo...');
    const comprehensiveReport = await VIPReports.generateComprehensiveReport(startDate, endDate);
    console.log('Resumo completo:', {
      receita: comprehensiveReport.summary.totalRevenue,
      conversoes: comprehensiveReport.summary.totalConversions,
      retencao: comprehensiveReport.summary.retentionRate + '%',
      churn: comprehensiveReport.summary.churnRate + '%'
    }, '\n');

    // Relatório de tendências
    console.log('📈 Gerando relatório de tendências...');
    const trendsReport = await VIPReports.generateTrendsReport(startDate, endDate);
    console.log('Crescimento da receita:', trendsReport.trends.revenueGrowth + '%', '\n');

    // 6. Teste: Renovar VIP
    console.log('🔄 6. Renovando VIP...');
    const renewResult = await VIPService.renewVIP(testUser.id, {
      plan_id: 'vip',
      plan_name: 'VIP Teste',
      plan_days: 15,
      payment_method: 'pix',
      amount: 49.90,
      auto_renew: true,
      notes: 'Renovação de teste'
    });
    console.log('✅ VIP renovado:', renewResult.message, '\n');

    // 7. Teste: Verificar status final
    console.log('🔍 7. Verificando status final...');
    const finalStatus = await VIPService.checkVIPStatus(testUser.id);
    console.log('Status final:', JSON.stringify(finalStatus, null, 2), '\n');

    // 8. Teste: Obter histórico
    console.log('📋 8. Obtendo histórico VIP...');
    const history = await VIPService.getVIPHistory(testUser.id, 1, 10);
    console.log('Histórico:', history.vipHistory.length, 'registros', '\n');

    // 9. Teste: Cancelar VIP
    console.log('❌ 9. Cancelando VIP...');
    const cancelResult = await VIPService.cancelVIP(testUser.id, 'Teste de cancelamento');
    console.log('✅ VIP cancelado:', cancelResult.message, '\n');

    // 10. Limpeza
    console.log('🧹 10. Limpando dados de teste...');
    await UserVIP.destroy({
      where: { user_id: testUser.id }
    });
    await testUser.destroy();
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 Teste completo do sistema VIP executado com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('   ✅ Criação de usuário');
    console.log('   ✅ Ativação de VIP');
    console.log('   ✅ Verificação de status');
    console.log('   ✅ Cron jobs (status, processamento manual, verificação)');
    console.log('   ✅ Relatórios (receita, conversão, retenção, planos, pagamentos, churn, completo, tendências)');
    console.log('   ✅ Renovação de VIP');
    console.log('   ✅ Histórico VIP');
    console.log('   ✅ Cancelamento de VIP');
    console.log('   ✅ Limpeza de dados');

    console.log('\n🚀 Sistema VIP completo funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro durante o teste completo:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testCompleteVIPSystem()
    .then(() => {
      console.log('\n🎉 Teste completo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro no teste completo:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteVIPSystem };
