// Comandos personalizados para testes do VIPAdminView

Cypress.Commands.add('loginAsAdmin', () => {
  // Mock do token de autenticação
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', 'mock-admin-token');
    win.localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'User',
      is_admin: true,
      role: 'admin'
    }));
  });
});

Cypress.Commands.add('mockVIPAdminAPIs', () => {
  // Mock de todas as APIs necessárias para VIPAdminView
  cy.intercept('GET', '/api/plans', {
    statusCode: 200,
    body: {
      success: true,
      plans: [
        { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30, color: '#6c757d', css_class: 'basic' },
        { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30, color: '#007bff', css_class: 'premium' },
        { id: 3, name: 'vip', display_name: 'Plano VIP', type: 'vip', category: 'Básicos', price: 99.90, duration_days: 30, color: '#ffc107', css_class: 'vip' }
      ],
      count: 3
    }
  }).as('getPlans');

  cy.intercept('GET', '/api/users/vip-statistics', {
    statusCode: 200,
    body: {
      success: true,
      statistics: {
        activeVIPs: 5,
        expiringSoon: 2,
        expiredToday: 1,
        totalRevenue: 2500.00,
        thisMonthRevenue: 800.00,
        thisMonth: 3
      }
    }
  }).as('getVIPStats');

  cy.intercept('GET', '/api/vip/active', {
    statusCode: 200,
    body: {
      activeVIPs: [
        {
          id: 1,
          userId: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium',
          dataInicio: '2024-01-01',
          dataFim: '2024-02-01',
          amount: 49.90,
          autoRenew: false,
          notes: 'Cliente teste'
        }
      ]
    }
  }).as('getActiveVIPs');

  cy.intercept('GET', '/api/users', {
    statusCode: 200,
    body: {
      users: [
        { id: 1, first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
        { id: 2, first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' }
      ]
    }
  }).as('getUsers');

  cy.intercept('GET', '/api/vip/cron/status', {
    statusCode: 200,
    body: {
      status: {
        isRunning: true,
        initialized: true,
        totalJobs: 5,
        lastExecution: '2024-01-20T10:00:00Z',
        nextExecution: '2024-01-21T00:00:00Z',
        jobs: {
          expiredVIPs: { running: true, nextDate: '2024-01-21T00:00:00Z' },
          expirationNotifications: { running: true, nextDate: '2024-01-21T09:00:00Z' },
          lastDayNotifications: { running: true, nextDate: '2024-01-20T18:00:00Z' },
          weeklyReport: { running: true, nextDate: '2024-01-21T08:00:00Z' },
          dataCleanup: { running: true, nextDate: '2024-02-01T02:00:00Z' }
        }
      }
    }
  }).as('getCronStatus');
});

Cypress.Commands.add('openActivateModal', () => {
  cy.get('.btn-primary').contains('Ativar VIP').click();
  cy.get('.modal-overlay').should('be.visible');
  cy.get('.modal-header h3').should('contain', 'Ativar VIP');
});

Cypress.Commands.add('openEditModal', () => {
  cy.get('.action-buttons .btn-icon').first().click();
  cy.get('.modal-overlay').should('be.visible');
  cy.get('.modal-header h3').should('contain', 'Editar VIP');
});

Cypress.Commands.add('fillActivateForm', (userIndex = 0, planType = 'premium', duration = 30, amount = 49.90) => {
  cy.get('select[name="userId"]').select(userIndex);
  cy.get('select[name="planType"]').select(planType);
  cy.get('input[name="duration"]').clear().type(duration.toString());
  cy.get('input[name="amount"]').clear().type(amount.toString());
});

Cypress.Commands.add('fillEditForm', (duration = 60, amount = 99.90) => {
  cy.get('input[name="duration"]').clear().type(duration.toString());
  cy.get('input[name="amount"]').clear().type(amount.toString());
});

Cypress.Commands.add('submitForm', () => {
  cy.get('.btn-primary').contains(/Ativar VIP|Atualizar VIP/).click();
});

Cypress.Commands.add('closeModal', () => {
  cy.get('.btn-secondary').contains('Cancelar').click();
  cy.get('.modal-overlay').should('not.exist');
});

Cypress.Commands.add('switchTab', (tabName) => {
  const tabMap = {
    'ativos': 0,
    'expirando': 1,
    'historico': 2,
    'cron': 3,
    'relatorios': 4
  };
  
  const tabIndex = tabMap[tabName.toLowerCase()];
  if (tabIndex !== undefined) {
    cy.get('.tab-btn').eq(tabIndex).click();
  }
});

Cypress.Commands.add('searchVIP', (searchTerm) => {
  cy.get('.search-input').clear().type(searchTerm);
});

Cypress.Commands.add('filterByPlan', (planName) => {
  cy.get('.filter-select').first().select(planName);
});

Cypress.Commands.add('filterByStatus', (status) => {
  cy.get('.filter-select').eq(1).select(status);
});

Cypress.Commands.add('waitForAPIs', () => {
  cy.wait('@getPlans');
  cy.wait('@getVIPStats');
  cy.wait('@getActiveVIPs');
  cy.wait('@getUsers');
  cy.wait('@getCronStatus');
});

Cypress.Commands.add('verifyVIPData', (expectedData) => {
  cy.get('.data-table tbody tr').should('contain', expectedData.userName);
  cy.get('.data-table tbody tr').should('contain', expectedData.planName);
  if (expectedData.status) {
    cy.get('.data-table tbody tr').should('contain', expectedData.status);
  }
});

Cypress.Commands.add('verifyStats', (expectedStats) => {
  cy.get('.stat-card').first().should('contain', expectedStats.activeVIPs);
  cy.get('.stat-card').eq(1).should('contain', expectedStats.expiringSoon);
  cy.get('.stat-card').eq(2).should('contain', expectedStats.expiredToday);
  if (expectedStats.totalRevenue) {
    cy.get('.stat-card').eq(3).should('contain', expectedStats.totalRevenue);
  }
});

Cypress.Commands.add('verifyCronStatus', (expectedStatus) => {
  cy.get('.cron-status .status-indicator').should('contain', expectedStatus.isRunning ? 'Ativo' : 'Inativo');
  cy.get('.cron-details p').should('contain', expectedStatus.initialized ? 'Sim' : 'Não');
  cy.get('.cron-details p').should('contain', expectedStatus.totalJobs);
});

Cypress.Commands.add('verifyReportsGenerated', () => {
  cy.get('.reports-grid').should('be.visible');
  cy.get('.report-card').should('have.length', 4);
  cy.get('.report-card').first().should('contain', 'Relatório de Receita');
  cy.get('.report-card').eq(1).should('contain', 'Relatório de Conversão');
  cy.get('.report-card').eq(2).should('contain', 'Relatório de Retenção');
  cy.get('.report-card').eq(3).should('contain', 'Relatório por Planos');
});

Cypress.Commands.add('testResponsiveDesign', () => {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1024, height: 768, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Large Desktop' }
  ];

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('.vip-admin-page').should('be.visible');
    cy.get('.stats-grid').should('be.visible');
    cy.get('.tabs-nav').should('be.visible');
  });
});

Cypress.Commands.add('testAccessibility', () => {
  // Verificar se todos os elementos interativos têm labels
  cy.get('button').each(($button) => {
    cy.wrap($button).should('have.attr', 'title').or('have.text');
  });

  // Verificar se todos os inputs têm labels
  cy.get('input, select, textarea').each(($input) => {
    const id = $input.attr('id');
    const name = $input.attr('name');
    const placeholder = $input.attr('placeholder');
    
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist');
    } else if (name) {
      cy.get(`label`).should('contain', name);
    } else if (placeholder) {
      cy.wrap($input).should('have.attr', 'placeholder');
    }
  });

  // Verificar navegação por teclado
  cy.get('.tab-btn').first().focus();
  cy.get('.tab-btn').first().should('have.focus');
  cy.get('.tab-btn').first().type('{enter}');
});

Cypress.Commands.add('testErrorHandling', () => {
  // Testar erro na API de planos
  cy.intercept('GET', '/api/plans', { statusCode: 500 }).as('getPlansError');
  cy.visit('/vip-admin');
  cy.wait('@getPlansError');
  // Deve usar fallback hardcoded
  cy.get('.modal-content').should('be.visible');

  // Testar timeout na API
  cy.intercept('GET', '/api/users/vip-statistics', { delay: 10000 }).as('getStatsTimeout');
  cy.visit('/vip-admin');
  // Deve continuar funcionando com valores padrão
  cy.get('.stats-grid').should('be.visible');
});

Cypress.Commands.add('testPerformance', () => {
  const startTime = Date.now();
  cy.visit('/vip-admin');
  cy.get('.vip-admin-page').should('be.visible');
  cy.then(() => {
    const loadTime = Date.now() - startTime;
    expect(loadTime).to.be.lessThan(5000); // Menos de 5 segundos
  });
});
