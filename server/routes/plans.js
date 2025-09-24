const express = require('express');
const router = express.Router();

// Importar modelo Plan
let Plan;
try {
  const models = require('../models');
  Plan = models.Plan;
  console.log('✅ Modelo Plan importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar modelo Plan:', error);
  process.exit(1);
}

// Rota de teste simples
router.get('/test', (req, res) => {
  console.log('🔍 [PLANS API] Rota /test executada');
  res.json({ message: 'Teste funcionando!' });
});

// GET /api/plans - Buscar todos os planos ativos
router.get('/', async (req, res) => {
  try {
    console.log('🔍 [PLANS API] Rota / executada - Buscando planos ativos...');
    
    // Buscar planos do banco de dados
    const { Plan } = require('../models');
    
    const plans = await Plan.findAll({
      where: { is_active: true },
      order: [
        ['category', 'ASC'],
        ['duration_days', 'ASC'],
        ['price', 'ASC']
      ]
    });

    console.log(`✅ Encontrados ${plans.length} planos ativos no banco de dados`);

    res.json({
      success: true,
      plans: plans,
      count: plans.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/plans/categories - Buscar categorias de planos
router.get('/categories', async (req, res) => {
  try {
    console.log('🔍 Buscando categorias de planos...');
    
    const categories = await Plan.findAll({
      attributes: ['category'],
      where: {
        is_active: true
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(cat => cat.category);

    console.log(`✅ Encontradas ${categoryList.length} categorias:`, categoryList);

    res.json({
      success: true,
      data: categoryList,
      count: categoryList.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/plans/:id - Buscar plano específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando plano ID: ${id}`);
    
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    console.log(`✅ Plano encontrado: ${plan.display_name}`);

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('❌ Erro ao buscar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;
