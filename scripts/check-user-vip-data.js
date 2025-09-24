const { Pool } = require('pg');

async function checkUserVIPData() {
  let pool = null;
  
  try {
    console.log('🔍 Verificando dados da tabela user_vip...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '7nYi>q10v_:>8pz)^0dC',
      database: process.env.DB_NAME || 'surestake'
    });

    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_vip'
    `);

    if (tableExists.rows.length === 0) {
      console.log('❌ Tabela user_vip não existe');
      return;
    }

    // Buscar todos os planos únicos na tabela user_vip
    const uniquePlans = await pool.query(`
      SELECT DISTINCT plan_name, plan_id, COUNT(*) as count
      FROM user_vip 
      GROUP BY plan_name, plan_id
      ORDER BY plan_name
    `);

    console.log('📋 Planos únicos na tabela user_vip:');
    uniquePlans.rows.forEach(plan => {
      console.log(`   "${plan.plan_name}" (plan_id: ${plan.plan_id}) - ${plan.count} registros`);
    });

    // Buscar VIPs ativos
    const activeVIPs = await pool.query(`
      SELECT 
        user_id,
        plan_name,
        plan_id,
        data_fim,
        status
      FROM user_vip 
      WHERE status = 'ativo'
      AND data_fim > CURRENT_TIMESTAMP
      ORDER BY user_id
    `);

    console.log(`\n📊 VIPs ativos (${activeVIPs.rows.length}):`);
    activeVIPs.rows.forEach(vip => {
      console.log(`   Usuário ${vip.user_id}: "${vip.plan_name}" (expira: ${vip.data_fim})`);
    });

    // Verificar planos disponíveis na tabela plans
    const availablePlans = await pool.query(`
      SELECT name, display_name, category
      FROM plans 
      WHERE is_active = true
      ORDER BY category, name
    `);

    console.log(`\n📋 Planos disponíveis na tabela plans (${availablePlans.rows.length}):`);
    availablePlans.rows.forEach(plan => {
      console.log(`   ${plan.name}: "${plan.display_name}" (${plan.category})`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkUserVIPData()
    .then(() => {
      console.log('✅ Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkUserVIPData };
