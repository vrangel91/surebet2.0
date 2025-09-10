<template>
  <div class="user-notification-center">
    <div class="notification-header">
      <h3>📢 Notificações</h3>
      <div class="notification-actions">
        <button @click="markAllAsRead" class="mark-all-btn" :disabled="unreadCount === 0">
          ✅ Marcar Todas como Lidas
        </button>
        <span class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Carregando notificações...
    </div>

    <div v-else-if="notifications.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Nenhuma notificação encontrada</p>
      <small>Você está em dia com todas as notificações!</small>
    </div>

    <div v-else class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        class="notification-item"
        :class="getNotificationClass(notification)"
        @click="toggleNotification(notification)"
      >
        <div class="notification-icon">
          {{ getTypeIcon(notification.type) }}
        </div>
        
        <div class="notification-content">
          <div class="notification-header-content">
            <h4>{{ notification.title }}</h4>
            <div class="notification-meta">
              <span class="priority" :class="'priority-' + notification.priority">
                {{ getPriorityLabel(notification.priority) }}
              </span>
              <span class="date">{{ formatDate(notification.created_at) }}</span>
            </div>
          </div>
          
          <p class="notification-message">{{ notification.message }}</p>
          
          <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0" class="notification-actions">
            <button 
              v-if="notification.metadata.action === 'reload'" 
              @click.stop="reloadPage"
              class="action-btn reload-btn"
            >
              🔄 Recarregar Página
            </button>
            
            <a 
              v-if="notification.metadata.url" 
              :href="notification.metadata.url"
              class="action-btn link-btn"
              target="_blank"
            >
              🔗 Abrir Link
            </a>
          </div>
        </div>
        
        <div class="notification-status">
          <button 
            v-if="!notification.is_read" 
            @click.stop="markAsRead(notification.id)"
            class="mark-read-btn"
            title="Marcar como lida"
          >
            👁️
          </button>
          
          <button 
            @click.stop="dismissNotification(notification.id)"
            class="dismiss-btn"
            title="Descartar"
          >
            ✕
          </button>
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
import { ref, onMounted, onUnmounted } from 'vue';
import axios from '@/utils/axios';

export default {
  name: 'UserNotificationCenter',
  
  setup() {
    const notifications = ref([]);
    const loading = ref(false);
    const unreadCount = ref(0);
    const pagination = ref({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    });

    // Carregar notificações
    const loadNotifications = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        });
        
        const response = await axios.get(`/api/notifications?${params}`);
        notifications.value = response.data.data.notifications;
        pagination.value = response.data.data.pagination;
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        loading.value = false;
      }
    };

    // Carregar contagem de não lidas
    const loadUnreadCount = async () => {
      try {
        const response = await axios.get('/api/notifications/unread-count');
        unreadCount.value = response.data.data.unreadCount;
      } catch (error) {
        console.error('Erro ao carregar contagem de não lidas:', error);
      }
    };

    // Marcar como lida
    const markAsRead = async (id) => {
      try {
        await axios.patch(`/api/notifications/${id}/read`);
        await Promise.all([loadNotifications(), loadUnreadCount()]);
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
      }
    };

    // Marcar todas como lidas
    const markAllAsRead = async () => {
      try {
        await axios.patch('/api/notifications/mark-all-read');
        await Promise.all([loadNotifications(), loadUnreadCount()]);
      } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
      }
    };

    // Descartar notificação
    const dismissNotification = async (id) => {
      try {
        await axios.patch(`/api/notifications/${id}/dismiss`);
        await Promise.all([loadNotifications(), loadUnreadCount()]);
      } catch (error) {
        console.error('Erro ao descartar notificação:', error);
      }
    };

    // Mudar página
    const changePage = (page) => {
      pagination.value.page = page;
      loadNotifications();
    };

    // Alternar notificação (expandir/colapsar)
    const toggleNotification = (notification) => {
      // Implementar lógica de expansão se necessário
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
    };

    // Recarregar página
    const reloadPage = () => {
      window.location.reload();
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

    const getPriorityLabel = (priority) => {
      const labels = {
        low: 'Baixa',
        normal: 'Normal',
        high: 'Alta',
        urgent: 'Urgente'
      };
      return labels[priority] || priority;
    };

    const getNotificationClass = (notification) => {
      return {
        'unread': !notification.is_read,
        'read': notification.is_read,
        [`priority-${notification.priority}`]: true,
        [`type-${notification.type}`]: true
      };
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Agora mesmo';
      } else if (diffInHours < 24) {
        return `Há ${Math.floor(diffInHours)}h`;
      } else if (diffInHours < 48) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    };

    // Carregar dados iniciais
    onMounted(async () => {
      await Promise.all([loadNotifications(), loadUnreadCount()]);
      
      // Atualizar contagem a cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      
      onUnmounted(() => {
        clearInterval(interval);
      });
    });

    return {
      notifications,
      loading,
      unreadCount,
      pagination,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      changePage,
      toggleNotification,
      reloadPage,
      getTypeIcon,
      getPriorityLabel,
      getNotificationClass,
      formatDate
    };
  }
};
</script>

<style scoped>
.user-notification-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.notification-header h3 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mark-all-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.mark-all-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state p {
  margin: 10px 0;
  font-size: 18px;
  color: #333;
}

.empty-state small {
  color: #999;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.notification-item.unread {
  border-left: 4px solid #007bff;
  background: #f8f9ff;
}

.notification-item.priority-urgent {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.notification-item.priority-high {
  border-left-color: #fd7e14;
  background: #fff8f0;
}

.notification-item.priority-normal {
  border-left-color: #ffc107;
  background: #fffdf0;
}

.notification-item.priority-low {
  border-left-color: #28a745;
  background: #f0fff4;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.notification-header-content h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.notification-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-low {
  background: #d4edda;
  color: #155724;
}

.priority-normal {
  background: #fff3cd;
  color: #856404;
}

.priority-high {
  background: #ffeaa7;
  color: #d63031;
}

.priority-urgent {
  background: #ff7675;
  color: white;
}

.date {
  font-size: 12px;
  color: #999;
}

.notification-message {
  margin: 0;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.notification-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-decoration: none;
  display: inline-block;
}

.action-btn:hover {
  background: #0056b3;
}

.reload-btn {
  background: #28a745;
}

.reload-btn:hover {
  background: #218838;
}

.link-btn {
  background: #6f42c1;
}

.link-btn:hover {
  background: #5a32a3;
}

.notification-status {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}

.mark-read-btn,
.dismiss-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.mark-read-btn {
  color: #007bff;
}

.mark-read-btn:hover {
  background: #e3f2fd;
}

.dismiss-btn {
  color: #dc3545;
}

.dismiss-btn:hover {
  background: #ffebee;
}

/* Paginação */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

/* Responsividade */
@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .notification-actions {
    justify-content: center;
  }
  
  .notification-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .notification-header-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .notification-meta {
    align-items: flex-start;
  }
  
  .notification-status {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
