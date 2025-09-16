const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔐 Gerando certificados SSL autoassinados...');

// Criar diretório para certificados se não existir
const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('📁 Diretório de certificados criado:', certsDir);
}

try {
  // Gerar chave privada
  console.log('🔑 Gerando chave privada...');
  execSync(`openssl genrsa -out ${path.join(certsDir, 'key.pem')} 2048`, { stdio: 'inherit' });
  
  // Gerar certificado autoassinado
  console.log('📜 Gerando certificado autoassinado...');
  execSync(`openssl req -new -x509 -key ${path.join(certsDir, 'key.pem')} -out ${path.join(certsDir, 'cert.pem')} -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=SureStake/OU=IT/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ Certificados SSL gerados com sucesso!');
  console.log('📁 Localização dos certificados:');
  console.log(`   - Chave privada: ${path.join(certsDir, 'key.pem')}`);
  console.log(`   - Certificado: ${path.join(certsDir, 'cert.pem')}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Estes são certificados autoassinados para desenvolvimento.');
  console.log('   Para produção, use certificados válidos de uma CA confiável.');
  
} catch (error) {
  console.error('❌ Erro ao gerar certificados SSL:', error.message);
  console.log('');
  console.log('💡 Soluções:');
  console.log('   1. Instale o OpenSSL: https://www.openssl.org/');
  console.log('   2. Ou use o Git Bash (que inclui OpenSSL)');
  console.log('   3. Ou execute manualmente:');
  console.log(`      mkdir -p ${certsDir}`);
  console.log(`      openssl genrsa -out ${path.join(certsDir, 'key.pem')} 2048`);
  console.log(`      openssl req -new -x509 -key ${path.join(certsDir, 'key.pem')} -out ${path.join(certsDir, 'cert.pem')} -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=SureStake/OU=IT/CN=localhost"`);
}
