// Usar fetch nativo (disponível no Node.js 18+)
// Se não estiver disponível, usar axios

async function testRankingAPI() {
  try {
    console.log('🧪 TESTANDO API DO RANKING');
    console.log('============================');
    
    // Simular dados exatos do RankingView
    const mockRankingData = [
      {
        surebet_id: 'surebet_record_1gDCeKYNmCu6',
        house: 'Bet365',
        market: 'Resultado Final',
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        hour: 20,
        sport: 'Football',
        period: '90min',
        minutes: 90,
        anchorh1: 'Flamengo',
        anchorh2: 'Palmeiras',
        chance: 95.5,
        metadata: {
          source: 'ranking_view',
          generated_at: new Date().toISOString(),
          test: true
        }
      }
    ];
    
    console.log('\n📤 Dados sendo enviados:');
    console.log(JSON.stringify(mockRankingData[0], null, 2));
    
    // Testar inserção individual (como o RankingView faz)
    console.log('\n📝 Testando inserção individual...');
    
    const response = await fetch('http://localhost:3001/api/surebet-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token' // Token de teste
      },
      body: JSON.stringify(mockRankingData[0])
    });
    
    console.log(`📊 Status da resposta: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resposta da API:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Erro da API:', errorText);
      
      // Tentar obter mais detalhes do erro
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Detalhes do erro:', errorJson);
      } catch (e) {
        console.log('⚠️ Erro não é JSON válido');
      }
    }
    
    // Testar inserção em lote
    console.log('\n📝 Testando inserção em lote...');
    
    const bulkResponse = await fetch('http://localhost:3001/api/surebet-stats/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token'
      },
      body: JSON.stringify({ stats: mockRankingData })
    });
    
    console.log(`📊 Status da resposta bulk: ${bulkResponse.status} ${bulkResponse.statusText}`);
    
    if (bulkResponse.ok) {
      const bulkResult = await bulkResponse.json();
      console.log('✅ Resposta bulk da API:', bulkResult);
    } else {
      const bulkErrorText = await bulkResponse.text();
      console.log('❌ Erro bulk da API:', bulkErrorText);
    }
    
    console.log('\n🎉 Teste da API concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o servidor está rodando na porta 3001');
    }
  }
}

testRankingAPI();
