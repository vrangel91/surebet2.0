const { addPlanIdToUsers } = require('./add-plan-id-to-users');
const { updatePlansTable } = require('./update-plans-table');
const { migrateUserVIPToPlans } = require('./migrate-user-vip-to-plans');

async function setupNewPlanStructure() {
  try {
    console.log('🚀 Iniciando configuração da nova estrutura de planos...\n');

    // Passo 1: Adicionar coluna plan_id na tabela users
    console.log('📋 Passo 1: Adicionando coluna plan_id na tabela users...');
    await addPlanIdToUsers();
    console.log('✅ Passo 1 concluído!\n');

    // Passo 2: Atualizar tabela plans com os novos planos
    console.log('📋 Passo 2: Atualizando tabela plans com os novos planos...');
    await updatePlansTable();
    console.log('✅ Passo 2 concluído!\n');

    // Passo 3: Migrar dados existentes
    console.log('📋 Passo 3: Migrando dados existentes da tabela user_vip...');
    await migrateUserVIPToPlans();
    console.log('✅ Passo 3 concluído!\n');

    console.log('🎉 Configuração da nova estrutura de planos concluída com sucesso!');
    console.log('\n📋 Resumo das mudanças:');
    console.log('   ✅ Coluna plan_id adicionada na tabela users');
    console.log('   ✅ Tabela plans atualizada com 20 novos planos');
    console.log('   ✅ Dados existentes migrados da tabela user_vip');
    console.log('   ✅ APIs atualizadas para usar nova estrutura');
    console.log('   ✅ Frontend atualizado para remover dados hardcoded');
    
    console.log('\n🔧 Próximos passos:');
    console.log('   1. Reiniciar o servidor para carregar os novos modelos');
    console.log('   2. Testar as APIs:');
    console.log('      - GET /api/plans');
    console.log('      - GET /api/users/with-plans');
    console.log('      - GET /api/users (deve incluir dados do plano)');
    console.log('   3. Testar o VIPAdminView no frontend');
    console.log('   4. Verificar se todos os usuários têm planos corretos');
    console.log('   5. Considerar remover a tabela user_vip após confirmação');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupNewPlanStructure()
    .then(() => {
      console.log('🎉 Script principal executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução do script principal:', error);
      process.exit(1);
    });
}

module.exports = { setupNewPlanStructure };
