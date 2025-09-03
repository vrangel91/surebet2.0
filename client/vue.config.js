const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configurações PWA
  pwa: {
    name: 'SureStake - Apostas Inteligentes',
    shortName: 'SureStake',
    description: 'Sistema inteligente de apostas esportivas com análise de surebets',
    themeColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    startUrl: '/',
    
    // Desabilitar prompt automático - usar apenas nosso instalador personalizado
    disable: false,
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // Desabilitar prompt automático de instalação
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      
      // Não mostrar prompt automático
      navigateFallback: null,
      navigateFallbackDenylist: [/^\/api\//],
      
      // Estratégia de cache
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
            }
          }
        },
        {
          urlPattern: /\.(?:css|js)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\./i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 5 // 5 minutos
            },
            networkTimeoutSeconds: 5
          }
        }
      ],
      
      // Excluir arquivos do cache
      exclude: [
        /\.map$/,
        /_redirects/,
        /\.htaccess/
      ]
    },
    
    // Ícones
    iconPaths: {
      favicon32: 'img/logo-32x32.png',
      favicon16: 'img/logo-16x16.png',
      appleTouchIcon: 'img/logo-192x192.png',
      maskIcon: 'img/logo.svg',
      msTileImage: 'img/logo-150x150.png'
    },
    
    // Manifest
    manifestOptions: {
      name: 'SureStake - Apostas Inteligentes',
      short_name: 'SureStake',
      description: 'Sistema inteligente de apostas esportivas com análise de surebets',
      start_url: '/',
      display: 'standalone',
      background_color: '#1a1a1a',
      theme_color: '#00ff88',
      orientation: 'portrait-primary',
      scope: '/',
      lang: 'pt-BR',
      categories: ['sports', 'finance', 'entertainment'],
      
      // Personalizações adicionais da barra de título
      display_override: ['standalone', 'minimal-ui'],
      edge_side_panel: {
        preferred_width: 400
      },
     
      icons: [
        {
          src: '/img/logo-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/img/logo-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ],
      
      shortcuts: [
        {
          name: 'Dashboard',
          short_name: 'Dashboard',
          description: 'Acessar o dashboard principal',
          url: '/dashboard',
          icons: [
            {
              src: '/img/dashboard-icon.png',
              sizes: '96x96'
            }
          ]
        },
        {
          name: 'Surebets',
          short_name: 'Surebets',
          description: 'Ver surebets disponíveis',
          url: '/surebets',
          icons: [
            {
              src: '/img/surebets-icon.png',
              sizes: '96x96'
            }
          ]
        }
      ]
    }
  },
  
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      },
      '/ws': {
        target: 'ws://localhost:3002',
        ws: true,
        changeOrigin: true
      }
    }
  },
  
  // Configurações para produção
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  
  // Configurações de build
  productionSourceMap: false,
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    output: {
      charset: true
    }
  },
  chainWebpack: config => {
    config.performance
      .maxEntrypointSize(512000)
      .maxAssetSize(512000)
    
    // Configurar codificação UTF-8
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          ...options.compilerOptions,
          whitespace: 'preserve'
        }
      }))
  }
})
