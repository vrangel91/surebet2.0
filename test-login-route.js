const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

// Simular a rota de login para testar
async function testLoginRoute() {
  try {
    console.log('🔍 Testando rota de login...\n');
    
    // Simular dados de requisição
    const req = {
      body: {
        email: 'admin@surestake.com',
        password: 'admin123'
      }
    };
    
    console.log('📤 Dados de entrada:', JSON.stringify(req.body, null, 2));
    
    // Validações básicas
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios');
    }
    
    console.log('✅ Validações básicas passaram');
    
    // Buscar usuário
    console.log('🔍 Buscando usuário no banco...');
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'password_hash', 'is_admin', 'is_vip', 'created_at']
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    console.log('   - ID:', user.id);
    console.log('   - Is Admin:', user.is_admin);
    console.log('   - Is VIP:', user.is_vip);
    
    // Verificar senha
    console.log('🔍 Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }
    
    console.log('✅ Senha válida');
    
    // Verificar privilégios
    if (!user.is_admin && !user.is_vip) {
      throw new Error('Usuário sem privilégios');
    }
    
    console.log('✅ Privilégios verificados');
    
    console.log('\n🎉 Teste da rota de login passou com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLoginRoute();
