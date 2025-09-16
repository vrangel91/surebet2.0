#!/usr/bin/env node

/**
 * Script para configurar ambiente de teste
 * Configura banco de dados de teste, limpa dados e prepara ambiente
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Configurando ambiente de teste...')

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} - Concluído`)
  } catch (error) {
    console.error(`❌ ${description} - Erro:`, error.message)
    process.exit(1)
  }
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath))
}

// Função para criar diretório se não existir
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`📁 Diretório criado: ${dirPath}`)
  }
}

async function setupTestEnvironment() {
  try {
    // 1. Verificar dependências
    console.log('🔍 Verificando dependências...')
    
    if (!fileExists('package.json')) {
      throw new Error('package.json não encontrado. Execute este script na raiz do projeto.')
    }
    
    // 2. Instalar dependências de teste
    console.log('📦 Instalando dependências de teste...')
    runCommand('npm install', 'Instalando dependências')
    
    // 3. Criar diretórios de teste
    console.log('📁 Criando estrutura de diretórios...')
    ensureDir('cypress/screenshots')
    ensureDir('cypress/videos')
    ensureDir('test-results')
    ensureDir('coverage')
    
    // 4. Configurar banco de dados de teste
    console.log('🗄️ Configurando banco de dados de teste...')
    
    // Verificar se PostgreSQL está rodando
    try {
      runCommand('pg_isready', 'Verificando conexão com PostgreSQL')
    } catch (error) {
      console.log('⚠️ PostgreSQL não está rodando. Iniciando...')
      // Tentar iniciar PostgreSQL (Windows)
      try {
        runCommand('net start postgresql-x64-13', 'Iniciando PostgreSQL')
      } catch (startError) {
        console.log('⚠️ Não foi possível iniciar PostgreSQL automaticamente.')
        console.log('📝 Por favor, inicie o PostgreSQL manualmente e execute novamente.')
      }
    }
    
    // 5. Criar banco de teste
    console.log('🏗️ Criando banco de dados de teste...')
    try {
      runCommand('createdb surestake_test', 'Criando banco de teste')
    } catch (error) {
      console.log('⚠️ Banco de teste já existe ou erro na criação')
    }
    
    // 6. Executar migrações de teste
    console.log('🔄 Executando migrações de teste...')
    try {
      runCommand('npm run db:migrate:test', 'Executando migrações')
    } catch (error) {
      console.log('⚠️ Comando de migração não encontrado. Pulando...')
    }
    
    // 7. Limpar dados de teste
    console.log('🧹 Limpando dados de teste...')
    try {
      runCommand('npm run test:clean', 'Limpando dados de teste')
    } catch (error) {
      console.log('⚠️ Comando de limpeza não encontrado. Pulando...')
    }
    
    // 8. Verificar configurações
    console.log('⚙️ Verificando configurações...')
    
    if (!fileExists('vitest.config.js')) {
      console.log('⚠️ vitest.config.js não encontrado')
    }
    
    if (!fileExists('cypress.config.js')) {
      console.log('⚠️ cypress.config.js não encontrado')
    }
    
    // 9. Executar testes de validação
    console.log('🧪 Executando testes de validação...')
    try {
      runCommand('npm run test:unit', 'Executando testes unitários')
    } catch (error) {
      console.log('⚠️ Alguns testes unitários falharam')
    }
    
    console.log('🎉 Configuração do ambiente de teste concluída!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   • npm run test:unit      - Executar testes unitários')
    console.log('   • npm run test:integration - Executar testes de integração')
    console.log('   • npm run test:e2e       - Executar testes E2E')
    console.log('   • npm run test:all       - Executar todos os testes')
    console.log('   • npm run test:coverage  - Executar com cobertura')
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message)
    process.exit(1)
  }
}

// Executar configuração
setupTestEnvironment()
