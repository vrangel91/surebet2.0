require('dotenv').config();
const { User } = require('./models');

async function testUserModel() {
  console.log('🔍 Testando modelo User...\n');
  
  try {
    console.log('📋 Testando busca de usuário por email...');
    
    const user = await User.findOne({
      where: { email: 'admin@surestake.com' }
    });

    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('   - ID:', user.id);
      console.log('   - Username:', user.username);
      console.log('   - Email:', user.email);
      console.log('   - First Name:', user.first_name);
      console.log('   - Last Name:', user.last_name);
      console.log('   - Is Admin:', user.is_admin);
      console.log('   - Is VIP:', user.is_vip);
      console.log('   - Created At:', user.created_at);
      console.log('   - Updated At:', user.updated_at);
      
      // Testar se as propriedades existem
      console.log('\n🔍 Verificando propriedades do modelo:');
      console.log('   - user.role:', user.role !== undefined ? '✅ Existe' : '❌ Não existe');
      console.log('   - user.account_type:', user.account_type !== undefined ? '✅ Existe' : '❌ Não existe');
      console.log('   - user.credits:', user.credits !== undefined ? '✅ Existe' : '❌ Não existe');
      console.log('   - user.status:', user.status !== undefined ? '✅ Existe' : '❌ Não existe');
      console.log('   - user.last_login:', user.last_login !== undefined ? '✅ Existe' : '❌ Não existe');
      
    } else {
      console.log('❌ Usuário não encontrado');
    }

    console.log('\n✅ Teste do modelo User concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao testar modelo User:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testUserModel();
