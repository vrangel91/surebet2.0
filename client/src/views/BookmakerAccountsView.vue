<template>
  <!-- Tela de Acesso Restrito para Todos -->
  <div class="restricted-access">
    <div class="restricted-content">
      <div class="restricted-icon">
        <svg width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
        </svg>
      </div>
      
      <h1 class="restricted-title">🔒 Acesso Restrito</h1>
      
      <div class="restricted-message">
        <p class="message-primary">
          Esta funcionalidade está temporariamente indisponível para todos os usuários.
        </p>
        <p class="message-secondary">
          O sistema de gerenciamento de contas de casas de apostas está em manutenção e será reativado em breve.
        </p>
      </div>
      
      <div class="restricted-info">
        <div class="info-item">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V5.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V7.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 9a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V9.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
          <span>Funcionalidade em manutenção</span>
        </div>
        <div class="info-item">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          <span>Será reativada em breve</span>
        </div>
        <div class="info-item">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V5.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V7.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M8 9a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V9.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
          <span>Melhorias em desenvolvimento</span>
        </div>
      </div>
      
      <div class="restricted-actions">
        <button @click="goBack" class="btn btn-secondary">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Voltar
        </button>
        <button @click="goHome" class="btn btn-primary">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
          </svg>
          Ir para o Início
        </button>
      </div>
      
      <div class="restricted-footer">
        <p class="footer-text">
          Para dúvidas sobre esta funcionalidade, entre em contato com o suporte.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmakerAccountsView',
  
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
/* Importar sistema de temas */
@import '@/assets/styles/themes.scss';

/* Tela de Acesso Restrito */
.restricted-access {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
}

.restricted-content {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.restricted-icon {
  margin-bottom: 2rem;
  color: var(--warning);
  filter: drop-shadow(0 0 20px var(--warning-shadow));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.restricted-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 20px var(--warning-shadow);
}

.restricted-message {
  margin-bottom: 2rem;
}

.message-primary {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.message-secondary {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.restricted-info {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item svg {
  color: var(--warning);
  flex-shrink: 0;
}

.restricted-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  min-width: 140px;
  justify-content: center;
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-button-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: var(--bg-gradient-primary-button);
  color: var(--text-dark);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--accent-primary-shadow);
}

.restricted-footer {
  border-top: 1px solid var(--border-primary);
  padding-top: 1.5rem;
}

.footer-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

/* Responsividade */
@media (max-width: 768px) {
  .restricted-access {
    padding: 1rem;
  }
  
  .restricted-content {
    padding: 2rem 1.5rem;
  }
  
  .restricted-title {
    font-size: 2rem;
  }
  
  .restricted-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .restricted-content {
    padding: 1.5rem 1rem;
  }
  
  .restricted-title {
    font-size: 1.75rem;
  }
  
  .message-primary {
    font-size: 1.1rem;
  }
  
  .restricted-info {
    padding: 1rem;
  }
}
</style>

