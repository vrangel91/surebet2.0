const { sequelize } = require('../config/database');

async function addAccountTypeColumn() {
  console.log('🔧 Adicionando campo account_type à tabela users...');
  
  try {
    // Verificar se a coluna já existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'account_type'
    `);
    
    if (results.length > 0) {
      console.log('✅ Campo account_type já existe na tabela users');
      return;
    }
    
    // Adicionar a coluna account_type
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN account_type VARCHAR(50) DEFAULT 'basic' NOT NULL
    `);
    
    console.log('✅ Campo account_type adicionado com sucesso!');
    
    // Atualizar usuários existentes para ter account_type = 'basic'
    await sequelize.query(`
      UPDATE users 
      SET account_type = 'basic' 
      WHERE account_type IS NULL OR account_type = ''
    `);
    
    console.log('✅ Usuários existentes atualizados com account_type = basic');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campo account_type:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addAccountTypeColumn()
    .then(() => {
      console.log('🎉 Script concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { addAccountTypeColumn };
