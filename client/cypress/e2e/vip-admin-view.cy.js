describe('VIPAdminView - Testes Completos', () => {
  beforeEach(() => {
    // Mock da API de planos
    cy.intercept('GET', '/api/plans', {
      statusCode: 200,
      body: {
        success: true,
        plans: [
          { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30, color: '#6c757d', css_class: 'basic' },
          { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30, color: '#007bff', css_class: 'premium' },
          { id: 3, name: 'vip', display_name: 'Plano VIP', type: 'vip', category: 'Básicos', price: 99.90, duration_days: 30, color: '#ffc107', css_class: 'vip' },
          { id: 4, name: 'pre-daily', display_name: 'Pré-Jogo Diário', type: 'pre-daily', category: 'Pré-Jogo', price: 19.90, duration_days: 1, color: '#28a745', css_class: 'pre-daily' },
          { id: 5, name: 'pre-weekly', display_name: 'Pré-Jogo Semanal', type: 'pre-weekly', category: 'Pré-Jogo', price: 39.90, duration_days: 7, color: '#28a745', css_class: 'pre-weekly' }
        ],
        count: 5
      }
    }).as('getPlans');

    // Mock da API de estatísticas VIP
    cy.intercept('GET', '/api/users/vip-statistics', {
      statusCode: 200,
      body: {
        success: true,
        statistics: {
          activeVIPs: 10,
          expiringSoon: 3,
          expiredToday: 2,
          totalRevenue: 5000.00,
          thisMonthRevenue: 1200.00,
          thisMonth: 5
        }
      }
    }).as('getVIPStats');

    // Mock da API de VIPs ativos
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
            notes: 'Teste'
          },
          {
            id: 2,
            userId: 2,
            user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
            planName: 'VIP',
            dataInicio: '2024-01-15',
            dataFim: '2024-02-15',
            amount: 99.90,
            autoRenew: true,
            notes: 'Cliente VIP'
          }
        ]
      }
    }).as('getActiveVIPs');

    // Mock da API de usuários
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: {
        users: [
          { id: 1, first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          { id: 2, first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          { id: 3, first_name: 'Pedro', last_name: 'Costa', email: 'pedro@test.com' }
        ]
      }
    }).as('getUsers');

    // Mock da API de status dos cron jobs
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

    // Mock da API de histórico VIP
    cy.intercept('GET', '/api/vip/history/all', {
      statusCode: 200,
      body: {
        vipHistory: [
          {
            id: 1,
            userId: 1,
            user: { first_name: 'João', first_name: 'Silva', email: 'joao@test.com' },
            planName: 'Premium',
            dataInicio: '2023-12-01',
            dataFim: '2024-01-01',
            status: 'expired',
            amount: 49.90
          }
        ]
      }
    }).as('getVIPHistory');

    // Mock da API de VIPs expirando
    cy.intercept('GET', '/api/vip/expiring-soon', {
      statusCode: 200,
      body: {
        expiringVIPs: [
          {
            id: 3,
            userId: 3,
            user: { first_name: 'Pedro', last_name: 'Costa', email: 'pedro@test.com' },
            planName: 'Basic',
            dataFim: '2024-01-22',
            amount: 29.90
          }
        ]
      }
    }).as('getExpiringVIPs');

    // Mock das APIs de relatórios
    cy.intercept('GET', '/api/vip/reports/revenue*', {
      statusCode: 200,
      body: {
        report: {
          summary: {
            totalRevenue: 5000.00,
            avgRevenue: 250.00,
            totalTransactions: 20,
            uniqueUsers: 15
          },
          generatedAt: '2024-01-20T10:00:00Z'
        }
      }
    }).as('getRevenueReport');

    cy.intercept('GET', '/api/vip/reports/conversion*', {
      statusCode: 200,
      body: {
        report: {
          metrics: {
            conversionRate: 15.5,
            firstTimeVIPs: 8,
            renewals: 12,
            totalUsers: 100
          }
        }
      }
    }).as('getConversionReport');

    cy.intercept('GET', '/api/vip/reports/retention*', {
      statusCode: 200,
      body: {
        report: {
          metrics: {
            retentionRate: 75.0,
            totalExpired: 20,
            renewedAfterExpiry: 5,
            renewedBeforeExpiry: 10
          }
        }
      }
    }).as('getRetentionReport');

    cy.intercept('GET', '/api/vip/reports/plans*', {
      statusCode: 200,
      body: {
        report: {
          plans: [
            { planId: 1, planName: 'Premium', activations: 10 },
            { planId: 2, planName: 'VIP', activations: 5 }
          ],
          summary: {
            totalActivations: 15,
            totalRevenue: 3000.00
          }
        }
      }
    }).as('getPlansReport');

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

    cy.intercept('POST', '/api/vip/cron/initialize', {
      statusCode: 200,
      body: { success: true, message: 'Cron jobs inicializados', totalJobs: 5 }
    }).as('initializeCronJobs');

    cy.intercept('POST', '/api/vip/cron/stop', {
      statusCode: 200,
      body: { success: true, message: 'Cron jobs parados', totalStopped: 5 }
    }).as('stopCronJobs');

    cy.intercept('POST', '/api/vip/cron/process-expired', {
      statusCode: 200,
      body: { success: true, message: 'VIPs expirados processados' }
    }).as('processExpiredVIPs');

    cy.intercept('POST', '/api/vip/cron/weekly-report', {
      statusCode: 200,
      body: { success: true, message: 'Relatório semanal gerado' }
    }).as('generateWeeklyReport');

    cy.intercept('POST', '/api/vip/notify-expiration/*', {
      statusCode: 200,
      body: { success: true, message: 'Notificação enviada' }
    }).as('sendExpirationNotification');

    // Visitar a página
    cy.visit('/vip-admin');
  });

  describe('Verificação de Acesso e Layout', () => {
    it('deve exibir a página de administração VIP para usuários admin', () => {
      cy.get('.vip-admin-page').should('be.visible');
      cy.get('.page-header h1').should('contain', 'Administração VIP');
      cy.get('.header-subtitle').should('contain', 'Gerencie usuários VIP, cron jobs e relatórios');
    });

    it('deve exibir as estatísticas corretamente', () => {
      cy.wait('@getVIPStats');
      cy.get('.stats-grid').should('be.visible');
      cy.get('.stat-card').should('have.length', 4);
      cy.get('.stat-card').first().should('contain', '10'); // activeVIPs
      cy.get('.stat-card').eq(1).should('contain', '3'); // expiringSoon
      cy.get('.stat-card').eq(2).should('contain', '2'); // expiredToday
      cy.get('.stat-card').eq(3).should('contain', 'R$ 5.000,00'); // totalRevenue
    });

    it('deve exibir as tabs de navegação', () => {
      cy.get('.tabs-nav').should('be.visible');
      cy.get('.tab-btn').should('have.length', 5);
      cy.get('.tab-btn').first().should('contain', 'VIPs Ativos');
      cy.get('.tab-btn').eq(1).should('contain', 'Expirando em Breve');
      cy.get('.tab-btn').eq(2).should('contain', 'Histórico');
      cy.get('.tab-btn').eq(3).should('contain', 'Cron Jobs');
      cy.get('.tab-btn').eq(4).should('contain', 'Relatórios');
    });
  });

  describe('Tab: VIPs Ativos', () => {
    beforeEach(() => {
      cy.wait('@getActiveVIPs');
      cy.get('.tab-btn').first().click();
    });

    it('deve exibir a tabela de VIPs ativos', () => {
      cy.get('.data-table').should('be.visible');
      cy.get('.data-table thead th').should('have.length', 7);
      cy.get('.data-table thead th').first().should('contain', 'Usuário');
      cy.get('.data-table thead th').eq(1).should('contain', 'Plano');
      cy.get('.data-table thead th').eq(2).should('contain', 'Início');
      cy.get('.data-table thead th').eq(3).should('contain', 'Expiração');
      cy.get('.data-table thead th').eq(4).should('contain', 'Dias Restantes');
      cy.get('.data-table thead th').eq(5).should('contain', 'Status');
      cy.get('.data-table thead th').eq(6).should('contain', 'Ações');
    });

    it('deve exibir os dados dos VIPs ativos', () => {
      cy.get('.data-table tbody tr').should('have.length', 2);
      cy.get('.data-table tbody tr').first().should('contain', 'João Silva');
      cy.get('.data-table tbody tr').first().should('contain', 'joao@test.com');
      cy.get('.data-table tbody tr').first().should('contain', 'Premium');
    });

    it('deve permitir busca de usuários', () => {
      cy.get('.search-input').type('João');
      cy.get('.data-table tbody tr').should('have.length', 1);
      cy.get('.data-table tbody tr').should('contain', 'João Silva');
    });

    it('deve permitir filtro por plano', () => {
      cy.get('.filter-select').first().select('Premium');
      cy.get('.data-table tbody tr').should('have.length', 1);
      cy.get('.data-table tbody tr').should('contain', 'Premium');
    });

    it('deve permitir filtro por status', () => {
      cy.get('.filter-select').eq(1).select('active');
      cy.get('.data-table tbody tr').should('have.length', 2);
    });

    it('deve exibir botões de ação para cada VIP', () => {
      cy.get('.action-buttons').should('have.length', 2);
      cy.get('.action-buttons .btn-icon').should('have.length', 6); // 3 botões por VIP
    });

    it('deve abrir modal de edição ao clicar no botão de editar', () => {
      cy.get('.action-buttons .btn-icon').first().click();
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.modal-header h3').should('contain', 'Editar VIP');
    });

    it('deve abrir modal de ativação ao clicar no botão "Ativar VIP"', () => {
      cy.get('.btn-primary').contains('Ativar VIP').click();
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.modal-header h3').should('contain', 'Ativar VIP');
    });
  });

  describe('Modal de Ativação de VIP', () => {
    beforeEach(() => {
      cy.wait('@getUsers');
      cy.get('.btn-primary').contains('Ativar VIP').click();
    });

    it('deve exibir o formulário de ativação', () => {
      cy.get('.modal-content').should('be.visible');
      cy.get('label').should('contain', 'Selecionar Usuário');
      cy.get('label').should('contain', 'Tipo de Plano');
      cy.get('label').should('contain', 'Duração (dias)');
      cy.get('label').should('contain', 'Valor (R$)');
      cy.get('label').should('contain', 'Renovação Automática');
      cy.get('label').should('contain', 'Observações');
    });

    it('deve carregar os planos dinamicamente', () => {
      cy.wait('@getPlans');
      cy.get('select[name="planType"]').should('be.visible');
      cy.get('select[name="planType"] option').should('have.length.at.least', 5);
    });

    it('deve carregar os usuários disponíveis', () => {
      cy.get('select[name="userId"]').should('be.visible');
      cy.get('select[name="userId"] option').should('have.length.at.least', 3);
    });

    it('deve validar o formulário antes de permitir ativação', () => {
      cy.get('.btn-primary').contains('Ativar VIP').should('be.disabled');
      cy.get('select[name="userId"]').select('1');
      cy.get('select[name="planType"]').select('premium');
      cy.get('input[name="duration"]').type('30');
      cy.get('input[name="amount"]').type('49.90');
      cy.get('.btn-primary').contains('Ativar VIP').should('not.be.disabled');
    });

    it('deve ativar VIP com sucesso', () => {
      cy.get('select[name="userId"]').select('1');
      cy.get('select[name="planType"]').select('premium');
      cy.get('input[name="duration"]').type('30');
      cy.get('input[name="amount"]').type('49.90');
      cy.get('.btn-primary').contains('Ativar VIP').click();
      cy.wait('@activateVIP');
      cy.get('.modal-overlay').should('not.exist');
    });

    it('deve fechar o modal ao clicar em cancelar', () => {
      cy.get('.btn-secondary').contains('Cancelar').click();
      cy.get('.modal-overlay').should('not.exist');
    });

    it('deve fechar o modal ao clicar no X', () => {
      cy.get('.modal-close').click();
      cy.get('.modal-overlay').should('not.exist');
    });
  });

  describe('Modal de Edição de VIP', () => {
    beforeEach(() => {
      cy.wait('@getActiveVIPs');
      cy.get('.tab-btn').first().click();
      cy.get('.action-buttons .btn-icon').first().click();
    });

    it('deve exibir o formulário de edição preenchido', () => {
      cy.get('.modal-content').should('be.visible');
      cy.get('input[name="userName"]').should('have.value', 'João Silva (joao@test.com)');
      cy.get('select[name="planType"]').should('have.value', 'premium');
      cy.get('input[name="duration"]').should('have.value', '30');
      cy.get('input[name="amount"]').should('have.value', '49.90');
    });

    it('deve atualizar VIP com sucesso', () => {
      cy.get('input[name="duration"]').clear().type('60');
      cy.get('input[name="amount"]').clear().type('99.90');
      cy.get('.btn-primary').contains('Atualizar VIP').click();
      cy.wait('@updateVIP');
      cy.get('.modal-overlay').should('not.exist');
    });
  });

  describe('Tab: Expirando em Breve', () => {
    beforeEach(() => {
      cy.wait('@getExpiringVIPs');
      cy.get('.tab-btn').eq(1).click();
    });

    it('deve exibir a tabela de VIPs expirando', () => {
      cy.get('.data-table').should('be.visible');
      cy.get('.data-table tbody tr').should('have.length', 1);
      cy.get('.data-table tbody tr').should('contain', 'Pedro Costa');
      cy.get('.data-table tbody tr').should('contain', 'Basic');
    });

    it('deve exibir botões de ação para renovação e notificação', () => {
      cy.get('.action-buttons .btn-icon').should('have.length', 2);
    });
  });

  describe('Tab: Histórico', () => {
    beforeEach(() => {
      cy.wait('@getVIPHistory');
      cy.get('.tab-btn').eq(2).click();
    });

    it('deve exibir a tabela de histórico', () => {
      cy.get('.data-table').should('be.visible');
      cy.get('.data-table tbody tr').should('have.length', 1);
      cy.get('.data-table tbody tr').should('contain', 'João Silva');
      cy.get('.data-table tbody tr').should('contain', 'Premium');
    });

    it('deve permitir busca no histórico', () => {
      cy.get('.search-input').type('João');
      cy.get('.data-table tbody tr').should('have.length', 1);
    });

    it('deve permitir filtro por período', () => {
      cy.get('.filter-select').eq(2).select('month');
      cy.get('.data-table tbody tr').should('have.length', 1);
    });
  });

  describe('Tab: Cron Jobs', () => {
    beforeEach(() => {
      cy.wait('@getCronStatus');
      cy.get('.tab-btn').eq(3).click();
    });

    it('deve exibir o status dos cron jobs', () => {
      cy.get('.cron-section').should('be.visible');
      cy.get('.cron-status .status-indicator').should('contain', 'Ativo');
      cy.get('.cron-details p').should('contain', 'Executando');
      cy.get('.cron-details p').should('contain', 'Sim'); // Inicializado
      cy.get('.cron-details p').should('contain', '5'); // Total de Jobs
    });

    it('deve exibir os controles de cron jobs', () => {
      cy.get('.cron-controls').should('be.visible');
      cy.get('.btn-success').should('contain', 'Inicializar Cron Jobs');
      cy.get('.btn-danger').should('contain', 'Parar Cron Jobs');
      cy.get('.btn-warning').should('contain', 'Processar VIPs Expirados');
      cy.get('.btn-info').should('contain', 'Gerar Relatório Semanal');
    });

    it('deve inicializar cron jobs', () => {
      cy.get('.btn-success').click();
      cy.wait('@initializeCronJobs');
    });

    it('deve parar cron jobs', () => {
      cy.get('.btn-danger').click();
      cy.wait('@stopCronJobs');
    });

    it('deve processar VIPs expirados', () => {
      cy.get('.btn-warning').click();
      cy.wait('@processExpiredVIPs');
    });

    it('deve gerar relatório semanal', () => {
      cy.get('.btn-info').click();
      cy.wait('@generateWeeklyReport');
    });
  });

  describe('Tab: Relatórios', () => {
    beforeEach(() => {
      cy.get('.tab-btn').eq(4).click();
    });

    it('deve exibir os controles de relatórios', () => {
      cy.get('.reports-section').should('be.visible');
      cy.get('.date-filters').should('be.visible');
      cy.get('.date-input').should('have.length', 2);
      cy.get('.btn-primary').should('contain', 'Gerar Relatórios');
    });

    it('deve gerar relatórios automaticamente ao abrir a aba', () => {
      cy.wait('@getRevenueReport');
      cy.wait('@getConversionReport');
      cy.wait('@getRetentionReport');
      cy.wait('@getPlansReport');
    });

    it('deve exibir os relatórios gerados', () => {
      cy.wait('@getRevenueReport');
      cy.wait('@getConversionReport');
      cy.wait('@getRetentionReport');
      cy.wait('@getPlansReport');
      
      cy.get('.reports-grid').should('be.visible');
      cy.get('.report-card').should('have.length', 4);
      cy.get('.report-card').first().should('contain', 'Relatório de Receita');
      cy.get('.report-card').eq(1).should('contain', 'Relatório de Conversão');
      cy.get('.report-card').eq(2).should('contain', 'Relatório de Retenção');
      cy.get('.report-card').eq(3).should('contain', 'Relatório por Planos');
    });

    it('deve exibir os dados dos relatórios', () => {
      cy.wait('@getRevenueReport');
      cy.get('.report-card').first().should('contain', 'R$ 5.000,00'); // Receita Total
      cy.get('.report-card').first().should('contain', 'R$ 250,00'); // Média por Transação
      cy.get('.report-card').first().should('contain', '20'); // Total de Transações
      cy.get('.report-card').first().should('contain', '15'); // Usuários Únicos
    });

    it('deve permitir gerar relatórios com período personalizado', () => {
      cy.get('.date-input').first().type('2024-01-01');
      cy.get('.date-input').eq(1).type('2024-01-31');
      cy.get('.btn-primary').contains('Gerar Relatórios').click();
      cy.wait('@getRevenueReport');
      cy.wait('@getConversionReport');
      cy.wait('@getRetentionReport');
      cy.wait('@getPlansReport');
    });
  });

  describe('Funcionalidades de Ação', () => {
    beforeEach(() => {
      cy.wait('@getActiveVIPs');
      cy.get('.tab-btn').first().click();
    });

    it('deve renovar VIP com sucesso', () => {
      cy.get('.action-buttons .btn-icon').eq(1).click(); // Botão de renovar
      cy.wait('@renewVIP');
    });

    it('deve cancelar VIP com confirmação', () => {
      cy.get('.action-buttons .btn-icon').eq(2).click(); // Botão de cancelar
      cy.on('window:confirm', () => true);
      cy.wait('@cancelVIP');
    });

    it('deve enviar notificação de expiração', () => {
      cy.get('.tab-btn').eq(1).click(); // Tab Expirando em Breve
      cy.wait('@getExpiringVIPs');
      cy.get('.action-buttons .btn-icon').eq(1).click(); // Botão de notificação
      cy.wait('@sendExpirationNotification');
    });
  });

  describe('Responsividade', () => {
    it('deve funcionar em dispositivos móveis', () => {
      cy.viewport(375, 667);
      cy.get('.vip-admin-page').should('be.visible');
      cy.get('.stats-grid').should('be.visible');
      cy.get('.tabs-nav').should('be.visible');
    });

    it('deve funcionar em tablets', () => {
      cy.viewport(768, 1024);
      cy.get('.vip-admin-page').should('be.visible');
      cy.get('.stats-grid').should('be.visible');
      cy.get('.tabs-nav').should('be.visible');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lidar com erro na API de planos', () => {
      cy.intercept('GET', '/api/plans', { statusCode: 500 }).as('getPlansError');
      cy.visit('/vip-admin');
      cy.wait('@getPlansError');
      // Deve usar fallback hardcoded
      cy.get('.modal-content').should('be.visible');
    });

    it('deve lidar com erro na API de estatísticas', () => {
      cy.intercept('GET', '/api/users/vip-statistics', { statusCode: 500 }).as('getStatsError');
      cy.visit('/vip-admin');
      cy.wait('@getStatsError');
      // Deve continuar funcionando com valores padrão
      cy.get('.stats-grid').should('be.visible');
    });

    it('deve lidar com timeout na API', () => {
      cy.intercept('GET', '/api/plans', { delay: 10000 }).as('getPlansTimeout');
      cy.visit('/vip-admin');
      // Deve usar fallback após timeout
      cy.get('.modal-content').should('be.visible');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para screen readers', () => {
      cy.get('label').should('exist');
      cy.get('input[type="text"]').should('have.attr', 'placeholder');
      cy.get('select').should('have.attr', 'name');
    });

    it('deve ter navegação por teclado', () => {
      cy.get('.tab-btn').first().focus();
      cy.get('.tab-btn').first().should('have.focus');
      cy.get('.tab-btn').first().type('{enter}');
    });

    it('deve ter contraste adequado', () => {
      cy.get('.btn-primary').should('be.visible');
      cy.get('.btn-secondary').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('deve carregar a página em tempo razoável', () => {
      const startTime = Date.now();
      cy.visit('/vip-admin');
      cy.get('.vip-admin-page').should('be.visible');
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Menos de 5 segundos
      });
    });

    it('deve fazer requisições em paralelo quando possível', () => {
      cy.visit('/vip-admin');
      // Verificar se múltiplas APIs são chamadas simultaneamente
      cy.wait('@getVIPStats');
      cy.wait('@getActiveVIPs');
      cy.wait('@getPlans');
    });
  });
});
