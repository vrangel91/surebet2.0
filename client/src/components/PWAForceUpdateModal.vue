<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="pwa-update-modal" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          🔄
        </div>
        <h3>Forçar Atualização PWA</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-section">
          <div class="warning-icon">⚠️</div>
          <h4>Esta ação afetará TODOS os usuários PWA!</h4>
          <p class="warning-text">
            A atualização forçada irá recarregar a aplicação para todos os usuários que estão usando o PWA instalado.
          </p>
        </div>
        
        <div class="impact-list">
          <h5>Impacto da Atualização:</h5>
          <ul>
            <li>📱 <strong>Usuários PWA:</strong> Aplicação será recarregada automaticamente</li>
            <li>💾 <strong>Cache:</strong> Será limpo e atualizado</li>
            <li>📝 <strong>Dados não salvos:</strong> Poderão ser perdidos</li>
            <li>⏱️ <strong>Tempo:</strong> Processo pode levar alguns segundos</li>
          </ul>
        </div>
        
        <div class="reason-section">
          <label for="update-reason">Motivo da Atualização:</label>
          <textarea 
            id="update-reason"
            v-model="reason" 
            class="reason-input"
            placeholder="Descreva o motivo da atualização forçada..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="confirmation-section">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="confirmed"
              class="confirmation-checkbox"
            >
            <span class="checkmark"></span>
            <span class="checkbox-text">
              Confirmo que entendo o impacto desta ação e desejo prosseguir
            </span>
          </label>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">
          Cancelar
        </button>
        <button 
          class="confirm-btn" 
          @click="confirmUpdate"
          :disabled="!confirmed || !reason.trim() || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Forçando Atualização...' : 'Forçar Atualização PWA' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PWAForceUpdateModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      reason: '',
      confirmed: false,
      loading: false
    }
  },
  
  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    
    resetForm() {
      this.reason = ''
      this.confirmed = false
      this.loading = false
    },
    
    async confirmUpdate() {
      if (!this.confirmed || !this.reason.trim() || this.loading) return
      
      try {
        this.loading = true
        
        // Emitir evento de confirmação
        this.$emit('confirm', {
          reason: this.reason,
          timestamp: new Date().toISOString()
        })
        
        // Fechar modal após confirmação
        this.closeModal()
        
      } catch (error) {
        console.error('Erro ao confirmar atualização:', error)
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.pwa-update-modal {
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border-radius: 16px 16px 0 0;
  color: white;
}

.header-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 24px;
}

.warning-section {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-section h4 {
  color: #ffc107;
  margin: 0 0 12px 0;
  font-size: 18px;
}

.warning-text {
  color: var(--text-secondary, #cccccc);
  margin: 0;
  line-height: 1.5;
}

.impact-list {
  margin-bottom: 24px;
}

.impact-list h5 {
  color: var(--text-primary, #ffffff);
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.impact-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.impact-list li {
  color: var(--text-secondary, #cccccc);
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
}

.reason-section {
  margin-bottom: 24px;
}

.reason-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
}

.reason-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-primary, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.reason-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.confirmation-section {
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  background: var(--bg-primary, #1a1a1a);
  border-radius: 8px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  border-color: rgba(255, 107, 53, 0.3);
  background: rgba(255, 107, 53, 0.05);
}

.confirmation-checkbox {
  margin: 0;
  width: 20px;
  height: 20px;
  accent-color: #ff6b35;
}

.checkbox-text {
  color: var(--text-secondary, #cccccc);
  line-height: 1.4;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.confirm-btn {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: center;
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e55a2b, #e57a3a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsividade */
@media (max-width: 768px) {
  .pwa-update-modal {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 20px;
    flex-direction: column;
  }
  
  .confirm-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>
