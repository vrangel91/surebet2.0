const { sequelize } = require('../config/database');
const { User, UserSession } = require('../models');
const { generateToken, verifyToken, createUserSession, verifyUserSession } = require('../utils/auth');

async function testAuth() {
  try {
    console.log('🧪 Testando sistema de autenticação...\n');
    
    // 1. Buscar um usuário existente
    console.log('1️⃣ Buscando usuário existente...');
    const user = await User.findOne({
      where: { email: 'teste@teste.com' }
    });
    
    if (!user) {
      console.log('❌ Usuário teste@teste.com não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
      is_vip: user.is_vip
    });
    
    // 2. Gerar token JWT
    console.log('\n2️⃣ Gerando token JWT...');
    const token = generateToken(user);
    console.log('✅ Token gerado:', token.substring(0, 50) + '...');
    
    // 3. Verificar token JWT
    console.log('\n3️⃣ Verificando token JWT...');
    const decoded = verifyToken(token);
    if (decoded) {
      console.log('✅ Token JWT válido:', decoded);
    } else {
      console.log('❌ Token JWT inválido');
      return;
    }
    
    // 4. Criar sessão no banco
    console.log('\n4️⃣ Criando sessão no banco...');
    await createUserSession(user, token);
    console.log('✅ Sessão criada no banco');
    
    // 5. Verificar sessão no banco
    console.log('\n5️⃣ Verificando sessão no banco...');
    const sessionUser = await verifyUserSession(token);
    if (sessionUser) {
      console.log('✅ Sessão válida no banco:', {
        id: sessionUser.id,
        email: sessionUser.email
      });
    } else {
      console.log('❌ Sessão inválida no banco');
    }
    
    // 6. Simular requisição HTTP
    console.log('\n6️⃣ Simulando requisição HTTP...');
    const mockReq = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    
    const tokenFromHeader = mockReq.headers['authorization']?.split(' ')[1];
    console.log('🔑 Token extraído do header:', tokenFromHeader ? 'Sim' : 'Não');
    
    if (tokenFromHeader) {
      const decodedFromHeader = verifyToken(tokenFromHeader);
      if (decodedFromHeader) {
        console.log('✅ Token do header é válido');
        
        const userFromSession = await verifyUserSession(tokenFromHeader);
        if (userFromSession) {
          console.log('✅ Usuário encontrado na sessão');
        } else {
          console.log('❌ Usuário não encontrado na sessão');
        }
      } else {
        console.log('❌ Token do header é inválido');
      }
    }
    
    console.log('\n🎉 Teste de autenticação concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
