const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      // Configurações do Node.js se necessário
    },
    env: {
      // Variáveis de ambiente para testes
      API_BASE_URL: 'http://localhost:3000/api',
      ADMIN_EMAIL: 'admin@test.com',
      ADMIN_PASSWORD: 'admin123'
    },
    retries: {
      runMode: 2,
      openMode: 0
    },
    experimentalStudio: true,
    experimentalRunAllSpecs: true
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  }
});