const { User } = require('./models');

async function updateAdminAccount() {
  try {
    console.log('🔍 Procurando usuário admin@surestake.com...');
    
    const user = await User.findOne({ 
      where: { email: 'admin@surestake.com' } 
    });
    
    if (!user) {
      console.log('❌ Usuário admin@surestake.com não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Account Type atual:', user.account_type);
    console.log('  Is Admin:', user.is_admin);
    console.log('  Is VIP:', user.is_vip);
    
    // Alterar para um plano que tenha acesso às funcionalidades
    const newAccountType = 'vip'; // Plano VIP tem acesso completo
    
    console.log(`🔄 Alterando account_type de '${user.account_type}' para '${newAccountType}'...`);
    
    await user.update({
      account_type: newAccountType,
      is_vip: true
    });
    
    console.log('✅ Usuário atualizado com sucesso!');
    console.log('  Novo Account Type:', newAccountType);
    console.log('  Is VIP:', true);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
  } finally {
    process.exit(0);
  }
}

updateAdminAccount();

