// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configurações globais para testes
Cypress.on('uncaught:exception', (err, runnable) => {
  // Não falha o teste em erros não capturados do Vue
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Configurações de viewport para diferentes dispositivos
Cypress.Commands.add('setViewport', (device) => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  }
  
  const viewport = viewports[device] || viewports.desktop
  cy.viewport(viewport.width, viewport.height)
})

// Comando para login de usuário VIP
Cypress.Commands.add('loginAsVIP', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'vip@example.com',
      name: 'VIP User',
      isVIP: true,
      isAdmin: false,
      token: 'mock-vip-token'
    }))
  })
})

// Comando para login de usuário admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      id: 2,
      email: 'admin@example.com',
      name: 'Admin User',
      isVIP: true,
      isAdmin: true,
      token: 'mock-admin-token'
    }))
  })
})

// Comando para limpar dados de teste
Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})

// Comando para aguardar carregamento de dados
Cypress.Commands.add('waitForSurebets', () => {
  cy.get('[data-testid="surebet-card"]', { timeout: 10000 }).should('exist')
})

// Comando para simular WebSocket
Cypress.Commands.add('mockWebSocket', () => {
  cy.window().then((win) => {
    win.WebSocket = cy.stub().callsFake(() => ({
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: cy.stub(),
      close: cy.stub()
    }))
  })
})
