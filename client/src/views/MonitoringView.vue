<template>
  <div class="monitoring-view">
    <div class="monitoring-header">
      <h1>📊 Monitoramento do Sistema</h1>
      <div class="refresh-controls">
        <button @click="refreshData" :disabled="loading" class="btn-refresh">
          🔄 {{ loading ? 'Atualizando...' : 'Atualizar' }}
        </button>
        <label class="auto-refresh">
          <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh">
          Auto-refresh (10s)
        </label>
      </div>
    </div>

    <div class="monitoring-grid">
      <!-- Estatísticas do Sistema -->
      <div class="stats-card">
        <h3>🖥️ Sistema</h3>
        <div class="stat-item">
          <span class="label">CPU:</span>
          <span class="value" :class="getCpuClass(stats.system?.cpu)">
            {{ stats.system?.cpu || 0 }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="label">Memória:</span>
          <span class="value" :class="getMemoryClass(stats.system?.memory)">
            {{ stats.system?.memory || 0 }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="label">Uptime:</span>
          <span class="value">{{ formatUptime(stats.system?.uptime) }}</span>
        </div>
      </div>

      <!-- Performance -->
      <div class="stats-card">
        <h3>⚡ Performance</h3>
        <div class="stat-item">
          <span class="label">Requisições:</span>
          <span class="value">{{ stats.performance?.totalRequests || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Taxa de Erro:</span>
          <span class="value" :class="getErrorRateClass(stats.performance?.errorRate)">
            {{ (stats.performance?.errorRate || 0).toFixed(2) }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="label">Tempo Médio:</span>
          <span class="value" :class="getResponseTimeClass(stats.performance?.avgResponseTime)">
            {{ Math.round(stats.performance?.avgResponseTime || 0) }}ms
          </span>
        </div>
      </div>

      <!-- Cache -->
      <div class="stats-card">
        <h3>📦 Cache</h3>
        <div class="stat-item">
          <span class="label">Tamanho:</span>
          <span class="value">{{ stats.cache?.size || 0 }}/{{ stats.cache?.maxSize || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Hit Rate:</span>
          <span class="value" :class="getCacheHitRateClass(stats.cache?.hitRate)">
            {{ stats.cache?.hitRate || 0 }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="label">Hits:</span>
          <span class="value">{{ stats.cache?.hits || 0 }}</span>
        </div>
      </div>

      <!-- Rate Limiter -->
      <div class="stats-card">
        <h3>🚦 Rate Limiter</h3>
        <div class="stat-item">
          <span class="label">IPs Ativos:</span>
          <span class="value">{{ stats.rateLimiter?.activeIPs || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Usuários Ativos:</span>
          <span class="value">{{ stats.rateLimiter?.activeUsers || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Bloqueios:</span>
          <span class="value" :class="stats.rateLimiter?.blockedIPsCount > 0 ? 'warning' : 'normal'">
            {{ stats.rateLimiter?.blockedIPsCount || 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div class="alerts-section">
      <h3>🚨 Alertas Ativos ({{ alerts.length }})</h3>
      <div v-if="alerts.length === 0" class="no-alerts">
        ✅ Nenhum alerta ativo
      </div>
      <div v-else class="alerts-list">
        <div 
          v-for="alert in alerts" 
          :key="alert.id"
          class="alert-item"
          :class="alert.severity"
        >
          <div class="alert-content">
            <span class="alert-type">{{ alert.type }}</span>
            <span class="alert-message">{{ alert.message }}</span>
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
          </div>
          <button @click="resolveAlert(alert.id)" class="btn-resolve">
            ✅ Resolver
          </button>
        </div>
      </div>
    </div>

    <!-- Gráficos de Performance -->
    <div class="charts-section">
      <h3>📈 Gráficos de Performance</h3>
      <div class="charts-grid">
        <div class="chart-container">
          <h4>CPU Usage</h4>
          <div class="chart-placeholder">
            📊 Gráfico de CPU (implementar com Chart.js)
          </div>
        </div>
        <div class="chart-container">
          <h4>Memory Usage</h4>
          <div class="chart-placeholder">
            📊 Gráfico de Memória (implementar com Chart.js)
          </div>
        </div>
        <div class="chart-container">
          <h4>Response Time</h4>
          <div class="chart-placeholder">
            📊 Gráfico de Tempo de Resposta (implementar com Chart.js)
          </div>
        </div>
        <div class="chart-container">
          <h4>Error Rate</h4>
          <div class="chart-placeholder">
            📊 Gráfico de Taxa de Erro (implementar com Chart.js)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { http } from '../utils/http.js';

export default {
  name: 'MonitoringView',
  data() {
    return {
      stats: {},
      alerts: [],
      loading: false,
      autoRefresh: false,
      refreshInterval: null
    };
  },
  mounted() {
    this.refreshData();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        const [statsResponse, alertsResponse] = await Promise.all([
          http.get('/api/monitoring/stats'),
          http.get('/api/monitoring/alerts')
        ]);
        
        this.stats = statsResponse.data;
        this.alerts = alertsResponse.data;
      } catch (error) {
        console.error('Erro ao carregar dados de monitoramento:', error);
        this.$toast.error('Erro ao carregar dados de monitoramento');
      } finally {
        this.loading = false;
      }
    },
    
    toggleAutoRefresh() {
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 10000); // 10 segundos
    },
    
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
    
    async resolveAlert(alertId) {
      try {
        // Implementar rota para resolver alerta
        // await http.post(`/api/monitoring/alerts/${alertId}/resolve`);
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.$toast.success('Alerta resolvido');
      } catch (error) {
        console.error('Erro ao resolver alerta:', error);
        this.$toast.error('Erro ao resolver alerta');
      }
    },
    
    getCpuClass(cpu) {
      if (cpu > 80) return 'critical';
      if (cpu > 60) return 'warning';
      return 'normal';
    },
    
    getMemoryClass(memory) {
      if (memory > 85) return 'critical';
      if (memory > 70) return 'warning';
      return 'normal';
    },
    
    getErrorRateClass(errorRate) {
      if (errorRate > 10) return 'critical';
      if (errorRate > 5) return 'warning';
      return 'normal';
    },
    
    getResponseTimeClass(responseTime) {
      if (responseTime > 1000) return 'critical';
      if (responseTime > 500) return 'warning';
      return 'normal';
    },
    
    getCacheHitRateClass(hitRate) {
      if (hitRate < 50) return 'critical';
      if (hitRate < 80) return 'warning';
      return 'normal';
    },
    
    formatUptime(seconds) {
      if (!seconds) return '0s';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours}h ${minutes}m ${secs}s`;
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
};
</script>

<style scoped>
.monitoring-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.monitoring-header h1 {
  margin: 0;
  color: #333;
}

.refresh-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-refresh {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-refresh:hover:not(:disabled) {
  background: #0056b3;
}

.btn-refresh:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.stats-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: 600;
  font-size: 16px;
}

.value.normal {
  color: #28a745;
}

.value.warning {
  color: #ffc107;
}

.value.critical {
  color: #dc3545;
}

.alerts-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.alerts-section h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.no-alerts {
  text-align: center;
  color: #28a745;
  font-size: 16px;
  padding: 20px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid;
}

.alert-item.error {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.alert-item.warning {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.alert-item.info {
  background: #d1ecf1;
  border-left-color: #17a2b8;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.alert-type {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
}

.alert-message {
  color: #333;
}

.alert-time {
  font-size: 12px;
  color: #666;
}

.btn-resolve {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-resolve:hover {
  background: #218838;
}

.charts-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.charts-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.chart-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
}

.chart-container h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .monitoring-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .monitoring-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
