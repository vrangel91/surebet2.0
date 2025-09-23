#!/usr/bin/env node

/**
 * Script de teste para verificar se a nova API sempregreen está funcionando
 */

const https = require('https');

console.log('🧪 Testando nova API sempregreen.net.br/apipre/stream...\n');

// Função para fazer requisição HTTPS
function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sempregreen.net.br',
      port: 443,
      path: '/apipre/stream',
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Referer': 'https://sempregreen.net.br',
        'Origin': 'https://sempregreen.net.br'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📡 Dados recebidos:');
        console.log(data.substring(0, 1000) + '...');
        
        // Verificar se é SSE
        if (data.includes('event: full') && data.includes('data: {')) {
          console.log('\n✅ Formato SSE detectado corretamente!');
          
          // Tentar extrair e parsear dados JSON
          const lines = data.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                console.log('\n📊 Estrutura dos dados:');
                console.log(`- Número de surebets: ${Object.keys(jsonData).length}`);
                
                // Verificar estrutura de um surebet
                const firstSurebetId = Object.keys(jsonData)[0];
                const firstSurebet = jsonData[firstSurebetId];
                
                if (Array.isArray(firstSurebet) && firstSurebet.length > 0) {
                  const firstPart = firstSurebet[0];
                  console.log('\n🔍 Estrutura de um surebet:');
                  console.log(`- ID: ${firstSurebetId}`);
                  console.log(`- Partes: ${firstSurebet.length}`);
                  console.log(`- Casa: ${firstPart.house}`);
                  console.log(`- Esporte: ${firstPart.sport}`);
                  console.log(`- Evento: ${firstPart.match}`);
                  console.log(`- Mercado: ${firstPart.market}`);
                  console.log(`- Odds: ${firstPart.chance}`);
                  console.log(`- Lucro: ${firstPart.profit}%`);
                  console.log(`- Torneio: ${firstPart.tournament}`);
                  
                  console.log('\n✅ Estrutura de dados válida!');
                } else {
                  console.log('\n❌ Estrutura de dados inválida!');
                }
                
                break;
              } catch (parseError) {
                console.log('\n❌ Erro ao parsear JSON:', parseError.message);
              }
            }
          }
        } else {
          console.log('\n❌ Formato SSE não detectado!');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('\n⏰ Timeout da requisição');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Executar teste
testAPI()
  .then(() => {
    console.log('\n🎉 Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Teste falhou:', error.message);
    process.exit(1);
  });
