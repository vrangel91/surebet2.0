<template>
  <div class="admin-notification-panel">
    <!-- PAINEL DE DIAGNÓSTICO E TESTES -->
    <div class="diagnostic-panel">
      <div class="diagnostic-header">
        <h4>🔍 Painel de Diagnóstico - Notificações</h4>
        <button @click="runAllTests" class="test-btn" :disabled="runningTests">
          {{ runningTests ? '🧪 Executando...' : '🧪 Executar Todos os Testes' }}
        </button>
      </div>
      
      <div class="test-results">
                 <div class="test-section">
           <h5>📊 Testes de API</h5>
           <div class="test-item" :class="testResults.apiStats.status">
             <span>Estatísticas:</span>
             <span>{{ testResults.apiStats.message }}</span>
           </div>
           <div class="test-item" :class="testResults.apiNotifications.status">
             <span>Lista de Notificações:</span>
             <span>{{ testResults.apiNotifications.message }}</span>
           </div>
         </div>
        
        <div class="test-section">
          <h5>📈 Testes de Dados</h5>
          <div class="test-item" :class="testResults.dataStructure.status">
            <span>Estrutura de Dados:</span>
            <span>{{ testResults.dataStructure.message }}</span>
          </div>
          <div class="test-item" :class="testResults.dataValidation.status">
            <span>Validação de Dados:</span>
            <span>{{ testResults.dataValidation.message }}</span>
          </div>
        </div>
        
                 <div class="test-section">
           <h5>🎯 Testes de Funcionalidade</h5>
           <div class="test-item" :class="testResults.createNotification.status">
             <span>Criar Notificação:</span>
             <span>{{ testResults.createNotification.message }}</span>
           </div>
           <div class="test-item" :class="testResults.pwaNotification.status">
             <span>Recebimento PWA:</span>
             <span>{{ testResults.pwaNotification.message }}</span>
           </div>
           <div class="test-item" :class="testResults.filters.status">
             <span>Filtros:</span>
             <span>{{ testResults.filters.message }}</span>
           </div>
         </div>
      </div>
      
             <div class="diagnostic-actions">
         <button @click="testCreateNotification" class="test-action-btn">
           ✨ Testar Criação
         </button>
         <button @click="testPWANotification" class="test-action-btn">
           📱 Testar PWA
         </button>
         <button @click="testFilters" class="test-action-btn">
           🔍 Testar Filtros
         </button>
         <button @click="testDataValidation" class="test-action-btn">
           ✅ Validar Dados
         </button>
         <button @click="clearTestResults" class="test-action-btn clear">
           🗑️ Limpar Resultados
         </button>
       </div>
    </div>

    <div class="panel-header">
      <h3>📢 Sistema de Notificações</h3>
      <button @click="showCreateForm = true" class="create-btn">
        ✨ Nova Notificação
      </button>
    </div>

    <!-- Formulário de Criação -->
    <div v-if="showCreateForm" class="create-form">
      <div class="form-header">
        <h4>Criar Nova Notificação</h4>
        <button @click="showCreateForm = false" class="close-btn">✕</button>
      </div>
      
      <form @submit.prevent="createNotification">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Título *</label>
            <input 
              id="title"
              v-model="newNotification.title" 
              type="text" 
              required 
              placeholder="Título da notificação"
              maxlength="255"
            />
          </div>
          
          <div class="form-group">
            <label for="type">Tipo</label>
            <select id="type" v-model="newNotification.type">
              <option value="info">ℹ️ Informação</option>
              <option value="success">✅ Sucesso</option>
              <option value="warning">⚠️ Aviso</option>
              <option value="error">❌ Erro</option>
              <option value="update">🔄 Atualização</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="priority">Prioridade</label>
            <select id="priority" v-model="newNotification.priority">
              <option value="low">🟢 Baixa</option>
              <option value="normal">🟡 Normal</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>
          
                     <div class="form-group">
             <label for="target_audience">Público-Alvo</label>
             <select id="target_audience" v-model="newNotification.target_audience">
               <option value="all">🌍 Todos os Usuários</option>
               <option value="vip">👑 Apenas VIPs</option>
               <option value="admin">🔧 Apenas Administradores</option>
             </select>
           </div>
         </div>

        <div class="form-group">
          <label for="message">Mensagem *</label>
          <textarea 
            id="message"
            v-model="newNotification.message" 
            required 
            placeholder="Mensagem da notificação"
            rows="4"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expires_at">Expira em</label>
            <input 
              id="expires_at"
              v-model="newNotification.expires_at" 
              type="datetime-local"
            />
            <small>Deixe em branco para não expirar</small>
          </div>
          
          <div class="form-group">
            <label for="metadata">Dados Adicionais (JSON)</label>
            <textarea 
              id="metadata"
              v-model="newNotification.metadata" 
              placeholder='{"action": "reload", "url": "/dashboard"}'
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="showCreateForm = false" class="cancel-btn">
            Cancelar
          </button>
          <button type="submit" class="submit-btn" :disabled="isCreating">
            {{ isCreating ? 'Enviando...' : 'Enviar Notificação' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Estatísticas -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total || 0 }}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.unread || 0 }}</div>
        <div class="stat-label">Não Lidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.dismissed || 0 }}</div>
        <div class="stat-label">Descartadas</div>
      </div>
    </div>

    <!-- Lista de Notificações -->
    <div class="notifications-list">
      <div class="list-header">
        <h4>Histórico de Notificações</h4>
        <div class="filters">
          <select v-model="filters.type" @change="loadNotifications">
            <option value="">Todos os Tipos</option>
            <option value="info">ℹ️ Informação</option>
            <option value="success">✅ Sucesso</option>
            <option value="warning">⚠️ Aviso</option>
            <option value="error">❌ Erro</option>
            <option value="update">🔄 Atualização</option>
          </select>
          
          <select v-model="filters.priority" @change="loadNotifications">
            <option value="">Todas as Prioridades</option>
            <option value="low">🟢 Baixa</option>
            <option value="normal">🟡 Normal</option>
            <option value="high">🟠 Alta</option>
            <option value="urgent">🔴 Urgente</option>
          </select>
          
                     <select v-model="filters.target_audience" @change="loadNotifications">
             <option value="">Todos os Públicos</option>
             <option value="all">🌍 Todos</option>
             <option value="vip">👑 VIPs</option>
             <option value="admin">🔧 Admins</option>
           </select>
        </div>
      </div>

      <div v-if="loading" class="loading">
        Carregando notificações...
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        Nenhuma notificação encontrada
      </div>

      <div v-else class="notifications-grid">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-card"
          :class="getNotificationClass(notification)"
        >
          <div class="notification-header">
            <div class="notification-type">
              {{ getTypeIcon(notification.type) }}
            </div>
            <div class="notification-priority">
              {{ getPriorityIcon(notification.priority) }}
            </div>
            <div class="notification-actions">
              <button @click="deleteNotification(notification.id)" class="delete-btn" title="Deletar">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="notification-content">
            <h5>{{ notification.title }}</h5>
            <p>{{ notification.message }}</p>
          </div>
          
          <div class="notification-footer">
            <div class="notification-meta">
              <span class="audience">{{ getAudienceLabel(notification.target_audience) }}</span>
              <span class="date">{{ formatDate(notification.created_at) }}</span>
            </div>
            <div class="notification-status">
              <span v-if="notification.is_read" class="read">✅ Lida</span>
              <span v-else class="unread">🔴 Não lida</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginação -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          ← Anterior
        </button>
        
        <span class="page-info">
          Página {{ pagination.page }} de {{ pagination.pages }}
        </span>
        
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.pages"
          class="page-btn"
        >
          Próxima →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { adminAPI } from '@/api/admin';

export default {
  name: 'AdminNotificationPanel',
  
  setup() {
    const showCreateForm = ref(false);
    const loading = ref(false);
    const isCreating = ref(false);
    const runningTests = ref(false);
    
         const notifications = ref([]);
     const stats = ref({});
    const pagination = ref({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    });
    
    const filters = reactive({
      type: '',
      priority: '',
      target_audience: ''
    });
    
         const newNotification = reactive({
       title: '',
       message: '',
       type: 'info',
       priority: 'normal',
       target_audience: 'all',
       expires_at: '',
       metadata: ''
     });

         // Resultados dos testes
     const testResults = reactive({
       apiStats: { status: 'info', message: 'Não testado' },
       apiNotifications: { status: 'info', message: 'Não testado' },
       dataStructure: { status: 'info', message: 'Não testado' },
       dataValidation: { status: 'info', message: 'Não testado' },
       createNotification: { status: 'info', message: 'Não testado' },
       pwaNotification: { status: 'info', message: 'Não testado' },
       filters: { status: 'info', message: 'Não testado' }
     });

    // Carregar notificações
    const loadNotifications = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        });
        
        if (filters.type) params.append('type', filters.type);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.target_audience) params.append('target_audience', filters.target_audience);
        
        const response = await adminAPI.getNotifications(params.toString());
        console.log('📊 Resposta da API notificações:', response.data);
        console.log('📊 Tipo da resposta:', typeof response.data);
        console.log('📊 Propriedades da resposta:', Object.keys(response.data));
        
        // Verificar se a resposta tem a estrutura esperada
        if (response && response.success && response.data && Array.isArray(response.data.notifications)) {
          notifications.value = response.data.notifications;
          pagination.value = response.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 };
          console.log('✅ Notificações carregadas:', notifications.value.length);
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response);
          console.warn('⚠️ Estrutura esperada: { success: true, data: { notifications: [...], pagination: {...} } }');
          console.warn('⚠️ Estrutura recebida:', response);
          notifications.value = [];
          pagination.value = { page: 1, limit: 20, total: 0, pages: 1 };
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        notifications.value = [];
        pagination.value = { page: 1, limit: 20, total: 0, pages: 1 };
      } finally {
        loading.value = false;
      }
    };

    // Carregar estatísticas
    const loadStats = async () => {
      try {
        const response = await adminAPI.getNotificationStats();
        console.log('📊 Resposta da API estatísticas:', response.data);
        console.log('📊 Tipo da resposta:', typeof response.data);
        console.log('📊 Propriedades da resposta:', Object.keys(response.data));
        
        // Verificar se a resposta tem a estrutura esperada
        if (response && response.success && response.data) {
          stats.value = response.data;
          console.log('✅ Estatísticas carregadas');
        } else {
          console.warn('⚠️ Resposta da API não contém dados válidos:', response);
          console.warn('⚠️ Estrutura esperada: { success: true, data: { ... } }');
          console.warn('⚠️ Estrutura recebida:', response);
          stats.value = { total: 0, unread: 0, dismissed: 0, byType: [], byAudience: [] };
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        stats.value = { total: 0, unread: 0, dismissed: 0, byType: [], byAudience: [] };
      }
    };

    

    // Criar notificação
    const createNotification = async () => {
      isCreating.value = true;
      try {
        const notificationData = { ...newNotification };
        
        // Converter metadata de string para objeto
        if (notificationData.metadata) {
          try {
            notificationData.metadata = JSON.parse(notificationData.metadata);
          } catch (e) {
            notificationData.metadata = {};
          }
        }
        
        
        
        await adminAPI.sendNotification(notificationData);
        
                 // Limpar formulário
         Object.assign(newNotification, {
           title: '',
           message: '',
           type: 'info',
           priority: 'normal',
           target_audience: 'all',
           expires_at: '',
           metadata: ''
         });
        
        showCreateForm.value = false;
        
        // Recarregar dados
        await Promise.all([loadNotifications(), loadStats()]);
        
        // Mostrar mensagem de sucesso
        alert('Notificação enviada com sucesso!');
        
      } catch (error) {
        console.error('Erro ao criar notificação:', error);
        alert('Erro ao enviar notificação: ' + (error.response?.data?.error || error.message));
      } finally {
        isCreating.value = false;
      }
    };

    // Deletar notificação
    const deleteNotification = async (id) => {
      if (!confirm('Tem certeza que deseja deletar esta notificação?')) return;
      
      try {
        await adminAPI.deleteNotification(id);
        await Promise.all([loadNotifications(), loadStats()]);
        alert('Notificação deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        alert('Erro ao deletar notificação: ' + (error.response?.data?.error || error.message));
      }
    };

    // Mudar página
    const changePage = (page) => {
      pagination.value.page = page;
      loadNotifications();
    };

    

    // Utilitários
    const getTypeIcon = (type) => {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        update: '🔄'
      };
      return icons[type] || 'ℹ️';
    };

    const getPriorityIcon = (priority) => {
      const icons = {
        low: '🟢',
        normal: '🟡',
        high: '🟠',
        urgent: '🔴'
      };
      return icons[priority] || '🟡';
    };

    const getNotificationClass = (notification) => {
      return {
        [`priority-${notification.priority}`]: true,
        [`type-${notification.type}`]: true
      };
    };

         const getAudienceLabel = (audience) => {
       const labels = {
         all: '🌍 Todos',
         vip: '👑 VIPs',
         admin: '🔧 Admins'
       };
       return labels[audience] || audience;
     };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('pt-BR');
    };

    // MÉTODOS DE TESTE
    const runAllTests = async () => {
      runningTests.value = true;
      console.log('🧪 Iniciando execução de todos os testes...');
      
             try {
         await Promise.all([
           testAPIStats(),
           testAPINotifications(),
           testDataStructure(),
           testDataValidation(),
           testCreateNotification(),
           testPWANotification(),
           testFilters()
         ]);
        
        console.log('✅ Todos os testes foram executados!');
      } catch (error) {
        console.error('❌ Erro durante execução dos testes:', error);
      } finally {
        runningTests.value = false;
      }
    };

    const testAPIStats = async () => {
      try {
        console.log('🧪 Testando API de estatísticas...');
        const response = await adminAPI.getNotificationStats();
        
        if (response && response.success && response.data) {
          testResults.apiStats = { 
            status: 'success', 
            message: `✅ API OK - Total: ${response.data.total || 0}, Não lidas: ${response.data.unread || 0}` 
          };
        } else {
          testResults.apiStats = { 
            status: 'error', 
            message: `❌ Estrutura inválida: ${JSON.stringify(response).substring(0, 100)}...` 
          };
        }
      } catch (error) {
        testResults.apiStats = { 
          status: 'error', 
          message: `❌ Erro: ${error.message}` 
        };
      }
    };

    const testAPINotifications = async () => {
      try {
        console.log('🧪 Testando API de notificações...');
        const response = await adminAPI.getNotifications();
        
        if (response && response.success && response.data && Array.isArray(response.data.notifications)) {
          testResults.apiNotifications = { 
            status: 'success', 
            message: `✅ API OK - ${response.data.notifications.length} notificações encontradas` 
          };
        } else {
          testResults.apiNotifications = { 
            status: 'error', 
            message: `❌ Estrutura inválida: ${JSON.stringify(response).substring(0, 100)}...` 
          };
        }
      } catch (error) {
        testResults.apiNotifications = { 
          status: 'error', 
          message: `❌ Erro: ${error.message}` 
        };
      }
    };

    

    const testDataStructure = () => {
      console.log('🧪 Testando estrutura de dados...');
      
      const issues = [];
      
      // Verificar estrutura de notificações
      if (notifications.value.length > 0) {
        const sample = notifications.value[0];
        const requiredFields = ['id', 'title', 'message', 'type', 'priority', 'target_audience'];
        
        requiredFields.forEach(field => {
          if (!(field in sample)) {
            issues.push(`Campo '${field}' ausente em notificações`);
          }
        });
      }
      
      // Verificar estrutura de estatísticas
      if (stats.value && Object.keys(stats.value).length > 0) {
        const requiredStats = ['total', 'unread', 'dismissed'];
        requiredStats.forEach(stat => {
          if (!(stat in stats.value)) {
            issues.push(`Estatística '${stat}' ausente`);
          }
        });
      }
      
      if (issues.length === 0) {
        testResults.dataStructure = { 
          status: 'success', 
          message: '✅ Estrutura de dados válida' 
        };
      } else {
        testResults.dataStructure = { 
          status: 'warning', 
          message: `⚠️ ${issues.length} problemas encontrados: ${issues.join(', ')}` 
        };
      }
    };

    const testDataValidation = () => {
      console.log('🧪 Testando validação de dados...');
      
      const issues = [];
      
      // Validar notificações
      notifications.value.forEach((notification, index) => {
        if (!notification.title || notification.title.trim() === '') {
          issues.push(`Notificação ${index + 1}: título vazio`);
        }
        if (!notification.message || notification.message.trim() === '') {
          issues.push(`Notificação ${index + 1}: mensagem vazia`);
        }
        if (!['info', 'success', 'warning', 'error', 'update'].includes(notification.type)) {
          issues.push(`Notificação ${index + 1}: tipo inválido '${notification.type}'`);
        }
        if (!['low', 'normal', 'high', 'urgent'].includes(notification.priority)) {
          issues.push(`Notificação ${index + 1}: prioridade inválida '${notification.priority}'`);
        }
      });
      
      if (issues.length === 0) {
        testResults.dataValidation = { 
          status: 'success', 
          message: '✅ Dados validados com sucesso' 
        };
      } else {
        testResults.dataValidation = { 
          status: 'warning', 
          message: `⚠️ ${issues.length} problemas de validação: ${issues.slice(0, 3).join(', ')}...` 
        };
      }
    };

         const testCreateNotification = async () => {
       try {
         console.log('🧪 Testando criação de notificação...');
         
         // Simular dados de teste
         const testData = {
           title: '🧪 Notificação de Teste',
           message: 'Esta é uma notificação de teste para verificar a funcionalidade',
           type: 'info',
           priority: 'normal',
           target_audience: 'all',
           expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
         };
         
         // Testar se a API aceita os dados
         const response = await adminAPI.sendNotification(testData);
         
         if (response && response.success) {
           testResults.createNotification = { 
             status: 'success', 
             message: '✅ Criação de notificação funcionando' 
           };
           
           // Recarregar dados para mostrar a nova notificação
           await Promise.all([loadNotifications(), loadStats()]);
         } else {
           testResults.createNotification = { 
             status: 'error', 
             message: `❌ Falha na criação: ${response?.error || 'Erro desconhecido'}` 
           };
         }
       } catch (error) {
         testResults.createNotification = { 
           status: 'error', 
           message: `❌ Erro na criação: ${error.message}` 
         };
       }
     };

     const testPWANotification = async () => {
       try {
         console.log('🧪 Testando funcionalidades PWA...');
         
         const pwaChecks = {
           serviceWorker: false,
           notifications: false,
           permission: false,
           apiWorking: false,
           notificationSaved: false
         };
         
         // 1. Verificar suporte ao Service Worker
         if ('serviceWorker' in navigator) {
           pwaChecks.serviceWorker = true;
           console.log('✅ Service Worker suportado');
         } else {
           console.log('❌ Service Worker não suportado');
         }
         
         // 2. Verificar suporte a notificações
         if ('Notification' in window) {
           pwaChecks.notifications = true;
           console.log('✅ Notificações suportadas');
         } else {
           console.log('❌ Notificações não suportadas');
         }
         
         // 3. Verificar permissão de notificação
         if (Notification.permission === 'granted') {
           pwaChecks.permission = true;
           console.log('✅ Permissão de notificação concedida');
         } else if (Notification.permission === 'default') {
           console.log('⚠️ Permissão de notificação não solicitada');
           const permission = await Notification.requestPermission();
           if (permission === 'granted') {
             pwaChecks.permission = true;
             console.log('✅ Permissão de notificação concedida após solicitação');
           } else {
             console.log('❌ Permissão de notificação negada');
           }
         } else {
           console.log('❌ Permissão de notificação negada');
         }
         
         // 4. Testar criação de notificação via API
         const testData = {
           title: '🧪 Teste PWA - Funcionalidade',
           message: 'Esta notificação testa se o sistema PWA está funcionando corretamente',
           type: 'info',
           priority: 'normal',
           target_audience: 'all',
           metadata: JSON.stringify({
             action: 'test',
             timestamp: Date.now(),
             source: 'pwa-test'
           })
         };
         
         const response = await adminAPI.sendNotification(testData);
         
         if (response && response.success) {
           pwaChecks.apiWorking = true;
           console.log('✅ API de notificação funcionando');
           
           // Aguardar processamento
           await new Promise(resolve => setTimeout(resolve, 2000));
           
           // 5. Verificar se a notificação foi salva no banco
           await loadNotifications();
           const savedNotification = notifications.value && Array.isArray(notifications.value) 
             ? notifications.value.find(n => 
                 n.title.includes('🧪 Teste PWA') && 
                 n.metadata?.source === 'pwa-test'
               )
             : null;
           
           if (savedNotification) {
             pwaChecks.notificationSaved = true;
             console.log('✅ Notificação salva no banco de dados');
           } else {
             console.log('❌ Notificação não foi salva no banco');
           }
         } else {
           console.log('❌ API de notificação falhou');
         }
         
         // 6. Criar notificação local para teste (se permissão concedida)
         if (pwaChecks.permission) {
           try {
             const localNotification = new Notification('🧪 Teste PWA Local', {
               body: 'Esta é uma notificação local para testar o PWA',
               icon: '/favicon.ico',
               tag: 'pwa-test-local'
             });
             
             // Fechar após 3 segundos
             setTimeout(() => {
               localNotification.close();
             }, 3000);
             
             console.log('✅ Notificação local criada com sucesso');
           } catch (error) {
             console.log('❌ Erro ao criar notificação local:', error);
           }
         }
         
         // 7. Determinar resultado final
         const totalChecks = Object.keys(pwaChecks).length;
         const passedChecks = Object.values(pwaChecks).filter(Boolean).length;
         
         if (passedChecks === totalChecks) {
           testResults.pwaNotification = { 
             status: 'success', 
             message: `✅ PWA totalmente funcional (${passedChecks}/${totalChecks} testes passaram)` 
           };
         } else if (passedChecks >= totalChecks * 0.6) {
           testResults.pwaNotification = { 
             status: 'warning', 
             message: `⚠️ PWA parcialmente funcional (${passedChecks}/${totalChecks} testes passaram)` 
           };
         } else {
           testResults.pwaNotification = { 
             status: 'error', 
             message: `❌ PWA com problemas (${passedChecks}/${totalChecks} testes passaram)` 
           };
         }
         
         console.log(`📊 Resultado PWA: ${passedChecks}/${totalChecks} testes passaram`);
         
       } catch (error) {
         console.error('Erro no teste PWA:', error);
         testResults.pwaNotification = { 
           status: 'error', 
           message: `❌ Erro no teste PWA: ${error.message}` 
         };
       }
     };

    const testFilters = () => {
      console.log('🧪 Testando filtros...');
      
      const issues = [];
      
      // Testar filtro por tipo
      if (filters.type) {
        const filteredByType = notifications.value.filter(n => n.type === filters.type);
        if (filteredByType.length === 0 && notifications.value.length > 0) {
          issues.push('Filtro por tipo não está funcionando');
        }
      }
      
      // Testar filtro por prioridade
      if (filters.priority) {
        const filteredByPriority = notifications.value.filter(n => n.priority === filters.priority);
        if (filteredByPriority.length === 0 && notifications.value.length > 0) {
          issues.push('Filtro por prioridade não está funcionando');
        }
      }
      
      // Testar filtro por público-alvo
      if (filters.target_audience) {
        const filteredByAudience = notifications.value.filter(n => n.target_audience === filters.target_audience);
        if (filteredByAudience.length === 0 && notifications.value.length > 0) {
          issues.push('Filtro por público-alvo não está funcionando');
        }
      }
      
      if (issues.length === 0) {
        testResults.filters = { 
          status: 'success', 
          message: '✅ Filtros funcionando corretamente' 
        };
      } else {
        testResults.filters = { 
          status: 'warning', 
          message: `⚠️ ${issues.length} problemas nos filtros: ${issues.join(', ')}` 
        };
      }
    };

    const clearTestResults = () => {
      Object.keys(testResults).forEach(key => {
        testResults[key] = { status: 'info', message: 'Não testado' };
      });
      console.log('🧹 Resultados dos testes limpos');
    };

         // Carregar dados iniciais
     onMounted(async () => {
       try {
         await Promise.all([loadNotifications(), loadStats()]);
       } catch (error) {
         console.error('Erro ao carregar dados iniciais:', error);
       }
     });

                return {
         showCreateForm,
         loading,
         isCreating,
         runningTests,
         notifications,
         stats,
         pagination,
         filters,
         newNotification,
         testResults,
         loadNotifications,
         createNotification,
         deleteNotification,
         changePage,
         getTypeIcon,
         getPriorityIcon,
         getNotificationClass,
         getAudienceLabel,
         formatDate,
         runAllTests,
         testCreateNotification,
         testPWANotification,
         testFilters,
         testDataValidation,
         clearTestResults
       };
  }
};
</script>

<style scoped>
.admin-notification-panel {
  padding: 20px;
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.diagnostic-panel {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.diagnostic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.diagnostic-header h4 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 20px;
  font-weight: 600;
}

.test-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.test-btn:hover:not(:disabled) {
  background: #00cc6a;
  transform: translateY(-1px);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-results {
  margin-bottom: 20px;
}

.test-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.test-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.test-section h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text-primary, #ffffff);
  font-size: 16px;
  font-weight: 600;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary, #ffffff);
}

.test-item.success {
  background-color: rgba(40, 167, 69, 0.1);
  border: 1px solid #28a745;
}

.test-item.warning {
  background-color: rgba(253, 126, 20, 0.1);
  border: 1px solid #fd7e14;
}

.test-item.error {
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
}

.test-item.info {
  background-color: rgba(0, 123, 255, 0.1);
  border: 1px solid #007bff;
}

.test-item span:first-child {
  font-weight: 600;
  color: var(--text-secondary, #888888);
}

.test-item span:last-child {
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.diagnostic-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.test-action-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.test-action-btn:hover:not(:disabled) {
  background: #00cc6a;
  transform: translateY(-1px);
}

.test-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-action-btn.clear {
  background: #dc3545;
  color: #ffffff;
}

.test-action-btn.clear:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

/* Responsividade para o painel de diagnóstico */
@media (max-width: 768px) {
  .diagnostic-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .diagnostic-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .test-action-btn {
    width: 100%;
  }
  
  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 24px;
  font-weight: 700;
}

.create-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: #00cc6a;
  transform: translateY(-1px);
}

.create-btn:hover {
  background: #218838;
}

/* Formulário de Criação */
.create-form {
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h4 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary, #888888);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary, #ffffff);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group small {
  color: var(--text-secondary, #888888);
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #00cc6a;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Estatísticas */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.stat-card {
  background: var(--bg-primary, #1a1a1a);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary, #888888);
  font-size: 14px;
}

/* Lista de Notificações */
.notifications-list {
  background: var(--bg-primary, #1a1a1a);
  border-radius: 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.list-header h4 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 18px;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  transition: all 0.2s ease;
}

.filters select:focus {
  outline: none;
  border-color: #00ff88;
}

.loading,
.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary, #888888);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notifications-grid {
  display: grid;
  gap: 15px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.notification-card {
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 15px;
  background: var(--bg-secondary, #2a2a2a);
  transition: all 0.2s ease;
}

.notification-card:hover {
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateY(-1px);
}

.notification-card.priority-urgent {
  border-left: 4px solid #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.notification-card.priority-high {
  border-left: 4px solid #fd7e14;
  background: rgba(253, 126, 20, 0.1);
}

.notification-card.priority-normal {
  border-left: 4px solid #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.notification-card.priority-low {
  border-left: 4px solid #28a745;
  background: #f0fff4;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notification-type,
.notification-priority {
  font-size: 18px;
}

.notification-actions {
  display: flex;
  gap: 5px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #dc3545;
}

.notification-content h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary, #ffffff);
  font-size: 16px;
  font-weight: 600;
}

.notification-content p {
  margin: 0;
  color: var(--text-secondary, #cccccc);
  line-height: 1.4;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.notification-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.audience {
  font-size: 12px;
  color: var(--text-secondary, #888888);
}

.date {
  font-size: 12px;
  color: var(--text-secondary, #666666);
}

.notification-status {
  font-size: 12px;
}

.read {
  color: #28a745;
}

.unread {
  color: #dc3545;
}

/* Paginação */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  flex-shrink: 0;
}

.page-btn {
  background: #00ff88;
  color: #1a1a1a;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #00cc6a;
  transform: translateY(-1px);
}

.page-btn:disabled {
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-secondary, #888888);
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary, #888888);
  font-size: 14px;
}

/* Responsividade */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .admin-notification-panel {
    padding: 16px;
  }
  
  .create-form {
    padding: 20px;
  }
}
</style>
