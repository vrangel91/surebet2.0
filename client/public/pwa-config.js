// 🎨 Configuração Personalizada do PWA - SureStake

// Configurações do PWA (título removido - gerenciado pelo vue.config.js)
window.PWA_CONFIG = {
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
    // Não criar barra de título aqui - será gerenciada pelo componente Vue
    // Apenas aplicar estilos e configurações necessárias
    console.log('🎨 Configuração PWA aplicada - barra de título será gerenciada pelo Vue');
  }
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
  
  // Não configurar barra de título - será gerenciada pelo Vue
  // setupTitleBar(); // Removido para evitar duplicação
  
  // DESABILITADO: Sistema de recuperação automática que causava loop infinito
  // setupAutoRecovery();
  
  // Adicionar funções globais
  window.togglePWATheme = toggleTheme;
  window.forcePWAUpdate = forcePWAUpdate;
  
  console.log('✅ PWA personalizado inicializado com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// 🚀 FUNÇÕES DE RECUPERAÇÃO MANUAL (DESABILITADAS AUTOMÁTICAS)

// Função para forçar atualização do PWA (manual)
function forcePWAUpdate() {
  console.log('🔄 Forçando atualização do PWA...');
  
  // Limpar caches se disponível
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

// Função para verificar integridade do PWA (manual)
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
