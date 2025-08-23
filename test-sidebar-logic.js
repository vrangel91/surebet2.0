// Teste da lógica dos getters do Vuex corrigidos
console.log('🧪 Testando lógica dos getters do Vuex...\n');

// Simular dados do usuário que vêm do backend
const mockUser = {
  id: 2,
  username: 'user_2',
  name: 'user_2',
  email: 'admin@surestake.com',
  is_admin: true,
  is_vip: true,
  role: 'admin',
  accountType: 'vip',
  credits: 999,
  status: 'active'
};

console.log('📊 Dados do usuário mock:');
console.log(JSON.stringify(mockUser, null, 2));

// Testar lógica dos getters corrigidos
console.log('\n🔍 Testando getters:');

// isAdmin
const isAdmin = mockUser?.is_admin === true;
console.log('   - isAdmin:', isAdmin, `(${mockUser.is_admin})`);

// isVIP
const isVIP = (() => {
  if (!mockUser) return false;
  if (mockUser.is_admin === true) return true;
  if (mockUser.is_vip === true) return true;
  return ['premium', 'vip'].includes(mockUser.accountType);
})();
console.log('   - isVIP:', isVIP, `(is_admin: ${mockUser.is_admin}, is_vip: ${mockUser.is_vip})`);

// canUseSystem
const canUseSystem = (() => {
  if (!mockUser) return false;
  if (mockUser.is_admin === true) return true;
  if (mockUser.is_vip === true) return true;
  
  const today = new Date().toDateString();
  const lastConsumption = mockUser.lastCreditConsumption 
    ? new Date(mockUser.lastCreditConsumption).toDateString() 
    : null;
  
  return lastConsumption === today || mockUser.credits > 0;
})();
console.log('   - canUseSystem:', canUseSystem);

console.log('\n✅ Teste concluído!');
console.log('🎯 Usuário deve ser reconhecido como ADMIN + VIP');
