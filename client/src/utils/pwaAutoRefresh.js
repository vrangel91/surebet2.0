// Utilitário para atualização automática do PWA
export class PWAAutoRefresh {
  constructor() {
    this.isRefreshing = false;
    this.init();
  }

  init() {
    // Escuta mensagens do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FORCE_REFRESH') {
          console.log('🔄 [PWA] Recebida mensagem de atualização:', event.data);
          this.forceRefresh();
        }
      });

      // Verifica se há uma nova versão disponível
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 [PWA] Service Worker atualizado, forçando refresh...');
        this.forceRefresh();
      });

      // Verifica atualizações apenas quando a página ganha foco após estar inativa por mais de 5 minutos
      let lastFocusTime = Date.now();
      window.addEventListener('focus', () => {
        const now = Date.now();
        const timeSinceLastFocus = now - lastFocusTime;
        
        // Só verifica se passou mais de 5 minutos desde o último foco
        if (timeSinceLastFocus > 300000) { // 5 minutos
          console.log('🔄 [PWA] Página ganhou foco após inatividade, verificando atualizações...');
          this.checkForUpdates();
        }
        lastFocusTime = now;
      });

      // Remove verificação automática no load - só verifica quando necessário
      // window.addEventListener('load', () => {
      //   console.log('🔄 [PWA] Página carregada, verificando atualizações...');
      //   this.checkForUpdates();
      // });
    }
  }

  async checkForUpdates() {
    if ('serviceWorker' in navigator && !this.isRefreshing) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Força verificação de atualizações
          await registration.update();
          console.log('🔄 [PWA] Verificação de atualizações concluída');
        }
      } catch (error) {
        console.error('❌ [PWA] Erro ao verificar atualizações:', error);
      }
    }
  }

  forceRefresh() {
    if (this.isRefreshing) {
      console.log('🔄 [PWA] Atualização já em andamento, ignorando...');
      return;
    }

    this.isRefreshing = true;
    console.log('🔄 [PWA] Forçando atualização completa da página...');

    // Limpa todos os caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ [PWA] Limpando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('🗑️ [PWA] Todos os caches foram limpos');
        this.performRefresh();
      }).catch((error) => {
        console.error('❌ [PWA] Erro ao limpar caches:', error);
        this.performRefresh();
      });
    } else {
      this.performRefresh();
    }
  }

  performRefresh() {
    // Força um refresh completo (equivalente ao Ctrl+F5)
    console.log('🔄 [PWA] Executando refresh completo...');
    
    // Adiciona timestamp para evitar cache do navegador
    const url = new URL(window.location);
    url.searchParams.set('_refresh', Date.now().toString());
    
    // Recarrega a página com cache bypass
    window.location.href = url.toString();
  }

  // Método para forçar atualização manual
  static forceUpdate() {
    const instance = new PWAAutoRefresh();
    instance.forceRefresh();
  }
}

// Inicializa automaticamente quando o módulo é importado
export const pwaAutoRefresh = new PWAAutoRefresh();
