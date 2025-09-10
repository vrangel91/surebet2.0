const axios = require('axios');

async function testAccountTypeAPI() {
  console.log('🧪 Testando API de atualização de tipo de conta...');
  
  try {
    // 1. Primeiro, fazer login para obter um token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Falha no login:', loginResponse.data.error);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Configurar headers para requisições autenticadas
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Buscar usuários para ver os tipos atuais
    console.log('\n📊 Buscando usuários...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', { headers });
    
    if (!usersResponse.data.success) {
      console.log('❌ Falha ao buscar usuários:', usersResponse.data.error);
      return;
    }

    console.log(`✅ ${usersResponse.data.users.length} usuários encontrados`);

    // Mostrar alguns usuários
    usersResponse.data.users.slice(0, 3).forEach(user => {
      console.log(`  ID: ${user.id} | ${user.name} | Tipo: ${user.account_type}`);
    });

    // 3. Testar atualização de tipo de conta
    if (usersResponse.data.users.length > 0) {
      const testUser = usersResponse.data.users[0];
      const newAccountType = testUser.account_type === 'basic' ? 'premium' : 'basic';
      
      console.log(`\n🔄 Testando atualização do usuário ID ${testUser.id} de '${testUser.account_type}' para '${newAccountType}'...`);
      
      const updateResponse = await axios.put(`http://localhost:3001/api/users/${testUser.id}`, {
        account_type: newAccountType
      }, { headers });

      console.log('✅ Atualização realizada com sucesso!');
      console.log(`  Resposta:`, updateResponse.data);

      // 4. Verificar se a atualização foi persistida
      console.log('\n🔍 Verificando se a atualização foi persistida...');
      const verifyResponse = await axios.get(`http://localhost:3001/api/users/${testUser.id}`, { headers });

      console.log(`  Tipo de conta atual: ${verifyResponse.data.user.account_type}`);
      
      if (verifyResponse.data.user.account_type === newAccountType) {
        console.log('✅ Verificação: Dados persistidos corretamente!');
      } else {
        console.log('❌ Verificação: Dados não foram persistidos corretamente');
      }

      // 5. Reverter para o valor original
      console.log(`\n🔄 Revertendo para o valor original: '${testUser.account_type}'...`);
      const revertResponse = await axios.put(`http://localhost:3001/api/users/${testUser.id}`, {
        account_type: testUser.account_type
      }, { headers });

      console.log('✅ Revertido com sucesso');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(() => {
  testAccountTypeAPI();
}, 3000);
