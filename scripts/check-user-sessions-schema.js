const { sequelize } = require('../config/database');

async function checkUserSessionsSchema() {
  try {
    console.log('🔍 Verificando schema da tabela user_sessions...\n');
    
    // Verificar se a tabela existe
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
      );
    `);
    
    if (tableExists[0][0].exists) {
      console.log('✅ Tabela user_sessions existe');
      
      // Verificar estrutura da tabela
      const columns = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Estrutura da tabela:');
      columns[0].forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      // Verificar se há registros
      const count = await sequelize.query(`
        SELECT COUNT(*) as total FROM user_sessions;
      `);
      
      console.log(`\n📈 Total de sessões: ${count[0][0].total}`);
      
      // Verificar sessões ativas
      const activeSessions = await sequelize.query(`
        SELECT COUNT(*) as active FROM user_sessions WHERE expires_at > NOW();
      `);
      
      console.log(`🔐 Sessões ativas: ${activeSessions[0][0].active}`);
      
    } else {
      console.log('❌ Tabela user_sessions não existe');
      console.log('\n💡 Criando tabela user_sessions...');
      
      await sequelize.query(`
        CREATE TABLE user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          token VARCHAR(500) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL
        );
      `);
      
      console.log('✅ Tabela user_sessions criada com sucesso');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkUserSessionsSchema();
}

module.exports = { checkUserSessionsSchema };
