#!/usr/bin/env node

const { User } = require('./models');

async function fixAdmin() {
  try {
    console.log('🔍 Procurando admin@surestake.com...');
    
    const admin = await User.findOne({
      where: { email: 'admin@surestake.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin não encontrado');
      return;
    }
    
    console.log('✅ Admin encontrado:');
    console.log('  ID:', admin.id);
    console.log('  Email:', admin.email);
    console.log('  Account Type:', admin.account_type);
    console.log('  Is Admin:', admin.is_admin);
    console.log('  Is VIP:', admin.is_vip);
    
    // Alterar para VIP para ter acesso completo
    await admin.update({
      account_type: 'vip',
      is_vip: true
    });
    
    console.log('✅ Admin atualizado para VIP!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

fixAdmin();

