#!/usr/bin/env node

/**
 * Teste para verificar problemas no RankingView.vue
 * Este script analisa o arquivo e identifica possíveis problemas de sintaxe
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando análise do RankingView.vue...\n');

// Caminho do arquivo
const filePath = '/var/www/surebet/client/src/views/RankingView.vue';

try {
  // Ler o arquivo
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('✅ Arquivo lido com sucesso');
  console.log(`📊 Tamanho do arquivo: ${content.length} caracteres\n`);

  // Verificar estrutura básica
  console.log('🔍 Verificando estrutura básica...');
  
  // Verificar se tem template, script e style
  const hasTemplate = content.includes('<template>');
  const hasScript = content.includes('<script>');
  const hasStyle = content.includes('<style');
  
  console.log(`- Template: ${hasTemplate ? '✅' : '❌'}`);
  console.log(`- Script: ${hasScript ? '✅' : '❌'}`);
  console.log(`- Style: ${hasStyle ? '✅' : '❌'}\n`);

  // Verificar estrutura do script
  console.log('🔍 Verificando estrutura do script...');
  
  // Encontrar início e fim do script
  const scriptStart = content.indexOf('<script>');
  const scriptEnd = content.lastIndexOf('</script>');
  
  if (scriptStart === -1 || scriptEnd === -1) {
    console.log('❌ Seção script não encontrada');
    process.exit(1);
  }
  
  const scriptContent = content.substring(scriptStart + 8, scriptEnd);
  console.log(`- Tamanho do script: ${scriptContent.length} caracteres`);

  // Verificar estrutura do objeto Vue
  console.log('\n🔍 Verificando estrutura do objeto Vue...');
  
  // Verificar se tem export default
  const hasExportDefault = scriptContent.includes('export default');
  console.log(`- Export default: ${hasExportDefault ? '✅' : '❌'}`);
  
  // Verificar se tem name
  const hasName = scriptContent.includes('name:');
  console.log(`- Name: ${hasName ? '✅' : '❌'}`);
  
  // Verificar se tem data
  const hasData = scriptContent.includes('data()');
  console.log(`- Data: ${hasData ? '✅' : '❌'}`);
  
  // Verificar se tem computed
  const hasComputed = scriptContent.includes('computed:');
  console.log(`- Computed: ${hasComputed ? '✅' : '❌'}`);
  
  // Verificar se tem methods
  const hasMethods = scriptContent.includes('methods:');
  console.log(`- Methods: ${hasMethods ? '✅' : '❌'}`);
  
  // Verificar se tem mounted
  const hasMounted = scriptContent.includes('mounted()');
  console.log(`- Mounted: ${hasMounted ? '✅' : '❌'}\n`);

  // Verificar chaves balanceadas
  console.log('🔍 Verificando balanceamento de chaves...');
  
  let openBraces = 0;
  let closeBraces = 0;
  let openParens = 0;
  let closeParens = 0;
  let openBrackets = 0;
  let closeBrackets = 0;
  
  for (let i = 0; i < scriptContent.length; i++) {
    const char = scriptContent[i];
    switch (char) {
      case '{': openBraces++; break;
      case '}': closeBraces++; break;
      case '(': openParens++; break;
      case ')': closeParens++; break;
      case '[': openBrackets++; break;
      case ']': closeBrackets++; break;
    }
  }
  
  console.log(`- Chaves { }: ${openBraces} abertas, ${closeBraces} fechadas ${openBraces === closeBraces ? '✅' : '❌'}`);
  console.log(`- Parênteses ( ): ${openParens} abertos, ${closeParens} fechados ${openParens === closeParens ? '✅' : '❌'}`);
  console.log(`- Colchetes [ ]: ${openBrackets} abertos, ${closeBrackets} fechados ${openBrackets === closeBrackets ? '✅' : '❌'}\n`);

  // Verificar métodos chamados no template
  console.log('🔍 Verificando métodos chamados no template...');
  
  const templateStart = content.indexOf('<template>');
  const templateEnd = content.lastIndexOf('</template>');
  const templateContent = content.substring(templateStart + 10, templateEnd);
  
  // Encontrar métodos chamados no template
  const methodCalls = templateContent.match(/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  const methodsInTemplate = methodCalls.map(call => {
    const match = call.match(/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  console.log(`- Métodos encontrados no template: ${methodsInTemplate.length}`);
  methodsInTemplate.forEach(method => console.log(`  - ${method}`));
  
  // Verificar se os métodos estão implementados
  console.log('\n🔍 Verificando implementação dos métodos...');
  
  const methodDefinitions = scriptContent.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm) || [];
  const definedMethods = methodDefinitions.map(def => {
    const match = def.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  console.log(`- Métodos definidos no script: ${definedMethods.length}`);
  
  // Verificar métodos faltantes
  const missingMethods = methodsInTemplate.filter(method => !definedMethods.includes(method));
  if (missingMethods.length > 0) {
    console.log('\n❌ Métodos faltantes:');
    missingMethods.forEach(method => console.log(`  - ${method}`));
  } else {
    console.log('\n✅ Todos os métodos do template estão implementados');
  }

  // Verificar problemas de sintaxe específicos
  console.log('\n🔍 Verificando problemas de sintaxe específicos...');
  
  // Verificar vírgulas soltas
  const danglingCommas = scriptContent.match(/,\s*}/g) || [];
  console.log(`- Vírgulas soltas: ${danglingCommas.length} ${danglingCommas.length === 0 ? '✅' : '❌'}`);
  
  // Verificar return solto
  const strayReturns = scriptContent.match(/^\s*return\s+[^;]*$/gm) || [];
  console.log(`- Returns soltos: ${strayReturns.length} ${strayReturns.length === 0 ? '✅' : '❌'}`);
  
  // Verificar console.log com emojis
  const emojiLogs = scriptContent.match(/console\.log\([^)]*[🎉🔍📋✅⚠️❌👤👑🔧🔒🚫ℹ️🔄📊🚀🌐⏸️⏳][^)]*\)/g) || [];
  console.log(`- Console.log com emojis: ${emojiLogs.length} ${emojiLogs.length === 0 ? '✅' : '❌'}`);
  
  if (emojiLogs.length > 0) {
    console.log('  Emojis encontrados em console.log:');
    emojiLogs.forEach(log => console.log(`    ${log.substring(0, 100)}...`));
  }

  // Verificar estrutura de objetos
  console.log('\n🔍 Verificando estrutura de objetos...');
  
  // Verificar se data() retorna um objeto
  const dataMatch = scriptContent.match(/data\(\)\s*\{[^}]*return\s*\{([^}]*)\}/s);
  if (dataMatch) {
    console.log('✅ Função data() encontrada');
  } else {
    console.log('❌ Função data() não encontrada ou malformada');
  }
  
  // Verificar se methods é um objeto
  const methodsMatch = scriptContent.match(/methods:\s*\{([^}]*)\}/s);
  if (methodsMatch) {
    console.log('✅ Objeto methods encontrado');
  } else {
    console.log('❌ Objeto methods não encontrado ou malformado');
  }

  // Verificar imports
  console.log('\n🔍 Verificando imports...');
  
  const imports = scriptContent.match(/import\s+.*from\s+['"][^'"]+['"]/g) || [];
  console.log(`- Imports encontrados: ${imports.length}`);
  imports.forEach(imp => console.log(`  - ${imp}`));

  // Verificar se há problemas de encoding
  console.log('\n🔍 Verificando problemas de encoding...');
  
  const nonAsciiChars = scriptContent.match(/[^\x00-\x7F]/g) || [];
  console.log(`- Caracteres não-ASCII: ${nonAsciiChars.length}`);
  
  if (nonAsciiChars.length > 0) {
    const uniqueChars = [...new Set(nonAsciiChars)];
    console.log('  Caracteres únicos encontrados:');
    uniqueChars.slice(0, 10).forEach(char => {
      const code = char.charCodeAt(0);
      console.log(`    '${char}' (U+${code.toString(16).toUpperCase()})`);
    });
  }

  console.log('\n✅ Análise concluída!');
  
  // Resumo final
  console.log('\n📋 RESUMO:');
  console.log(`- Arquivo: ${path.basename(filePath)}`);
  console.log(`- Tamanho: ${content.length} caracteres`);
  console.log(`- Script: ${scriptContent.length} caracteres`);
  console.log(`- Métodos no template: ${methodsInTemplate.length}`);
  console.log(`- Métodos implementados: ${definedMethods.length}`);
  console.log(`- Métodos faltantes: ${missingMethods.length}`);
  console.log(`- Chaves balanceadas: ${openBraces === closeBraces ? 'Sim' : 'Não'}`);
  console.log(`- Caracteres não-ASCII: ${nonAsciiChars.length}`);

} catch (error) {
  console.error('❌ Erro ao analisar arquivo:', error.message);
  process.exit(1);
}
