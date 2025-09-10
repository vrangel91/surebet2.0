const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'surestake-secret-key-2024';
const JWT_EXPIRES_IN = '7d'; // 7 dias

// Gerar token JWT
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    is_admin: user.is_admin,
    is_vip: user.is_vip
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Criar sessão de usuário
async function createUserSession(user, token, req = null) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  await UserSession.create({
    user_id: user.id,
    token: token,
    expires_at: expiresAt
    // Colunas removidas pois não existem no banco surestake:
    // user_agent: req ? req.headers['user-agent'] : null,
    // ip_address: req ? req.ip : null
  });
}

// Verificar sessão de usuário
async function verifyUserSession(token) {
  const session = await UserSession.findOne({
    where: { token },
    include: [{
      model: User,
      as: 'user'
    }]
  });

  if (!session || !session.isValid()) {
    return null;
  }

  return session.user;
}

// Invalidar sessão (logout)
async function invalidateSession(token) {
  const session = await UserSession.findOne({
    where: { token }
  });

  if (session) {
    await session.invalidate();
  }
}

// Middleware de autenticação
async function authenticateToken(req, res, next) {
  console.log('🔍 [Auth] Middleware de autenticação chamado');
  console.log('🔍 [Auth] Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔍 [Auth] Auth header:', authHeader);
  console.log('🔍 [Auth] Token extraído:', token ? 'Presente' : 'Ausente');

  if (!token) {
    console.log('❌ [Auth] Token não fornecido');
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido' 
    });
  }

  try {
    // Verificar token JWT
    console.log('🔍 [Auth] Verificando token JWT...');
    const decoded = verifyToken(token);
    console.log('🔍 [Auth] Token decodificado:', decoded);
    
    if (!decoded) {
      console.log('❌ [Auth] Token inválido');
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    // Buscar usuário diretamente pelo ID (temporário - sem verificação de sessão)
    console.log('🔍 [Auth] Buscando usuário com ID:', decoded.userId);
    const user = await User.findByPk(decoded.userId);
    console.log('🔍 [Auth] Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
      console.log('❌ [Auth] Usuário não encontrado');
      return res.status(401).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    console.log('✅ [Auth] Autenticação bem-sucedida para usuário:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [Auth] Erro na autenticação:', error);
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
}

// Middleware para verificar se é admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores.' 
    });
  }
}



module.exports = {
  generateToken,
  verifyToken,
  createUserSession,
  verifyUserSession,
  invalidateSession,
  authenticateToken,
  requireAdmin,

};
