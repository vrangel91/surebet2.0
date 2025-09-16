// Service Worker Simplificado - SureStake
import { precacheAndRoute } from 'workbox-precaching';

// Verificar se estamos em ambiente de desenvolvimento
const isLocalDev = self.location.hostname === 'localhost';
const isLocalHttps = isLocalDev && self.location.protocol === 'https:';

// Precaching automático do Workbox (apenas se não for desenvolvimento local)
if (!isLocalDev) {
  precacheAndRoute(self.__WB_MANIFEST);
}

const CACHE_NAME = 'surestake-v1.0.0';
const STATIC_CACHE = 'surestake-static-v1.0.0';
const DYNAMIC_CACHE = 'surestake-dynamic-v1.0.0';

// Arquivos que devem ser cacheados imediatamente
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker...');
  
  if (isLocalDev) {
    console.log('⚠️ [SW] Modo desenvolvimento local detectado - pulando cache');
    event.waitUntil(self.skipWaiting());
    return;
  }
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ [SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Erro na instalação:', error);
        // Em caso de erro, ainda assim ativar o SW
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Ativando Service Worker...');
  
  if (isLocalDev) {
    console.log('⚠️ [SW] Modo desenvolvimento local - ativação simplificada');
    event.waitUntil(self.clients.claim());
    return;
  }
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker ativado com sucesso');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ [SW] Erro na ativação:', error);
        // Em caso de erro, ainda assim ativar o SW
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Em modo desenvolvimento local, não interceptar requisições
  if (isLocalDev) {
    return;
  }
  
  // Ignorar requisições para APIs
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Estratégia: Network First com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, cachear a resposta
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tentar buscar no cache
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Se não encontrar no cache e for uma navegação, mostrar página offline
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Para outros tipos de requisição, retornar erro
            return new Response('Recurso não disponível offline', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 [SW] Recebida mensagem para pular espera');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    console.log('🔄 [SW] Forçando refresh da página');
    event.ports[0].postMessage({ type: 'REFRESH' });
  }
});

// Notificações push (se necessário no futuro)
self.addEventListener('push', (event) => {
  console.log('📱 [SW] Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do SureStake',
    icon: '/img/logo-192x192.png',
    badge: '/img/logo-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('SureStake', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Notificação clicada');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('✅ [SW] Service Worker carregado com sucesso');