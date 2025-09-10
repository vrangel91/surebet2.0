const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configurações PWA
  pwa: {
    name: 'SureStake',
    shortName: 'SureStake',
    description: 'Sistema inteligente de apostas esportivas com análise de surebets',
    themeColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    startUrl: '/',
    
    // Usar nosso Service Worker personalizado
    disable: true,
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // Usar nosso arquivo sw.js personalizado
      swSrc: './public/sw.js',
      swDest: 'sw.js'
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
      name: 'SureStake',
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
              src: '/img/dashboard-icon.svg',
              sizes: '96x96',
              type: 'image/svg+xml'
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
              src: '/img/surebets-icon.svg',
              sizes: '96x96',
              type: 'image/svg+xml'
            }
          ]
        }
      ]
    }
  },
  
  devServer: {
    port: 3001,
    https: {
      key: require('fs').readFileSync(path.join(__dirname, '../certs/key.pem')),
      cert: require('fs').readFileSync(path.join(__dirname, '../certs/cert.pem'))
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // ← CORRIGIDO: usar HTTP em desenvolvimento
        changeOrigin: true,
        secure: false,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      },
      '/ws': {
        target: 'ws://localhost:3002', // ← CORRIGIDO: usar WS em desenvolvimento
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Configurações para produção
  publicPath: '/',
  
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
