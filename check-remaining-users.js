const axios = require('axios');

async function checkRemainingUsers() {
  try {
    console.log('🔍 Verificando usuários restantes...\n');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    // Listar usuários
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = usersResponse.data.users;
    console.log(`📊 Total de usuários: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Is Admin: ${user.is_admin}`);
      console.log(`   - Is VIP: ${user.is_vip}`);
    });
    
    const adminUsers = users.filter(u => u.is_admin);
    const regularUsers = users.filter(u => !u.is_admin);
    
    console.log(`\n📋 Resumo:`);
    console.log(`   - Administradores: ${adminUsers.length}`);
    console.log(`   - Usuários regulares: ${regularUsers.length}`);
    
    if (regularUsers.length === 0) {
      console.log('\n⚠️ Não há usuários regulares para deletar');
      console.log('💡 Para testar a exclusão, você precisa criar um usuário primeiro');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
}

checkRemainingUsers();
