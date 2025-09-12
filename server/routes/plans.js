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
    
    // Dados hardcoded temporariamente para resolver o problema
    const plans = [
      { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30, color: '#6c757d', css_class: 'basic' },
      { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30, color: '#007bff', css_class: 'premium' },
      { id: 3, name: 'vip', display_name: 'Plano VIP', type: 'vip', category: 'Básicos', price: 99.90, duration_days: 30, color: '#ffc107', css_class: 'vip' },
      { id: 4, name: 'pre-daily', display_name: 'Pré-Jogo Diário', type: 'pre-daily', category: 'Pré-Jogo', price: 19.90, duration_days: 1, color: '#28a745', css_class: 'pre-daily' },
      { id: 5, name: 'pre-weekly', display_name: 'Pré-Jogo Semanal', type: 'pre-weekly', category: 'Pré-Jogo', price: 39.90, duration_days: 7, color: '#28a745', css_class: 'pre-weekly' },
      { id: 6, name: 'pre-monthly', display_name: 'Pré-Jogo Mensal', type: 'pre-monthly', category: 'Pré-Jogo', price: 79.90, duration_days: 30, color: '#28a745', css_class: 'pre-monthly' },
      { id: 7, name: 'pre-yearly', display_name: 'Pré-Jogo Anual', type: 'pre-yearly', category: 'Pré-Jogo', price: 299.90, duration_days: 365, color: '#28a745', css_class: 'pre-yearly' },
      { id: 8, name: 'live-daily', display_name: 'Live Diário', type: 'live-daily', category: 'Live', price: 19.90, duration_days: 1, color: '#dc3545', css_class: 'live-daily' },
      { id: 9, name: 'live-weekly', display_name: 'Live Semanal', type: 'live-weekly', category: 'Live', price: 39.90, duration_days: 7, color: '#dc3545', css_class: 'live-weekly' },
      { id: 10, name: 'live-monthly', display_name: 'Live Mensal', type: 'live-monthly', category: 'Live', price: 79.90, duration_days: 30, color: '#dc3545', css_class: 'live-monthly' },
      { id: 11, name: 'live-yearly', display_name: 'Live Anual', type: 'live-yearly', category: 'Live', price: 299.90, duration_days: 365, color: '#dc3545', css_class: 'live-yearly' },
      { id: 12, name: 'prelive-daily', display_name: 'Pré+Live Diário', type: 'prelive-daily', category: 'Pré+Live', price: 29.90, duration_days: 1, color: '#6f42c1', css_class: 'prelive-daily' },
      { id: 13, name: 'prelive-weekly', display_name: 'Pré+Live Semanal', type: 'prelive-weekly', category: 'Pré+Live', price: 59.90, duration_days: 7, color: '#6f42c1', css_class: 'prelive-weekly' },
      { id: 14, name: 'prelive-monthly', display_name: 'Pré+Live Mensal', type: 'prelive-monthly', category: 'Pré+Live', price: 119.90, duration_days: 30, color: '#6f42c1', css_class: 'prelive-monthly' },
      { id: 15, name: 'prelive-yearly', display_name: 'Pré+Live Anual', type: 'prelive-yearly', category: 'Pré+Live', price: 399.90, duration_days: 365, color: '#6f42c1', css_class: 'prelive-yearly' },
      { id: 16, name: 'valuebet-daily', display_name: 'Valuebet Diário', type: 'valuebet-daily', category: 'Valuebet', price: 19.90, duration_days: 1, color: '#fd7e14', css_class: 'valuebet-daily' },
      { id: 17, name: 'valuebet-weekly', display_name: 'Valuebet Semanal', type: 'valuebet-weekly', category: 'Valuebet', price: 39.90, duration_days: 7, color: '#fd7e14', css_class: 'valuebet-weekly' },
      { id: 18, name: 'valuebet-monthly', display_name: 'Valuebet Mensal', type: 'valuebet-monthly', category: 'Valuebet', price: 79.90, duration_days: 30, color: '#fd7e14', css_class: 'valuebet-monthly' },
      { id: 19, name: 'valuebet-yearly', display_name: 'Valuebet Anual', type: 'valuebet-yearly', category: 'Valuebet', price: 299.90, duration_days: 365, color: '#fd7e14', css_class: 'valuebet-yearly' },
      { id: 20, name: 'full-daily', display_name: 'Full Diário', type: 'full-daily', category: 'Full', price: 39.90, duration_days: 1, color: '#20c997', css_class: 'full-daily' },
      { id: 21, name: 'full-weekly', display_name: 'Full Semanal', type: 'full-weekly', category: 'Full', price: 79.90, duration_days: 7, color: '#20c997', css_class: 'full-weekly' },
      { id: 22, name: 'full-monthly', display_name: 'Full Mensal', type: 'full-monthly', category: 'Full', price: 159.90, duration_days: 30, color: '#20c997', css_class: 'full-monthly' },
      { id: 23, name: 'full-yearly', display_name: 'Full Anual', type: 'full-yearly', category: 'Full', price: 599.90, duration_days: 365, color: '#20c997', css_class: 'full-yearly' }
    ];

    console.log(`✅ Encontrados ${plans.length} planos ativos (hardcoded)`);

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
