#!/usr/bin/env node

/**
 * Script para limpeza de dados de teste
 * Remove dados de teste, limpa cache e prepara ambiente limpo
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧹 Iniciando limpeza de dados de teste...')

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} - Concluído`)
  } catch (error) {
    console.log(`⚠️ ${description} - Aviso: ${error.message}`)
  }
}

// Função para remover arquivo/diretório
function removeFileOrDir(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true })
        console.log(`🗑️ Diretório removido: ${filePath}`)
      } else {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Arquivo removido: ${filePath}`)
      }
    }
  } catch (error) {
    console.log(`⚠️ Erro ao remover ${filePath}: ${error.message}`)
  }
}

async function cleanupTestEnvironment() {
  try {
    // 1. Limpar dados do banco de teste
    console.log('🗄️ Limpando banco de dados de teste...')
    try {
      runCommand('psql -d surestake_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"', 'Limpando banco de teste')
    } catch (error) {
      console.log('⚠️ Erro ao limpar banco de teste. Continuando...')
    }
    
    // 2. Limpar arquivos de cache
    console.log('💾 Limpando cache...')
    removeFileOrDir('node_modules/.cache')
    removeFileOrDir('.vite')
    removeFileOrDir('dist')
    
    // 3. Limpar resultados de teste
    console.log('📊 Limpando resultados de teste...')
    removeFileOrDir('coverage')
    removeFileOrDir('test-results')
    removeFileOrDir('cypress/screenshots')
    removeFileOrDir('cypress/videos')
    
    // 4. Limpar logs de teste
    console.log('📝 Limpando logs...')
    removeFileOrDir('logs/test')
    
    // 5. Limpar dados de localStorage/sessionStorage
    console.log('🌐 Limpando dados do navegador...')
    // Isso será feito pelos testes individuais
    
    // 6. Limpar arquivos temporários
    console.log('🗂️ Limpando arquivos temporários...')
    removeFileOrDir('.tmp')
    removeFileOrDir('temp')
    
    // 7. Limpar arquivos de lock
    console.log('🔒 Limpando arquivos de lock...')
    removeFileOrDir('package-lock.json')
    removeFileOrDir('yarn.lock')
    
    // 8. Reinstalar dependências limpas
    console.log('📦 Reinstalando dependências...')
    runCommand('npm install', 'Reinstalando dependências')
    
    // 9. Verificar integridade
    console.log('🔍 Verificando integridade...')
    
    const requiredFiles = [
      'package.json',
      'vitest.config.js',
      'cypress.config.js'
    ]
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} - OK`)
      } else {
        console.log(`❌ ${file} - Não encontrado`)
      }
    })
    
    console.log('🎉 Limpeza concluída!')
    console.log('')
    console.log('📋 Ambiente limpo e pronto para testes')
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message)
    process.exit(1)
  }
}

// Executar limpeza
cleanupTestEnvironment()
