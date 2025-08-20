const { sequelize, syncModels } = require('../models');

async function initBookmakerTables() {
  try {
    console.log('🔄 Inicializando tabelas de contas de casas de apostas...');
    
    // Sincronizar modelos com o banco de dados
    await syncModels();
    
    console.log('✅ Tabelas de contas de casas de apostas inicializadas com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - bookmaker_accounts (contas dos usuários)');
    console.log('   - transaction_history (histórico de transações)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initBookmakerTables();
}

module.exports = { initBookmakerTables };
