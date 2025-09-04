<template>
  <RouteGuard>
    <div class="guia-apostas-container">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Conteúdo Principal -->
      <main class="main-content">
        <!-- Header -->
        <Header />
        
        <div class="guia-content">
          <!-- Hero Section -->
          <div class="hero-section">
            <div class="hero-content">
              <div class="hero-badge">
                <i class="bi bi-shield-check"></i>
                <span>Guia Profissional</span>
              </div>
              <h1 class="hero-title">
                Estratégias de Apostas
                <span class="gradient-text">Inteligentes</span>
              </h1>
              <p class="hero-description">
                Domine as técnicas avançadas para apostar de forma segura, 
                diversificada e profissional. Maximize seus lucros com estratégias comprovadas.
              </p>
              <div class="hero-stats">
                <div class="stat-item">
                  <div class="stat-number">7</div>
                  <div class="stat-label">Categorias</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">21</div>
                  <div class="stat-label">Estratégias</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">100%</div>
                  <div class="stat-label">Seguro</div>
                </div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="floating-card">
                <div class="card-header">
                  <div class="card-icon">
                    <i class="bi bi-graph-up-arrow"></i>
                  </div>
                  <div class="card-title">Lucro Garantido</div>
                </div>
                <div class="card-value">+4.2%</div>
                <div class="card-subtitle">Margem Média</div>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="navigation-tabs">
            <button 
              v-for="(section, index) in sections" 
              :key="index"
              :class="['tab-button', { active: activeSection === index }]"
              @click="setActiveSection(index)"
            >
              <i :class="section.icon"></i>
              <span>{{ section.title }}</span>
            </button>
          </div>

          <!-- Content Sections -->
          <div class="content-sections">
            <!-- Valores Section -->
            <div v-show="activeSection === 0" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-currency-dollar"></i>
                </div>
                <div class="section-info">
                  <h2>Valores Redondos e Variados</h2>
                  <p>Estratégias para diversificar valores e evitar padrões detectáveis</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-graph-up"></i>
                  </div>
                  <h3>Diversificação Inteligente</h3>
                  <p>Use valores diferentes para cada aposta: R$ 10, R$ 25, R$ 50, R$ 100, R$ 200. Evite sempre o mesmo valor.</p>
                  <div class="card-tags">
                    <span class="tag">Valores</span>
                    <span class="tag">Diversificação</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-calculator"></i>
                  </div>
                  <h3>Valores Redondos</h3>
                  <p>Prefira valores redondos como R$ 20, R$ 50, R$ 100. Evite valores específicos como R$ 23,47 ou R$ 87,32.</p>
                  <div class="card-tags">
                    <span class="tag">Redondos</span>
                    <span class="tag">Natural</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-shuffle"></i>
                  </div>
                  <h3>Variação Constante</h3>
                  <p>Alterne entre valores baixos, médios e altos. Nunca use o mesmo padrão de valores consecutivamente.</p>
                  <div class="card-tags">
                    <span class="tag">Aleatório</span>
                    <span class="tag">Padrão</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Porcentagens Section -->
            <div v-show="activeSection === 1" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-percent"></i>
                </div>
                <div class="section-info">
                  <h2>Porcentagens de Lucro Diversificadas</h2>
                  <p>Como variar margens de lucro para parecer natural</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-bar-chart"></i>
                  </div>
                  <h3>Variação de Margens</h3>
                  <p>Alterne entre margens de 2%, 3%, 4%, 5% e 6%. Evite sempre a mesma porcentagem de lucro.</p>
                  <div class="card-tags">
                    <span class="tag">2-6%</span>
                    <span class="tag">Margens</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-arrow-up-right"></i>
                  </div>
                  <h3>Margens Realistas</h3>
                  <p>Use margens entre 2% e 6%. Margens muito altas (acima de 8%) podem chamar atenção.</p>
                  <div class="card-tags">
                    <span class="tag">Realista</span>
                    <span class="tag">Seguro</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-shuffle"></i>
                  </div>
                  <h3>Padrão Aleatório</h3>
                  <p>Não siga uma sequência lógica. Misture margens baixas e altas de forma natural.</p>
                  <div class="card-tags">
                    <span class="tag">Aleatório</span>
                    <span class="tag">Natural</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mercados Section -->
            <div v-show="activeSection === 2" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-trophy"></i>
                </div>
                <div class="section-info">
                  <h2>Diversificação de Mercados</h2>
                  <p>Estratégias para apostar em diferentes mercados e horários</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-globe"></i>
                  </div>
                  <h3>Mercados Populares</h3>
                  <p>Foque em mercados conhecidos: Futebol, Basquete, Tênis, Vôlei. Evite esportes muito específicos.</p>
                  <div class="card-tags">
                    <span class="tag">Popular</span>
                    <span class="tag">Conhecido</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-calendar"></i>
                  </div>
                  <h3>Horários Diversos</h3>
                  <p>Aposte em diferentes horários: manhã, tarde, noite. Simule um apostador que aposta quando pode.</p>
                  <div class="card-tags">
                    <span class="tag">Horários</span>
                    <span class="tag">Variado</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-list-check"></i>
                  </div>
                  <h3>Tipos de Aposta</h3>
                  <p>Varie entre: Resultado Final, Over/Under, Handicap, Ambas Marcam. Não use sempre o mesmo tipo.</p>
                  <div class="card-tags">
                    <span class="tag">Tipos</span>
                    <span class="tag">Diverso</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Segurança Section -->
            <div v-show="activeSection === 3" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-shield-lock"></i>
                </div>
                <div class="section-info">
                  <h2>Segurança e Privacidade</h2>
                  <p>Proteção máxima para suas contas e identidade</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card critical">
                  <div class="card-icon">
                    <i class="bi bi-wifi-off"></i>
                  </div>
                  <h3>IPs e Dispositivos</h3>
                  <p>NUNCA use várias contas no mesmo IP ou dispositivo. Use VPNs diferentes para cada conta.</p>
                  <div class="card-tags">
                    <span class="tag critical">CRÍTICO</span>
                    <span class="tag">VPN</span>
                  </div>
                </div>
                <div class="strategy-card critical">
                  <div class="card-icon">
                    <i class="bi bi-person-check"></i>
                  </div>
                  <h3>Identidades Separadas</h3>
                  <p>Cada conta deve ter: nome diferente, email único, telefone diferente, documentos distintos.</p>
                  <div class="card-tags">
                    <span class="tag critical">ESSENCIAL</span>
                    <span class="tag">Identidade</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-browser-chrome"></i>
                  </div>
                  <h3>Navegadores Diferentes</h3>
                  <p>Use navegadores diferentes para cada conta: Chrome, Firefox, Safari, Edge. Limpe cookies sempre.</p>
                  <div class="card-tags">
                    <span class="tag">Navegador</span>
                    <span class="tag">Cookies</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Movimentação Section -->
            <div v-show="activeSection === 4" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-arrow-repeat"></i>
                </div>
                <div class="section-info">
                  <h2>Movimentação Gradual de Saldos</h2>
                  <p>Como gerenciar depósitos e saques de forma natural</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-graph-up-arrow"></i>
                  </div>
                  <h3>Crescimento Natural</h3>
                  <p>Comece com depósitos pequenos (R$ 50-100) e aumente gradualmente. Simule um apostador que ganha confiança.</p>
                  <div class="card-tags">
                    <span class="tag">Crescimento</span>
                    <span class="tag">Natural</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-clock"></i>
                  </div>
                  <h3>Intervalos de Tempo</h3>
                  <p>Faça depósitos com intervalos de 2-7 dias. Não deposite sempre no mesmo dia da semana.</p>
                  <div class="card-tags">
                    <span class="tag">Intervalos</span>
                    <span class="tag">Tempo</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-cash-coin"></i>
                  </div>
                  <h3>Valores Variados</h3>
                  <p>Varie os valores dos depósitos: R$ 50, R$ 100, R$ 200, R$ 500. Evite sempre o mesmo valor.</p>
                  <div class="card-tags">
                    <span class="tag">Valores</span>
                    <span class="tag">Variado</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comportamento Section -->
            <div v-show="activeSection === 5" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-person-heart"></i>
                </div>
                <div class="section-info">
                  <h2>Simulação de Apostador Casual</h2>
                  <p>Como se comportar como um apostador comum e natural</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-calendar-week"></i>
                  </div>
                  <h3>Frequência Natural</h3>
                  <p>Aposte 3-5 vezes por semana, não todos os dias. Simule alguém que aposta quando tem tempo.</p>
                  <div class="card-tags">
                    <span class="tag">Frequência</span>
                    <span class="tag">Natural</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-emoji-smile"></i>
                  </div>
                  <h3>Comportamento Casual</h3>
                  <p>Faça algumas apostas "perdidas" ocasionalmente. Um apostador real não ganha sempre.</p>
                  <div class="card-tags">
                    <span class="tag">Casual</span>
                    <span class="tag">Realista</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-trophy"></i>
                  </div>
                  <h3>Ligas Conhecidas</h3>
                  <p>Foque em ligas populares: Brasileirão, Premier League, Champions League, NBA, NFL.</p>
                  <div class="card-tags">
                    <span class="tag">Ligas</span>
                    <span class="tag">Popular</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dicas Extras Section -->
            <div v-show="activeSection === 6" class="section-content">
              <div class="section-header">
                <div class="section-icon">
                  <i class="bi bi-lightbulb"></i>
                </div>
                <div class="section-info">
                  <h2>Dicas Extras Importantes</h2>
                  <p>Estratégias avançadas e dicas finais para sucesso</p>
                </div>
              </div>
              <div class="cards-grid">
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                  <h3>Evite Padrões</h3>
                  <p>Nunca aposte sempre no mesmo horário, mesmo valor, mesma liga ou mesmo tipo de aposta.</p>
                  <div class="card-tags">
                    <span class="tag">Padrões</span>
                    <span class="tag">Evitar</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-eye-slash"></i>
                  </div>
                  <h3>Mantenha Discrição</h3>
                  <p>Não comente sobre suas apostas em redes sociais ou com outras pessoas. Mantenha sigilo total.</p>
                  <div class="card-tags">
                    <span class="tag">Discrição</span>
                    <span class="tag">Sigilo</span>
                  </div>
                </div>
                <div class="strategy-card">
                  <div class="card-icon">
                    <i class="bi bi-arrow-clockwise"></i>
                  </div>
                  <h3>Rotacione Contas</h3>
                  <p>Use diferentes contas em diferentes casas. Não concentre todas as apostas em uma única casa.</p>
                  <div class="card-tags">
                    <span class="tag">Rotação</span>
                    <span class="tag">Contas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Warning Section -->
          <div class="warning-section">
            <div class="warning-card">
              <div class="warning-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="warning-content">
                <h3>⚠️ Aviso Importante</h3>
                <p>
                  Este guia é para fins educacionais. Sempre aposte com responsabilidade e dentro dos limites legais. 
                  Lembre-se de que apostas envolvem riscos e você pode perder dinheiro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </RouteGuard>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import RouteGuard from '../components/RouteGuard.vue'

export default {
  name: 'GuiaApostasView',
  components: {
    Sidebar,
    Header,
    RouteGuard
  },
  data() {
    return {
      activeSection: 0,
      sections: [
        {
          title: 'Valores',
          icon: 'bi bi-currency-dollar'
        },
        {
          title: 'Porcentagens',
          icon: 'bi bi-percent'
        },
        {
          title: 'Mercados',
          icon: 'bi bi-trophy'
        },
        {
          title: 'Segurança',
          icon: 'bi bi-shield-lock'
        },
        {
          title: 'Movimentação',
          icon: 'bi bi-arrow-repeat'
        },
        {
          title: 'Comportamento',
          icon: 'bi bi-person-heart'
        },
        {
          title: 'Dicas Extras',
          icon: 'bi bi-lightbulb'
        }
      ]
    }
  },
  methods: {
    setActiveSection(index) {
      this.activeSection = index
    }
  },
  mounted() {
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<style lang="scss" scoped>
.guia-apostas-container {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  max-width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  padding: 0;
}

.guia-content {
  width: 100%;
  padding: 20px;
}

// Hero Section
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-gradient-accent);
    border-radius: 20px;
  }
  
  .hero-content {
    flex: 1;
    z-index: 2;
    position: relative;
    
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-accent);
      border: 1px solid var(--border-accent);
      border-radius: 50px;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-accent);
      margin-bottom: 20px;
      
      i {
        font-size: 1rem;
      }
    }
    
    .hero-title {
      font-size: 2.8rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 15px 0;
      color: var(--text-primary);
      
      .gradient-text {
        background: var(--bg-gradient-primary-button);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .hero-description {
      font-size: 1.2rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 40px 0;
      max-width: 600px;
    }
    
    .hero-stats {
      display: flex;
      gap: 40px;
      
      .stat-item {
        text-align: center;
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--accent-primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-top: 5px;
        }
      }
    }
  }
  
  .hero-visual {
    flex: 0 0 250px;
    z-index: 2;
    position: relative;
    
    .floating-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-card);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      box-shadow: var(--shadow-card);
      animation: float 6s ease-in-out infinite;
      
      .card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
        
        .card-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-gradient-primary-button);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-button-primary);
          font-size: 1.2rem;
        }
        
        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
      
      .card-value {
        font-size: 2.2rem;
        font-weight: 700;
        color: var(--text-success);
        line-height: 1;
        margin-bottom: 8px;
      }
      
      .card-subtitle {
        font-size: 0.9rem;
        color: var(--text-tertiary);
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

// Navigation Tabs
.navigation-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 30px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 6px;
  
  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    i {
      font-size: 1rem;
    }
    
    &:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }
    
    &.active {
      background: var(--bg-gradient-primary-button);
      color: var(--text-button-primary);
      box-shadow: var(--shadow-card);
    }
  }
}

// Content Sections
.content-sections {
  margin-bottom: 60px;
}

.section-content {
  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 25px;
    padding: 20px;
    background: var(--bg-secondary);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    
    .section-icon {
      width: 50px;
      height: 50px;
      background: var(--bg-gradient-primary-button);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-button-primary);
      font-size: 1.3rem;
    }
    
    .section-info {
      flex: 1;
      
      h2 {
        font-size: 1.6rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 6px 0;
      }
      
      p {
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
}

.strategy-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--bg-gradient-primary-button);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-accent);
    
    &::before {
      opacity: 1;
    }
  }
  
  &.critical {
    border-color: var(--border-error);
    
    &::before {
      background: var(--bg-gradient-error);
    }
  }
  
  .card-icon {
    width: 45px;
    height: 45px;
    background: var(--bg-gradient-primary-button);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-button-primary);
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0 0 15px 0;
    font-size: 0.95rem;
  }
  
  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .tag {
      background: var(--bg-accent);
      border: 1px solid var(--border-accent);
      color: var(--text-accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      
      &.critical {
        background: var(--bg-error);
        border-color: var(--border-error);
        color: var(--text-error);
      }
    }
  }
}

// Warning Section
.warning-section {
  margin-top: 60px;
  
  .warning-card {
    background: var(--bg-gradient-error);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-error);
    border-radius: 20px;
    padding: 40px;
    display: flex;
    align-items: center;
    gap: 30px;
    box-shadow: var(--shadow-card);
    
    .warning-icon {
      flex-shrink: 0;
      font-size: 3rem;
      color: var(--text-error);
    }
    
    .warning-content {
      flex: 1;
      
      h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 15px 0;
      }
      
      p {
        font-size: 1.1rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

// Responsividade
@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    gap: 40px;
    
    .hero-visual {
      flex: none;
    }
  }
}

@media (max-width: 768px) {
  .guia-apostas-container {
    flex-direction: column;
  }
  
  .guia-content {
    padding: 15px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .hero-section {
    padding: 30px 15px;
    
    .hero-content {
      .hero-title {
        font-size: 2.2rem;
      }
      
      .hero-description {
        font-size: 1rem;
      }
      
      .hero-stats {
        justify-content: center;
        gap: 25px;
      }
    }
  }
  
  .navigation-tabs {
    flex-wrap: wrap;
    gap: 4px;
    
    .tab-button {
      flex: 1 1 calc(50% - 4px);
      min-width: 120px;
    }
  }
  
  .section-content {
    .section-header {
      flex-direction: column;
      text-align: center;
      gap: 15px;
      padding: 20px;
      
      .section-info h2 {
        font-size: 1.6rem;
      }
    }
    
    .cards-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
  
  .strategy-card {
    padding: 25px;
  }
  
  .warning-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 30px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    .hero-content {
      .hero-title {
        font-size: 2rem;
      }
      
      .hero-stats {
        flex-direction: column;
        gap: 20px;
      }
    }
  }
  
  .navigation-tabs {
    .tab-button {
      flex: 1 1 100%;
      span {
        display: none;
      }
    }
  }
  
  .section-content {
    .section-header {
      .section-info h2 {
        font-size: 1.4rem;
      }
    }
  }
}
</style>
