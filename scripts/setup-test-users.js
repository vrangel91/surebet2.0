/**
 * Script para Configuração de Usuários de Teste
 * Cria usuários de teste em lote para os testes de performance
 */

const axios = require('axios');

class TestUserSetup {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.maxUsers = config.maxUsers || 1000;
    this.batchSize = config.batchSize || 50;
    this.createdUsers = 0;
    this.errors = [];
  }

  /**
   * Executa configuração completa de usuários de teste
   */
  async setup() {
    console.log('👥 CONFIGURANDO USUÁRIOS DE TESTE');
    console.log('=================================');
    console.log(`📊 Máximo de usuários: ${this.maxUsers}`);
    console.log(`📦 Tamanho do lote: ${this.batchSize}`);
    console.log('');

    try {
      // 1. Verificar se o servidor está rodando
      await this.checkServerHealth();
      
      // 2. Criar usuários de teste em lotes
      await this.createTestUsersInBatches();
      
      // 3. Relatório final
      this.generateSetupReport();
      
    } catch (error) {
      console.error('❌ Erro durante configuração:', error.message);
      process.exit(1);
    }
  }

  /**
   * Verifica se o servidor está rodando
   */
  async checkServerHealth() {
    try {
      console.log('🔍 Verificando servidor...');
      const response = await axios.get(`${this.baseUrl}/api/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Servidor está rodando e respondendo');
      } else {
        throw new Error(`Servidor retornou status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Servidor não está acessível: ${error.message}`);
    }
  }

  /**
   * Cria usuários de teste em lotes
   */
  async createTestUsersInBatches() {
    const totalBatches = Math.ceil(this.maxUsers / this.batchSize);
    
    console.log(`🔄 Criando usuários em ${totalBatches} lotes de ${this.batchSize} usuários...`);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startUser = batchIndex * this.batchSize;
      const endUser = Math.min(startUser + this.batchSize, this.maxUsers);
      
      console.log(`📦 Lote ${batchIndex + 1}/${totalBatches}: usuários ${startUser} a ${endUser - 1}`);
      
      await this.createBatch(startUser, endUser);
      
      // Pequena pausa entre lotes para não sobrecarregar o servidor
      if (batchIndex < totalBatches - 1) {
        await this.sleep(1000);
      }
    }
  }

  /**
   * Cria um lote de usuários
   */
  async createBatch(startUser, endUser) {
    const promises = [];
    
    for (let i = startUser; i < endUser; i++) {
      promises.push(this.createTestUser(i));
    }
    
    // Executar criação em paralelo
    const results = await Promise.allSettled(promises);
    
    // Processar resultados
    results.forEach((result, index) => {
      const userIndex = startUser + index;
      if (result.status === 'fulfilled') {
        this.createdUsers++;
      } else {
        this.errors.push({
          user: `testuser${userIndex}@example.com`,
          error: result.reason.message
        });
      }
    });
    
    console.log(`  ✅ Lote concluído: ${this.createdUsers} usuários criados até agora`);
  }

  /**
   * Cria um usuário de teste específico
   */
  async createTestUser(userIndex) {
    try {
      await axios.post(`${this.baseUrl}/api/auth/register`, {
        email: `testuser${userIndex}@example.com`,
        password: 'testpassword123',
        name: `Test User ${userIndex}`,
        isTestUser: true
      });
      
    } catch (error) {
      // Se usuário já existe (409), é OK
      if (error.response && error.response.status === 409) {
        // Usuário já existe, não é erro
        return;
      }
      
      // Outros erros são problemas
      throw new Error(`Erro ao criar usuário ${userIndex}: ${error.message}`);
    }
  }

  /**
   * Cria usuários de estresse
   */
  async createStressUsers() {
    console.log('\n🔥 Criando usuários de estresse...');
    
    const stressUserCount = Math.min(500, this.maxUsers);
    
    for (let i = 0; i < stressUserCount; i++) {
      try {
        await axios.post(`${this.baseUrl}/api/auth/register`, {
          email: `stressuser${i}@example.com`,
          password: 'stresspassword123',
          name: `Stress User ${i}`,
          isTestUser: true
        });
        
        if (i % 50 === 0) {
          console.log(`  📊 Usuários de estresse criados: ${i + 1}/${stressUserCount}`);
        }
        
      } catch (error) {
        if (!(error.response && error.response.status === 409)) {
          this.errors.push({
            user: `stressuser${i}@example.com`,
            error: error.message
          });
        }
      }
    }
    
    console.log(`✅ ${stressUserCount} usuários de estresse configurados`);
  }

  /**
   * Gera relatório de configuração
   */
  generateSetupReport() {
    console.log('\n📋 RELATÓRIO DE CONFIGURAÇÃO');
    console.log('============================');
    console.log(`✅ Usuários criados: ${this.createdUsers}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERROS DETALHADOS:');
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error.user}: ${error.error}`);
      });
      
      if (this.errors.length > 10) {
        console.log(`... e mais ${this.errors.length - 10} erros`);
      }
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Execute os testes: npm run test:performance');
    console.log('2. Limpe usuários após testes: npm run test:cleanup');
    
    if (this.createdUsers > 0) {
      console.log('\n✅ Configuração de usuários de teste concluída!');
    } else {
      console.log('\n⚠️ Nenhum usuário de teste foi criado');
    }
  }

  /**
   * Utilitário para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  const setup = new TestUserSetup();
  setup.setup().catch(console.error);
}

module.exports = TestUserSetup;
