/**
 * Rotas de Verificação de Planos - Versão Simplificada
 * Funcionalidade básica sem middleware complexo
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../utils/auth');

/**
 * GET /api/plan/status
 * Verificar status do plano do usuário
 */
router.get('/status', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        plan: user.account_type || 'basic',
        isActive: true,
        userId: user.id,
        isAdmin: user.is_admin || false
      }
    });
  } catch (error) {
    logger.error('Erro ao verificar status do plano:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/plan/features
 * Verificar funcionalidades disponíveis
 */
router.get('/features', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.is_admin || false;
    
    // Funcionalidades básicas para todos os usuários logados
    const features = {
      surebets: true,
      reports: true,
      compoundInterest: true,
      bookmakerAccounts: true,
      guide: true,
      glossary: true
    };
    
    res.json({
      success: true,
      data: {
        features,
        isAdmin
      }
    });
  } catch (error) {
    logger.error('Erro ao verificar funcionalidades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;