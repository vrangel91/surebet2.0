const VIPService = require('./vipService');

/**
 * Middleware para verificar se o usuário tem acesso VIP
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
async function requireVIP(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'É necessário estar logado para acessar esta funcionalidade'
      });
    }

    const canAccess = await VIPService.canAccessVIP(userId);
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Esta funcionalidade é exclusiva para usuários VIP',
        requiredAccess: 'VIP',
        currentUser: {
          id: userId,
          hasVIP: false
        }
      });
    }

    // Adicionar informações VIP ao request para uso posterior
    req.userVIP = {
      hasAccess: true,
      userId: userId
    };

    next();
  } catch (error) {
    console.error('❌ Erro no middleware VIP:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar acesso VIP'
    });
  }
}

/**
 * Middleware para verificar se o usuário tem acesso Premium ou superior
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
async function requirePremium(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'É necessário estar logado para acessar esta funcionalidade'
      });
    }

    const vipStatus = await VIPService.checkVIPStatus(userId);
    
    // Permitir acesso para admin, premium e vip
    const allowedPlans = ['admin', 'premium', 'vip'];
    const hasAccess = vipStatus.hasVIP && (
      vipStatus.vipStatus?.isAdmin || 
      allowedPlans.includes(vipStatus.vipStatus?.planId)
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Esta funcionalidade é exclusiva para usuários Premium ou superior',
        requiredAccess: 'Premium',
        currentUser: {
          id: userId,
          hasVIP: vipStatus.hasVIP,
          planId: vipStatus.vipStatus?.planId || 'basic'
        }
      });
    }

    // Adicionar informações VIP ao request para uso posterior
    req.userVIP = {
      hasAccess: true,
      userId: userId,
      planId: vipStatus.vipStatus?.planId || 'basic',
      isAdmin: vipStatus.vipStatus?.isAdmin || false
    };

    next();
  } catch (error) {
    console.error('❌ Erro no middleware Premium:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar acesso Premium'
    });
  }
}

/**
 * Middleware para verificar se o usuário tem acesso VIP específico
 * @param {string} requiredPlan - Plano requerido (basic, premium, vip, admin)
 * @returns {Function} - Middleware function
 */
function requirePlan(requiredPlan) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          message: 'É necessário estar logado para acessar esta funcionalidade'
        });
      }

      const vipStatus = await VIPService.checkVIPStatus(userId);
      
      // Definir hierarquia de planos
      const planHierarchy = {
        'basic': 0,
        'premium': 1,
        'vip': 2,
        'admin': 3
      };

      const userPlan = vipStatus.vipStatus?.planId || 'basic';
      const userLevel = planHierarchy[userPlan] || 0;
      const requiredLevel = planHierarchy[requiredPlan] || 0;
      
      const hasAccess = vipStatus.hasVIP && userLevel >= requiredLevel;
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: `Esta funcionalidade requer plano ${requiredPlan} ou superior`,
          requiredAccess: requiredPlan,
          currentUser: {
            id: userId,
            hasVIP: vipStatus.hasVIP,
            planId: userPlan,
            userLevel: userLevel
          }
        });
      }

      // Adicionar informações VIP ao request para uso posterior
      req.userVIP = {
        hasAccess: true,
        userId: userId,
        planId: userPlan,
        userLevel: userLevel,
        isAdmin: vipStatus.vipStatus?.isAdmin || false
      };

      next();
    } catch (error) {
      console.error(`❌ Erro no middleware de plano ${requiredPlan}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao verificar acesso ao plano'
      });
    }
  };
}

/**
 * Middleware opcional para adicionar informações VIP ao request
 * Não bloqueia o acesso, apenas adiciona informações
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
async function optionalVIP(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      const vipStatus = await VIPService.checkVIPStatus(userId);
      
      req.userVIP = {
        hasAccess: vipStatus.hasVIP,
        userId: userId,
        planId: vipStatus.vipStatus?.planId || 'basic',
        isAdmin: vipStatus.vipStatus?.isAdmin || false,
        vipStatus: vipStatus.vipStatus
      };
    } else {
      req.userVIP = {
        hasAccess: false,
        userId: null,
        planId: 'basic',
        isAdmin: false,
        vipStatus: null
      };
    }

    next();
  } catch (error) {
    console.error('❌ Erro no middleware VIP opcional:', error);
    // Não falhar, apenas definir valores padrão
    req.userVIP = {
      hasAccess: false,
      userId: req.user?.id || null,
      planId: 'basic',
      isAdmin: false,
      vipStatus: null
    };
    next();
  }
}

/**
 * Middleware para verificar se o usuário tem VIP ativo (não expirado)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
async function requireActiveVIP(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'É necessário estar logado para acessar esta funcionalidade'
      });
    }

    const vipStatus = await VIPService.checkVIPStatus(userId);
    
    if (!vipStatus.hasVIP) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Esta funcionalidade é exclusiva para usuários VIP',
        requiredAccess: 'VIP Ativo',
        currentUser: {
          id: userId,
          hasVIP: false
        }
      });
    }

    // Verificar se o VIP não está expirado
    if (vipStatus.vipStatus?.isExpired) {
      return res.status(403).json({
        error: 'VIP Expirado',
        message: 'Seu VIP expirou. Renove para continuar acessando esta funcionalidade',
        requiredAccess: 'VIP Ativo',
        currentUser: {
          id: userId,
          hasVIP: true,
          isExpired: true,
          expiredAt: vipStatus.vipStatus.dataFim
        }
      });
    }

    // Adicionar informações VIP ao request para uso posterior
    req.userVIP = {
      hasAccess: true,
      userId: userId,
      planId: vipStatus.vipStatus?.planId || 'basic',
      isAdmin: vipStatus.vipStatus?.isAdmin || false,
      daysRemaining: vipStatus.vipStatus?.daysRemaining || 0,
      vipStatus: vipStatus.vipStatus
    };

    next();
  } catch (error) {
    console.error('❌ Erro no middleware VIP ativo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar VIP ativo'
    });
  }
}

module.exports = {
  requireVIP,
  requirePremium,
  requirePlan,
  optionalVIP,
  requireActiveVIP
};
