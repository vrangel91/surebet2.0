const fetch = require('node-fetch');

async function testRankingComplete() {
  try {
    console.log('🧪 TESTE COMPLETO DO RANKING CORRIGIDO');
    console.log('========================================');
    
    // 1. Testar dados válidos
    console.log('\n1️⃣ Testando com dados válidos...');
    
    const validData = [
      {
        surebet_id: 'test_valid_1',
        house: 'Bet365',
        market: 'Resultado Final',
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: '2025-08-29',
        hour: 20,
        sport: 'Football',
        period: '90min',
        minutes: 90,
        anchorh1: 'Flamengo',
        anchorh2: 'Palmeiras',
        chance: 95.5,
        metadata: { source: 'ranking_view', test: true }
      }
    ];
    
    // Testar inserção individual
    console.log('\n📝 Testando inserção individual...');
    try {
      const individualResponse = await fetch('http://localhost:3001/api/surebet-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: JSON.stringify(validData[0])
      });
      
      console.log(`📊 Status individual: ${individualResponse.status} ${individualResponse.statusText}`);
      
      if (individualResponse.ok) {
        const result = await individualResponse.json();
        console.log('✅ Inserção individual bem-sucedida:', result);
      } else {
        const errorText = await individualResponse.text();
        console.log('❌ Erro individual:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro na inserção individual:', error.message);
    }
    
    // Testar inserção em lote
    console.log('\n📝 Testando inserção em lote...');
    try {
      const bulkResponse = await fetch('http://localhost:3001/api/surebet-stats/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: JSON.stringify({ stats: validData })
      });
      
      console.log(`📊 Status bulk: ${bulkResponse.status} ${bulkResponse.statusText}`);
      
      if (bulkResponse.ok) {
        const result = await bulkResponse.json();
        console.log('✅ Inserção em lote bem-sucedida:', result);
      } else {
        const errorText = await bulkResponse.text();
        console.log('❌ Erro bulk:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro na inserção em lote:', error.message);
    }
    
    // 2. Testar dados inválidos (campos faltando)
    console.log('\n2️⃣ Testando com dados inválidos (campos faltando)...');
    
    const invalidData = [
      {
        surebet_id: 'test_invalid_1',
        house: 'Bet365',
        // market faltando
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: '2025-08-29',
        hour: 20,
        sport: 'Football'
        // outros campos opcionais
      }
    ];
    
    try {
      const invalidResponse = await fetch('http://localhost:3001/api/surebet-stats/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: JSON.stringify({ stats: invalidData })
      });
      
      console.log(`📊 Status dados inválidos: ${invalidResponse.status} ${invalidResponse.statusText}`);
      
      if (invalidResponse.ok) {
        console.log('⚠️ Dados inválidos foram aceitos (não esperado)');
      } else {
        const errorText = await invalidResponse.text();
        console.log('✅ Erro esperado para dados inválidos:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao testar dados inválidos:', error.message);
    }
    
    // 3. Testar dados com valores undefined/null
    console.log('\n3️⃣ Testando com valores undefined/null...');
    
    const nullData = [
      {
        surebet_id: 'test_null_1',
        house: null, // valor null
        market: 'Resultado Final',
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: '2025-08-29',
        hour: 20,
        sport: 'Football'
      }
    ];
    
    try {
      const nullResponse = await fetch('http://localhost:3001/api/surebet-stats/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: JSON.stringify({ stats: nullData })
      });
      
      console.log(`📊 Status valores null: ${nullResponse.status} ${nullResponse.statusText}`);
      
      if (nullResponse.ok) {
        console.log('⚠️ Valores null foram aceitos (não esperado)');
      } else {
        const errorText = await nullResponse.text();
        console.log('✅ Erro esperado para valores null:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao testar valores null:', error.message);
    }
    
    // 4. Testar formato de data
    console.log('\n4️⃣ Testando formato de data...');
    
    const dateData = [
      {
        surebet_id: 'test_date_1',
        house: 'Bet365',
        market: 'Resultado Final',
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: new Date().toISOString(), // formato ISO completo
        hour: 20,
        sport: 'Football'
      }
    ];
    
    try {
      const dateResponse = await fetch('http://localhost:3001/api/surebet-stats/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        },
        body: JSON.stringify({ stats: dateData })
      });
      
      console.log(`📊 Status formato data: ${dateResponse.status} ${dateResponse.statusText}`);
      
      if (dateResponse.ok) {
        const result = await dateResponse.json();
        console.log('✅ Formato de data aceito:', result);
      } else {
        const errorText = await dateResponse.text();
        console.log('❌ Erro com formato de data:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro ao testar formato de data:', error.message);
    }
    
    console.log('\n🎉 Teste completo finalizado!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testRankingComplete();
