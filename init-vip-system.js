const { initUserVIPTable } = require('./scripts/init-user-vip-table');
const VIPService = require('./utils/vipService');
const { syncModels } = require('./models');

async function initVIPSystem() {
  try {
    console.log('🚀 Inicializando sistema VIP completo...\n');

    // 1. Sincronizar modelos
    console.log('📋 1. Sincronizando modelos...');
    await syncModels();
    console.log('✅ Modelos sincronizados\n');

    // 2. Criar tabela user_vip
    console.log('👑 2. Criando tabela user_vip...');
    await initUserVIPTable();
    console.log('✅ Tabela user_vip criada\n');

    // 3. Migrar dados da tabela antiga (se existir)
    console.log('🔄 3. Verificando migração de dados...');
    const migrationResult = await VIPService.migrateFromOldTable();
    console.log(`✅ Migração: ${migrationResult.message}\n`);

    // 4. Processar VIPs expirados
    console.log('⏰ 4. Processando VIPs expirados...');
    const expiredResult = await VIPService.processExpiredVIPs();
    console.log(`✅ ${expiredResult.message}\n`);

    // 5. Obter estatísticas iniciais
    console.log('📊 5. Obtendo estatísticas iniciais...');
    const stats = await VIPService.getVIPStatistics();
    console.log('📈 Estatísticas VIP:');
    console.log(`   - VIPs ativos: ${stats.statistics.activeVIPs}`);
    console.log(`   - Expirando em 7 dias: ${stats.statistics.expiringSoon}`);
    console.log(`   - Expirados hoje: ${stats.statistics.expiredToday}`);
    console.log(`   - Criados este mês: ${stats.statistics.thisMonth}`);
    console.log(`   - Total de usuários VIP: ${stats.statistics.totalVIPUsers}\n`);

    console.log('🎉 Sistema VIP inicializado com sucesso!');
    console.log('\n📋 Funcionalidades disponíveis:');
    console.log('   ✅ Controle completo de data de início e fim');
    console.log('   ✅ Status automático (ativo, inativo, expirado, cancelado)');
    console.log('   ✅ Renovação automática de VIPs');
    console.log('   ✅ Histórico completo de VIPs');
    console.log('   ✅ Processamento automático de expiração');
    console.log('   ✅ Estatísticas detalhadas');
    console.log('   ✅ Migração de dados antigos');
    console.log('   ✅ APIs RESTful completas');
    console.log('   ✅ Índices otimizados para performance');
    console.log('   ✅ Triggers para atualização automática');

    console.log('\n🔗 Endpoints disponíveis:');
    console.log('   POST   /api/vip/activate - Ativar VIP');
    console.log('   GET    /api/vip/status/:userId - Verificar status VIP');
    console.log('   GET    /api/vip/my-status - Status VIP do usuário atual');
    console.log('   POST   /api/vip/renew/:userId - Renovar VIP');
    console.log('   PATCH  /api/vip/cancel/:userId - Cancelar VIP (admin)');
    console.log('   GET    /api/vip/history/:userId - Histórico VIP');
    console.log('   GET    /api/vip/my-history - Histórico VIP do usuário atual');
    console.log('   POST   /api/vip/process-expired - Processar VIPs expirados (admin)');
    console.log('   GET    /api/vip/statistics - Estatísticas VIP (admin)');
    console.log('   POST   /api/vip/migrate - Migrar dados antigos (admin)');
    console.log('   POST   /api/vip/check-access - Verificar acesso VIP');
    console.log('   GET    /api/vip/active - Listar VIPs ativos (admin)');
    console.log('   GET    /api/vip/expiring-soon - VIPs que expiram em breve (admin)');

    console.log('\n🚀 Próximos passos:');
    console.log('   1. Configurar cron job para processar VIPs expirados');
    console.log('   2. Implementar notificações de expiração');
    console.log('   3. Configurar webhooks para pagamentos');
    console.log('   4. Testar fluxo completo de ativação/renovação');
    console.log('   5. Implementar interface administrativa');

  } catch (error) {
    console.error('❌ Erro ao inicializar sistema VIP:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initVIPSystem()
    .then(() => {
      console.log('\n🎉 Inicialização concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initVIPSystem };
