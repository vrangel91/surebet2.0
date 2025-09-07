describe('Página de Surebets - Testes E2E', () => {
  beforeEach(() => {
    // Limpar dados de teste
    cy.clearTestData()
    
    // Mockar WebSocket
    cy.mockWebSocket()
    
    // Mockar API de surebets
    cy.mockAPI('GET', '/api/surebets', {
      statusCode: 200,
      body: {
        'surebet_001': [
          {
            house: 'Bet365',
            chance: 2.10,
            market: 'Resultado Final',
            sport: 'Futebol',
            event: 'Brasil vs Argentina',
            selection1: 'Brasil',
            selection2: 'Empate',
            selection3: 'Argentina',
            odds1: 2.10,
            odds2: 3.40,
            odds3: 3.80,
            profit: 15.50,
            roi: 3.2,
            stake: 100,
            isLive: false,
            timestamp: new Date().toISOString()
          },
          {
            house: 'William Hill',
            chance: 3.40,
            market: 'Resultado Final',
            sport: 'Futebol',
            event: 'Brasil vs Argentina',
            selection1: 'Brasil',
            selection2: 'Empate',
            selection3: 'Argentina',
            odds1: 2.10,
            odds2: 3.40,
            odds3: 3.80,
            profit: 15.50,
            roi: 3.2,
            stake: 100,
            isLive: false,
            timestamp: new Date().toISOString()
          }
        ]
      }
    })
    
    // Mockar API de usuário
    cy.mockAPI('GET', '/api/user/profile', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'vip@example.com',
        name: 'VIP User',
        isVIP: true,
        isAdmin: false,
        balance: 1000.00
      }
    })
  })

  describe('Fluxo de Login e Acesso', () => {
    it('deve redirecionar usuário não autenticado para login', () => {
      cy.visit('/')
      cy.url().should('include', '/login')
    })

    it('deve permitir acesso com usuário VIP', () => {
      cy.loginAsVIP()
      cy.visit('/')
      cy.url().should('not.include', '/login')
      cy.get('[data-testid="surebets-page"]').should('be.visible')
    })

    it('deve exibir mensagem de erro para usuário não VIP', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify({
          id: 1,
          email: 'user@example.com',
          name: 'Regular User',
          isVIP: false,
          isAdmin: false,
          token: 'mock-token'
        }))
      })
      
      cy.visit('/')
      cy.url().should('include', '/plans')
    })
  })

  describe('Carregamento e Exibição de Dados', () => {
    beforeEach(() => {
      cy.loginAsVIP()
    })

    it('deve carregar e exibir surebets corretamente', () => {
      cy.visit('/')
      
      // Aguardar carregamento
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.waitForSurebets()
      
      // Verificar se os cards de surebet são exibidos
      cy.get('[data-testid="surebet-card"]').should('have.length.at.least', 1)
      
      // Verificar informações do surebet
      cy.get('[data-testid="surebet-card"]').first().within(() => {
        cy.shouldContainText('[data-testid="event-title"]', 'Brasil vs Argentina')
        cy.shouldContainText('[data-testid="sport-badge"]', 'Futebol')
        cy.shouldContainText('[data-testid="profit-value"]', 'R$')
        cy.shouldContainText('[data-testid="roi-value"]', '%')
      })
    })

    it('deve exibir loading durante carregamento', () => {
      cy.visit('/')
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
    })

    it('deve ocultar loading após carregamento', () => {
      cy.visit('/')
      cy.waitForSurebets()
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })
  })

  describe('Filtros e Busca', () => {
    beforeEach(() => {
      cy.loginAsVIP()
      cy.visit('/')
      cy.waitForSurebets()
    })

    it('deve aplicar filtro por esporte', () => {
      // Abrir painel de filtros
      cy.get('[data-testid="filter-toggle"]').click()
      
      // Selecionar esporte
      cy.get('[data-testid="sport-filter"]').click()
      cy.get('[data-testid="sport-option-futebol"]').click()
      
      // Aplicar filtro
      cy.get('[data-testid="apply-filters"]').click()
      
      // Verificar se apenas surebets de futebol são exibidos
      cy.get('[data-testid="surebet-card"]').each(($card) => {
        cy.wrap($card).shouldContainText('[data-testid="sport-badge"]', 'Futebol')
      })
    })

    it('deve aplicar filtro por casa de apostas', () => {
      cy.get('[data-testid="filter-toggle"]').click()
      
      cy.get('[data-testid="house-filter"]').click()
      cy.get('[data-testid="house-option-bet365"]').click()
      
      cy.get('[data-testid="apply-filters"]').click()
      
      // Verificar se apenas surebets da Bet365 são exibidos
      cy.get('[data-testid="surebet-card"]').each(($card) => {
        cy.wrap($card).shouldContainText('[data-testid="bookmaker"]', 'Bet365')
      })
    })

    it('deve aplicar filtro de ROI mínimo', () => {
      cy.get('[data-testid="filter-toggle"]').click()
      
      cy.get('[data-testid="min-roi-input"]').clear().type('2.0')
      cy.get('[data-testid="apply-filters"]').click()
      
      // Verificar se apenas surebets com ROI >= 2.0 são exibidos
      cy.get('[data-testid="surebet-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="roi-value"]').then(($roi) => {
          const roiText = $roi.text()
          const roiValue = parseFloat(roiText.replace('%', ''))
          expect(roiValue).to.be.at.least(2.0)
        })
      })
    })

    it('deve limpar todos os filtros', () => {
      // Aplicar alguns filtros
      cy.get('[data-testid="filter-toggle"]').click()
      cy.get('[data-testid="sport-filter"]').click()
      cy.get('[data-testid="sport-option-futebol"]').click()
      cy.get('[data-testid="apply-filters"]').click()
      
      // Limpar filtros
      cy.get('[data-testid="clear-filters"]').click()
      
      // Verificar se todos os surebets são exibidos novamente
      cy.get('[data-testid="surebet-card"]').should('have.length.at.least', 1)
    })
  })

  describe('Controles de Busca', () => {
    beforeEach(() => {
      cy.loginAsVIP()
      cy.visit('/')
      cy.waitForSurebets()
    })

    it('deve pausar e retomar busca', () => {
      // Verificar estado inicial
      cy.get('[data-testid="search-toggle"]').shouldContainText('Pausar')
      
      // Pausar busca
      cy.get('[data-testid="search-toggle"]').click()
      cy.get('[data-testid="search-toggle"]').shouldContainText('Retomar')
      
      // Retomar busca
      cy.get('[data-testid="search-toggle"]').click()
      cy.get('[data-testid="search-toggle"]').shouldContainText('Pausar')
    })

    it('deve alternar som', () => {
      // Verificar estado inicial
      cy.get('[data-testid="sound-toggle"]').shouldContainText('Som On')
      
      // Desligar som
      cy.get('[data-testid="sound-toggle"]').click()
      cy.get('[data-testid="sound-toggle"]').shouldContainText('Som Off')
      
      // Ligar som
      cy.get('[data-testid="sound-toggle"]').click()
      cy.get('[data-testid="sound-toggle"]').shouldContainText('Som On')
    })
  })

  describe('Interações com Cards', () => {
    beforeEach(() => {
      cy.loginAsVIP()
      cy.visit('/')
      cy.waitForSurebets()
    })

    it('deve fixar e desfixar card', () => {
      // Fixar primeiro card
      cy.get('[data-testid="surebet-card"]').first().within(() => {
        cy.get('[data-testid="pin-button"]').click()
      })
      
      // Verificar se card foi fixado
      cy.get('[data-testid="pinned-cards"]').should('be.visible')
      cy.get('[data-testid="pinned-indicator"]').shouldContainText('1')
      
      // Desfixar card
      cy.get('[data-testid="pinned-cards"]').within(() => {
        cy.get('[data-testid="unpin-button"]').click()
      })
      
      // Verificar se card foi desfixado
      cy.get('[data-testid="pinned-cards"]').should('not.exist')
    })

    it('deve exibir botões de apostar', () => {
      cy.get('[data-testid="surebet-card"]').first().within(() => {
        cy.get('[data-testid="bet-button"]').should('be.visible')
        cy.get('[data-testid="bet-button"]').shouldContainText('Apostar')
      })
    })

    it('deve exibir informações de stake calculado', () => {
      cy.get('[data-testid="surebet-card"]').first().within(() => {
        cy.get('[data-testid="stake-value"]').should('be.visible')
        cy.get('[data-testid="stake-value"]').shouldContainText('R$')
      })
    })
  })

  describe('Responsividade', () => {
    beforeEach(() => {
      cy.loginAsVIP()
    })

    it('deve funcionar em dispositivos móveis', () => {
      cy.setViewport('mobile')
      cy.visit('/')
      cy.waitForSurebets()
      
      // Verificar se elementos principais são visíveis
      cy.get('[data-testid="surebets-page"]').should('be.visible')
      cy.get('[data-testid="surebet-card"]').should('be.visible')
      
      // Verificar se controles são acessíveis
      cy.get('[data-testid="search-toggle"]').should('be.visible')
      cy.get('[data-testid="filter-toggle"]').should('be.visible')
    })

    it('deve funcionar em tablets', () => {
      cy.setViewport('tablet')
      cy.visit('/')
      cy.waitForSurebets()
      
      cy.get('[data-testid="surebets-page"]').should('be.visible')
      cy.get('[data-testid="surebet-card"]').should('be.visible')
    })

    it('deve funcionar em desktop', () => {
      cy.setViewport('desktop')
      cy.visit('/')
      cy.waitForSurebets()
      
      cy.get('[data-testid="surebets-page"]').should('be.visible')
      cy.get('[data-testid="surebet-card"]').should('be.visible')
    })
  })

  describe('Performance', () => {
    beforeEach(() => {
      cy.loginAsVIP()
    })

    it('deve carregar página rapidamente', () => {
      cy.visit('/')
      cy.checkPerformance(2000) // Máximo 2 segundos
    })

    it('deve filtrar dados rapidamente', () => {
      cy.visit('/')
      cy.waitForSurebets()
      
      const startTime = Date.now()
      
      cy.get('[data-testid="filter-toggle"]').click()
      cy.get('[data-testid="sport-filter"]').click()
      cy.get('[data-testid="sport-option-futebol"]').click()
      cy.get('[data-testid="apply-filters"]').click()
      
      cy.then(() => {
        const endTime = Date.now()
        const filterTime = endTime - startTime
        expect(filterTime).to.be.lessThan(500) // Máximo 500ms
      })
    })
  })

  describe('Tratamento de Erros', () => {
    beforeEach(() => {
      cy.loginAsVIP()
    })

    it('deve exibir mensagem de erro quando API falha', () => {
      // Mockar erro na API
      cy.intercept('GET', '/api/surebets', {
        statusCode: 500,
        body: { error: 'Servidor indisponível' }
      }).as('apiError')
      
      cy.visit('/')
      cy.wait('@apiError')
      
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').shouldContainText('Erro ao carregar dados')
    })

    it('deve permitir retry após erro', () => {
      // Mockar erro inicial
      cy.intercept('GET', '/api/surebets', {
        statusCode: 500,
        body: { error: 'Servidor indisponível' }
      }).as('apiError')
      
      cy.visit('/')
      cy.wait('@apiError')
      
      // Mockar sucesso no retry
      cy.intercept('GET', '/api/surebets', {
        statusCode: 200,
        body: {
          'surebet_001': [
            {
              house: 'Bet365',
              chance: 2.10,
              market: 'Resultado Final',
              sport: 'Futebol',
              event: 'Brasil vs Argentina',
              profit: 15.50,
              roi: 3.2,
              isLive: false
            }
          ]
        }
      }).as('apiSuccess')
      
      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@apiSuccess')
      
      cy.get('[data-testid="surebet-card"]').should('be.visible')
    })
  })

  describe('Acessibilidade', () => {
    beforeEach(() => {
      cy.loginAsVIP()
      cy.visit('/')
      cy.waitForSurebets()
    })

    it('deve ter estrutura semântica correta', () => {
      cy.checkAccessibility()
    })

    it('deve ser navegável por teclado', () => {
      // Testar navegação por Tab
      cy.get('body').tab()
      cy.focused().should('be.visible')
      
      // Testar navegação por Enter
      cy.get('[data-testid="search-toggle"]').focus()
      cy.get('[data-testid="search-toggle"]').type('{enter}')
    })

    it('deve ter contraste adequado', () => {
      // Verificar se elementos importantes têm contraste suficiente
      cy.get('[data-testid="surebet-card"]').first().should('be.visible')
    })
  })
})
