const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

// Função de sanitização
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return str
  
  try {
    let sanitized = str
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (!sanitized) return 'Não especificado'
    return sanitized
  } catch (error) {
    console.warn('Erro ao sanitizar string:', error)
    return 'Não especificado'
  }
}

// Configurar conexão com banco
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'surestake',
  logging: false
})

// Modelo SurebetStats
const SurebetStats = sequelize.define('SurebetStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surebet_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  house: {
    type: DataTypes.STRING,
    allowNull: false
  },
  market: {
    type: DataTypes.STRING,
    allowNull: false
  },
  match: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hour: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true
  },
  minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  anchorh1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  anchorh2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'surebet_stats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

async function testDailyCache() {
  console.log('🧪 Testando sistema de cache diário...')
  
  try {
    // Testar conexão
    await sequelize.authenticate()
    console.log('✅ Conexão com banco estabelecida')
    
    const today = new Date().toISOString().split('T')[0]
    console.log(`📅 Data de hoje: ${today}`)
    
    // 1. Verificar se já existem dados de hoje
    console.log('\n🔍 Verificando dados existentes de hoje...')
    const existingStats = await SurebetStats.findAll({
      where: {
        date: today,
        user_id: 2 // ID do usuário admin
      }
    })
    
    console.log(`📊 Dados existentes de hoje: ${existingStats.length} registros`)
    
    if (existingStats.length > 0) {
      console.log('🗑️ Removendo dados existentes para teste...')
      await SurebetStats.destroy({
        where: {
          date: today,
          user_id: 2
        }
      })
      console.log('✅ Dados existentes removidos')
    }
    
    // 2. Criar dados de teste para hoje
    console.log('\n📝 Criando dados de teste para hoje...')
    const testData = [
      {
        surebet_id: 'test_cache_1',
        user_id: 2,
        house: 'Bet365',
        market: 'Over/Under 2.5',
        match: 'Teste Cache 1',
        profit: 15.50,
        date: today,
        hour: 14,
        sport: 'Futebol',
        period: '90min',
        minutes: 0,
        anchorh1: null,
        anchorh2: null,
        chance: 85.5,
        status: 'active',
        metadata: {
          source: 'test_cache',
          cache_type: 'daily',
          created_at: new Date().toISOString()
        }
      },
      {
        surebet_id: 'test_cache_2',
        user_id: 2,
        house: 'Betwarrior',
        market: 'Resultado Final',
        match: 'Teste Cache 2',
        profit: 22.30,
        date: today,
        hour: 15,
        sport: 'Futebol',
        period: '90min',
        minutes: 0,
        anchorh1: null,
        anchorh2: null,
        chance: 78.2,
        status: 'active',
        metadata: {
          source: 'test_cache',
          cache_type: 'daily',
          created_at: new Date().toISOString()
        }
      }
    ]
    
    // 3. Inserir dados de teste
    console.log('💾 Inserindo dados de teste...')
    const createdStats = await SurebetStats.bulkCreate(testData)
    console.log(`✅ ${createdStats.length} registros de teste inseridos`)
    
    // 4. Verificar se os dados foram inseridos corretamente
    console.log('\n🔍 Verificando dados inseridos...')
    const insertedStats = await SurebetStats.findAll({
      where: {
        date: today,
        user_id: 2
      }
    })
    
    console.log(`📊 Dados inseridos verificados: ${insertedStats.length} registros`)
    insertedStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat.house} - ${stat.market} - R$ ${stat.profit}`)
    })
    
    // 5. Simular atualização de cache (remover e reinserir)
    console.log('\n🔄 Simulando atualização de cache...')
    
    // Remover dados antigos
    const deletedCount = await SurebetStats.destroy({
      where: {
        date: today,
        user_id: 2
      }
    })
    console.log(`🗑️ Removidos ${deletedCount} registros antigos`)
    
    // Inserir dados atualizados
    const updatedTestData = testData.map(item => ({
      ...item,
      surebet_id: item.surebet_id + '_updated',
      profit: item.profit + 5, // Aumentar lucro para simular atualização
      metadata: {
        ...item.metadata,
        updated_at: new Date().toISOString(),
        version: '2.0'
      }
    }))
    
    const updatedStats = await SurebetStats.bulkCreate(updatedTestData)
    console.log(`✅ ${updatedStats.length} registros atualizados inseridos`)
    
    // 6. Verificar dados finais
    console.log('\n🔍 Verificando dados finais...')
    const finalStats = await SurebetStats.findAll({
      where: {
        date: today,
        user_id: 2
      }
    })
    
    console.log(`📊 Dados finais: ${finalStats.length} registros`)
    finalStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat.house} - ${stat.market} - R$ ${stat.profit} (${stat.surebet_id})`)
    })
    
    // 7. Limpeza final
    console.log('\n🧹 Limpeza final...')
    await SurebetStats.destroy({
      where: {
        date: today,
        user_id: 2
      }
    })
    console.log('✅ Dados de teste removidos')
    
    console.log('\n🎉 Teste de cache diário concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await sequelize.close()
  }
}

// Executar teste
testDailyCache()


