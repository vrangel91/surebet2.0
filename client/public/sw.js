const CACHE_NAME = 'surestake-v1.0.0';
const STATIC_CACHE = 'surestake-static-v1.0.0';
const DYNAMIC_CACHE = 'surestake-dynamic-v1.0.0';

// Arquivos que devem ser cacheados imediatamente
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/app.css',
  '/css/vendors.css',
  '/js/app.js',
  '/js/vendors.js',
  '/js/chunk-vendors.js',
  '/favicon.ico',
  '/img/logo.png',
  '/img/logo_loading.png',
  '/img/welcome-banner.gif',
  '/fonts/bootstrap-icons.woff2',
  '/fonts/bootstrap-icons.woff',
  '/notification.mp3'
];

// Estratégia de cache: Network First para APIs, Cache First para arquivos estáticos
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  API: 'network-first'
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cache estático aberto');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Todos os arquivos estáticos foram cacheados');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao instalar cache estático:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado e caches limpos');
        
        // DESABILITADO: Notificação automática que pode causar loop
        // self.clients.matchAll().then(clients => {
        //   clients.forEach(client => {
        //     client.postMessage({
        //       type: 'SW_UPDATED',
        //       data: { version: CACHE_NAME }
        //     });
        //   });
        // });
        
        return self.clients.claim();
      })
  );
});

// Listener para mensagens dos clientes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Pular requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Pular requisições para outros domínios
  if (url.origin !== location.origin) {
    return;
  }
  
  // Pular requisições com range headers (que podem causar status 206)
  if (request.headers.has('range')) {
    return;
  }
  
  // Estratégia para arquivos estáticos
  if (isStaticFile(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Estratégia para APIs
  if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estratégia padrão para outras requisições
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    // Verificar se a resposta é válida para cache (não é parcial e é bem-sucedida)
    if (networkResponse.ok && networkResponse.status !== 206) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    } else if (networkResponse.status === 206) {
      console.log('[SW] Resposta parcial (206) detectada, pulando cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erro na estratégia cache-first:', error);
    return new Response('Erro de rede', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Verificar se a resposta é válida para cache (não é parcial e é bem-sucedida)
    if (networkResponse.ok && networkResponse.status !== 206) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    } else if (networkResponse.status === 206) {
      console.log('[SW] Resposta parcial (206) detectada, pulando cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Rede falhou, tentando cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar página offline personalizada
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Conteúdo não disponível offline', { status: 503 });
  }
}

// Verificar se é arquivo estático
function isStaticFile(pathname) {
  // Arquivos que definitivamente são estáticos e seguros para cache-first
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico', '.mp3', '.mp4'];
  const isStaticExtension = staticExtensions.some(ext => pathname.endsWith(ext));
  
  // Páginas principais que são seguras para cache
  const isMainPage = pathname === '/' || pathname === '/index.html';
  
  // Evitar cache-first para arquivos que podem ser muito grandes ou gerar respostas parciais
  const isLargeFile = pathname.includes('chunk-') || pathname.includes('app.') || pathname.includes('vendors.');
  
  return (isStaticExtension || isMainPage) && !isLargeFile;
}

// Verificar se é requisição de API
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || 
         pathname.includes('auth') || 
         pathname.includes('surebets') ||
         pathname.includes('users') ||
         pathname.includes('tickets');
}

// Mensagem para atualização do cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// DESABILITADO: Sincronização em background que pode causar problemas
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'background-sync') {
//     event.waitUntil(doBackgroundSync());
//   }
// });

// async function doBackgroundSync() {
//   try {
//     console.log('[SW] Executando sincronização em background...');
//     // Aqui você pode implementar lógica para sincronizar dados offline
//     // como envio de formulários, atualizações de perfil, etc.
//   } catch (error) {
//     console.error('[SW] Erro na sincronização em background:', error);
//   }
// }

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova notificação do SureStake',
      icon: '/img/logo-192x192.png',
      badge: '/img/logo-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver detalhes',
          icon: '/img/logo-72x72.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/img/logo-72x72.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SureStake', options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
