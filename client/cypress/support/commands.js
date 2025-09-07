// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para aguardar elemento estar visível
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible')
})

// Comando para clicar em elemento e aguardar carregamento
Cypress.Commands.add('clickAndWait', (selector, waitFor = null) => {
  cy.get(selector).click()
  if (waitFor) {
    cy.get(waitFor).should('be.visible')
  }
})

// Comando para preencher formulário
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}"]`).clear().type(value)
  })
})

// Comando para verificar se elemento contém texto
Cypress.Commands.add('shouldContainText', (selector, text) => {
  cy.get(selector).should('contain.text', text)
})

// Comando para verificar se elemento não contém texto
Cypress.Commands.add('shouldNotContainText', (selector, text) => {
  cy.get(selector).should('not.contain.text', text)
})

// Comando para aguardar API response
Cypress.Commands.add('waitForAPI', (method, url) => {
  cy.intercept(method, url).as('apiCall')
  cy.wait('@apiCall')
})

// Comando para mockar API response
Cypress.Commands.add('mockAPI', (method, url, response) => {
  cy.intercept(method, url, response).as('mockedAPI')
})

// Comando para verificar performance
Cypress.Commands.add('checkPerformance', (threshold = 1000) => {
  cy.window().then((win) => {
    const performance = win.performance
    const navigation = performance.getEntriesByType('navigation')[0]
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart
    
    expect(loadTime).to.be.lessThan(threshold)
  })
})

// Comando para simular scroll
Cypress.Commands.add('scrollToElement', (selector) => {
  cy.get(selector).scrollIntoView()
})

// Comando para verificar acessibilidade básica
Cypress.Commands.add('checkAccessibility', () => {
  // Verifica se há elementos com roles apropriados
  cy.get('[role="button"]').should('exist')
  cy.get('[role="main"]').should('exist')
  
  // Verifica se há labels para inputs
  cy.get('input').each(($input) => {
    const id = $input.attr('id')
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist')
    }
  })
})

// Comando para verificar responsividade
Cypress.Commands.add('checkResponsive', () => {
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ]
  
  breakpoints.forEach(breakpoint => {
    cy.viewport(breakpoint.width, breakpoint.height)
    cy.get('body').should('be.visible')
  })
})
