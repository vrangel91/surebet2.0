require('dotenv').config();
const { User } = require('./models');

async function testUserQuery() {
  console.log('🔍 Testando consulta do modelo User...\n');
  
  try {
    console.log('📋 Testando User.findOne...');
    
    const user = await User.findOne({
      where: { email: 'admin@surestake.com' }
    });

    if (user) {
      console.log('✅ Usuário encontrado com sucesso!');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Is Admin:', user.is_admin);
      
      // Testar se consegue acessar as propriedades
      console.log('\n🔍 Testando acesso às propriedades...');
      console.log('   - user.email:', user.email);
      console.log('   - user.password_hash:', user.password_hash ? '✅ Presente' : '❌ Ausente');
      console.log('   - user.is_admin:', user.is_admin);
      console.log('   - user.is_vip:', user.is_vip);
      
    } else {
      console.log('❌ Usuário não encontrado');
    }

    console.log('\n✅ Teste de consulta concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao consultar usuário:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testUserQuery();
