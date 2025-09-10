const { sequelize } = require('../config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela surebet_stats...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'surebet_stats' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela surebet_stats:');
    results.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🔍 Verificando estrutura da tabela surebet_analytics...');
    
    const [analyticsResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'surebet_analytics' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela surebet_analytics:');
    analyticsResults.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();
