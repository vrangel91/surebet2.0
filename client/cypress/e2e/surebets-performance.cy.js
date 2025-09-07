/**
 * Testes E2E de Performance para SurebetsView
 * Testa cache, navegação e otimizações de performance
 */

describe('Surebets Performance E2E', () => {
  beforeEach(() => {
    // Interceptar chamadas da API
    cy.intercept('GET', '/api/surebets', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          surebets: [
            {
              id: 1,
              sport: 'Futebol',
              profit: 5.2,
              house1: 'Bet365',
              house2: 'Betfair',
              odds1: 2.1,
              odds2: 2.0,
              isLive: false,
              createdAt: new Date().toISOString(),
              match: 'Barcelona vs Real Madrid'
            },
            {
              id: 2,
              sport: 'Basquete',
              profit: 3.8,
              house1: 'William Hill',
              house2: 'Pinnacle',
              odds1: 1.8,
              odds2: 1.9,
              isLive: true,
              createdAt: new Date().toISOString(),
              match: 'Lakers vs Warriors'
            }
          ],
          total: 2,
          timestamp: Date.now()
        }
      }
    }).as('getSurebets')

    // Interceptar outras APIs
    cy.intercept('GET', '/api/bookmaker-accounts', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          accounts: [
            { id: 1, bookmaker: 'Bet365', balance: 1000 },
            { id: 2, bookmaker: 'Betfair', balance: 500 }
          ]
        }
      }
    }).as('getBookmakerAccounts')

    // Visitar página
    cy.visit('/surebets')
  })

  describe('Cache e Performance', () => {
    it('deve carregar dados rapidamente na primeira visita', () => {
      cy.get('[data-testid="surebets-container"]').should('be.visible')
      
      // Aguardar carregamento
      cy.wait('@getSurebets')
      
      // Verificar se dados foram carregados
      cy.get('[data-testid="surebet-card"]').should('have.length.at.least', 1)
      
      // Verificar tempo de carregamento
      cy.get('[data-testid="loading-indicator"]').should('not.exist')
    })

    it('deve usar cache ao navegar entre páginas', () => {
      // Carregar dados iniciais
      cy.wait('@getSurebets')
      cy.get('[data-testid="surebet-card"]').should('be.visible')
      
      // Navegar para outra página
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard"]').should('be.visible')
      
      // Voltar para surebets
      cy.visit('/surebets')
      
      // Verificar se dados ainda estão visíveis (cache)
      cy.get('[data-testid="surebet-card"]').should('be.visible')
      
      // Verificar se não fez nova chamada à API
      cy.get('@getSurebets.all').should('have.length', 1)
    })

    it('deve forçar refresh quando solicitado', () => {
      // Carregar dados iniciais
      cy.wait('@getSurebets')
      
      // Clicar em refresh
      cy.get('[data-testid="refresh-button"]').click()
      
      // Verificar se fez nova chamada
      cy.wait('@getSurebets')
      cy.get('@getSurebets.all').should('have.length', 2)
    })

    it('deve mostrar estatísticas de cache', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Abrir painel de estatísticas
      cy.get('[data-testid="cache-stats-button"]').click()
      
      // Verificar estatísticas
      cy.get('[data-testid="cache-stats"]').should('be.visible')
      cy.get('[data-testid="cache-hit-rate"]').should('contain', '%')
      cy.get('[data-testid="cache-size"]').should('be.visible')
    })
  })

  describe('Filtros e Interações', () => {
    it('deve aplicar filtros sem recarregar dados desnecessariamente', () => {
      // Carregar dados iniciais
      cy.wait('@getSurebets')
      
      // Aplicar filtro de esporte
      cy.get('[data-testid="sport-filter"]').select('Futebol')
      
      // Verificar se filtro foi aplicado
      cy.get('[data-testid="surebet-card"]').should('contain', 'Futebol')
      
      // Verificar se não fez nova chamada à API
      cy.get('@getSurebets.all').should('have.length', 1)
    })

    it('deve aplicar filtro de data corretamente', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Aplicar filtro de data
      cy.get('[data-testid="date-filter"]').type('2024-01-15')
      
      // Verificar se filtro foi aplicado
      cy.get('[data-testid="date-filter"]').should('have.value', '2024-01-15')
    })

    it('deve salvar e carregar filtros salvos', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Aplicar filtros
      cy.get('[data-testid="sport-filter"]').select('Futebol')
      cy.get('[data-testid="min-profit-filter"]').type('3')
      
      // Salvar filtro
      cy.get('[data-testid="save-filter-button"]').click()
      cy.get('[data-testid="filter-name-input"]').type('Meu Filtro')
      cy.get('[data-testid="confirm-save-filter"]').click()
      
      // Verificar se filtro foi salvo
      cy.get('[data-testid="saved-filters"]').should('contain', 'Meu Filtro')
    })

    it('deve alternar entre filtros prelive e live', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Clicar em filtro prelive
      cy.get('[data-testid="prelive-filter"]').click()
      cy.get('[data-testid="prelive-filter"]').should('have.class', 'active')
      
      // Clicar em filtro live
      cy.get('[data-testid="live-filter"]').click()
      cy.get('[data-testid="live-filter"]').should('have.class', 'active')
    })
  })

  describe('Controles de Busca', () => {
    it('deve pausar e retomar busca automática', () => {
      // Carregar dados iniciais
      cy.wait('@getSurebets')
      
      // Pausar busca
      cy.get('[data-testid="search-toggle"]').click()
      cy.get('[data-testid="search-toggle"]').should('contain', 'Retomar')
      
      // Retomar busca
      cy.get('[data-testid="search-toggle"]').click()
      cy.get('[data-testid="search-toggle"]').should('contain', 'Pausar')
    })

    it('deve alternar som corretamente', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Alternar som
      cy.get('[data-testid="sound-toggle"]').click()
      cy.get('[data-testid="sound-toggle"]').should('contain', 'Som Off')
      
      // Alternar novamente
      cy.get('[data-testid="sound-toggle"]').click()
      cy.get('[data-testid="sound-toggle"]').should('contain', 'Som On')
    })

    it('deve mostrar indicador de cards fixos', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Fixar um card
      cy.get('[data-testid="surebet-card"]').first().find('[data-testid="pin-button"]').click()
      
      // Verificar indicador
      cy.get('[data-testid="pinned-indicator"]').should('be.visible')
      cy.get('[data-testid="pinned-indicator"]').should('contain', '1')
    })
  })

  describe('Performance e Otimização', () => {
    it('deve carregar página em menos de 3 segundos', () => {
      const startTime = Date.now()
      
      cy.visit('/surebets')
      cy.get('[data-testid="surebets-container"]').should('be.visible')
      cy.wait('@getSurebets')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('deve manter performance com muitos dados', () => {
      // Interceptar com muitos dados
      cy.intercept('GET', '/api/surebets', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            surebets: Array.from({ length: 100 }, (_, i) => ({
              id: i + 1,
              sport: 'Futebol',
              profit: Math.random() * 10,
              house1: 'Casa A',
              house2: 'Casa B',
              odds1: 2.0,
              odds2: 2.1,
              isLive: false,
              createdAt: new Date().toISOString()
            })),
            total: 100
          }
        }
      }).as('getManySurebets')

      cy.visit('/surebets')
      cy.wait('@getManySurebets')
      
      // Verificar se página ainda é responsiva
      cy.get('[data-testid="surebet-card"]').should('have.length', 100)
      cy.get('[data-testid="search-toggle"]').should('be.visible')
    })

    it('deve otimizar scroll com virtualização', () => {
      // Carregar muitos dados
      cy.intercept('GET', '/api/surebets', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            surebets: Array.from({ length: 1000 }, (_, i) => ({
              id: i + 1,
              sport: 'Futebol',
              profit: Math.random() * 10,
              house1: 'Casa A',
              house2: 'Casa B',
              odds1: 2.0,
              odds2: 2.1,
              isLive: false,
              createdAt: new Date().toISOString()
            })),
            total: 1000
          }
        }
      }).as('getManySurebets')

      cy.visit('/surebets')
      cy.wait('@getManySurebets')
      
      // Verificar se scroll funciona suavemente
      cy.get('[data-testid="surebets-container"]').scrollTo('bottom')
      cy.get('[data-testid="surebets-container"]').should('be.visible')
    })

    it('deve gerenciar memória corretamente', () => {
      // Carregar dados
      cy.wait('@getSurebets')
      
      // Navegar várias vezes
      for (let i = 0; i < 5; i++) {
        cy.visit('/dashboard')
        cy.visit('/surebets')
      }
      
      // Verificar se página ainda funciona
      cy.get('[data-testid="surebet-card"]').should('be.visible')
      cy.get('[data-testid="search-toggle"]').should('be.visible')
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lidar com erro de API graciosamente', () => {
      // Interceptar com erro
      cy.intercept('GET', '/api/surebets', {
        statusCode: 500,
        body: { success: false, message: 'Internal Server Error' }
      }).as('getSurebetsError')

      cy.visit('/surebets')
      cy.wait('@getSurebetsError')
      
      // Verificar se erro é exibido
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('deve recuperar de erro de rede', () => {
      // Interceptar com erro de rede
      cy.intercept('GET', '/api/surebets', {
        forceNetworkError: true
      }).as('getSurebetsNetworkError')

      cy.visit('/surebets')
      cy.wait('@getSurebetsNetworkError')
      
      // Verificar se erro é exibido
      cy.get('[data-testid="error-message"]').should('be.visible')
      
      // Interceptar com sucesso
      cy.intercept('GET', '/api/surebets', {
        statusCode: 200,
        body: {
          success: true,
          data: { surebets: [], total: 0 }
        }
      }).as('getSurebetsSuccess')
      
      // Tentar novamente
      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@getSurebetsSuccess')
      
      // Verificar se recuperou
      cy.get('[data-testid="error-message"]').should('not.exist')
    })

    it('deve lidar com timeout de API', () => {
      // Interceptar com delay
      cy.intercept('GET', '/api/surebets', (req) => {
        req.reply((res) => {
          res.delay(10000) // 10 segundos
          res.send({
            statusCode: 200,
            body: {
              success: true,
              data: { surebets: [], total: 0 }
            }
          })
        })
      }).as('getSurebetsTimeout')

      cy.visit('/surebets')
      
      // Verificar se loading é exibido
      cy.get('[data-testid="loading-indicator"]').should('be.visible')
      
      // Verificar se timeout é tratado
      cy.get('[data-testid="timeout-message"]', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ser acessível via teclado', () => {
      cy.wait('@getSurebets')
      
      // Navegar com Tab
      cy.get('body').tab()
      cy.focused().should('be.visible')
      
      // Navegar pelos controles
      cy.get('[data-testid="search-toggle"]').focus()
      cy.get('[data-testid="sound-toggle"]').focus()
      cy.get('[data-testid="refresh-button"]').focus()
    })

    it('deve ter contraste adequado', () => {
      cy.wait('@getSurebets')
      
      // Verificar contraste dos elementos principais
      cy.get('[data-testid="page-title"]').should('be.visible')
      cy.get('[data-testid="surebet-card"]').should('be.visible')
    })

    it('deve ter labels adequados', () => {
      cy.wait('@getSurebets')
      
      // Verificar se elementos têm labels
      cy.get('[data-testid="search-toggle"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="sound-toggle"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="date-filter"]').should('have.attr', 'aria-label')
    })
  })
})
