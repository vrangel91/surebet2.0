const { Plan } = require('../models');

const plansData = [
  // Planos Básicos
  {
    name: 'basic',
    display_name: 'Plano Básico',
    type: 'basic',
    category: 'Básico',
    price: 0.00,
    duration_days: 0,
    is_active: true,
    description: 'Plano gratuito com funcionalidades básicas',
    features: ['Acesso básico', 'Suporte por email'],
    color: '#6c757d',
    css_class: 'basic'
  },
  
  // Planos Pré-Jogo
  {
    name: 'pre-daily',
    display_name: 'Pré-Jogo Diário',
    type: 'pre-daily',
    category: 'Pré-Jogo',
    price: 9.90,
    duration_days: 1,
    is_active: true,
    description: 'Acesso a surebets de pré-jogo por 1 dia',
    features: ['Surebets pré-jogo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#17a2b8',
    css_class: 'pre-daily'
  },
  {
    name: 'pre-weekly',
    display_name: 'Pré-Jogo Semanal',
    type: 'pre-weekly',
    category: 'Pré-Jogo',
    price: 49.90,
    duration_days: 7,
    is_active: true,
    description: 'Acesso a surebets de pré-jogo por 7 dias',
    features: ['Surebets pré-jogo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#17a2b8',
    css_class: 'pre-weekly'
  },
  {
    name: 'pre-monthly',
    display_name: 'Pré-Jogo Mensal',
    type: 'pre-monthly',
    category: 'Pré-Jogo',
    price: 149.90,
    duration_days: 30,
    is_active: true,
    description: 'Acesso a surebets de pré-jogo por 30 dias',
    features: ['Surebets pré-jogo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#17a2b8',
    css_class: 'pre-monthly'
  },
  {
    name: 'pre-yearly',
    display_name: 'Pré-Jogo Anual',
    type: 'pre-yearly',
    category: 'Pré-Jogo',
    price: 1299.90,
    duration_days: 365,
    is_active: true,
    description: 'Acesso a surebets de pré-jogo por 365 dias',
    features: ['Surebets pré-jogo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#17a2b8',
    css_class: 'pre-yearly'
  },
  
  // Planos Live
  {
    name: 'live-daily',
    display_name: 'Live Diário',
    type: 'live-daily',
    category: 'Live',
    price: 19.90,
    duration_days: 1,
    is_active: true,
    description: 'Acesso a surebets ao vivo por 1 dia',
    features: ['Surebets ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#dc3545',
    css_class: 'live-daily'
  },
  {
    name: 'live-weekly',
    display_name: 'Live Semanal',
    type: 'live-weekly',
    category: 'Live',
    price: 99.90,
    duration_days: 7,
    is_active: true,
    description: 'Acesso a surebets ao vivo por 7 dias',
    features: ['Surebets ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#dc3545',
    css_class: 'live-weekly'
  },
  {
    name: 'live-monthly',
    display_name: 'Live Mensal',
    type: 'live-monthly',
    category: 'Live',
    price: 299.90,
    duration_days: 30,
    is_active: true,
    description: 'Acesso a surebets ao vivo por 30 dias',
    features: ['Surebets ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#dc3545',
    css_class: 'live-monthly'
  },
  {
    name: 'live-yearly',
    display_name: 'Live Anual',
    type: 'live-yearly',
    category: 'Live',
    price: 2599.90,
    duration_days: 365,
    is_active: true,
    description: 'Acesso a surebets ao vivo por 365 dias',
    features: ['Surebets ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#dc3545',
    css_class: 'live-yearly'
  },
  
  // Planos Pré+Live
  {
    name: 'prelive-daily',
    display_name: 'Pré+Live Diário',
    type: 'prelive-daily',
    category: 'Pré+Live',
    price: 24.90,
    duration_days: 1,
    is_active: true,
    description: 'Acesso completo a surebets pré-jogo e ao vivo por 1 dia',
    features: ['Surebets pré-jogo e ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#6f42c1',
    css_class: 'prelive-daily'
  },
  {
    name: 'prelive-weekly',
    display_name: 'Pré+Live Semanal',
    type: 'prelive-weekly',
    category: 'Pré+Live',
    price: 124.90,
    duration_days: 7,
    is_active: true,
    description: 'Acesso completo a surebets pré-jogo e ao vivo por 7 dias',
    features: ['Surebets pré-jogo e ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#6f42c1',
    css_class: 'prelive-weekly'
  },
  {
    name: 'prelive-monthly',
    display_name: 'Pré+Live Mensal',
    type: 'prelive-monthly',
    category: 'Pré+Live',
    price: 399.90,
    duration_days: 30,
    is_active: true,
    description: 'Acesso completo a surebets pré-jogo e ao vivo por 30 dias',
    features: ['Surebets pré-jogo e ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#6f42c1',
    css_class: 'prelive-monthly'
  },
  {
    name: 'prelive-yearly',
    display_name: 'Pré+Live Anual',
    type: 'prelive-yearly',
    category: 'Pré+Live',
    price: 3499.90,
    duration_days: 365,
    is_active: true,
    description: 'Acesso completo a surebets pré-jogo e ao vivo por 365 dias',
    features: ['Surebets pré-jogo e ao vivo', 'Atualizações em tempo real', 'Suporte prioritário'],
    color: '#6f42c1',
    css_class: 'prelive-yearly'
  },
  
  // Planos Valuebet
  {
    name: 'valuebet-daily',
    display_name: 'Valuebet Diário',
    type: 'valuebet-daily',
    category: 'Valuebet',
    price: 14.90,
    duration_days: 1,
    is_active: true,
    description: 'Acesso a valuebets por 1 dia',
    features: ['Valuebets', 'Análise de valor', 'Suporte prioritário'],
    color: '#ffc107',
    css_class: 'valuebet-daily'
  },
  {
    name: 'valuebet-weekly',
    display_name: 'Valuebet Semanal',
    type: 'valuebet-weekly',
    category: 'Valuebet',
    price: 74.90,
    duration_days: 7,
    is_active: true,
    description: 'Acesso a valuebets por 7 dias',
    features: ['Valuebets', 'Análise de valor', 'Suporte prioritário'],
    color: '#ffc107',
    css_class: 'valuebet-weekly'
  },
  {
    name: 'valuebet-monthly',
    display_name: 'Valuebet Mensal',
    type: 'valuebet-monthly',
    category: 'Valuebet',
    price: 249.90,
    duration_days: 30,
    is_active: true,
    description: 'Acesso a valuebets por 30 dias',
    features: ['Valuebets', 'Análise de valor', 'Suporte prioritário'],
    color: '#ffc107',
    css_class: 'valuebet-monthly'
  },
  {
    name: 'valuebet-yearly',
    display_name: 'Valuebet Anual',
    type: 'valuebet-yearly',
    category: 'Valuebet',
    price: 2199.90,
    duration_days: 365,
    is_active: true,
    description: 'Acesso a valuebets por 365 dias',
    features: ['Valuebets', 'Análise de valor', 'Suporte prioritário'],
    color: '#ffc107',
    css_class: 'valuebet-yearly'
  },
  
  // Planos Full
  {
    name: 'full-daily',
    display_name: 'Full Diário',
    type: 'full-daily',
    category: 'Full',
    price: 29.90,
    duration_days: 1,
    is_active: true,
    description: 'Acesso completo a todas as funcionalidades por 1 dia',
    features: ['Todas as funcionalidades', 'Suporte prioritário', 'Recursos premium'],
    color: '#28a745',
    css_class: 'full-daily'
  },
  {
    name: 'full-weekly',
    display_name: 'Full Semanal',
    type: 'full-weekly',
    category: 'Full',
    price: 149.90,
    duration_days: 7,
    is_active: true,
    description: 'Acesso completo a todas as funcionalidades por 7 dias',
    features: ['Todas as funcionalidades', 'Suporte prioritário', 'Recursos premium'],
    color: '#28a745',
    css_class: 'full-weekly'
  },
  {
    name: 'full-monthly',
    display_name: 'Full Mensal',
    type: 'full-monthly',
    category: 'Full',
    price: 499.90,
    duration_days: 30,
    is_active: true,
    description: 'Acesso completo a todas as funcionalidades por 30 dias',
    features: ['Todas as funcionalidades', 'Suporte prioritário', 'Recursos premium'],
    color: '#28a745',
    css_class: 'full-monthly'
  },
  {
    name: 'full-yearly',
    display_name: 'Full Anual',
    type: 'full-yearly',
    category: 'Full',
    price: 4499.90,
    duration_days: 365,
    is_active: true,
    description: 'Acesso completo a todas as funcionalidades por 365 dias',
    features: ['Todas as funcionalidades', 'Suporte prioritário', 'Recursos premium'],
    color: '#28a745',
    css_class: 'full-yearly'
  }
];

async function seedPlans() {
  try {
    console.log('🌱 Iniciando seed dos planos...');
    
    // Verificar se já existem planos
    const existingPlans = await Plan.count();
    if (existingPlans > 0) {
      console.log(`⚠️ Já existem ${existingPlans} planos no banco. Pulando seed.`);
      return;
    }
    
    // Inserir planos
    await Plan.bulkCreate(plansData);
    
    console.log(`✅ ${plansData.length} planos inseridos com sucesso!`);
    
    // Listar planos inseridos
    const insertedPlans = await Plan.findAll({
      order: [['category', 'ASC'], ['price', 'ASC']]
    });
    
    console.log('\n📋 Planos inseridos:');
    insertedPlans.forEach(plan => {
      console.log(`  - ${plan.display_name} (${plan.category}) - R$ ${plan.price}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inserir planos:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('✅ Seed concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = { seedPlans, plansData };
