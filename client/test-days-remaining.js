// Teste específico para getDaysRemaining
console.log('🧪 Testando getDaysRemaining...');

function testGetDaysRemaining() {
  console.log('📊 Testando getDaysRemaining...');
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 10);
  
  const end = new Date(futureDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const result = Math.max(0, diffDays);
  
  console.log(`✅ getDaysRemaining('${futureDate.toISOString()}') = ${result} dias`);
  console.log(`📅 Data atual: ${now.toISOString()}`);
  console.log(`📅 Data futura: ${futureDate.toISOString()}`);
  console.log(`⏱️ Diferença em ms: ${diffTime}`);
  console.log(`📊 Diferença em dias: ${diffDays}`);
  console.log(`🎯 Resultado final: ${result}`);
  console.log(`✅ Esperado: 10`);
  console.log(`🧪 Teste passou: ${result === 10}`);
  
  return result === 10;
}

// Executar o teste
const result = testGetDaysRemaining();
console.log(`\n🎯 Resultado final: ${result ? 'PASSOU' : 'FALHOU'}`);
