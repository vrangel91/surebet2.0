const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('surestake', 'postgres', 'SureStake2024!', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function quickFix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    const result = await sequelize.query(`
      UPDATE users 
      SET account_type = 'vip', is_vip = true 
      WHERE email = 'admin@surestake.com'
      RETURNING id, email, account_type, is_vip
    `);
    
    if (result[0].length > 0) {
      console.log('✅ Admin atualizado:', result[0][0]);
    } else {
      console.log('❌ Admin não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  await sequelize.close();
  process.exit(0);
}

quickFix();

