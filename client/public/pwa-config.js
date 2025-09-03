// 🎨 Configuração Personalizada do PWA - SureStake

// Configurações da barra de título
window.PWA_CONFIG = {
  title: 'SureStake - Apostas Inteligentes',
  theme: 'dark', // 'dark' ou 'light'
  animated: true,
  colors: {
    primary: '#00ff88',
    secondary: '#00cc6a',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    text: '#ffffff',
    accent: '#00ff88'
  }
};

// Função para detectar se estamos em um PWA
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Função para aplicar tema personalizado
function applyCustomTheme() {
  if (isPWA()) {
    // Aplicar cores personalizadas
    document.documentElement.style.setProperty('--pwa-primary', PWA_CONFIG.colors.primary);
    document.documentElement.style.setProperty('--pwa-secondary', PWA_CONFIG.colors.secondary);
    document.documentElement.style.setProperty('--pwa-background', PWA_CONFIG.colors.background);
    document.documentElement.style.setProperty('--pwa-surface', PWA_CONFIG.colors.surface);
    document.documentElement.style.setProperty('--pwa-text', PWA_CONFIG.colors.text);
    document.documentElement.style.setProperty('--pwa-accent', PWA_CONFIG.colors.accent);
    
    // Adicionar classe PWA ao body
    document.body.classList.add('pwa-mode');
    
    console.log('🎨 Tema PWA personalizado aplicado');
  }
}

// Função para configurar a barra de título
function setupTitleBar() {
  if (isPWA()) {
    // Criar barra de título personalizada se não existir
    if (!document.querySelector('.pwa-titlebar')) {
      const titleBar = document.createElement('div');
      titleBar.className = 'pwa-titlebar dark';
      titleBar.innerHTML = `
        <div class="pwa-titlebar-brand">
          <div class="pwa-titlebar-logo">S</div>
          <span class="pwa-titlebar-title">${PWA_CONFIG.title}</span>
        </div>
        <div class="pwa-titlebar-controls">
          <button class="pwa-titlebar-button minimize" title="Minimizar">
            <svg viewBox="0 0 24 24"><path d="M20 14H4v-2h16v2z"/></svg>
          </button>
          <button class="pwa-titlebar-button maximize" title="Maximizar">
            <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          </button>
          <button class="pwa-titlebar-button close" title="Fechar">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      `;
      
      // Inserir no início do body
      document.body.insertBefore(titleBar, document.body.firstChild);
      
      // Adicionar eventos aos botões
      setupTitleBarEvents(titleBar);
      
      console.log('🎨 Barra de título PWA criada');
    }
  }
}

// Função para configurar eventos da barra de título
function setupTitleBarEvents(titleBar) {
  const minimizeBtn = titleBar.querySelector('.minimize');
  const maximizeBtn = titleBar.querySelector('.maximize');
  const closeBtn = titleBar.querySelector('.close');
  
  // Minimizar
  minimizeBtn.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    } else {
      window.minimize();
    }
  });
  
  // Maximizar/Restaurar
  maximizeBtn.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.toggleMaximize();
    } else {
      if (window.innerHeight === screen.height) {
        window.restore();
      } else {
        window.maximize();
      }
    }
  });
  
  // Fechar
  closeBtn.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    } else {
      window.close();
    }
  });
}

// Função para alternar tema
function toggleTheme() {
  const currentTheme = PWA_CONFIG.theme;
  PWA_CONFIG.theme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Aplicar novo tema
  applyCustomTheme();
  
  // Salvar preferência
  localStorage.setItem('pwa-theme', PWA_CONFIG.theme);
  
  console.log(`🎨 Tema alterado para: ${PWA_CONFIG.theme}`);
}

// Função para alternar animação
function toggleAnimation() {
  PWA_CONFIG.animated = !PWA_CONFIG.animated;
  
  // Aplicar animação
  const titleBar = document.querySelector('.pwa-titlebar');
  if (titleBar) {
    titleBar.classList.toggle('animated', PWA_CONFIG.animated);
  }
  
  // Salvar preferência
  localStorage.setItem('pwa-animated', PWA_CONFIG.animated);
  
  console.log(`🎨 Animação ${PWA_CONFIG.animated ? 'ativada' : 'desativada'}`);
}

// Função para carregar preferências salvas
function loadPreferences() {
  const savedTheme = localStorage.getItem('pwa-theme');
  const savedAnimation = localStorage.getItem('pwa-animated');
  
  if (savedTheme) {
    PWA_CONFIG.theme = savedTheme;
  }
  
  if (savedAnimation !== null) {
    PWA_CONFIG.animated = savedAnimation === 'true';
  }
}

// Função para inicializar o PWA
function initPWA() {
  console.log('🚀 Inicializando PWA personalizado...');
  
  // Carregar preferências
  loadPreferences();
  
  // Aplicar tema
  applyCustomTheme();
  
  // Configurar barra de título
  setupTitleBar();
  
  // Configurar recuperação automática
  setupAutoRecovery();
  
  // Adicionar funções globais
  window.togglePWATheme = toggleTheme;
  window.togglePWAAnimation = toggleAnimation;
  window.forcePWAUpdate = forcePWAUpdate;
  
  console.log('✅ PWA personalizado inicializado com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// 🚀 FUNÇÕES DE RECUPERAÇÃO AUTOMÁTICA

// Função para configurar recuperação automática
function setupAutoRecovery() {
  console.log('🔄 Configurando recuperação automática...');
  
  // Verificar se a aplicação carregou corretamente
  let appLoadTimeout;
  let recoveryAttempts = 0;
  const maxRecoveryAttempts = 3;
  
  // Função para verificar se a aplicação está funcionando
  function checkAppHealth() {
    // Verificar se o elemento #app tem conteúdo
    const appElement = document.getElementById('app');
    if (!appElement || appElement.children.length === 0) {
      console.warn('⚠️ Aplicação não carregou corretamente');
      
      if (recoveryAttempts < maxRecoveryAttempts) {
        recoveryAttempts++;
        console.log(`🔄 Tentativa de recuperação ${recoveryAttempts}/${maxRecoveryAttempts}`);
        
        // Tentar recarregar a aplicação
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('❌ Máximo de tentativas de recuperação atingido');
        showRecoveryMessage();
      }
    } else {
      console.log('✅ Aplicação carregada corretamente');
      clearTimeout(appLoadTimeout);
    }
  }
  
  // Função para mostrar mensagem de recuperação
  function showRecoveryMessage() {
    const recoveryDiv = document.createElement('div');
    recoveryDiv.id = 'pwa-recovery-message';
    recoveryDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(26, 26, 26, 0.95);
        color: white;
        padding: 30px;
        border-radius: 16px;
        border: 2px solid #00ff88;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      ">
        <h3 style="color: #00ff88; margin-bottom: 20px;">🔄 Recuperação Necessária</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
          A aplicação não conseguiu carregar automaticamente. 
          Clique no botão abaixo para tentar novamente.
        </p>
        <button onclick="forcePWAUpdate()" style="
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #1a1a1a;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin: 0 8px;
        ">🔄 Tentar Novamente</button>
        <button onclick="window.location.reload()" style="
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin: 0 8px;
        ">🔄 Recarregar Página</button>
      </div>
    `;
    
    document.body.appendChild(recoveryDiv);
  }
  
  // Configurar timeout para verificar carregamento da aplicação
  appLoadTimeout = setTimeout(() => {
    checkAppHealth();
  }, 5000); // Verificar após 5 segundos
  
  // Verificar novamente após 10 segundos
  setTimeout(() => {
    checkAppHealth();
  }, 10000);
  
  // Verificar quando a página terminar de carregar
  if (document.readyState === 'complete') {
    setTimeout(checkAppHealth, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(checkAppHealth, 1000);
    });
  }
  
  // Verificar se há problemas de roteamento
  window.addEventListener('popstate', () => {
    console.log('🔄 Mudança de rota detectada, verificando aplicação...');
    setTimeout(checkAppHealth, 500);
  });
  
  // Verificar se há erros JavaScript
  window.addEventListener('error', (event) => {
    console.error('❌ Erro JavaScript detectado:', event.error);
    if (recoveryAttempts < maxRecoveryAttempts) {
      recoveryAttempts++;
      setTimeout(() => {
        console.log('🔄 Tentando recuperar após erro JavaScript...');
        window.location.reload();
      }, 3000);
    }
  });
}

// Função para forçar atualização do PWA
function forcePWAUpdate() {
  console.log('🔄 Forçando atualização do PWA...');
  
  // Remover mensagem de recuperação se existir
  const recoveryMessage = document.getElementById('pwa-recovery-message');
  if (recoveryMessage) {
    recoveryMessage.remove();
  }
  
  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Removendo cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Caches limpos, recarregando aplicação...');
      
      // Recarregar a aplicação
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  } else {
    // Fallback se caches não estiver disponível
    window.location.reload();
  }
}

// Função para verificar integridade do PWA
function checkPWIntegrity() {
  console.log('🔍 Verificando integridade do PWA...');
  
  const checks = {
    serviceWorker: false,
    appElement: false,
    themeApplied: false,
    titleBar: false
  };
  
  // Verificar Service Worker do Vue CLI
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      checks.serviceWorker = !!(registration && registration.active);
      console.log('✅ Service Worker Vue CLI:', checks.serviceWorker);
    });
  }
  
  // Verificar elemento da aplicação
  const appElement = document.getElementById('app');
  checks.appElement = !!(appElement && appElement.children.length > 0);
  console.log('✅ Elemento App:', checks.appElement);
  
  // Verificar se o tema foi aplicado
  checks.themeApplied = document.body.classList.contains('pwa-mode');
  console.log('✅ Tema Aplicado:', checks.themeApplied);
  
  // Verificar barra de título
  checks.titleBar = !!document.querySelector('.pwa-titlebar');
  console.log('✅ Barra de Título:', checks.titleBar);
  
  // Retornar resultado
  const allChecksPassed = Object.values(checks).every(check => check);
  console.log('🔍 Resultado da verificação:', allChecksPassed ? '✅ PASSOU' : '❌ FALHOU');
  
  return { checks, allChecksPassed };
}

// Exportar configurações para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWA_CONFIG;
}
