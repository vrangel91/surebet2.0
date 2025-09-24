const { Pool } = require('pg');

async function migrateUserVIPToPlans() {
  let pool = null;
  
  try {
    console.log('🚀 Iniciando migração de dados da tabela user_vip para users.plan_id...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '7nYi>q10v_:>8pz)^0dC',
      database: process.env.DB_NAME || 'surestake'
    });

    // Verificar se a tabela user_vip existe
    console.log('🔍 Verificando se a tabela user_vip existe...');
    const checkTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_vip'
    `);

    if (checkTable.rows.length === 0) {
      console.log('⚠️ Tabela user_vip não existe. Nada para migrar.');
      return;
    }

    // Verificar se a coluna plan_id existe na tabela users
    console.log('🔍 Verificando se a coluna plan_id existe na tabela users...');
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'plan_id'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('❌ Coluna plan_id não existe na tabela users. Execute primeiro o script add-plan-id-to-users.js');
      return;
    }

    // Buscar todos os VIPs ativos
    console.log('📊 Buscando VIPs ativos para migração...');
    const activeVIPs = await pool.query(`
      SELECT 
        uv.user_id,
        uv.plan_name,
        uv.plan_id as old_plan_id,
        uv.data_fim,
        uv.amount,
        uv.auto_renew,
        uv.notes
      FROM user_vip uv
      WHERE uv.status = 'ativo'
      AND uv.data_fim > CURRENT_TIMESTAMP
      ORDER BY uv.user_id, uv.created_at DESC
    `);

    console.log(`📋 Encontrados ${activeVIPs.rows.length} VIPs ativos para migração`);

    if (activeVIPs.rows.length === 0) {
      console.log('✅ Nenhum VIP ativo encontrado. Migração concluída.');
      return;
    }

    // Mapear planos antigos para novos IDs baseado no display_name
    const planMapping = {
      'Plano Básico': 'pre-daily', // Mapear básico para pré-jogo diário
      'Plano Premium': 'pre-weekly', // Mapear premium para pré-jogo semanal
      'Plano VIP': 'pre-monthly', // Mapear VIP para pré-jogo mensal
      'Pré-Jogo Diário': 'pre-daily',
      'Pré-Jogo Semanal': 'pre-weekly',
      'Pré-Jogo Mensal': 'pre-monthly',
      'Pré-Jogo Anual': 'pre-yearly',
      'Live Diário': 'live-daily',
      'Live Semanal': 'live-weekly',
      'Live Mensal': 'live-monthly',
      'Live Anual': 'live-yearly',
      'Pré+Live Diário': 'prelive-daily',
      'Pré+Live Semanal': 'prelive-weekly',
      'Pré+Live Mensal': 'prelive-monthly',
      'Pré+Live Anual': 'prelive-yearly',
      'Valuebet Diário': 'valuebet-daily',
      'Valuebet Semanal': 'valuebet-weekly',
      'Valuebet Mensal': 'valuebet-monthly',
      'Valuebet Anual': 'valuebet-yearly',
      'Full Diário': 'full-daily',
      'Full Semanal': 'full-weekly',
      'Full Mensal': 'full-monthly',
      'Full Anual': 'full-yearly'
    };

    let migratedCount = 0;
    let errorCount = 0;

    // Migrar cada VIP ativo
    for (const vip of activeVIPs.rows) {
      try {
        // Mapear o plano antigo para o novo
        const newPlanName = planMapping[vip.plan_name] || vip.plan_name;
        
        // Buscar o ID do novo plano
        const planResult = await pool.query(`
          SELECT id FROM plans WHERE name = $1 AND is_active = true
        `, [newPlanName]);

        if (planResult.rows.length === 0) {
          console.log(`⚠️ Plano ${newPlanName} não encontrado para usuário ${vip.user_id}`);
          errorCount++;
          continue;
        }

        const newPlanId = planResult.rows[0].id;

        // Atualizar o usuário com o novo plan_id
        await pool.query(`
          UPDATE users 
          SET 
            plan_id = $1,
            is_vip = true,
            vip_expires_at = $2,
            account_type = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [
          newPlanId,
          vip.data_fim,
          newPlanName,
          vip.user_id
        ]);

        console.log(`✅ Usuário ${vip.user_id} migrado para plano ${newPlanName} (ID: ${newPlanId})`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Erro ao migrar usuário ${vip.user_id}:`, error.message);
        errorCount++;
      }
    }

    // Mostrar resumo da migração
    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Usuários migrados: ${migratedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📋 Total processados: ${activeVIPs.rows.length}`);

    // Opcional: Marcar VIPs migrados como inativos
    if (migratedCount > 0) {
      console.log('\n🔄 Marcando VIPs migrados como inativos...');
      const updateResult = await pool.query(`
        UPDATE user_vip 
        SET status = 'inativo', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'ativo' 
        AND data_fim > CURRENT_TIMESTAMP
      `);
      console.log(`✅ ${updateResult.rowCount} registros marcados como inativos`);
    }

    console.log('\n🎉 Migração concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Testar as APIs com os novos dados');
    console.log('   2. Verificar se o frontend está funcionando corretamente');
    console.log('   3. Considerar remover a tabela user_vip após confirmação');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateUserVIPToPlans()
    .then(() => {
      console.log('🎉 Script de migração executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução da migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateUserVIPToPlans };
