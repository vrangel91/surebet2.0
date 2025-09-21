#!/usr/bin/env node

const { Pool } = require('pg');
const { logger } = require('../server/utils/logger');

class DatabaseOptimizer {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: process.env.DB_NAME || 'surestake',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async optimizeDatabase() {
    console.log('🚀 Iniciando otimização do banco de dados...\n');

    try {
      // 1. Analisar configurações atuais
      await this.analyzeCurrentSettings();
      
      // 2. Criar índices compostos otimizados
      await this.createOptimizedIndexes();
      
      // 3. Atualizar estatísticas
      await this.updateStatistics();
      
      // 4. Limpar dados antigos
      await this.cleanOldData();
      
      // 5. Otimizar configurações do PostgreSQL
      await this.optimizePostgreSQLSettings();
      
      console.log('\n✅ Otimização do banco de dados concluída!');
      
    } catch (error) {
      console.error('❌ Erro durante otimização:', error.message);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async analyzeCurrentSettings() {
    console.log('📊 Analisando configurações atuais...');
    
    const settings = await this.pool.query(`
      SELECT name, setting, unit 
      FROM pg_settings 
      WHERE name IN (
        'shared_buffers', 'effective_cache_size', 'work_mem', 
        'maintenance_work_mem', 'max_connections', 'random_page_cost',
        'seq_page_cost', 'cpu_tuple_cost', 'cpu_index_tuple_cost'
      )
      ORDER BY name;
    `);
    
    console.log('Configurações atuais:');
    settings.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.setting} ${row.unit || ''}`);
    });
    
    // Verificar tamanho das tabelas
    const tableSizes = await this.pool.query(`
      SELECT 
        schemaname, 
        tablename, 
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `);
    
    console.log('\nTamanho das tabelas:');
    tableSizes.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.size}`);
    });
  }

  async createOptimizedIndexes() {
    console.log('\n🔧 Criando índices otimizados...');
    
    const indexes = [
      // Índices compostos para surebet_stats (tabela mais pesada)
      {
        name: 'idx_surebet_stats_user_date_status',
        query: `CREATE INDEX IF NOT EXISTS idx_surebet_stats_user_date_status 
                ON surebet_stats (user_id, date DESC, status) 
                WHERE status = 'active';`
      },
      {
        name: 'idx_surebet_stats_sport_date',
        query: `CREATE INDEX IF NOT EXISTS idx_surebet_stats_sport_date 
                ON surebet_stats (sport, date DESC) 
                WHERE status = 'active';`
      },
      {
        name: 'idx_surebet_stats_house_market',
        query: `CREATE INDEX IF NOT EXISTS idx_surebet_stats_house_market 
                ON surebet_stats (house, market) 
                WHERE status = 'active';`
      },
      {
        name: 'idx_surebet_stats_date_hour',
        query: `CREATE INDEX IF NOT EXISTS idx_surebet_stats_date_hour 
                ON surebet_stats (date DESC, hour DESC) 
                WHERE status = 'active';`
      },
      
      // Índices para orders
      {
        name: 'idx_orders_user_status',
        query: `CREATE INDEX IF NOT EXISTS idx_orders_user_status 
                ON orders (user_id, status, created_at DESC);`
      },
      
      // Índices para user_sessions
      {
        name: 'idx_user_sessions_user_created',
        query: `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_created 
                ON user_sessions (user_id, created_at DESC);`
      }
    ];

    for (const index of indexes) {
      try {
        console.log(`  Criando índice: ${index.name}`);
        await this.pool.query(index.query);
        console.log(`  ✅ ${index.name} criado com sucesso`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`  ℹ️  ${index.name} já existe`);
        } else {
          console.log(`  ⚠️  Erro ao criar ${index.name}: ${error.message}`);
        }
      }
    }
  }

  async updateStatistics() {
    console.log('\n📈 Atualizando estatísticas do banco...');
    
    try {
      await this.pool.query('ANALYZE;');
      console.log('  ✅ Estatísticas atualizadas');
    } catch (error) {
      console.log(`  ⚠️  Erro ao atualizar estatísticas: ${error.message}`);
    }
  }

  async cleanOldData() {
    console.log('\n🧹 Limpando dados antigos...');
    
    try {
      // Limpar sessões antigas (mais de 30 dias)
      const oldSessions = await this.pool.query(`
        DELETE FROM user_sessions 
        WHERE created_at < NOW() - INTERVAL '30 days';
      `);
      console.log(`  ✅ ${oldSessions.rowCount} sessões antigas removidas`);
      
      // Limpar estatísticas antigas (mais de 90 dias)
      const oldStats = await this.pool.query(`
        DELETE FROM surebet_stats 
        WHERE date < NOW() - INTERVAL '90 days' 
        AND status != 'active';
      `);
      console.log(`  ✅ ${oldStats.rowCount} estatísticas antigas removidas`);
      
    } catch (error) {
      console.log(`  ⚠️  Erro ao limpar dados antigos: ${error.message}`);
    }
  }

  async optimizePostgreSQLSettings() {
    console.log('\n⚙️  Sugerindo otimizações do PostgreSQL...');
    
    const recommendations = [
      {
        setting: 'shared_buffers',
        current: '128MB',
        recommended: '256MB',
        reason: 'Aumentar para 25% da RAM disponível'
      },
      {
        setting: 'effective_cache_size',
        current: '4GB',
        recommended: '1GB',
        reason: 'Ajustar para 75% da RAM disponível'
      },
      {
        setting: 'work_mem',
        current: '4MB',
        recommended: '16MB',
        reason: 'Aumentar para consultas complexas'
      },
      {
        setting: 'maintenance_work_mem',
        current: '64MB',
        recommended: '256MB',
        reason: 'Melhorar performance de VACUUM e CREATE INDEX'
      },
      {
        setting: 'random_page_cost',
        current: '4.0',
        recommended: '1.1',
        reason: 'SSD tem acesso aleatório mais rápido'
      }
    ];
    
    console.log('Recomendações de configuração:');
    recommendations.forEach(rec => {
      console.log(`  ${rec.setting}:`);
      console.log(`    Atual: ${rec.current}`);
      console.log(`    Recomendado: ${rec.recommended}`);
      console.log(`    Motivo: ${rec.reason}\n`);
    });
    
    console.log('Para aplicar essas configurações:');
    console.log('1. Edite o arquivo /etc/postgresql/16/main/postgresql.conf');
    console.log('2. Reinicie o PostgreSQL: sudo systemctl restart postgresql');
  }

  async getSlowQueries() {
    console.log('\n🐌 Consultas lentas detectadas:');
    
    try {
      // Verificar se pg_stat_statements está habilitado
      const extension = await this.pool.query(`
        SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';
      `);
      
      if (extension.rows.length === 0) {
        console.log('  ℹ️  pg_stat_statements não está habilitado');
        console.log('  Para habilitar:');
        console.log('  1. Adicione "shared_preload_libraries = \'pg_stat_statements\'" ao postgresql.conf');
        console.log('  2. Reinicie o PostgreSQL');
        console.log('  3. Execute: CREATE EXTENSION pg_stat_statements;');
        return;
      }
      
      const slowQueries = await this.pool.query(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        ORDER BY mean_time DESC 
        LIMIT 10;
      `);
      
      if (slowQueries.rows.length === 0) {
        console.log('  ✅ Nenhuma consulta lenta detectada');
        return;
      }
      
      slowQueries.rows.forEach((query, index) => {
        console.log(`  ${index + 1}. ${query.query.substring(0, 100)}...`);
        console.log(`     Chamadas: ${query.calls}, Tempo médio: ${query.mean_time}ms`);
      });
      
    } catch (error) {
      console.log(`  ⚠️  Erro ao verificar consultas lentas: ${error.message}`);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const optimizer = new DatabaseOptimizer();
  optimizer.optimizeDatabase()
    .then(() => {
      console.log('\n🎉 Otimização concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Falha na otimização:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseOptimizer;
