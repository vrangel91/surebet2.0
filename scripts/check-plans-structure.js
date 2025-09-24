const { Pool } = require('pg');

async function checkPlansStructure() {
  let pool = null;
  
  try {
    console.log('🔍 Verificando estrutura da tabela plans...');

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
      WHERE table_name = 'plans'
    `);

    if (tableExists.rows.length === 0) {
      console.log('❌ Tabela plans não existe');
      return;
    }

    // Verificar estrutura da tabela
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'plans'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estrutura da tabela plans:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar se há dados
    const count = await pool.query('SELECT COUNT(*) as count FROM plans');
    console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkPlansStructure()
    .then(() => {
      console.log('✅ Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkPlansStructure };
