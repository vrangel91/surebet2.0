// 🎨 Instalador PWA Personalizado - SureStake

class SureStakePWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installerElement = null;
    this.isInstalled = false;
    this.isInstalling = false;
    this.position = 'left'; // 'left' ou 'right'
    this.theme = this.detectTheme(); // Detectar tema automaticamente
    
    this.init();
  }

  // Detectar tema atual do sistema
  detectTheme() {
    // Verificar se há uma classe de tema no body ou html
    const bodyTheme = document.body.classList.contains('dark') || 
                     document.body.classList.contains('light');
    const htmlTheme = document.documentElement.classList.contains('dark') || 
                     document.documentElement.classList.contains('light');
    
    if (bodyTheme || htmlTheme) {
      return document.body.classList.contains('dark') || 
             document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Verificar se há variáveis CSS customizadas
    const rootStyles = getComputedStyle(document.documentElement);
    const bgColor = rootStyles.getPropertyValue('--bg-color') || 
                   rootStyles.getPropertyValue('--background-color') ||
                   rootStyles.getPropertyValue('background-color');
    
    if (bgColor) {
      // Se a cor de fundo for escura, assumir tema dark
      const rgb = bgColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
        return brightness < 128 ? 'dark' : 'light';
      }
    }
    
    // Padrão: light
    return 'light';
  }

  // Obter cores do tema atual
  getThemeColors() {
    const isDark = this.theme === 'dark';
    
    return {
      success: isDark ? '#00ff88' : '#00aa44',
      error: isDark ? '#ff4444' : '#cc0000',
      info: isDark ? '#00aaff' : '#0066cc',
      warning: isDark ? '#ffaa00' : '#cc8800',
      background: isDark ? '#1a1a1a' : '#ffffff',
      text: isDark ? '#ffffff' : '#000000',
      border: isDark ? '#333333' : '#cccccc',
      shadow: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'
    };
  }

  // Inicializar o instalador
  init() {
    console.log('🚀 Inicializando instalador PWA personalizado...');
    console.log('🎨 Tema detectado:', this.theme);
    
    // Verificar se já está instalado
    this.checkInstallationStatus();
    
    // Escutar eventos de instalação
    this.setupEventListeners();
    
    // Criar o elemento do instalador
    this.createInstallerElement();
    
    // Mostrar o instalador se apropriado
    this.showInstallerIfNeeded();
  }

  // Verificar status da instalação
  checkInstallationStatus() {
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');
    
    console.log('📱 Status da instalação:', this.isInstalled ? 'Instalado' : 'Não instalado');
  }

  // Configurar event listeners
  setupEventListeners() {
    // Evento antes da instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('🎯 Evento beforeinstallprompt capturado!');
      
      // Prevenir o prompt padrão do navegador
      e.preventDefault();
      
      // Armazenar o prompt para uso posterior
      this.deferredPrompt = e;
      
      console.log('✅ deferredPrompt armazenado:', this.deferredPrompt);
      
      // Mostrar nosso instalador personalizado
      this.showInstaller();
    });

    // Evento de instalação bem-sucedida
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalado com sucesso!');
      this.isInstalled = true;
      this.hideInstaller();
      this.showSuccessMessage();
    });

    // Verificar mudanças no display mode
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.isInstalled = e.matches;
      if (this.isInstalled) {
        this.hideInstaller();
      }
    });

    // Verificar mudanças no tema do sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        this.updateTheme();
      });
    }
  }

  // Criar elemento do instalador
  createInstallerElement() {
    // Remover instalador existente se houver
    const existingInstaller = document.querySelector('.pwa-installer');
    if (existingInstaller) {
      existingInstaller.remove();
    }

    // Criar novo instalador
    this.installerElement = document.createElement('div');
    this.installerElement.className = `pwa-installer ${this.position} ${this.theme}`;
    this.installerElement.style.display = 'none';
    
    this.installerElement.innerHTML = `
      <div class="pwa-installer-header">
        <div class="pwa-installer-logo">
          <div class="pwa-installer-icon">S</div>
          <h3 class="pwa-installer-title">Instalar SureStake</h3>
        </div>
        <button class="pwa-installer-close" title="Fechar">×</button>
      </div>
      
      <p class="pwa-installer-description">
        Adicione o app à sua tela inicial para acesso rápido e funcionalidade offline
      </p>
      
      <div class="pwa-installer-actions">
        <button class="pwa-installer-btn primary" id="pwa-install-btn">
          <span class="pwa-installer-btn-icon">📱</span>
          Instalar Agora
        </button>
        <button class="pwa-installer-btn secondary" id="pwa-later-btn">
          <span class="pwa-installer-btn-icon">⏰</span>
          Lembrar Depois
        </button>
      </div>
      
      <div class="pwa-installer-loading">
        <div class="pwa-installer-spinner"></div>
        <span>Instalando...</span>
      </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(this.installerElement);
    
    // Configurar eventos dos botões
    this.setupButtonEvents();
  }

  // Configurar eventos dos botões
  setupButtonEvents() {
    // Botão de instalar
    const installBtn = this.installerElement.querySelector('#pwa-install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', () => this.installPWA());
    }

    // Botão de lembrar depois
    const laterBtn = this.installerElement.querySelector('#pwa-later-btn');
    if (laterBtn) {
      laterBtn.addEventListener('click', () => this.rememberLater());
    }

    // Botão de fechar
    const closeBtn = this.installerElement.querySelector('.pwa-installer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideInstaller());
    }
  }

  // Mostrar instalador
  showInstaller() {
    console.log('🎨 showInstaller chamado...');
    console.log('📱 isInstalled:', this.isInstalled);
    console.log('🚀 isInstalling:', this.isInstalling);
    console.log('🎯 installerElement:', this.installerElement);
    
    if (this.isInstalled || this.isInstalling) {
      console.log('❌ Não mostrando instalador - usuário já instalado ou instalando');
      return;
    }

    // Verificar se deve pular o instalador
    if (this.shouldSkipInstaller()) {
      console.log('⏰ Usuário escolheu lembrar depois recentemente, não mostrando instalador');
      return;
    }

    console.log('🎨 Mostrando instalador PWA personalizado...');
    
    if (this.installerElement) {
      console.log('✅ Elemento encontrado, alterando display para block');
      this.installerElement.style.display = 'block';
      
      // Adicionar classe para animação
      setTimeout(() => {
        this.installerElement.classList.add('active');
        console.log('🎭 Classe active adicionada');
      }, 100);
    } else {
      console.log('❌ Elemento installerElement não encontrado!');
    }
  }

  // Ocultar instalador
  hideInstaller() {
    if (this.installerElement) {
      this.installerElement.classList.remove('active');
      
      setTimeout(() => {
        this.installerElement.style.display = 'none';
      }, 300);
    }
  }

  // Mostrar instalador se apropriado
  showInstallerIfNeeded() {
    console.log('🔍 Verificando se deve mostrar instalador...');
    console.log('📱 isInstalled:', this.isInstalled);
    console.log('🎯 deferredPrompt:', this.deferredPrompt);
    
    // Verificar se o usuário já escolheu "Lembrar Depois" recentemente
    if (this.shouldSkipInstaller()) {
      console.log('⏰ Usuário escolheu lembrar depois recentemente, não mostrando instalador');
      return;
    }
    
    // Se já temos o prompt e não está instalado, mostrar imediatamente
    if (this.deferredPrompt && !this.isInstalled) {
      console.log('✅ Condições atendidas, mostrando instalador...');
      this.showInstaller();
    } else {
      console.log('❌ Condições não atendidas para mostrar instalador');
    }
  }

  // Verificar se deve pular o instalador
  shouldSkipInstaller() {
    const lastShown = localStorage.getItem('pwa-installer-last-shown');
    if (!lastShown) {
      return false;
    }
    
    const lastShownTime = parseInt(lastShown);
    const now = Date.now();
    const daysSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60 * 24);
    
    // Não mostrar por 7 dias após "Lembrar Depois"
    const skipDays = 7;
    
    console.log(`📅 Dias desde último "Lembrar Depois": ${daysSinceLastShown.toFixed(2)}`);
    
    return daysSinceLastShown < skipDays;
  }

  // Verificar se deve mostrar o instalador
  shouldShowInstaller() {
    if (this.isInstalled) return false;
    
    // Temporariamente remover verificação de 7 dias para debug
    console.log('🔍 shouldShowInstaller: usuário não instalado, permitindo exibição');
    return true;
  }

  // Instalar PWA
  async installPWA() {
    if (!this.deferredPrompt || this.isInstalling) {
      return;
    }

    console.log('🚀 Iniciando instalação do PWA...');
    
    this.isInstalling = true;
    this.installerElement.classList.add('installing');
    
    try {
      // Mostrar prompt de instalação
      this.deferredPrompt.prompt();
      
      // Aguardar resposta do usuário
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('📱 Resultado da instalação:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ Usuário aceitou a instalação');
        this.showSuccessMessage();
      } else {
        console.log('❌ Usuário rejeitou a instalação');
        this.showRejectionMessage();
      }
      
      // Limpar prompt
      this.deferredPrompt = null;
      
    } catch (error) {
      console.error('❌ Erro durante instalação:', error);
      this.showErrorMessage();
    } finally {
      this.isInstalling = false;
      this.installerElement.classList.remove('installing');
      this.hideInstaller();
    }
  }

  // Lembrar depois
  rememberLater() {
    console.log('⏰ Usuário escolheu lembrar depois');
    
    // Salvar timestamp
    localStorage.setItem('pwa-installer-last-shown', Date.now().toString());
    
    // Ocultar instalador
    this.hideInstaller();
    
    // Mostrar mensagem
    this.showReminderMessage();
  }

  // Forçar mostrar instalador (ignorar preferência)
  forceShow() {
    console.log('🔓 Forçando exibição do instalador...');
    
    // Remover timestamp para permitir exibição
    localStorage.removeItem('pwa-installer-last-shown');
    
    // Mostrar instalador se tiver o prompt
    if (this.deferredPrompt && !this.isInstalled) {
      this.showInstaller();
    } else {
      console.log('❌ Não é possível mostrar instalador - sem prompt ou já instalado');
    }
  }

  // Resetar preferência do usuário
  resetUserPreference() {
    console.log('🔄 Resetando preferência do usuário...');
    localStorage.removeItem('pwa-installer-last-shown');
  }

  // Mostrar mensagem de sucesso
  showSuccessMessage() {
    this.showNotification('✅ SureStake instalado com sucesso!', 'success');
  }

  // Mostrar mensagem de rejeição
  showRejectionMessage() {
    this.showNotification('ℹ️ Instalação cancelada. Você pode instalar depois.', 'info');
  }

  // Mostrar mensagem de erro
  showErrorMessage() {
    this.showNotification('❌ Erro durante instalação. Tente novamente.', 'error');
  }

  // Mostrar mensagem de lembrete
  showReminderMessage() {
    this.showNotification('⏰ Lembraremos você sobre a instalação em 7 dias. Use resetPWAPreference() no console para redefinir.', 'info');
  }

  // Mostrar notificação
  showNotification(message, type = 'info') {
    // Obter cores do tema atual
    const colors = this.getThemeColors();
    
    // Criar notificação personalizada
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type} pwa-notification-${this.theme}`;
    notification.innerHTML = `
      <div class="pwa-notification-content">
        <span class="pwa-notification-message">${message}</span>
        <button class="pwa-notification-close">×</button>
      </div>
    `;
    
    // Determinar cor de fundo baseada no tipo e tema
    let backgroundColor;
    switch (type) {
      case 'success':
        backgroundColor = colors.success;
        break;
      case 'error':
        backgroundColor = colors.error;
        break;
      case 'warning':
        backgroundColor = colors.warning;
        break;
      case 'info':
      default:
        backgroundColor = colors.info;
        break;
    }
    
    // Adicionar estilos inline com cores dinâmicas
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px ${colors.shadow};
      z-index: 10001;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      border: 1px solid ${colors.border};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    // Estilizar botão de fechar
    const closeBtn = notification.querySelector('.pwa-notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '0.8';
    });
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Configurar botão de fechar
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Alterar posição
  setPosition(position) {
    if (position !== 'left' && position !== 'right') {
      console.warn('⚠️ Posição inválida. Use "left" ou "right"');
      return;
    }
    
    this.position = position;
    
    if (this.installerElement) {
      this.installerElement.className = `pwa-installer ${this.position} ${this.theme}`;
    }
    
    console.log(`🎯 Posição do instalador alterada para: ${position}`);
  }

  // Alterar tema
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') {
      console.warn('⚠️ Tema inválido. Use "dark" ou "light"');
      return;
    }
    
    this.theme = theme;
    
    if (this.installerElement) {
      this.installerElement.className = `pwa-installer ${this.position} ${this.theme}`;
    }
    
    console.log(`🎨 Tema do instalador alterado para: ${theme}`);
  }

  // Atualizar tema automaticamente
  updateTheme() {
    const newTheme = this.detectTheme();
    if (newTheme !== this.theme) {
      console.log(`🔄 Tema alterado de ${this.theme} para ${newTheme}`);
      this.setTheme(newTheme);
    }
  }

  // Forçar exibição do instalador
  forceShow() {
    console.log('🎯 Forçando exibição do instalador...');
    this.showInstaller();
  }

  // Destruir instalador
  destroy() {
    if (this.installerElement) {
      this.installerElement.remove();
      this.installerElement = null;
    }
    
    console.log('🗑️ Instalador PWA destruído');
  }
}

// 🚀 Inicializar quando o DOM estiver pronto

let pwaInstaller = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pwaInstaller = new SureStakePWAInstaller();
  });
} else {
  pwaInstaller = new SureStakePWAInstaller();
}

// 🌐 Exportar para uso global
window.SureStakePWAInstaller = SureStakePWAInstaller;
window.pwaInstaller = pwaInstaller;

// 📱 Funções de controle global
window.showPWAInstaller = () => {
  if (pwaInstaller) pwaInstaller.forceShow();
};

window.hidePWAInstaller = () => {
  if (pwaInstaller) pwaInstaller.hideInstaller();
};

window.resetPWAPreference = () => {
  if (pwaInstaller) pwaInstaller.resetUserPreference();
};

window.setPWAInstallerPosition = (position) => {
  if (pwaInstaller) pwaInstaller.setPosition(position);
};

window.setPWAInstallerTheme = (theme) => {
  if (pwaInstaller) pwaInstaller.setTheme(theme);
};

window.updatePWAInstallerTheme = () => {
  if (pwaInstaller) pwaInstaller.updateTheme();
};

console.log('🚀 Instalador PWA personalizado carregado e pronto!');
console.log('🎨 Tema detectado automaticamente:', pwaInstaller ? pwaInstaller.theme : 'N/A');
console.log('💡 Funções disponíveis:');
console.log('   - showPWAInstaller() - Forçar exibição do instalador');
console.log('   - hidePWAInstaller() - Ocultar instalador');
console.log('   - resetPWAPreference() - Redefinir preferência do usuário');
console.log('   - setPWAInstallerPosition("left"|"right") - Definir posição');
console.log('   - setPWAInstallerTheme("dark"|"light") - Definir tema');
console.log('   - updatePWAInstallerTheme() - Atualizar tema automaticamente');
