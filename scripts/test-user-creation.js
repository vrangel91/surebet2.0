const { User } = require('../models');

async function testUserCreation() {
  try {
    console.log('🧪 Testando criação de usuário...');
    
    const timestamp = Date.now();
    const user = await User.create({
      username: `Teste Usuario ${timestamp}`,
      first_name: 'Teste',
      last_name: 'Usuario',
      email: `teste${timestamp}@teste.com`,
      password_hash: '123456',
      account_type: 'basic',
      is_admin: false,
      is_vip: false
    });
    
    console.log('✅ Usuário criado com sucesso:', {
      id: user.id,
      username: user.username,
      email: user.email,
      account_type: user.account_type
    });
    
    // Remover usuário de teste
    await user.destroy();
    console.log('🧹 Usuário de teste removido');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    process.exit(0);
  }
}

testUserCreation();
