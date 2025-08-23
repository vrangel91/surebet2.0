const { User } = require('./models');
const { generateToken, createUserSession } = require('./utils/auth');

async function testLoginStepByStep() {
  try {
    console.log('🔍 Testando login passo a passo...\n');
    
    // Passo 1: Buscar usuário
    console.log('📋 Passo 1: Buscando usuário...');
    const user = await User.findOne({
      where: { email: 'admin@surestake.com' },
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'password_hash', 'is_admin', 'is_vip', 'created_at']
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    console.log('✅ Usuário encontrado:', user.email);
    
    // Passo 2: Verificar senha
    console.log('\n📋 Passo 2: Verificando senha...');
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare('admin123', user.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }
    console.log('✅ Senha válida');
    
    // Passo 3: Verificar privilégios
    console.log('\n📋 Passo 3: Verificando privilégios...');
    if (!user.is_admin && !user.is_vip) {
      throw new Error('Usuário sem privilégios');
    }
    console.log('✅ Privilégios verificados');
    
    // Passo 4: Gerar token
    console.log('\n📋 Passo 4: Gerando token...');
    const token = generateToken(user);
    if (!token) {
      throw new Error('Falha ao gerar token');
    }
    console.log('✅ Token gerado:', token.substring(0, 20) + '...');
    
    // Passo 5: Criar sessão
    console.log('\n📋 Passo 5: Criando sessão...');
    const req = {
      headers: {
        'user-agent': 'test-script'
      },
      ip: '127.0.0.1'
    };
    
    await createUserSession(user, token, req);
    console.log('✅ Sessão criada');
    
    // Passo 6: Verificar dados de resposta
    console.log('\n📋 Passo 6: Preparando dados de resposta...');
    const userData = {
      id: user.id,
      username: user.username,
      name: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin,
      is_vip: user.is_vip,
      can_use_system: user.is_admin || user.is_vip,
      role: user.is_admin ? 'admin' : 'user',
      accountType: user.is_vip ? 'vip' : (user.is_admin ? 'admin' : 'basic'),
      credits: 999,
      status: 'active'
    };
    
    console.log('✅ Dados preparados:', JSON.stringify(userData, null, 2));
    
    console.log('\n🎉 Todos os passos passaram com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro no passo:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await require('./models').sequelize.close();
  }
}

testLoginStepByStep();
