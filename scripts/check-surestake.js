const { Pool } = require('pg');

async function checkSurestake() {
  let pool = null;
  
  try {
    console.log('🔍 Verificando banco surestake...');
    
    // Tentar conectar ao banco surestake
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake'
    });
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco surestake estabelecida');
    
    // Listar tabelas
    console.log('\n📊 Tabelas no banco surestake:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('  (nenhuma tabela encontrada)');
    } else {
      tables.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Verificar se a tabela orders existe
    const ordersExists = tables.rows.some(row => row.table_name === 'orders');
    console.log(`\n🔍 Tabela 'orders' existe: ${ordersExists ? '✅ SIM' : '❌ NÃO'}`);
    
    if (!ordersExists) {
      console.log('\n⚠️ A tabela orders não existe no banco surestake!');
      console.log('Vamos criar as tabelas necessárias...');
      
      // Criar tabela orders
      console.log('\n🔧 Criando tabela orders...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          plan_id VARCHAR(255) NOT NULL,
          plan_name VARCHAR(255) NOT NULL,
          plan_days INTEGER NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          installments INTEGER DEFAULT 1,
          customer_data JSONB,
          payment_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela orders criada com sucesso!');
    }
    
  } catch (error) {
    if (error.code === '3D000') {
      console.log('❌ Banco surestake não existe!');
      console.log('Vamos criar o banco...');
      
      // Conectar ao postgres para criar o banco
      const postgresPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'SureStake2024!',
        database: 'postgres'
      });
      
      await postgresPool.query('CREATE DATABASE surestake');
      await postgresPool.end();
      
      console.log('✅ Banco surestake criado!');
      console.log('Agora execute o script init-vip-tables.js para criar as tabelas.');
      
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    if (pool) await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkSurestake()
    .then(() => {
      console.log('\n🎉 Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkSurestake };
