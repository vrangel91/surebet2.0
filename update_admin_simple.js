const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'SureStake2024!',
  database: 'surestake',
  logging: false
});

async function updateAdminAccount() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');
    
    console.log('🔍 Procurando usuário admin@surestake.com...');
    
    const [users] = await sequelize.query(
      "SELECT id, email, account_type, is_admin, is_vip FROM users WHERE email = 'admin@surestake.com'"
    );
    
    if (users.length === 0) {
      console.log('❌ Usuário admin@surestake.com não encontrado');
      return;
    }
    
    const user = users[0];
    console.log('✅ Usuário encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Account Type atual:', user.account_type);
    console.log('  Is Admin:', user.is_admin);
    console.log('  Is VIP:', user.is_vip);
    
    // Alterar para um plano que tenha acesso às funcionalidades
    const newAccountType = 'vip'; // Plano VIP tem acesso completo
    
    console.log(`🔄 Alterando account_type de '${user.account_type}' para '${newAccountType}'...`);
    
    await sequelize.query(
      "UPDATE users SET account_type = $1, is_vip = true WHERE id = $2",
      {
        bind: [newAccountType, user.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('✅ Usuário atualizado com sucesso!');
    console.log('  Novo Account Type:', newAccountType);
    console.log('  Is VIP:', true);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateAdminAccount();

