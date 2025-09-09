describe('VIPAdminView - Testes Headless', () => {
  beforeEach(() => {
    // Mock básico das APIs
    cy.intercept('GET', '/api/plans', {
      statusCode: 200,
      body: {
        success: true,
        plans: [
          { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30 },
          { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30 }
        ],
        count: 2
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
          thisMonthRevenue: 800.00
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
            amount: 49.90
          }
        ]
      }
    }).as('getActiveVIPs');

    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: {
        users: [
          { id: 1, first_name: 'João', last_name: 'Silva', email: 'joao@test.com' }
        ]
      }
    }).as('getUsers');

    cy.intercept('GET', '/api/vip/cron/status', {
      statusCode: 200,
      body: {
        status: {
          isRunning: true,
          initialized: true,
          totalJobs: 5
        }
      }
    }).as('getCronStatus');

    // Mock das APIs de ações
    cy.intercept('POST', '/api/vip/activate', {
      statusCode: 200,
      body: { success: true, message: 'VIP ativado com sucesso' }
    }).as('activateVIP');

    cy.intercept('PUT', '/api/vip/update/*', {
      statusCode: 200,
      body: { success: true, message: 'VIP atualizado com sucesso' }
    }).as('updateVIP');

    cy.intercept('POST', '/api/vip/renew/*', {
      statusCode: 200,
      body: { success: true, message: 'VIP renovado com sucesso' }
    }).as('renewVIP');

    cy.intercept('PATCH', '/api/vip/cancel/*', {
      statusCode: 200,
      body: { success: true, message: 'VIP cancelado com sucesso' }
    }).as('cancelVIP');

    // Visitar a página
    cy.visit('/vip-admin');
  });

  it('deve carregar a página de administração VIP', () => {
    cy.get('.vip-admin-page').should('be.visible');
    cy.get('.page-header h1').should('contain', 'Administração VIP');
  });

  it('deve exibir as estatísticas', () => {
    cy.wait('@getVIPStats');
    cy.get('.stats-grid').should('be.visible');
    cy.get('.stat-card').should('have.length', 4);
  });

  it('deve exibir as tabs de navegação', () => {
    cy.get('.tabs-nav').should('be.visible');
    cy.get('.tab-btn').should('have.length', 5);
  });

  it('deve exibir a tabela de VIPs ativos', () => {
    cy.wait('@getActiveVIPs');
    cy.get('.tab-btn').first().click();
    cy.get('.data-table').should('be.visible');
    cy.get('.data-table tbody tr').should('have.length', 1);
  });

  it('deve abrir o modal de ativação de VIP', () => {
    cy.wait('@getUsers');
    cy.get('.btn-primary').contains('Ativar VIP').click();
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.modal-header h3').should('contain', 'Ativar VIP');
  });

  it('deve carregar os planos no modal de ativação', () => {
    cy.wait('@getPlans');
    cy.wait('@getUsers');
    cy.get('.btn-primary').contains('Ativar VIP').click();
    cy.get('select[name="planType"]').should('be.visible');
    cy.get('select[name="planType"] option').should('have.length.at.least', 2);
  });

  it('deve validar o formulário de ativação', () => {
    cy.wait('@getUsers');
    cy.get('.btn-primary').contains('Ativar VIP').click();
    cy.get('.btn-primary').contains('Ativar VIP').should('be.disabled');
    
    cy.get('select[name="userId"]').select('1');
    cy.get('select[name="planType"]').select('premium');
    cy.get('input[name="duration"]').type('30');
    cy.get('input[name="amount"]').type('49.90');
    
    cy.get('.btn-primary').contains('Ativar VIP').should('not.be.disabled');
  });

  it('deve ativar VIP com sucesso', () => {
    cy.wait('@getUsers');
    cy.get('.btn-primary').contains('Ativar VIP').click();
    
    cy.get('select[name="userId"]').select('1');
    cy.get('select[name="planType"]').select('premium');
    cy.get('input[name="duration"]').type('30');
    cy.get('input[name="amount"]').type('49.90');
    
    cy.get('.btn-primary').contains('Ativar VIP').click();
    cy.wait('@activateVIP');
    cy.get('.modal-overlay').should('not.exist');
  });

  it('deve fechar o modal ao clicar em cancelar', () => {
    cy.wait('@getUsers');
    cy.get('.btn-primary').contains('Ativar VIP').click();
    cy.get('.btn-secondary').contains('Cancelar').click();
    cy.get('.modal-overlay').should('not.exist');
  });

  it('deve exibir a tab de cron jobs', () => {
    cy.wait('@getCronStatus');
    cy.get('.tab-btn').eq(3).click();
    cy.get('.cron-section').should('be.visible');
    cy.get('.cron-status .status-indicator').should('contain', 'Ativo');
  });

  it('deve exibir a tab de relatórios', () => {
    cy.get('.tab-btn').eq(4).click();
    cy.get('.reports-section').should('be.visible');
    cy.get('.date-filters').should('be.visible');
  });
});
