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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido' 
    });
  }

  try {
    // Verificar token JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    // Verificar sessão no banco
    const user = await verifyUserSession(token);
    if (!user) {
      return res.status(401).json({ 
        error: 'Sessão expirada ou inválida' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
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
