#!/usr/bin/env node

/**
 * Script simples para corrigir usuário admin
 */

const { User } = require('./models');
const bcrypt = require('bcrypt');

async function fixAdminUser() {
  try {
    console.log('🔧 Corrigindo usuário admin...');
    
    // Buscar usuário admin
    const adminUser = await User.findOne({
      where: { email: 'admin@surebets.com' }
    });
    
    if (adminUser) {
      console.log(`✅ Usuário encontrado: ${adminUser.email}`);
      
      // Tornar admin
      await adminUser.update({ is_admin: true });
      console.log('✅ Usuário agora é admin');
      
      // Definir senha
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await adminUser.update({ password: hashedPassword });
      console.log('✅ Senha definida: admin123');
      
      console.log('\n🎯 Usuário admin corrigido!');
      console.log('📧 Email: admin@surestake.com');
      console.log('🔑 Senha: admin123');
      
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

fixAdminUser();
