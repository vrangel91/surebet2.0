const { sequelize } = require('../config/database');

async function checkAccountType() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'account_type'
    `);
    
    console.log('Resultados:', results);
    
    if (results.length > 0) {
      console.log('✅ Campo account_type existe na tabela users');
    } else {
      console.log('❌ Campo account_type NÃO existe na tabela users');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkAccountType();
