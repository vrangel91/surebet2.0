const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
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
