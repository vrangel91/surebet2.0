describe('Teste de Carga - Múltiplos Usuários', () => {
  beforeEach(() => {
    cy.clearTestData()
    cy.mockWebSocket()
  })

  it('deve suportar múltiplas sessões simultâneas', () => {
    // Simular 5 usuários simultâneos
    const userCount = 5
    const promises = []
    
    for (let i = 0; i < userCount; i++) {
      const promise = cy.wrap(null).then(() => {
        // Criar usuário único
        const user = {
          id: i + 1,
          email: `user${i + 1}@example.com`,
          name: `User ${i + 1}`,
          isVIP: true,
          isAdmin: false,
          token: `mock-token-${i + 1}`
        }
        
        // Mockar API para este usuário
        cy.mockAPI('GET', '/api/surebets', {
          statusCode: 200,
          body: {
            [`surebet_${i + 1}`]: [
              {
                house: 'Bet365',
                chance: 2.10 + (i * 0.1),
                market: 'Resultado Final',
                sport: 'Futebol',
                event: `Event ${i + 1}`,
                profit: 15.50 + (i * 2),
                roi: 3.2 + (i * 0.1),
                isLive: false
              }
            ]
          }
        })
        
        // Login e navegação
        cy.window().then((win) => {
          win.localStorage.setItem('user', JSON.stringify(user))
        })
        
        cy.visit('/')
        cy.waitForSurebets()
        
        // Verificar se dados foram carregados
        cy.get('[data-testid="surebet-card"]').should('be.visible')
      })
      
      promises.push(promise)
    }
    
    // Aguardar todas as sessões
    cy.wrap(Promise.all(promises))
  })

  it('deve manter performance com muitos dados', () => {
    // Mockar muitos surebets
    const manySurebets = {}
    for (let i = 0; i < 100; i++) {
      manySurebets[`surebet_${i}`] = [
        {
          house: 'Bet365',
          chance: 2.10 + (i * 0.01),
          market: 'Resultado Final',
          sport: 'Futebol',
          event: `Event ${i}`,
          profit: 15.50 + (i * 0.1),
          roi: 3.2 + (i * 0.01),
          isLive: false
        }
      ]
    }
    
    cy.mockAPI('GET', '/api/surebets', {
      statusCode: 200,
      body: manySurebets
    })
    
    cy.loginAsVIP()
    
    const startTime = Date.now()
    cy.visit('/')
    cy.waitForSurebets()
    
    cy.then(() => {
      const endTime = Date.now()
      const loadTime = endTime - startTime
      expect(loadTime).to.be.lessThan(3000) // Máximo 3 segundos
    })
    
    // Verificar se todos os cards foram renderizados
    cy.get('[data-testid="surebet-card"]').should('have.length', 100)
  })

  it('deve filtrar rapidamente com muitos dados', () => {
    // Mockar muitos surebets
    const manySurebets = {}
    for (let i = 0; i < 50; i++) {
      manySurebets[`surebet_${i}`] = [
        {
          house: i % 2 === 0 ? 'Bet365' : 'William Hill',
          chance: 2.10 + (i * 0.01),
          market: 'Resultado Final',
          sport: i % 3 === 0 ? 'Futebol' : 'Basquete',
          event: `Event ${i}`,
          profit: 15.50 + (i * 0.1),
          roi: 3.2 + (i * 0.01),
          isLive: false
        }
      ]
    }
    
    cy.mockAPI('GET', '/api/surebets', {
      statusCode: 200,
      body: manySurebets
    })
    
    cy.loginAsVIP()
    cy.visit('/')
    cy.waitForSurebets()
    
    // Testar filtro por esporte
    const startTime = Date.now()
    
    cy.get('[data-testid="filter-toggle"]').click()
    cy.get('[data-testid="sport-filter"]').click()
    cy.get('[data-testid="sport-option-futebol"]').click()
    cy.get('[data-testid="apply-filters"]').click()
    
    cy.then(() => {
      const endTime = Date.now()
      const filterTime = endTime - startTime
      expect(filterTime).to.be.lessThan(1000) // Máximo 1 segundo
    })
    
    // Verificar se apenas surebets de futebol são exibidos
    cy.get('[data-testid="surebet-card"]').each(($card) => {
      cy.wrap($card).shouldContainText('[data-testid="sport-badge"]', 'Futebol')
    })
  })

  it('deve atualizar dados em tempo real sem travar', () => {
    let messageCount = 0
    
    // Mockar WebSocket com atualizações frequentes
    cy.window().then((win) => {
      const originalWebSocket = win.WebSocket
      win.WebSocket = cy.stub().callsFake(() => {
        const mockWS = {
          onopen: null,
          onmessage: null,
          onclose: null,
          onerror: null,
          send: cy.stub(),
          close: cy.stub()
        }
        
        // Simular conexão
        setTimeout(() => {
          if (mockWS.onopen) mockWS.onopen()
        }, 100)
        
        // Simular mensagens frequentes
        const interval = setInterval(() => {
          if (mockWS.onmessage && messageCount < 10) {
            const newSurebet = {
              type: 'new_surebet',
              surebets: {
                [`surebet_${messageCount}`]: [
                  {
                    house: 'Bet365',
                    chance: 2.10 + (messageCount * 0.1),
                    market: 'Resultado Final',
                    sport: 'Futebol',
                    event: `Event ${messageCount}`,
                    profit: 15.50 + (messageCount * 2),
                    roi: 3.2 + (messageCount * 0.1),
                    isLive: false
                  }
                ]
              }
            }
            
            mockWS.onmessage({
              data: JSON.stringify(newSurebet)
            })
            
            messageCount++
          } else {
            clearInterval(interval)
          }
        }, 500)
        
        return mockWS
      })
    })
    
    cy.loginAsVIP()
    cy.visit('/')
    
    // Aguardar algumas atualizações
    cy.wait(3000)
    
    // Verificar se a UI não travou
    cy.get('[data-testid="surebets-page"]').should('be.visible')
    cy.get('[data-testid="surebet-card"]').should('be.visible')
    
    // Verificar se novos dados foram adicionados
    cy.get('[data-testid="surebet-card"]').should('have.length.at.least', 1)
  })

  it('deve manter estado consistente entre filtros', () => {
    // Mockar dados com diferentes características
    const diverseSurebets = {
      'surebet_1': [{
        house: 'Bet365',
        chance: 2.10,
        market: 'Resultado Final',
        sport: 'Futebol',
        event: 'Brasil vs Argentina',
        profit: 15.50,
        roi: 3.2,
        isLive: false
      }],
      'surebet_2': [{
        house: 'William Hill',
        chance: 1.85,
        market: 'Over/Under 2.5',
        sport: 'Basquete',
        event: 'Lakers vs Warriors',
        profit: 8.20,
        roi: 2.1,
        isLive: true
      }],
      'surebet_3': [{
        house: 'Betfair',
        chance: 3.40,
        market: 'Dupla Chance',
        sport: 'Futebol',
        event: 'Real Madrid vs Barcelona',
        profit: 25.30,
        roi: 4.5,
        isLive: false
      }]
    }
    
    cy.mockAPI('GET', '/api/surebets', {
      statusCode: 200,
      body: diverseSurebets
    })
    
    cy.loginAsVIP()
    cy.visit('/')
    cy.waitForSurebets()
    
    // Aplicar filtro por esporte
    cy.get('[data-testid="filter-toggle"]').click()
    cy.get('[data-testid="sport-filter"]').click()
    cy.get('[data-testid="sport-option-futebol"]').click()
    cy.get('[data-testid="apply-filters"]').click()
    
    // Verificar contagem
    cy.get('[data-testid="total-count"]').shouldContainText('2')
    
    // Aplicar filtro por casa
    cy.get('[data-testid="house-filter"]').click()
    cy.get('[data-testid="house-option-bet365"]').click()
    cy.get('[data-testid="apply-filters"]').click()
    
    // Verificar contagem atualizada
    cy.get('[data-testid="total-count"]').shouldContainText('1')
    
    // Limpar filtros
    cy.get('[data-testid="clear-filters"]').click()
    
    // Verificar contagem original
    cy.get('[data-testid="total-count"]').shouldContainText('3')
  })

  it('deve lidar com falhas de rede graciosamente', () => {
    // Mockar falha intermitente
    let callCount = 0
    cy.intercept('GET', '/api/surebets', (req) => {
      callCount++
      if (callCount <= 2) {
        req.reply({
          statusCode: 500,
          body: { error: 'Servidor indisponível' }
        })
      } else {
        req.reply({
          statusCode: 200,
          body: {
            'surebet_001': [{
              house: 'Bet365',
              chance: 2.10,
              market: 'Resultado Final',
              sport: 'Futebol',
              event: 'Brasil vs Argentina',
              profit: 15.50,
              roi: 3.2,
              isLive: false
            }]
          }
        })
      }
    }).as('apiCall')
    
    cy.loginAsVIP()
    cy.visit('/')
    
    // Verificar se erro é exibido
    cy.get('[data-testid="error-message"]').should('be.visible')
    
    // Aguardar retry automático
    cy.wait('@apiCall')
    cy.wait('@apiCall')
    cy.wait('@apiCall')
    
    // Verificar se dados foram carregados após retry
    cy.get('[data-testid="surebet-card"]').should('be.visible')
  })
})
