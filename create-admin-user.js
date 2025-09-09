require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('🔧 Criando usuário administrador...\n');
  
  try {
    // Configuração da conexão com o banco SURESTAKE
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
    console.log('✅ Conexão com banco de dados SURESTAKE estabelecida\n');

    // Dados do administrador
    const adminData = {
      username: 'admin',
      email: 'admin@surestake.com',
      password: 'admin123',
      first_name: 'Administrador',
      last_name: 'Sistema',
      is_admin: true,
      is_vip: true
    };

    // Gerar hash da senha
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Verificar se já existe um usuário com esse email
    const [existingUser] = await sequelize.query(`
      SELECT id, username, email, is_admin 
      FROM users 
      WHERE email = '${adminData.email}'
    `);

    if (existingUser.length > 0) {
      console.log('⚠️  Usuário já existe com este email. Promovendo a administrador...');
      
      // Atualizar usuário existente para administrador
      await sequelize.query(`
        UPDATE users 
        SET is_admin = true, 
            is_vip = true,
            account_type = 'vip',
            first_name = '${adminData.first_name}',
            last_name = '${adminData.last_name}',
            password_hash = '${passwordHash}',
            updated_at = NOW()
        WHERE email = '${adminData.email}'
      `);

      console.log('✅ Usuário promovido a administrador com sucesso!');
      console.log(`   - Email: ${adminData.email}`);
      console.log(`   - Senha: ${adminData.password}`);
      console.log(`   - Username: ${existingUser[0].username}`);

    } else {
      console.log('➕ Criando novo usuário administrador...');

      // Criar novo usuário administrador
      await sequelize.query(`
        INSERT INTO users (
          username, 
          email, 
          password_hash, 
          first_name, 
          last_name, 
          is_admin, 
          is_vip,
          account_type,
          created_at,
          updated_at
        ) VALUES (
          '${adminData.username}',
          '${adminData.email}',
          '${passwordHash}',
          '${adminData.first_name}',
          '${adminData.last_name}',
          ${adminData.is_admin},
          ${adminData.is_vip},
          'vip',
          NOW(),
          NOW()
        )
      `);

      console.log('✅ Usuário administrador criado com sucesso!');
      console.log(`   - Username: ${adminData.username}`);
      console.log(`   - Email: ${adminData.email}`);
      console.log(`   - Senha: ${adminData.password}`);
    }

    // Verificar se foi criado/atualizado com sucesso
    const [adminUser] = await sequelize.query(`
      SELECT id, username, email, first_name, last_name, is_admin, is_vip, account_type, created_at
      FROM users 
      WHERE email = '${adminData.email}'
    `);

    if (adminUser.length > 0) {
      console.log('\n🎉 Administrador configurado:');
      console.log(`   - ID: ${adminUser[0].id}`);
      console.log(`   - Username: ${adminUser[0].username}`);
      console.log(`   - Email: ${adminUser[0].email}`);
      console.log(`   - Nome: ${adminUser[0].first_name} ${adminUser[0].last_name}`);
      console.log(`   - Is Admin: ${adminUser[0].is_admin}`);
      console.log(`   - Is VIP: ${adminUser[0].is_vip}`);
      console.log(`   - Account Type: ${adminUser[0].account_type}`);
      console.log(`   - Criado em: ${adminUser[0].created_at}`);
    }

    await sequelize.close();
    console.log('\n✅ Operação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message);
  }
}

// Executar criação
createAdminUser();
