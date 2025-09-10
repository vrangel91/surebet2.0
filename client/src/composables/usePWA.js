import { ref, onMounted, onUnmounted } from 'vue';

export function usePWA() {
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const isOffline = ref(false);
  const hasUpdate = ref(false);
  const deferredPrompt = ref(null);
  const swRegistration = ref(null);

  // Verificar se o PWA pode ser instalado
  const checkInstallability = () => {
    console.log('[PWA] Verificando instalação...');
    
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      console.log('[PWA] Já instalado em modo standalone');
      isInstalled.value = true;
      isInstallable.value = false;
      return;
    }

    // Verificar se o navegador suporta PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('[PWA] Navegador suporta PWA');
      // Não definir isInstallable como true aqui, aguardar o evento beforeinstallprompt
    } else {
      console.log('[PWA] Navegador não suporta PWA');
    }
  };

  // Capturar evento de instalação
  const captureInstallPrompt = (event) => {
    console.log('[PWA] Evento beforeinstallprompt capturado!');
    event.preventDefault();
    deferredPrompt.value = event;
    isInstallable.value = true;
    
    // Disparar evento customizado para notificar componentes
    window.dispatchEvent(new CustomEvent('pwa-installable', { 
      detail: { installable: true } 
    }));
  };

  // Instalar PWA
  const installPWA = async () => {
    console.log('[PWA] Tentando instalar...');
    console.log('[PWA] deferredPrompt:', deferredPrompt.value);
    console.log('[PWA] isInstallable:', isInstallable.value);
    
    if (!deferredPrompt.value) {
      console.log('[PWA] PWA já instalado ou não disponível para instalação');
      console.log('[PWA] Verificando se está em modo standalone...');
      
      // Verificar novamente se está em modo standalone
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        console.log('[PWA] Confirmado: já está instalado');
        isInstalled.value = true;
        isInstallable.value = false;
        return false;
      }
      
      console.log('[PWA] Aguardando evento beforeinstallprompt...');
      return false;
    }

    try {
      console.log('[PWA] Executando prompt de instalação...');
      deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] PWA instalado com sucesso!');
        isInstalled.value = true;
        isInstallable.value = false;
        deferredPrompt.value = null;
        return true;
      } else {
        console.log('[PWA] Usuário recusou a instalação do PWA');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Erro ao instalar PWA:', error);
      return false;
    }
  };

  // Registrar Service Worker
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      swRegistration.value = registration;
      
      console.log('Service Worker registrado:', registration);

      // DESABILITADO: Verificação automática de atualizações que causava loop infinito
      // registration.addEventListener('updatefound', () => {
      //   const newWorker = registration.installing;
      //   newWorker.addEventListener('statechange', () => {
      //     if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      //       hasUpdate.value = true;
      //       console.log('Nova versão disponível!');
      //     }
      //   });
      // });

      // DESABILITADO: Atualização automática que causava reload infinito
      // navigator.serviceWorker.addEventListener('controllerchange', () => {
      //   console.log('Nova versão ativada!');
      //   hasUpdate.value = false;
      //   window.location.reload();
      // });

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  };

  // Verificar status de conexão
  const checkConnectionStatus = () => {
    isOffline.value = !navigator.onLine;
  };

  // Verificar se está em modo standalone (instalado)
  const checkStandaloneMode = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (isStandalone) {
      isInstalled.value = true;
      isInstallable.value = false;
    }
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Permissão de notificação negada');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  };

  // Enviar notificação
  const sendNotification = (title, options = {}) => {
    if (Notification.permission === 'granted' && swRegistration.value) {
      swRegistration.value.showNotification(title, {
        icon: '/img/logo-192x192.png',
        badge: '/img/logo-72x72.png',
        vibrate: [100, 50, 100],
        ...options
      });
    }
  };

  // Verificar recursos PWA disponíveis
  const getPWACapabilities = () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notifications: 'Notification' in window,
      installPrompt: 'beforeinstallprompt' in window,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      offline: 'caches' in window
    };
  };

  // Verificar atualizações do Service Worker (DESABILITADO - causava loop)
  const checkForUpdates = () => {
    // DESABILITADO: Verificação automática que causava loop infinito
    // if (swRegistration.value && swRegistration.value.updateViaCache !== 'none') {
    //   swRegistration.value.update();
    // }
    console.log('[PWA] Verificação automática de atualizações desabilitada para evitar loop infinito');
  };

  // Atualizar PWA
  const updatePWA = async () => {
    if (!swRegistration.value) {
      console.log('[PWA] Service Worker não registrado');
      return false;
    }

    try {
      console.log('[PWA] Verificando atualizações...');
      await swRegistration.value.update();
      return true;
    } catch (error) {
      console.error('[PWA] Erro ao verificar atualizações:', error);
      return false;
    }
  };

  // Forçar atualização
  const forceUpdate = async () => {
    console.log('[PWA] Forçando atualização...');
    
    try {
      // Limpar caches antigos
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('SureStake') || cacheName.includes('surestake')) {
            await caches.delete(cacheName);
            console.log('[PWA] Cache limpo:', cacheName);
          }
        }
      }

      // Se temos um Service Worker registrado, tentar atualizá-lo
      if (swRegistration.value) {
        console.log('[PWA] Atualizando Service Worker...');
        await swRegistration.value.update();
      }

      // Aguardar um pouco para a atualização ser processada
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recarregar a página
      console.log('[PWA] Recarregando página...');
      window.location.reload();
      
    } catch (error) {
      console.error('[PWA] Erro ao forçar atualização:', error);
      
      // Em caso de erro, tentar recarregar mesmo assim
      console.log('[PWA] Tentando recarregar mesmo com erro...');
      window.location.reload();
    }
  };

  // Event listeners
  onMounted(() => {
    // Verificar instalação
    checkInstallability();
    checkStandaloneMode();
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Verificar status de conexão
    checkConnectionStatus();
    
    // Event listeners
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    window.addEventListener('online', checkConnectionStatus);
    window.addEventListener('offline', checkConnectionStatus);
    
    // Verificar se está em modo standalone
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      mediaQuery.addEventListener('change', checkStandaloneMode);
    }
    
    // Verificar se já existe um prompt de instalação pendente
    if ('beforeinstallprompt' in window) {
      console.log('[PWA] Evento beforeinstallprompt disponível');
      isInstallable.value = true;
    }

    // DESABILITADO: Verificação automática de atualizações que causava loop infinito
    // const updateInterval = setInterval(checkForUpdates, 300000); // A cada 5 minutos
    
    // Cleanup no unmount
    onUnmounted(() => {
      // clearInterval(updateInterval); // DESABILITADO
    });
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
    window.removeEventListener('online', checkConnectionStatus);
    window.removeEventListener('offline', checkConnectionStatus);
  });

  return {
    // Estado
    isInstallable,
    isInstalled,
    isOffline,
    hasUpdate,
    
    // Métodos
    installPWA,
    updatePWA,
    forceUpdate,
    requestNotificationPermission,
    sendNotification,
    getPWACapabilities,
    
    // Computed
    canInstall: () => isInstallable.value && !isInstalled.value,
    isOnline: () => !isOffline.value
  };
}
