const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Configurando navegador para aceitar certificados autoassinados...');

try {
  // Verificar se os certificados existem
  const certPath = path.join(__dirname, '..', 'certs', 'cert.pem');
  const keyPath = path.join(__dirname, '..', 'certs', 'key.pem');
  
  console.log('📁 Verificando certificados:');
  console.log(`   - Certificado: ${certPath}`);
  console.log(`   - Chave: ${keyPath}`);
  
  if (!require('fs').existsSync(certPath) || !require('fs').existsSync(keyPath)) {
    console.error('❌ Certificados não encontrados! Execute primeiro: node scripts/generate-ssl-certs.js');
    process.exit(1);
  }
  
  console.log('✅ Certificados encontrados');
  
  // Instruções para o usuário
  console.log('\n📋 INSTRUÇÕES PARA CONFIGURAR O NAVEGADOR:');
  console.log('');
  console.log('1. 🌐 CHROME/EDGE:');
  console.log('   - Acesse: chrome://flags/#allow-insecure-localhost');
  console.log('   - Ative: "Allow invalid certificates for resources loaded from localhost"');
  console.log('   - Reinicie o navegador');
  console.log('');
  console.log('2. 🔥 FIREFOX:');
  console.log('   - Acesse: about:config');
  console.log('   - Procure por: security.tls.insecure_fallback_hosts');
  console.log('   - Adicione: localhost');
  console.log('');
  console.log('3. 🚀 ALTERNATIVA RÁPIDA:');
  console.log('   - Acesse: https://localhost:3001');
  console.log('   - Clique em "Avançado" ou "Advanced"');
  console.log('   - Clique em "Prosseguir para localhost" ou "Proceed to localhost"');
  console.log('');
  console.log('4. 🔄 TESTE:');
  console.log('   - Acesse: https://localhost:3001');
  console.log('   - Deve carregar sem erros SSL');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Estas configurações são apenas para desenvolvimento local');
  console.log('   - Em produção, use certificados válidos de CA confiável');
  console.log('   - Não use estas configurações em navegadores de produção');
  
} catch (error) {
  console.error('❌ Erro ao configurar SSL:', error.message);
  process.exit(1);
}
