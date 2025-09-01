const { sequelize } = require('../config/database');

async function initReferralSystem() {
  try {
    console.log('🚀 Inicializando sistema de referências...\n');
    
    // Adicionar colunas para sistema de referências
    console.log('📊 Adicionando colunas para sistema de referências...');
    
    // Verificar se as colunas já existem
    const tableInfo = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `);
    
    const existingColumns = tableInfo[0].map(col => col.column_name);
    console.log('Colunas existentes:', existingColumns);
    
    // Adicionar referral_code se não existir
    if (!existingColumns.includes('referral_code')) {
      console.log('➕ Adicionando coluna referral_code...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN referral_code VARCHAR(8) UNIQUE
      `);
      console.log('✅ Coluna referral_code adicionada com sucesso');
    } else {
      console.log('✅ Coluna referral_code já existe');
    }
    
    // Adicionar referred_by se não existir
    if (!existingColumns.includes('referred_by')) {
      console.log('➕ Adicionando coluna referred_by...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN referred_by INTEGER REFERENCES users(id)
      `);
      console.log('✅ Coluna referred_by adicionada com sucesso');
    } else {
      console.log('✅ Coluna referred_by já existe');
    }
    
    // Adicionar commission_balance se não existir
    if (!existingColumns.includes('commission_balance')) {
      console.log('➕ Adicionando coluna commission_balance...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN commission_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL
      `);
      console.log('✅ Coluna commission_balance adicionada com sucesso');
    } else {
      console.log('✅ Coluna commission_balance já existe');
    }
    
    // Criar índices para performance
    console.log('\n🔍 Criando índices para performance...');
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)
      `);
      console.log('✅ Índice para referral_code criado');
    } catch (error) {
      console.log('ℹ️ Índice para referral_code já existe ou erro:', error.message);
    }
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)
      `);
      console.log('✅ Índice para referred_by criado');
    } catch (error) {
      console.log('ℹ️ Índice para referred_by já existe ou erro:', error.message);
    }
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_users_commission_balance ON users(commission_balance)
      `);
      console.log('✅ Índice para commission_balance criado');
    } catch (error) {
      console.log('ℹ️ Índice para commission_balance já existe ou erro:', error.message);
    }
    
    // Gerar códigos de referência para usuários existentes que não possuem
    console.log('\n🎯 Gerando códigos de referência para usuários existentes...');
    
    const usersWithoutCode = await sequelize.query(`
      SELECT id, username, email 
      FROM users 
      WHERE referral_code IS NULL
    `);
    
    if (usersWithoutCode[0].length > 0) {
      console.log(`📝 ${usersWithoutCode[0].length} usuários precisam de código de referência`);
      
      for (const user of usersWithoutCode[0]) {
        const referralCode = generateReferralCode();
        
        await sequelize.query(`
          UPDATE users 
          SET referral_code = :referralCode 
          WHERE id = :userId
        `, {
          replacements: { 
            referralCode, 
            userId: user.id 
          }
        });
        
        console.log(`✅ Usuário ${user.username || user.email} recebeu código: ${referralCode}`);
      }
    } else {
      console.log('✅ Todos os usuários já possuem código de referência');
    }
    
    console.log('\n🎉 Sistema de referências inicializado com sucesso!');
    console.log('\n📋 Resumo das funcionalidades:');
    console.log('   ✅ Códigos de referência únicos para cada usuário');
    console.log('   ✅ Sistema de indicações (referred_by)');
    console.log('   ✅ Saldo de comissões');
    console.log('   ✅ Índices otimizados para performance');
    console.log('   ✅ APIs RESTful para gerenciamento');
    
    console.log('\n🔗 Endpoints disponíveis:');
    console.log('   GET    /api/referrals/my-status - Status de referências');
    console.log('   POST   /api/referrals/withdraw - Solicitar saque');
    console.log('   GET    /api/referrals/history - Histórico de saques');
    
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Testar APIs de referências');
    console.log('   2. Implementar sistema de pagamento PIX');
    console.log('   3. Configurar notificações de comissões');
    console.log('   4. Implementar dashboard administrativo');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de referências:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Função para gerar código de referência único
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Executar se chamado diretamente
if (require.main === module) {
  initReferralSystem();
}

module.exports = { initReferralSystem };

