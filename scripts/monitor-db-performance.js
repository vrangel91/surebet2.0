#!/usr/bin/env node

const { Pool } = require('pg');

class DatabasePerformanceMonitor {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '7nYi>q10v_:>8pz)^0dC',
      database: process.env.DB_NAME || 'surestake',
      max: 5
    });
  }

  async monitorPerformance() {
    console.log('📊 Monitorando performance do banco de dados...\n');

    try {
      // 1. Verificar conexões ativas
      await this.checkActiveConnections();
      
      // 2. Verificar consultas em execução
      await this.checkRunningQueries();
      
      // 3. Verificar uso de índices
      await this.checkIndexUsage();
      
      // 4. Verificar estatísticas de tabelas
      await this.checkTableStats();
      
      // 5. Verificar configurações de performance
      await this.checkPerformanceSettings();
      
    } catch (error) {
      console.error('❌ Erro durante monitoramento:', error.message);
    } finally {
      await this.pool.end();
    }
  }

  async checkActiveConnections() {
    console.log('🔗 Conexões ativas:');
    
    const connections = await this.pool.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = 'surestake';
    `);
    
    const stats = connections.rows[0];
    console.log(`  Total: ${stats.total_connections}`);
    console.log(`  Ativas: ${stats.active_connections}`);
    console.log(`  Ociosas: ${stats.idle_connections}\n`);
  }

  async checkRunningQueries() {
    console.log('🏃 Consultas em execução:');
    
    const queries = await this.pool.query(`
      SELECT 
        pid,
        state,
        query_start,
        now() - query_start as duration,
        query
      FROM pg_stat_activity 
      WHERE datname = 'surestake' 
        AND state != 'idle' 
        AND query NOT LIKE '%pg_stat_activity%'
      ORDER BY query_start;
    `);
    
    if (queries.rows.length === 0) {
      console.log('  ✅ Nenhuma consulta em execução\n');
      return;
    }
    
    queries.rows.forEach((query, index) => {
      console.log(`  ${index + 1}. PID: ${query.pid}`);
      console.log(`     Estado: ${query.state}`);
      console.log(`     Duração: ${query.duration}`);
      console.log(`     Query: ${query.query.substring(0, 100)}...\n`);
    });
  }

  async checkIndexUsage() {
    console.log('📈 Uso de índices:');
    
    try {
      const indexUsage = await this.pool.query(`
        SELECT 
          schemaname,
          relname as tablename,
          indexrelname as indexname,
          idx_tup_read,
          idx_tup_fetch,
          CASE 
            WHEN idx_tup_read > 0 
            THEN ROUND((idx_tup_fetch::numeric / idx_tup_read::numeric) * 100, 2)
            ELSE 0 
          END as efficiency_percent
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_tup_read DESC
        LIMIT 10;
      `);
      
      if (indexUsage.rows.length === 0) {
        console.log('  ℹ️  Nenhum dado de uso de índices disponível\n');
        return;
      }
      
      indexUsage.rows.forEach((index, i) => {
        console.log(`  ${i + 1}. ${index.tablename}.${index.indexname}`);
        console.log(`     Leituras: ${index.idx_tup_read}`);
        console.log(`     Buscas: ${index.idx_tup_fetch}`);
        console.log(`     Eficiência: ${index.efficiency_percent}%\n`);
      });
    } catch (error) {
      console.log(`  ⚠️  Erro ao verificar uso de índices: ${error.message}\n`);
    }
  }

  async checkTableStats() {
    console.log('📋 Estatísticas das tabelas:');
    
    try {
      const tableStats = await this.pool.query(`
        SELECT 
          schemaname,
          relname as tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC;
      `);
      
      tableStats.rows.forEach((table, i) => {
        console.log(`  ${i + 1}. ${table.tablename}`);
        console.log(`     Tuplas vivas: ${table.live_tuples}`);
        console.log(`     Tuplas mortas: ${table.dead_tuples}`);
        console.log(`     Inserções: ${table.inserts}`);
        console.log(`     Atualizações: ${table.updates}`);
        console.log(`     Exclusões: ${table.deletes}`);
        console.log(`     Último VACUUM: ${table.last_vacuum || 'Nunca'}`);
        console.log(`     Último ANALYZE: ${table.last_analyze || 'Nunca'}\n`);
      });
    } catch (error) {
      console.log(`  ⚠️  Erro ao verificar estatísticas das tabelas: ${error.message}\n`);
    }
  }

  async checkPerformanceSettings() {
    console.log('⚙️  Configurações de performance:');
    
    const settings = await this.pool.query(`
      SELECT name, setting, unit, context
      FROM pg_settings 
      WHERE name IN (
        'shared_buffers', 'effective_cache_size', 'work_mem', 
        'maintenance_work_mem', 'random_page_cost', 'seq_page_cost',
        'cpu_tuple_cost', 'cpu_index_tuple_cost', 'max_connections'
      )
      ORDER BY name;
    `);
    
    settings.rows.forEach(setting => {
      const value = setting.unit ? `${setting.setting} ${setting.unit}` : setting.setting;
      console.log(`  ${setting.name}: ${value} (${setting.context})`);
    });
    
    console.log('');
  }

  async getSlowQueries() {
    console.log('🐌 Consultas lentas (últimas 24h):');
    
    try {
      // Verificar se pg_stat_statements está disponível
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
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements 
        WHERE mean_time > 100
        ORDER BY mean_time DESC 
        LIMIT 5;
      `);
      
      if (slowQueries.rows.length === 0) {
        console.log('  ✅ Nenhuma consulta lenta detectada nas últimas 24h');
        return;
      }
      
      slowQueries.rows.forEach((query, index) => {
        console.log(`  ${index + 1}. ${query.query.substring(0, 80)}...`);
        console.log(`     Chamadas: ${query.calls}`);
        console.log(`     Tempo médio: ${query.mean_time.toFixed(2)}ms`);
        console.log(`     Cache hit: ${query.hit_percent.toFixed(1)}%\n`);
      });
      
    } catch (error) {
      console.log(`  ⚠️  Erro ao verificar consultas lentas: ${error.message}`);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const monitor = new DatabasePerformanceMonitor();
  monitor.monitorPerformance()
    .then(() => {
      console.log('✅ Monitoramento concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha no monitoramento:', error.message);
      process.exit(1);
    });
}

module.exports = DatabasePerformanceMonitor;
