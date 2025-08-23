const { User, UserSession } = require('./models');
const { createUserSession } = require('./utils/auth');

async function testCreateSession() {
  try {
    console.log('🔍 Testando criação de sessão...\n');
    
    // Buscar usuário admin
    console.log('🔍 Buscando usuário admin...');
    const user = await User.findOne({
      where: { email: 'admin@surestake.com' }
    });
    
    if (!user) {
      throw new Error('Usuário admin não encontrado');
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    
    // Simular token
    const token = 'test-token-' + Date.now();
    console.log('🔑 Token simulado:', token);
    
    // Simular requisição
    const req = {
      headers: {
        'user-agent': 'test-script'
      },
      ip: '127.0.0.1'
    };
    
    console.log('📤 Criando sessão...');
    await createUserSession(user, token, req);
    console.log('✅ Sessão criada com sucesso!');
    
    // Verificar se a sessão foi criada
    console.log('🔍 Verificando sessão criada...');
    const session = await UserSession.findOne({
      where: { token }
    });
    
    if (session) {
      console.log('✅ Sessão encontrada no banco:');
      console.log('   - ID:', session.id);
      console.log('   - User ID:', session.user_id);
      console.log('   - Token:', session.token);
      console.log('   - Is Active:', session.is_active);
      console.log('   - Expires At:', session.expires_at);
    } else {
      console.log('❌ Sessão não encontrada no banco');
    }
    
    // Limpar sessão de teste
    if (session) {
      await session.destroy();
      console.log('🧹 Sessão de teste removida');
    }
    
    console.log('\n🎉 Teste de criação de sessão passou com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await require('./models').sequelize.close();
  }
}

testCreateSession();
