const { sequelize } = require('../config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela users:');
    results.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar dados de exemplo
    console.log('\n📊 Dados de exemplo da tabela users:');
    const [userData] = await sequelize.query(`
      SELECT id, username, first_name, last_name, email, is_admin, is_vip, account_type
      FROM users 
      LIMIT 3
    `);
    
    userData.forEach(user => {
      console.log(`\nUsuário ID ${user.id}:`);
      console.log(`  - username: "${user.username}"`);
      console.log(`  - first_name: "${user.first_name}"`);
      console.log(`  - last_name: "${user.last_name}"`);
      console.log(`  - email: "${user.email}"`);
      console.log(`  - is_admin: ${user.is_admin}`);
      console.log(`  - is_vip: ${user.is_vip}`);
      console.log(`  - account_type: "${user.account_type}"`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();
