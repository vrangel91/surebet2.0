const { sequelize } = require('./models');

async function checkUserSessionsSchema() {
  try {
    console.log('🔍 Verificando estrutura da tabela user_sessions...\n');
    
    // Verificar colunas da tabela
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas da tabela user_sessions:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar dados de exemplo
    console.log('\n📊 Dados de exemplo na tabela:');
    const [sessions] = await sequelize.query(`
      SELECT * FROM user_sessions LIMIT 3
    `);
    
    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`\n   Sessão ${index + 1}:`);
        Object.keys(session).forEach(key => {
          console.log(`     ${key}: ${session[key]}`);
        });
      });
    } else {
      console.log('   Nenhuma sessão encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUserSessionsSchema();
