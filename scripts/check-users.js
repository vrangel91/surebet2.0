#!/usr/bin/env node

/**
 * Script para verificar usuários no banco de dados
 */

const { User } = require('../models');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n');
    
    // Buscar todos os usuários
    const users = await User.findAll({
      attributes: ['id', 'email', 'username', 'is_admin', 'is_vip', 'status', 'created_at']
    });
    
    console.log(`📊 Total de usuários encontrados: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
      console.log('💡 Execute: node create-admin-user.js para criar um usuário admin');
      return;
    }
    
    // Listar usuários
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Admin: ${user.is_admin ? '✅' : '❌'}`);
      console.log(`   VIP: ${user.is_vip ? '✅' : '❌'}`);
      console.log(`   Status: ${user.status || 'N/A'}`);
      console.log(`   Criado: ${user.created_at}`);
      console.log('');
    });
    
    // Verificar se há usuários admin
    const adminUsers = users.filter(user => user.is_admin);
    if (adminUsers.length === 0) {
      console.log('⚠️ Nenhum usuário admin encontrado!');
      console.log('💡 Execute: node create-admin-user.js para criar um usuário admin');
    } else {
      console.log(`✅ ${adminUsers.length} usuário(s) admin encontrado(s)`);
    }
    
    // Verificar se há usuários ativos
    const activeUsers = users.filter(user => user.status === 'active' || !user.status);
    console.log(`✅ ${activeUsers.length} usuário(s) ativo(s)`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message);
    console.error('📋 Detalhes:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
