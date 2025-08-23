const { Pool } = require('pg');

async function testConnection() {
  let pool = null;
  
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    // Usar a mesma configuração do routes/orders.js
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: process.env.DB_NAME || 'surestake'
    });
    
    console.log('📋 Configuração usada:');
    console.log(`  - Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  - Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  - User: ${process.env.DB_USER || 'postgres'}`);
    console.log(`  - Database: ${process.env.DB_NAME || 'surestake'}`);
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a tabela orders existe
    console.log('\n🔍 Verificando tabela orders...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name = 'orders'
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Tabela orders existe!');
      
      // Testar inserção
      console.log('\n🧪 Testando inserção na tabela orders...');
      const testQuery = `
        INSERT INTO orders (user_id, plan_id, plan_name, plan_days, amount, status, payment_method, installments, customer_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      
      const testValues = [
        'test_user',
        'test_plan',
        'Plano Teste',
        30,
        99.90,
        'pending',
        'pix',
        1,
        JSON.stringify({ test: true })
      ];
      
      const result = await pool.query(testQuery, testValues);
      console.log(`✅ Inserção testada com sucesso! ID: ${result.rows[0].id}`);
      
      // Limpar teste
      await pool.query('DELETE FROM orders WHERE user_id = $1', ['test_user']);
      console.log('🧹 Dados de teste removidos');
      
    } else {
      console.log('❌ Tabela orders NÃO existe!');
      
      // Listar todas as tabelas para debug
      const allTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log('\n📊 Tabelas existentes:');
      allTables.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código do erro:', error.code);
    
    if (error.code === '3D000') {
      console.log('\n💡 Solução: O banco de dados não existe. Execute:');
      console.log('node scripts/init-vip-tables.js');
    }
  } finally {
    if (pool) await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n🎉 Teste concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro no teste:', error);
      process.exit(1);
    });
}

module.exports = { testConnection };
