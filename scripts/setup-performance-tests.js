#!/usr/bin/env node

/**
 * Script de Configuração para Testes de Performance
 * Instala dependências e configura ambiente para testes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceTestSetup {
  constructor() {
    this.requiredPackages = [
      'axios',
      'ws',
      'child_process'
    ];
    
    this.testConfig = {
      baseUrl: 'http://localhost:3001',
      wsUrl: 'ws://localhost:3002',
      outputDir: './test-results',
      scenarios: {
        load: {
          users: [10, 50, 100, 200],
          duration: 120000 // 2 minutos
        },
        stress: {
          users: [300, 500, 1000],
          duration: 300000 // 5 minutos
        }
      }
    };
  }

  /**
   * Executa configuração completa
   */
  async setup() {
    console.log('🔧 CONFIGURANDO AMBIENTE DE TESTES DE PERFORMANCE');
    console.log('================================================');
    
    try {
      // 1. Verificar dependências
      await this.checkDependencies();
      
      // 2. Criar estrutura de diretórios
      this.createDirectoryStructure();
      
      // 3. Configurar arquivos de teste
      this.createTestConfig();
      
      // 4. Criar scripts de execução
      this.createExecutionScripts();
      
      // 5. Validar configuração
      await this.validateSetup();
      
      console.log('\n✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Certifique-se de que o servidor está rodando');
      console.log('2. Execute: npm run test:performance');
      console.log('3. Ou execute: node scripts/run-performance-tests.js');
      
    } catch (error) {
      console.error('\n❌ ERRO DURANTE A CONFIGURAÇÃO:', error.message);
      process.exit(1);
    }
  }

  /**
   * Verifica dependências necessárias
   */
  async checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json não encontrado. Execute este script na raiz do projeto.');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const missingPackages = this.requiredPackages.filter(pkg => !dependencies[pkg]);
    
    if (missingPackages.length > 0) {
      console.log(`⚠️ Instalando dependências faltantes: ${missingPackages.join(', ')}`);
      
      try {
        execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
        console.log('✅ Dependências instaladas com sucesso');
      } catch (error) {
        throw new Error(`Falha ao instalar dependências: ${error.message}`);
      }
    } else {
      console.log('✅ Todas as dependências estão instaladas');
    }
  }

  /**
   * Cria estrutura de diretórios
   */
  createDirectoryStructure() {
    console.log('📁 Criando estrutura de diretórios...');
    
    const directories = [
      'test-results',
      'test-results/reports',
      'test-results/logs',
      'test-results/data'
    ];
    
    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✅ Criado: ${dir}`);
      } else {
        console.log(`  📁 Já existe: ${dir}`);
      }
    });
  }

  /**
   * Cria arquivo de configuração
   */
  createTestConfig() {
    console.log('⚙️ Criando arquivo de configuração...');
    
    const configPath = path.join(process.cwd(), 'test-results', 'test-config.json');
    const config = {
      ...this.testConfig,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        description: 'Configuração para testes de performance do sistema Surebets'
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  ✅ Configuração salva em: ${configPath}`);
  }

  /**
   * Cria scripts de execução
   */
  createExecutionScripts() {
    console.log('📜 Criando scripts de execução...');
    
    // Script para Windows
    const windowsScript = `@echo off
echo Iniciando testes de performance...
node scripts/run-performance-tests.js
pause`;

    const windowsScriptPath = path.join(process.cwd(), 'test-performance.bat');
    fs.writeFileSync(windowsScriptPath, windowsScript);
    console.log(`  ✅ Script Windows: ${windowsScriptPath}`);

    // Script para Linux/Mac
    const unixScript = `#!/bin/bash
echo "Iniciando testes de performance..."
node scripts/run-performance-tests.js`;

    const unixScriptPath = path.join(process.cwd(), 'test-performance.sh');
    fs.writeFileSync(unixScriptPath, unixScript);
    
    // Tornar executável no Unix
    try {
      execSync(`chmod +x ${unixScriptPath}`);
      console.log(`  ✅ Script Unix: ${unixScriptPath}`);
    } catch (error) {
      console.log(`  ⚠️ Script Unix criado mas não foi possível torná-lo executável: ${unixScriptPath}`);
    }
  }

  /**
   * Valida configuração
   */
  async validateSetup() {
    console.log('🔍 Validando configuração...');
    
    const checks = [
      {
        name: 'Estrutura de diretórios',
        check: () => {
          const requiredDirs = ['test-results', 'test-results/reports', 'test-results/logs'];
          return requiredDirs.every(dir => fs.existsSync(path.join(process.cwd(), dir)));
        }
      },
      {
        name: 'Arquivo de configuração',
        check: () => {
          return fs.existsSync(path.join(process.cwd(), 'test-results', 'test-config.json'));
        }
      },
      {
        name: 'Scripts de teste',
        check: () => {
          const scripts = ['load-testing.js', 'stress-test.js', 'performance-monitor.js', 'run-performance-tests.js'];
          return scripts.every(script => fs.existsSync(path.join(__dirname, script)));
        }
      },
      {
        name: 'Dependências Node.js',
        check: () => {
          try {
            require('axios');
            require('ws');
            return true;
          } catch (error) {
            return false;
          }
        }
      }
    ];
    
    let allPassed = true;
    
    checks.forEach(check => {
      if (check.check()) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name}`);
        allPassed = false;
      }
    });
    
    if (!allPassed) {
      throw new Error('Alguns checks de validação falharam');
    }
    
    console.log('✅ Validação concluída com sucesso');
  }

  /**
   * Cria arquivo README para testes
   */
  createReadme() {
    const readmeContent = `# 🚀 Testes de Performance - Surebets

## 📋 Visão Geral

Este diretório contém todos os scripts e configurações para executar testes de performance e carga no sistema Surebets.

## 🛠️ Scripts Disponíveis

### Execução Completa
\`\`\`bash
# Executar todos os testes
npm run test:performance

# Ou diretamente
node scripts/run-performance-tests.js
\`\`\`

### Testes Individuais
\`\`\`bash
# Testes de carga
node scripts/load-testing.js

# Testes de estresse
node scripts/stress-test.js

# Monitoramento de performance
node scripts/performance-monitor.js
\`\`\`

## 📊 Tipos de Teste

### 1. Testes de Carga
- **Objetivo**: Verificar performance sob carga normal
- **Usuários**: 10, 50, 100, 200
- **Duração**: 2 minutos por cenário
- **Métricas**: Tempo de resposta, taxa de erro, throughput

### 2. Testes de Estresse
- **Objetivo**: Identificar limites do sistema
- **Usuários**: 300, 500, 1000
- **Duração**: 5 minutos por cenário
- **Métricas**: Ponto de falha, recuperação, estabilidade

### 3. Monitoramento de Performance
- **Objetivo**: Coletar métricas do sistema
- **Duração**: Durante todos os testes
- **Métricas**: CPU, memória, rede, banco de dados

## 📈 Métricas Monitoradas

- **Tempo de Resposta**: < 500ms (ideal)
- **Taxa de Erro**: < 1% (ideal)
- **Throughput**: Requisições por segundo
- **Uso de CPU**: < 70% (ideal)
- **Uso de Memória**: < 80% (ideal)
- **Conexões DB**: < 50 (ideal)

## 📁 Estrutura de Arquivos

\`\`\`
test-results/
├── reports/          # Relatórios gerados
├── logs/            # Logs de execução
├── data/            # Dados de teste
└── test-config.json # Configuração
\`\`\`

## 🔧 Configuração

Edite \`test-results/test-config.json\` para personalizar:

\`\`\`json
{
  "baseUrl": "http://localhost:3001",
  "wsUrl": "ws://localhost:3002",
  "scenarios": {
    "load": {
      "users": [10, 50, 100, 200],
      "duration": 120000
    },
    "stress": {
      "users": [300, 500, 1000],
      "duration": 300000
    }
  }
}
\`\`\`

## 📋 Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor está ativo
2. **Banco de dados**: PostgreSQL deve estar acessível
3. **Dependências**: Execute \`npm install\` se necessário
4. **Portas livres**: 3001 (API) e 3002 (WebSocket)

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se o servidor está rodando
- Confirme as URLs no arquivo de configuração

### Dependências Faltando
- Execute: \`npm install axios ws\`

### Permissões (Unix)
- Execute: \`chmod +x test-performance.sh\`

## 📊 Interpretando Resultados

### Score de Qualidade
- **80-100**: Excelente
- **60-79**: Bom
- **40-59**: Regular
- **0-39**: Ruim

### Alertas
- **CPU > 90%**: Crítico
- **Memória > 80%**: Atenção
- **Taxa de Erro > 5%**: Investigar

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

---

*Última atualização: ${new Date().toLocaleDateString('pt-BR')}*
`;

    const readmePath = path.join(process.cwd(), 'test-results', 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`  ✅ README criado: ${readmePath}`);
  }
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  const setup = new PerformanceTestSetup();
  setup.setup().catch(console.error);
}

module.exports = PerformanceTestSetup;
