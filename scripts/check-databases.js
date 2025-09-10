const { Pool } = require('pg');

async function checkDatabases() {
  let pool = null;
  
  try {
    console.log('🔍 Verificando status dos bancos de dados...');
    
    // Conectar ao banco postgres para listar bancos
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'postgres'
    });
    
    // Listar bancos de dados
    console.log('\n📋 Bancos de dados existentes:');
    const databases = await pool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      AND datname NOT IN ('postgres', 'template0', 'template1')
      ORDER BY datname
    `);
    
    databases.rows.forEach(db => {
      console.log(`  - ${db.datname}`);
    });
    
    // Verificar tabelas em cada banco
    for (const db of databases.rows) {
      console.log(`\n📊 Tabelas no banco '${db.datname}':`);
      
      // Conectar ao banco específico
      const dbPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'SureStake2024!',
        database: db.datname
      });
      
      try {
        const tables = await dbPool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        
        if (tables.rows.length === 0) {
          console.log('  (nenhuma tabela)');
        } else {
          tables.rows.forEach(table => {
            console.log(`  - ${table.table_name}`);
          });
        }
        
        await dbPool.end();
      } catch (error) {
        console.log(`  ❌ Erro ao conectar: ${error.message}`);
        await dbPool.end();
      }
    }
    
    // Verificar configuração atual do sistema
    console.log('\n⚙️ Configuração atual do sistema:');
    console.log(`  - DB_NAME: ${process.env.DB_NAME || 'surestake'}`);
    console.log(`  - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  - DB_USER: ${process.env.DB_USER || 'postgres'}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar bancos:', error);
  } finally {
    if (pool) await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkDatabases()
    .then(() => {
      console.log('\n🎉 Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabases };
