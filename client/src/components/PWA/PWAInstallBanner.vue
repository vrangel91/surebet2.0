<template>
  <!-- Banner de instalação PWA para mobile -->
  <div v-if="showPWAInstall" class="pwa-install-banner">
    <div class="pwa-content">
      <div class="pwa-icon">📱</div>
      <div class="pwa-text">
        <h3>Instalar App</h3>
        <p>Instale o SureStake para acesso rápido e offline</p>
      </div>
      <div class="pwa-actions">
        <button @click="installPWA" class="pwa-install-btn">
          Instalar
        </button>
        <button @click="dismissPWA" class="pwa-dismiss-btn">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PWAInstallBanner',
  data() {
    return {
      showPWAInstall: false,
      deferredPrompt: null,
      isPWAInstalled: false,
    }
  },
  mounted() {
    this.setupPWA()
  },
  methods: {
    setupPWA() {
      // Verificar se já está instalado
      if (this.checkIfPWAInstalled()) {
        return
      }
      
      // Verificar se foi dispensado recentemente (7 dias)
      const dismissed = localStorage.getItem('pwa_dismissed')
      if (dismissed) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) {
          return
        }
      }
      
      // Detectar se é mobile
      if (this.isMobileDevice()) {
        console.log('📱 Dispositivo móvel detectado')
        console.log('🍎 É iOS?', this.isIOS())
        console.log('🤖 User Agent:', navigator.userAgent)
        
        // Para iOS, sempre mostrar o banner (não depende de beforeinstallprompt)
        if (this.isIOS()) {
          this.showPWAInstall = true
          console.log('📱 iOS detectado - mostrando banner PWA')
          return
        }
        
        // Para Android e outros, usar beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault()
          this.deferredPrompt = e
          this.showPWAInstall = true
          console.log('📱 PWA pode ser instalado')
        })
        
        // Detectar se foi instalado
        window.addEventListener('appinstalled', () => {
          this.isPWAInstalled = true
          this.showPWAInstall = false
          console.log('✅ PWA instalado com sucesso')
        })
      }
    },

    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
             (window.innerWidth <= 768)
    },

    isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    },

    checkIfPWAInstalled() {
      // Verificar se está rodando como PWA
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        this.isPWAInstalled = true
        this.showPWAInstall = false
        return true
      }
      return false
    },

    async installPWA() {
      // Para iOS, sempre mostrar instruções manuais
      if (this.isIOS()) {
        this.showManualInstallInstructions()
        return
      }

      if (!this.deferredPrompt) {
        // Fallback para instruções manuais
        this.showManualInstallInstructions()
        return
      }

      try {
        // Mostrar prompt de instalação
        this.deferredPrompt.prompt()
        
        // Aguardar resposta do usuário
        const { outcome } = await this.deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar PWA')
        } else {
          console.log('❌ Usuário rejeitou instalar PWA')
        }
        
        // Limpar prompt
        this.deferredPrompt = null
        this.showPWAInstall = false
      } catch (error) {
        console.error('❌ Erro ao instalar PWA:', error)
        this.showManualInstallInstructions()
      }
    },

    dismissPWA() {
      this.showPWAInstall = false
      // Salvar no localStorage para não mostrar novamente por 7 dias
      localStorage.setItem('pwa_dismissed', Date.now().toString())
      
      // Mostrar toast de confirmação
      this.showDismissToast()
    },

    showDismissToast() {
      // Criar toast estilizado
      const toast = document.createElement('div')
      toast.className = 'pwa-dismiss-toast'
      toast.innerHTML = `
        <div class="pwa-toast-content">
          <div class="pwa-toast-icon">⏰</div>
          <div class="pwa-toast-text">
            <h4>Lembraremos em 7 dias</h4>
            <p>Você pode instalar o app a qualquer momento</p>
          </div>
          <button class="pwa-toast-close" onclick="this.closest('.pwa-dismiss-toast').remove()">✕</button>
        </div>
      `
      
      // Adicionar estilos
      const style = document.createElement('style')
      style.textContent = this.getToastStyles()
      document.head.appendChild(style)
      
      // Adicionar toast ao body
      document.body.appendChild(toast)
      
      // Animação de entrada
      setTimeout(() => {
        toast.classList.add('pwa-toast-show')
      }, 100)
      
      // Remover automaticamente após 5 segundos
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove('pwa-toast-show')
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove()
            }
          }, 300)
        }
      }, 5000)
      
      // Fechar ao clicar no X
      toast.querySelector('.pwa-toast-close').addEventListener('click', () => {
        toast.classList.remove('pwa-toast-show')
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
        }, 300)
      })
    },

    getToastStyles() {
      return `
        .pwa-dismiss-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          max-width: 400px;
          width: 100%;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pwa-dismiss-toast.pwa-toast-show {
          opacity: 1;
          transform: translateX(0);
        }

        .pwa-toast-content {
          background: var(--bg-modal, rgba(255, 255, 255, 0.95));
          border: 1px solid var(--border-modal, rgba(0, 0, 0, 0.1));
          border-radius: 12px;
          box-shadow: var(--shadow-modal, 0 10px 25px rgba(0, 0, 0, 0.2));
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .pwa-toast-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--bg-gradient-primary-button, linear-gradient(135deg, #00ff88, #00cc6a));
        }

        .pwa-toast-icon {
          font-size: 24px;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        .pwa-toast-text {
          flex: 1;
          min-width: 0;
        }

        .pwa-toast-text h4 {
          margin: 0 0 4px 0;
          color: var(--text-primary, #1a1a1a);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }

        .pwa-toast-text p {
          margin: 0;
          color: var(--text-secondary, #6c757d);
          font-size: 12px;
          line-height: 1.3;
        }

        .pwa-toast-close {
          background: none;
          border: none;
          color: var(--text-secondary, #6c757d);
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .pwa-toast-close:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
          color: var(--text-primary, #1a1a1a);
          transform: scale(1.1);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .pwa-dismiss-toast {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .pwa-toast-content {
            padding: 12px;
            gap: 10px;
          }

          .pwa-toast-icon {
            font-size: 20px;
          }

          .pwa-toast-text h4 {
            font-size: 13px;
          }

          .pwa-toast-text p {
            font-size: 11px;
          }

          .pwa-toast-close {
            width: 20px;
            height: 20px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .pwa-dismiss-toast {
            top: 5px;
            right: 5px;
            left: 5px;
          }

          .pwa-toast-content {
            padding: 10px;
            gap: 8px;
          }

          .pwa-toast-text h4 {
            font-size: 12px;
          }

          .pwa-toast-text p {
            font-size: 10px;
          }
        }
      `
    },

    showManualInstallInstructions() {
      // Criar modal estilizado
      const modal = document.createElement('div')
      modal.className = 'pwa-instructions-modal'
      modal.innerHTML = `
        <div class="pwa-instructions-overlay">
          <div class="pwa-instructions-content">
            <div class="pwa-instructions-header">
              <div class="pwa-instructions-icon">📱</div>
              <h3>Como Instalar o App</h3>
              <button class="pwa-instructions-close" onclick="this.closest('.pwa-instructions-modal').remove()">✕</button>
            </div>
            <div class="pwa-instructions-body">
              ${this.getInstallInstructions()}
            </div>
            <div class="pwa-instructions-footer">
              <button class="pwa-instructions-btn" onclick="this.closest('.pwa-instructions-modal').remove()">
                Entendi
              </button>
            </div>
          </div>
        </div>
      `
      
      // Adicionar estilos
      const style = document.createElement('style')
      style.textContent = this.getModalStyles()
      document.head.appendChild(style)
      
      // Adicionar modal ao body
      document.body.appendChild(modal)
      
      // Fechar ao clicar no overlay
      modal.querySelector('.pwa-instructions-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          modal.remove()
        }
      })
    },

    getInstallInstructions() {
      const isIOS = this.isIOS()
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isIOS) {
        return `
          <div class="pwa-instructions-steps">
            <div class="pwa-step">
              <div class="pwa-step-number">1</div>
              <div class="pwa-step-content">
                <h4>Toque no botão de compartilhar</h4>
                <p>Na barra inferior do Safari, toque no ícone de compartilhar (📤)</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">2</div>
              <div class="pwa-step-content">
                <h4>Selecione "Adicionar à Tela de Início"</h4>
                <p>Role para baixo e toque em "Adicionar à Tela de Início"</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">3</div>
              <div class="pwa-step-content">
                <h4>Confirme a instalação</h4>
                <p>Toque em "Adicionar" no canto superior direito</p>
              </div>
            </div>
            <div class="pwa-step-success">
              <div class="pwa-success-icon">✨</div>
              <div class="pwa-success-text">
                <h4>Pronto!</h4>
                <p>O app aparecerá na sua tela inicial como um ícone nativo</p>
              </div>
            </div>
          </div>
        `
      } else if (isAndroid) {
        return `
          <div class="pwa-instructions-steps">
            <div class="pwa-step">
              <div class="pwa-step-number">1</div>
              <div class="pwa-step-content">
                <h4>Toque no menu</h4>
                <p>No canto superior direito, toque no menu (⋮)</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">2</div>
              <div class="pwa-step-content">
                <h4>Selecione "Instalar app"</h4>
                <p>Procure por "Instalar app" ou "Adicionar à tela inicial"</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">3</div>
              <div class="pwa-step-content">
                <h4>Confirme a instalação</h4>
                <p>Toque em "Instalar" para confirmar</p>
              </div>
            </div>
            <div class="pwa-step-success">
              <div class="pwa-success-icon">✨</div>
              <div class="pwa-success-text">
                <h4>Pronto!</h4>
                <p>O app aparecerá na sua tela inicial</p>
              </div>
            </div>
          </div>
        `
      } else {
        return `
          <div class="pwa-instructions-steps">
            <div class="pwa-step">
              <div class="pwa-step-number">1</div>
              <div class="pwa-step-content">
                <h4>Procure pelo ícone de instalação</h4>
                <p>Na barra de endereços, procure pelo ícone de instalação</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">2</div>
              <div class="pwa-step-content">
                <h4>Ou use o menu do navegador</h4>
                <p>Clique no menu (⋮) → "Instalar"</p>
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-number">3</div>
              <div class="pwa-step-content">
                <h4>Confirme a instalação</h4>
                <p>Clique em "Instalar" para confirmar</p>
              </div>
            </div>
            <div class="pwa-step-success">
              <div class="pwa-success-icon">✨</div>
              <div class="pwa-success-text">
                <h4>Pronto!</h4>
                <p>O app será instalado como aplicativo nativo</p>
              </div>
            </div>
          </div>
        `
      }
    },

    getModalStyles() {
      return `
        .pwa-instructions-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pwa-instructions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-strong, rgba(0, 0, 0, 0.7));
          backdrop-filter: blur(5px);
        }

        .pwa-instructions-content {
          position: relative;
          background: var(--bg-modal, rgba(255, 255, 255, 0.95));
          border-radius: 16px;
          box-shadow: var(--shadow-modal, 0 10px 25px rgba(0, 0, 0, 0.2));
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid var(--border-modal, rgba(0, 0, 0, 0.1));
        }

        .pwa-instructions-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid var(--border-separator, rgba(0, 0, 0, 0.1));
        }

        .pwa-instructions-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .pwa-instructions-header h3 {
          flex: 1;
          margin: 0;
          color: var(--text-primary, #1a1a1a);
          font-size: 20px;
          font-weight: 600;
        }

        .pwa-instructions-close {
          background: none;
          border: none;
          color: var(--text-secondary, #6c757d);
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .pwa-instructions-close:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
          color: var(--text-primary, #1a1a1a);
        }

        .pwa-instructions-body {
          padding: 20px;
        }

        .pwa-instructions-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pwa-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .pwa-step-number {
          background: var(--accent-primary, #00ff88);
          color: var(--text-button-primary, #000);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .pwa-step-content h4 {
          margin: 0 0 5px 0;
          color: var(--text-primary, #1a1a1a);
          font-size: 16px;
          font-weight: 600;
        }

        .pwa-step-content p {
          margin: 0;
          color: var(--text-secondary, #6c757d);
          font-size: 14px;
          line-height: 1.5;
        }

        .pwa-step-success {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: var(--bg-success, rgba(0, 255, 136, 0.1));
          border-radius: 12px;
          border: 1px solid var(--border-success, rgba(0, 255, 136, 0.3));
        }

        .pwa-success-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .pwa-success-text h4 {
          margin: 0 0 5px 0;
          color: var(--text-success, #00ff88);
          font-size: 16px;
          font-weight: 600;
        }

        .pwa-success-text p {
          margin: 0;
          color: var(--text-success, #00ff88);
          font-size: 14px;
          line-height: 1.5;
        }

        .pwa-instructions-footer {
          padding: 20px;
          border-top: 1px solid var(--border-separator, rgba(0, 0, 0, 0.1));
          text-align: center;
        }

        .pwa-instructions-btn {
          background: var(--bg-gradient-primary-button, linear-gradient(135deg, #00ff88, #00cc6a));
          color: var(--text-button-primary, #000);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pwa-instructions-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .pwa-instructions-modal {
            padding: 10px;
          }

          .pwa-instructions-content {
            max-height: 90vh;
          }

          .pwa-instructions-header {
            padding: 15px;
          }

          .pwa-instructions-body {
            padding: 15px;
          }

          .pwa-instructions-footer {
            padding: 15px;
          }

          .pwa-step {
            gap: 12px;
          }

          .pwa-step-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .pwa-step-content h4 {
            font-size: 15px;
          }

          .pwa-step-content p {
            font-size: 13px;
          }
        }
      `
    }
  }
}
</script>

<style scoped>
/* Estilos do banner PWA */
.pwa-install-banner {
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 20px;
  margin: 0;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideDown 0.3s ease-out;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.pwa-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.pwa-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.pwa-text {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.pwa-text h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.pwa-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.pwa-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
}

.pwa-install-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pwa-install-btn:hover {
  background: linear-gradient(135deg, #00cc6a, #00ff88);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);
}

.pwa-dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.pwa-dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  opacity: 1;
  transform: scale(1.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade do banner PWA */
@media (max-width: 768px) {
  .pwa-install-banner {
    padding: 15px;
  }

  .pwa-content {
    gap: 12px;
    max-width: 100%;
  }

  .pwa-icon {
    font-size: 28px;
  }

  .pwa-text h3 {
    font-size: 16px;
  }

  .pwa-text p {
    font-size: 13px;
  }

  .pwa-install-btn {
    padding: 10px 20px;
    font-size: 13px;
  }

  .pwa-dismiss-btn {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .pwa-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .pwa-actions {
    width: 100%;
    justify-content: center;
    gap: 15px;
  }

  .pwa-install-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
