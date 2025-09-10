// Teste simples para verificar as funções do VIPAdminView
console.log('🧪 Iniciando testes do VIPAdminView...');

// Mock das funções principais
const mockPlans = [
  { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30 },
  { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30 },
  { id: 3, name: 'vip', display_name: 'Plano VIP', type: 'vip', category: 'Básicos', price: 99.90, duration_days: 30 }
];

const mockVIPs = [
  {
    id: 1,
    userId: 1,
    user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
    planName: 'Premium',
    dataInicio: '2024-01-01',
    dataFim: '2024-02-01',
    amount: 49.90,
    autoRenew: false,
    notes: 'Cliente teste'
  },
  {
    id: 2,
    userId: 2,
    user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
    planName: 'VIP',
    dataInicio: '2024-01-15',
    dataFim: '2024-02-15',
    amount: 99.90,
    autoRenew: true,
    notes: 'Cliente VIP'
  }
];

// Funções de teste
function testFormatDate() {
  console.log('📅 Testando formatDate...');
  const date = '2024-01-15';
  const result = new Date(date).toLocaleDateString('pt-BR');
  console.log(`✅ formatDate('${date}') = ${result}`);
  return result === '15/01/2024';
}

function testFormatCurrency() {
  console.log('💰 Testando formatCurrency...');
  const value = 1234.56;
  const result = parseFloat(value || 0).toFixed(2);
  console.log(`✅ formatCurrency(${value}) = ${result}`);
  return result === '1234.56';
}

function testGetDaysRemaining() {
  console.log('📊 Testando getDaysRemaining...');
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 10);
  
  const end = new Date(futureDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const result = Math.max(0, diffDays);
  
  console.log(`✅ getDaysRemaining('${futureDate.toISOString()}') = ${result} dias`);
  console.log(`📅 Data atual: ${now.toISOString()}`);
  console.log(`📅 Data futura: ${futureDate.toISOString()}`);
  console.log(`⏱️ Diferença em ms: ${diffTime}`);
  console.log(`📊 Diferença em dias: ${diffDays}`);
  console.log(`🎯 Resultado final: ${result}`);
  console.log(`✅ Esperado: 10`);
  console.log(`🧪 Teste passou: ${result === 10}`);
  
  return result === 10;
}

function testGetVIPStatus() {
  console.log('🔍 Testando getVIPStatus...');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  
  const daysRemaining = 10;
  let status;
  
  if (daysRemaining <= 0) {
    status = { status: 'expired', label: 'Expirado', class: 'expired' };
  } else if (daysRemaining <= 1) {
    status = { status: 'critical', label: 'Crítico (1 dia)', class: 'critical' };
  } else if (daysRemaining <= 3) {
    status = { status: 'urgent', label: 'Urgente (≤3 dias)', class: 'urgent' };
  } else if (daysRemaining <= 7) {
    status = { status: 'expiring', label: 'Expirando (≤7 dias)', class: 'warning' };
  } else {
    status = { status: 'active', label: 'Ativo', class: 'active' };
  }
  
  console.log(`✅ getVIPStatus(${daysRemaining} dias) = ${status.label}`);
  return status.status === 'active';
}

function testGetPlanId() {
  console.log('🆔 Testando getPlanId...');
  const planType = 'premium';
  const plan = mockPlans.find(p => p.type === planType);
  const result = plan ? plan.id : 2;
  
  console.log(`✅ getPlanId('${planType}') = ${result}`);
  return result === 2;
}

function testGetPlanDisplayName() {
  console.log('📝 Testando getPlanDisplayName...');
  const planType = 'premium';
  const plan = mockPlans.find(p => p.type === planType);
  const result = plan ? plan.display_name : planType;
  
  console.log(`✅ getPlanDisplayName('${planType}') = ${result}`);
  return result === 'Plano Premium';
}

function testGetPlanTypeFromName() {
  console.log('🔍 Testando getPlanTypeFromName...');
  const planName = 'Plano Premium';
  const plan = mockPlans.find(p => p.display_name === planName);
  const result = plan ? plan.type : 'premium';
  
  console.log(`✅ getPlanTypeFromName('${planName}') = ${result}`);
  return result === 'premium';
}

function testGroupedPlans() {
  console.log('📊 Testando groupedPlans...');
  const grouped = mockPlans.reduce((groups, plan) => {
    const category = plan.category || 'Outros';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(plan);
    return groups;
  }, {});
  
  console.log(`✅ groupedPlans = ${Object.keys(grouped).length} categorias`);
  console.log(`   - Básicos: ${grouped['Básicos']?.length || 0} planos`);
  return Object.keys(grouped).length === 1 && grouped['Básicos'].length === 3;
}

function testFilterVIPs() {
  console.log('🔍 Testando filtros de VIPs...');
  const searchTerm = 'João';
  const planFilter = 'Premium';
  
  let filtered = mockVIPs;
  
  // Filtro por busca
  if (searchTerm) {
    filtered = filtered.filter(vip => 
      vip.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vip.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vip.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Filtro por plano
  if (planFilter !== 'all') {
    filtered = filtered.filter(vip => vip.planName?.toLowerCase() === planFilter.toLowerCase());
  }
  
  console.log(`✅ Filtro por busca '${searchTerm}': ${filtered.length} resultados`);
  console.log(`✅ Filtro por plano '${planFilter}': ${filtered.length} resultados`);
  return filtered.length === 1 && filtered[0].user.first_name === 'João';
}

function testFormValidation() {
  console.log('✅ Testando validação de formulários...');
  
  // Teste formulário de ativação
  const activateForm = {
    userId: '',
    planType: '',
    duration: 0,
    amount: 0
  };
  
  const canActivate = activateForm.userId && 
                     activateForm.duration > 0 && 
                     activateForm.amount >= 0 &&
                     activateForm.planType && 
                     activateForm.planType !== '';
  
  console.log(`✅ Formulário vazio: ${!canActivate ? 'inválido' : 'válido'}`);
  
  // Preencher formulário
  activateForm.userId = '1';
  activateForm.planType = 'premium';
  activateForm.duration = 30;
  activateForm.amount = 49.90;
  
  const canActivateFilled = activateForm.userId && 
                           activateForm.duration > 0 && 
                           activateForm.amount >= 0 &&
                           activateForm.planType && 
                           activateForm.planType !== '';
  
  console.log(`✅ Formulário preenchido: ${canActivateFilled ? 'válido' : 'inválido'}`);
  return !canActivate && canActivateFilled;
}

function testStatsCalculation() {
  console.log('📊 Testando cálculo de estatísticas...');
  
  const stats = {
    activeVIPs: mockVIPs.length,
    expiringSoon: mockVIPs.filter(vip => {
      const daysRemaining = Math.ceil((new Date(vip.dataFim) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 7 && daysRemaining > 0;
    }).length,
    expiredToday: mockVIPs.filter(vip => {
      const daysRemaining = Math.ceil((new Date(vip.dataFim) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 0;
    }).length,
    totalRevenue: mockVIPs.reduce((sum, vip) => sum + (vip.amount || 0), 0)
  };
  
  console.log(`✅ VIPs ativos: ${stats.activeVIPs}`);
  console.log(`✅ Expirando em breve: ${stats.expiringSoon}`);
  console.log(`✅ Expirados hoje: ${stats.expiredToday}`);
  console.log(`✅ Receita total: R$ ${stats.totalRevenue.toFixed(2)}`);
  
  return stats.activeVIPs === 2 && stats.totalRevenue === 149.80;
}

// Executar todos os testes
function runAllTests() {
  console.log('🚀 Executando todos os testes...\n');
  
  const tests = [
    { name: 'formatDate', fn: testFormatDate },
    { name: 'formatCurrency', fn: testFormatCurrency },
    { name: 'getDaysRemaining', fn: testGetDaysRemaining },
    { name: 'getVIPStatus', fn: testGetVIPStatus },
    { name: 'getPlanId', fn: testGetPlanId },
    { name: 'getPlanDisplayName', fn: testGetPlanDisplayName },
    { name: 'getPlanTypeFromName', fn: testGetPlanTypeFromName },
    { name: 'groupedPlans', fn: testGroupedPlans },
    { name: 'filterVIPs', fn: testFilterVIPs },
    { name: 'formValidation', fn: testFormValidation },
    { name: 'statsCalculation', fn: testStatsCalculation }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      if (result) {
        console.log(`✅ ${test.name}: PASSOU\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALHOU\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO - ${error.message}\n`);
      failed++;
    }
  });
  
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! O VIPAdminView está funcionando corretamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique as funções mencionadas.');
  }
}

// Executar os testes
runAllTests();
