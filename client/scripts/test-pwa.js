#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Função para verificar se um arquivo existe
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description}: ${filePath} (${stats.size} bytes)`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - ARQUIVO NÃO ENCONTRADO`);
    return false;
  }
}

// Função para verificar se o manifest.json é válido
function validateManifest() {
  try {
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('\n📋 Verificando manifest.json...');
    console.log(`   Nome: ${manifest.name}`);
    console.log(`   Short Name: ${manifest.short_name}`);
    console.log(`   Theme Color: ${manifest.theme_color}`);
    console.log(`   Background Color: ${manifest.background_color}`);
    console.log(`   Ícones: ${manifest.icons.length} ícones configurados`);
    
    // Verificar se todos os ícones existem
    let validIcons = 0;
    manifest.icons.forEach(icon => {
      const iconPath = path.join(__dirname, '..', 'public', icon.src);
      if (fs.existsSync(iconPath)) {
        validIcons++;
      } else {
        console.log(`   ⚠️  Ícone não encontrado: ${icon.src}`);
      }
    });
    
    console.log(`   ✅ ${validIcons}/${manifest.icons.length} ícones encontrados`);
    return validIcons === manifest.icons.length;
  } catch (error) {
    console.log(`❌ Erro ao validar manifest.json: ${error.message}`);
    return false;
  }
}

// Função principal
function testPWA() {
  console.log('🧪 Testando configuração do PWA SureStake...\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const imgDir = path.join(publicDir, 'img');
  
  let allFilesExist = true;
  
  // Verificar arquivos essenciais
  console.log('📁 Verificando arquivos essenciais...');
  allFilesExist &= checkFile(path.join(publicDir, 'manifest.json'), 'Manifest');
  allFilesExist &= checkFile(path.join(publicDir, 'favicon.ico'), 'Favicon ICO');
  allFilesExist &= checkFile(path.join(publicDir, 'favicon.svg'), 'Favicon SVG');
  allFilesExist &= checkFile(path.join(publicDir, 'sw.js'), 'Service Worker');
  
  // Verificar ícones PWA
  console.log('\n🖼️  Verificando ícones PWA...');
  const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512, 150];
  
  iconSizes.forEach(size => {
    const pngFile = path.join(imgDir, `logo-${size}x${size}.png`);
    const svgFile = path.join(imgDir, `logo-${size}x${size}.svg`);
    
    allFilesExist &= checkFile(pngFile, `Ícone PNG ${size}x${size}`);
    checkFile(svgFile, `Ícone SVG ${size}x${size}`);
  });
  
  // Validar manifest
  const manifestValid = validateManifest();
  
  // Resultado final
  console.log('\n📊 Resultado do teste:');
  if (allFilesExist && manifestValid) {
    console.log('🎉 PWA configurado corretamente!');
    console.log('\n📱 Para testar o PWA:');
    console.log('1. Execute: npm run serve');
    console.log('2. Abra o navegador em https://localhost:3001');
    console.log('3. Abra as ferramentas de desenvolvedor (F12)');
    console.log('4. Vá para a aba "Application" > "Manifest"');
    console.log('5. Verifique se o ícone aparece corretamente');
    console.log('6. Teste a instalação do PWA');
  } else {
    console.log('⚠️  PWA precisa de ajustes:');
    if (!allFilesExist) {
      console.log('   - Alguns arquivos de ícone estão faltando');
    }
    if (!manifestValid) {
      console.log('   - Manifest.json tem problemas');
    }
    console.log('\n🔧 Execute: node scripts/generate-pwa-icons.js');
  }
  
  return allFilesExist && manifestValid;
}

// Executar se chamado diretamente
if (require.main === module) {
  testPWA();
}

module.exports = { testPWA, checkFile, validateManifest };

