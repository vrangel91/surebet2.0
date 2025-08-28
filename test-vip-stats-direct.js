const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'surestake',
  user: 'postgres',
  password: 'SureStake2024!'
});

async function testVIPStatsDirect() {
  try {
    console.log('🧪 Testando estatísticas VIP diretamente no banco...');
    
    // Testar cada query individualmente
    console.log('\n1. VIPs ativos:');
    const activeVIPsResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_vip 
      WHERE status = 'ativo' AND data_fim > NOW()
    `);
    console.log('Resultado:', activeVIPsResult.rows[0]);
    
    console.log('\n2. Expirando em 7 dias:');
    const expiringSoonResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_vip 
      WHERE status = 'ativo' 
      AND data_fim BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `);
    console.log('Resultado:', expiringSoonResult.rows[0]);
    
    console.log('\n3. Expirados hoje:');
    const expiredTodayResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_vip 
      WHERE status = 'ativo' 
      AND DATE(data_fim) = CURRENT_DATE
    `);
    console.log('Resultado:', expiredTodayResult.rows[0]);
    
    console.log('\n4. Receita total:');
    const totalRevenueResult = await pool.query(`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM user_vip 
      WHERE amount IS NOT NULL AND amount > 0
    `);
    console.log('Resultado:', totalRevenueResult.rows[0]);
    
    console.log('\n5. Receita deste mês:');
    const thisMonthRevenueResult = await pool.query(`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM user_vip 
      WHERE amount IS NOT NULL AND amount > 0
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    console.log('Resultado:', thisMonthRevenueResult.rows[0]);
    
    console.log('\n6. VIPs criados este mês:');
    const thisMonthResult = await pool.query(`
      SELECT COUNT(*) as count FROM user_vip 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    console.log('Resultado:', thisMonthResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

testVIPStatsDirect();
