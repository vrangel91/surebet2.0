#!/usr/bin/env node

/**
 * Script para corrigir problemas em produção
 */

const { User, Notification, sequelize } = require('../models');
const bcrypt = require('bcrypt');

async function fixProductionIssues() {
  try {
    console.log('🔧 Iniciando correção de problemas em produção...\n');
    
    // 1. Verificar e corrigir usuário admin
    console.log('📋 1. Verificando usuário admin...');
    const adminUser = await User.findOne({
      where: { email: 'admin@surebets.com' }
    });
    
    if (adminUser) {
      console.log(`✅ Usuário admin encontrado: ${adminUser.email}`);
      
      // Verificar se é admin
      if (!adminUser.is_admin) {
        console.log('🔧 Tornando usuário admin...');
        await adminUser.update({ is_admin: true });
        console.log('✅ Usuário agora é admin');
      } else {
        console.log('✅ Usuário já é admin');
      }
      
      // Verificar senha
      if (!adminUser.password || adminUser.password.length < 10) {
        console.log('🔧 Definindo senha padrão...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await adminUser.update({ password: hashedPassword });
        console.log('✅ Senha definida: admin123');
      } else {
        console.log('✅ Senha já configurada');
      }
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
    // 2. Verificar tabela de notificações
    console.log('\n📋 2. Verificando tabela de notificações...');
    try {
      await Notification.sync({ alter: true });
      console.log('✅ Tabela de notificações sincronizada');
    } catch (error) {
      console.log('⚠️ Erro ao sincronizar notificações:', error.message);
    }
    
    // 3. Verificar conexão com banco
    console.log('\n📋 3. Verificando conexão com banco...');
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com banco OK');
    } catch (error) {
      console.log('❌ Erro de conexão:', error.message);
    }
    
    // 4. Verificar se há notificações
    console.log('\n📋 4. Verificando notificações...');
    try {
      const notificationCount = await Notification.count();
      console.log(`✅ ${notificationCount} notificações encontradas`);
    } catch (error) {
      console.log('⚠️ Erro ao contar notificações:', error.message);
    }
    
    console.log('\n🎯 Correções concluídas!');
    console.log('\n📊 Resumo:');
    console.log('- Usuário admin: admin@surebets.com');
    console.log('- Senha: admin123');
    console.log('- Execute: pm2 restart surestake');
    
  } catch (error) {
    console.error('❌ Erro durante correções:', error.message);
    console.error('📋 Detalhes:', error);
  } finally {
    process.exit(0);
  }
}

fixProductionIssues();
