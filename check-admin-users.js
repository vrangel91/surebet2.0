

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function checkAdminUsers() {
  console.log('🔍 Verificando usuários administradores no banco de dados SURESSTAKE...\n');
  
  try {
    // Configuração da conexão com o banco SURESSTAKE
    const sequelize = new Sequelize(
      process.env.DB_NAME || 'surestake',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados SURESSTAKE estabelecida\n');

    // Primeiro, verificar a estrutura real da tabela users
    console.log('📋 Estrutura da tabela users:');
    const [columns] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('\n🔍 Verificando se existe coluna is_admin...');
    
    // Verificar se a coluna is_admin existe
    const hasIsAdmin = columns.some(col => col.column_name === 'is_admin');
    
    if (hasIsAdmin) {
      console.log('✅ Coluna is_admin encontrada');
      
      // Consultar usuários administradores usando is_admin
      const [adminUsers] = await sequelize.query(`
        SELECT 
          id,
          username,
          email,
          first_name,
          last_name,
          is_admin,
          created_at
        FROM users 
        WHERE is_admin = true
        ORDER BY created_at DESC
      `);

      if (adminUsers.length === 0) {
        console.log('\n❌ Nenhum usuário administrador encontrado no banco de dados');
      } else {
        console.log(`\n✅ Encontrados ${adminUsers.length} usuário(s) administrador(es):\n`);
        
        adminUsers.forEach((user, index) => {
          console.log(`${index + 1}. Usuário Administrador:`);
          console.log(`   - ID: ${user.id}`);
          console.log(`   - Username: ${user.username || 'Não informado'}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Nome: ${user.first_name || 'Não informado'} ${user.last_name || 'Não informado'}`);
          console.log(`   - Is Admin: ${user.is_admin}`);
          console.log(`   - Criado em: ${user.created_at}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Coluna is_admin não encontrada');
    }
    
    // Listar todos os usuários para ver o que temos
    console.log('\n📋 Listando todos os usuários disponíveis:');
    const [allUsers] = await sequelize.query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        is_admin,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (allUsers.length === 0) {
      console.log('❌ Nenhum usuário encontrado na tabela');
    } else {
      console.log(`✅ Encontrados ${allUsers.length} usuário(s):\n`);
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. Usuário:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Username: ${user.username || 'Não informado'}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Nome: ${user.first_name || 'Não informado'} ${user.last_name || 'Não informado'}`);
        console.log(`   - Is Admin: ${user.is_admin}`);
        console.log(`   - Criado em: ${user.created_at}`);
        console.log('');
      });
    }

    // Verificar outros bancos disponíveis
    console.log('\n🔍 Verificando outros bancos de dados disponíveis...');
    const [databases] = await sequelize.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false 
      AND datname NOT IN ('postgres', 'template0', 'template1')
      ORDER BY datname
    `);

    if (databases.length > 0) {
      console.log('📋 Bancos de dados disponíveis:');
      databases.forEach(db => {
        console.log(`   - ${db.datname}`);
      });
    } else {
      console.log('❌ Nenhum banco de dados adicional encontrado');
    }

    await sequelize.close();
    console.log('\n✅ Consulta concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o PostgreSQL está rodando');
    } else if (error.code === '28P01') {
      console.log('\n💡 Dica: Verifique as credenciais do banco de dados');
    } else if (error.code === '3D000') {
      console.log('\n💡 Dica: Verifique se o banco de dados "surestake" existe');
    }
  }
}

// Executar consulta
checkAdminUsers();
