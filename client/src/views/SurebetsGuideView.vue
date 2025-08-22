<template>
  <div class="surebets-guide-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header -->
      <div class="guide-header">
        <h1 class="guide-title">
          <svg class="guide-icon" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
          Guia Completo de Surebets
        </h1>
        <p class="guide-subtitle">Aprenda tudo sobre arbitragem esportiva e como lucrar com segurança</p>
      </div>

      <!-- Navegação do Guia -->
      <nav class="guide-navigation">
        <a href="#o-que-e" class="nav-item active">O que é</a>
        <a href="#como-funciona" class="nav-item">Como Funciona</a>
        <a href="#tipos" class="nav-item">Tipos</a>
        <a href="#calculos" class="nav-item">Cálculos</a>
        <a href="#estrategias" class="nav-item">Estratégias</a>
        <a href="#riscos" class="nav-item">Riscos</a>
        <a href="#ferramentas" class="nav-item">Ferramentas</a>
      </nav>

             <!-- Seção: O que é Surebet -->
       <section id="o-que-e" class="guide-section">
         <h2 class="section-title">🎯 O que é uma Surebet?</h2>
         <div class="content-card">
           <p class="section-text">
             Uma <strong>surebet</strong> (ou arbitragem esportiva) é uma situação onde você pode apostar em todos os resultados possíveis de um evento esportivo e ainda assim ter lucro garantido, independentemente do resultado final.
           </p>
           
           <div class="example-box">
             <h4>📊 Exemplo Prático:</h4>
             <p>Imagine um jogo de futebol entre Time A vs Time B:</p>
             <ul>
               <li><strong>Time A ganha:</strong> Odds 2.50 (Casa 1)</li>
               <li><strong>Empate:</strong> Odds 3.20 (Casa 2)</li>
               <li><strong>Time B ganha:</strong> Odds 2.80 (Casa 3)</li>
             </ul>
             <p>Com as odds corretas e valores de apostas calculados, você pode lucrar independentemente do resultado!</p>
           </div>

           <div class="system-highlight">
             <h4>🚀 <strong>NOSSO SISTEMA AUTOMATIZADO</strong></h4>
             <p>O <strong>SureStake</strong> identifica, calcula e executa surebets automaticamente 24/7, eliminando a necessidade de monitoramento manual e cálculos complexos!</p>
             <ul>
               <li><strong>✅ Detecção Automática:</strong> Encontra oportunidades em tempo real</li>
               <li><strong>✅ Cálculos Precisos:</strong> Determina valores exatos para cada aposta</li>
               <li><strong>✅ Execução Rápida:</strong> Aproveita oportunidades antes que desapareçam</li>
               <li><strong>✅ Monitoramento 24/7:</strong> Nunca perde uma chance de lucro</li>
             </ul>
           </div>
         </div>
       </section>

      <!-- Seção: Como Funciona -->
      <section id="como-funciona" class="guide-section">
        <h2 class="section-title">⚙️ Como Funciona a Arbitragem?</h2>
        <div class="content-card">
          <h3>🔍 Princípio Básico</h3>
          <p>A arbitragem funciona explorando diferenças nas odds oferecidas por diferentes casas de apostas para o mesmo evento.</p>
          
          <div class="step-by-step">
            <h4>📋 Passo a Passo:</h4>
            <ol>
              <li><strong>Identificar:</strong> Encontrar eventos com odds que permitam arbitragem</li>
              <li><strong>Calcular:</strong> Determinar os valores exatos para cada aposta</li>
              <li><strong>Executar:</strong> Fazer as apostas simultaneamente</li>
              <li><strong>Lucrar:</strong> Garantir lucro independente do resultado</li>
            </ol>
          </div>

          <div class="warning-box">
            <h4>⚠️ Importante:</h4>
            <p>As surebets são oportunidades temporárias que podem desaparecer rapidamente. É essencial agir com velocidade e precisão.</p>
          </div>
        </div>
      </section>

             <!-- Seção: Tipos de Arbitragem -->
       <section id="tipos" class="guide-section">
         <h2 class="section-title">🏆 Tipos de Arbitragem Esportiva</h2>
         
         <!-- Surebet Clássica -->
         <div class="content-card">
           <h3>🎯 Surebet Clássica (2-Way) - <span class="our-specialty">Nossa Especialidade</span></h3>
           <p>Arbitragem entre dois resultados possíveis, como em apostas de futebol (casa/fora).</p>
           
           <div class="calculation-example">
             <h4>📐 Exemplo de Cálculo:</h4>
             <div class="math-formula">
               <p><strong>Fórmula:</strong> (1/odds1) + (1/odds2) &lt; 1</p>
               <p><strong>Exemplo:</strong> (1/2.00) + (1/2.00) = 0.5 + 0.5 = 1.0</p>
               <p>Se o resultado for &lt; 1, temos uma surebet!</p>
             </div>
           </div>

           <div class="specialty-highlight">
             <h4>⭐ <strong>Por que Focamos em 2-Way?</strong></h4>
             <ul>
               <li><strong>🔒 Menos Erros:</strong> Apenas 2 resultados para calcular, reduzindo margem de erro</li>
               <li><strong>⚡ Execução Mais Rápida:</strong> Menos apostas para fazer simultaneamente</li>
               <li><strong>💰 Maior Lucro:</strong> ROI geralmente mais alto que 3-way</li>
               <li><strong>🛡️ Mais Seguro:</strong> Menor chance de odds mudarem durante execução</li>
               <li><strong>🎯 Mais Oportunidades:</strong> 2-way aparecem com mais frequência</li>
             </ul>
           </div>
         </div>

        <!-- Surebet 3-Way -->
        <div class="content-card">
          <h3>🎲 Surebet 3-Way</h3>
          <p>Arbitragem entre três resultados possíveis, comum em futebol (casa/empate/fora).</p>
          
          <div class="calculation-example">
            <h4>📐 Fórmula:</h4>
            <div class="math-formula">
              <p><strong>(1/odds1) + (1/odds2) + (1/odds3) &lt; 1</strong></p>
              <p>Exemplo: (1/2.50) + (1/3.20) + (1/2.80) = 0.4 + 0.3125 + 0.357 = 1.069</p>
              <p>Neste caso, não é uma surebet (resultado > 1)</p>
            </div>
          </div>
        </div>

        <!-- Middle -->
        <div class="content-card">
          <h3>🎯 Middle (Meio)</h3>
          <p>Estratégia onde você aposta em linhas diferentes esperando que o resultado final fique "no meio".</p>
          
          <div class="example-box">
            <h4>📊 Exemplo:</h4>
            <p><strong>Casa 1:</strong> Over 2.5 gols a 1.90</p>
            <p><strong>Casa 2:</strong> Under 3.5 gols a 1.85</p>
            <p>Se o jogo terminar com exatamente 3 gols, você ganha em ambas as apostas!</p>
          </div>
        </div>

        <!-- Arbitragem de Handicap -->
        <div class="content-card">
          <h3>⚖️ Arbitragem de Handicap</h3>
          <p>Explorar diferenças em linhas de handicap entre casas de apostas.</p>
          
          <div class="example-box">
            <h4>📊 Exemplo:</h4>
            <p><strong>Casa 1:</strong> Time A -1.5 a 1.95</p>
            <p><strong>Casa 2:</strong> Time B +1.5 a 1.90</p>
            <p>Com valores calculados corretamente, você pode garantir lucro!</p>
          </div>
        </div>
      </section>

      <!-- Seção: Cálculos -->
      <section id="calculos" class="guide-section">
        <h2 class="section-title">🧮 Cálculos e Fórmulas</h2>
        
        <!-- Fórmula Básica -->
        <div class="content-card">
          <h3>📐 Fórmula Básica de Arbitragem</h3>
          <div class="math-formula">
            <p><strong>Verificação:</strong> Σ(1/odds) &lt; 1</p>
            <p><strong>Lucro:</strong> Lucro = (1 / Σ(1/odds)) - 1</p>
            <p><strong>Investimento Total:</strong> Valor que você precisa apostar</p>
          </div>
        </div>

        <!-- Cálculo de Valores -->
        <div class="content-card">
          <h3>💰 Como Calcular os Valores das Apostas</h3>
          
          <div class="calculation-example">
            <h4>📊 Exemplo Prático:</h4>
            <p><strong>Evento:</strong> Time A vs Time B</p>
            <p><strong>Odds:</strong> Time A (2.00) | Time B (2.00)</p>
            <p><strong>Investimento Total:</strong> R$ 1000</p>
            
            <div class="math-steps">
              <p><strong>Passo 1:</strong> Calcular proporções</p>
              <p>Proporção A = (1/2.00) / Σ(1/odds) = 0.5 / 1.0 = 0.5</p>
              <p>Proporção B = (1/2.00) / Σ(1/odds) = 0.5 / 1.0 = 0.5</p>
              
              <p><strong>Passo 2:</strong> Calcular valores</p>
              <p>Valor A = R$ 1000 × 0.5 = R$ 500</p>
              <p>Valor B = R$ 1000 × 0.5 = R$ 500</p>
              
              <p><strong>Passo 3:</strong> Verificar lucro</p>
              <p>Se Time A ganhar: R$ 500 × 2.00 = R$ 1000</p>
              <p>Se Time B ganhar: R$ 500 × 2.00 = R$ 1000</p>
              <p><strong>Lucro:</strong> R$ 0 (break-even neste caso)</p>
            </div>
          </div>
        </div>

        <!-- ROI e Lucro -->
        <div class="content-card">
          <h3>📈 ROI e Percentual de Lucro</h3>
          
          <div class="math-formula">
            <p><strong>ROI:</strong> (Lucro / Investimento Total) × 100</p>
            <p><strong>Exemplo:</strong> Se você investir R$ 1000 e lucrar R$ 50</p>
            <p><strong>ROI:</strong> (50 / 1000) × 100 = 5%</p>
          </div>
          
          <div class="info-box">
            <h4>💡 Dica:</h4>
            <p>Surebets típicas oferecem ROI entre 1% a 10%. Valores muito altos podem indicar erro nas odds ou risco.</p>
          </div>
        </div>
      </section>

      <!-- Seção: Estratégias -->
      <section id="estrategias" class="guide-section">
        <h2 class="section-title">🎯 Estratégias de Arbitragem</h2>
        
        <!-- Estratégia Conservadora -->
        <div class="content-card">
          <h3>🛡️ Estratégia Conservadora</h3>
          <p>Focar em surebets com ROI baixo mas seguro (1-3%).</p>
          
          <div class="strategy-benefits">
            <h4>✅ Vantagens:</h4>
            <ul>
              <li>Baixo risco</li>
              <li>Resultados consistentes</li>
              <li>Menor chance de erro</li>
              <li>Ideal para iniciantes</li>
            </ul>
          </div>
        </div>

        <!-- Estratégia Agressiva -->
        <div class="content-card">
          <h3>⚡ Estratégia Agressiva</h3>
          <p>Buscar surebets com ROI alto (5-15%) mas com mais risco.</p>
          
          <div class="strategy-benefits">
            <h4>⚠️ Considerações:</h4>
            <ul>
              <li>Maior lucro potencial</li>
              <li>Maior risco de erro</li>
              <li>Odds podem mudar rapidamente</li>
              <li>Requer experiência</li>
            </ul>
          </div>
        </div>

        <!-- Diversificação -->
        <div class="content-card">
          <h3>🌐 Estratégia de Diversificação</h3>
          <p>Distribuir apostas entre diferentes esportes, casas e tipos de arbitragem.</p>
          
          <div class="strategy-benefits">
            <h4>✅ Benefícios:</h4>
            <ul>
              <li>Reduz risco concentrado</li>
              <li>Mais oportunidades</li>
              <li>Estabilidade de resultados</li>
              <li>Melhor gestão de capital</li>
            </ul>
          </div>
        </div>
      </section>

             <!-- Seção: Riscos -->
       <section id="riscos" class="guide-section">
         <h2 class="section-title">⚠️ Riscos e Desafios</h2>
         
         <!-- Riscos Principais -->
         <div class="content-card">
           <h3>🚨 Principais Riscos</h3>
           
           <div class="risk-item">
             <h4>⏰ Timing</h4>
             <p>Odds podem mudar rapidamente, transformando uma surebet em perda.</p>
           </div>
           
           <div class="risk-item">
             <h4>💰 Limites de Aposta</h4>
             <p>Casas podem limitar valores ou cancelar apostas suspeitas.</p>
           </div>
           
           <div class="risk-item">
             <h4>🔒 Contas Bloqueadas</h4>
             <p>Casas podem bloquear contas que fazem muitas arbitragens.</p>
           </div>
           
           <div class="risk-item">
             <h4>📊 Erros de Cálculo</h4>
             <p>Um pequeno erro pode transformar lucro em prejuízo.</p>
           </div>
         </div>

         <!-- Como Evitar Limitações -->
         <div class="content-card">
           <h3>🛡️ Como Evitar Limitações nas Casas de Apostas</h3>
           
           <div class="strategy-benefits">
             <h4>✅ Estratégias Anti-Detecção:</h4>
             <ul>
               <li><strong>🎭 Comportamento Natural:</strong> Faça apostas normais ocasionalmente</li>
               <li><strong>💰 Valores Variados:</strong> Não use sempre os mesmos valores</li>
               <li><strong>⏰ Timing Aleatório:</strong> Evite padrões de horário</li>
               <li><strong>🎯 Diversificação:</strong> Use múltiplas casas de apostas</li>
               <li><strong>📱 Múltiplas Contas:</strong> Tenha contas em diferentes casas</li>
               <li><strong>🌍 IPs Diferentes:</strong> Use VPNs e diferentes dispositivos</li>
               <li><strong>💳 Métodos de Pagamento:</strong> Varie formas de depósito/saque</li>
             </ul>
           </div>

           <div class="warning-box">
             <h4>⚠️ <strong>IMPORTANTE:</strong></h4>
             <p>Nossa experiência mostra que casas de apostas são mais tolerantes com usuários que:</p>
             <ul>
               <li>Fazem apostas normais ocasionalmente</li>
               <li>Não fazem apenas arbitragens</li>
               <li>Mantêm um perfil de apostador "normal"</li>
               <li>Usam múltiplas casas de forma inteligente</li>
             </ul>
           </div>
         </div>

        <!-- Como Minimizar Riscos -->
        <div class="content-card">
          <h3>🛡️ Como Minimizar Riscos</h3>
          
          <div class="strategy-benefits">
            <h4>✅ Boas Práticas:</h4>
            <ul>
              <li>Use calculadoras automáticas</li>
              <li>Verifique odds múltiplas vezes</li>
              <li>Comece com valores pequenos</li>
              <li>Tenha múltiplas contas</li>
              <li>Monitore mudanças de odds</li>
              <li>Use ferramentas de alerta</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Seção: Ferramentas -->
      <section id="ferramentas" class="guide-section">
        <h2 class="section-title">🛠️ Ferramentas e Recursos</h2>
        
                 <!-- Calculadoras -->
         <div class="content-card">
           <h3>🧮 Calculadoras de Arbitragem</h3>
           <p>Use calculadoras automáticas para evitar erros e otimizar resultados.</p>
           
           <div class="tool-features">
             <h4>🔧 Funcionalidades Essenciais:</h4>
             <ul>
               <li>Cálculo automático de valores</li>
               <li>Verificação de ROI</li>
               <li>Alertas de oportunidades</li>
               <li>Histórico de arbitragens</li>
               <li>Análise de performance</li>
             </ul>
           </div>
         </div>

         <!-- Nosso Sistema Automatizado -->
         <div class="content-card">
           <h3>🤖 <strong>NOSSO SISTEMA AUTOMATIZADO</strong></h3>
           <p>O <strong>SureStake</strong> é a ferramenta mais avançada do mercado, desenvolvida com anos de experiência em arbitragem esportiva.</p>
           
           <div class="tool-features">
             <h4>🚀 <strong>Vantagens Exclusivas:</strong></h4>
             <ul>
               <li><strong>⚡ Velocidade Suprema:</strong> Executa em milissegundos, antes que odds mudem</li>
               <li><strong>🎯 Precisão Matemática:</strong> Cálculos 100% precisos, sem margem de erro</li>
               <li><strong>🌍 Cobertura Global:</strong> Monitora centenas de casas simultaneamente</li>
               <li><strong>📊 Análise Inteligente:</strong> IA que aprende e melhora com o tempo</li>
               <li><strong>🛡️ Segurança Total:</strong> Proteção contra detecção e limitações</li>
               <li><strong>💰 ROI Otimizado:</strong> Sempre escolhe as melhores oportunidades</li>
               <li><strong>📱 Acesso 24/7:</strong> Funciona em qualquer dispositivo, a qualquer hora</li>
             </ul>
           </div>

           <div class="experience-highlight">
             <h4>🏆 <strong>Nossa Experiência:</strong></h4>
             <p>Com <strong>anos de experiência</strong> no mercado, desenvolvemos estratégias que:</p>
             <ul>
               <li><strong>✅ Reduzem riscos</strong> de contas bloqueadas</li>
               <li><strong>✅ Maximizam lucros</strong> com arbitragem 2-way</li>
               <li><strong>✅ Evitam detecção</strong> por casas de apostas</li>
               <li><strong>✅ Garantem consistência</strong> nos resultados</li>
             </ul>
           </div>
         </div>

        <!-- Software de Monitoramento -->
        <div class="content-card">
          <h3>📊 Software de Monitoramento</h3>
          <p>Ferramentas que monitoram odds em tempo real e alertam sobre oportunidades.</p>
          
          <div class="tool-features">
            <h4>⚡ Recursos Importantes:</h4>
            <ul>
              <li>Monitoramento 24/7</li>
              <li>Alertas instantâneos</li>
              <li>Comparação de casas</li>
              <li>Análise de tendências</li>
              <li>Relatórios detalhados</li>
            </ul>
          </div>
        </div>

        <!-- Gestão de Capital -->
        <div class="content-card">
          <h3>💰 Gestão de Capital</h3>
          <p>Estratégias para gerenciar seu dinheiro de forma eficiente.</p>
          
          <div class="tool-features">
            <h4>📈 Princípios Fundamentais:</h4>
            <ul>
              <li>Nunca aposte mais de 5% do capital</li>
              <li>Mantenha reserva de emergência</li>
              <li>Registre todas as operações</li>
              <li>Analise performance regularmente</li>
              <li>Ajuste estratégia conforme resultados</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Seção: FAQ -->
      <section class="guide-section">
        <h2 class="section-title">❓ Perguntas Frequentes</h2>
        
        <div class="faq-container">
          <div class="faq-item">
            <h4>🤔 Surebets são legais?</h4>
            <p>Sim, arbitragem esportiva é legal na maioria dos países. É uma estratégia matemática válida.</p>
          </div>
          
          <div class="faq-item">
            <h4>💰 Quanto posso lucrar?</h4>
            <p>Lucros típicos variam de 1% a 10% por operação. Consistência é mais importante que valores altos.</p>
          </div>
          
          <div class="faq-item">
            <h4>⏰ Quanto tempo leva para aprender?</h4>
            <p>Com estudo dedicado, você pode começar em 2-4 semanas. Experiência se desenvolve com o tempo.</p>
          </div>
          
          <div class="faq-item">
            <h4>🏦 Preciso de muito capital?</h4>
            <p>Pode começar com R$ 100-500. O importante é a gestão de risco, não o valor inicial.</p>
          </div>
          
          <div class="faq-item">
            <h4>🎯 Quais esportes são melhores?</h4>
            <p>Futebol, tênis e basquete oferecem mais oportunidades devido ao volume de apostas.</p>
          </div>
        </div>
      </section>

             <!-- Call to Action -->
       <section class="guide-section">
         <div class="cta-card">
           <h3>🚀 <strong>Pronto para Lucrar com Nosso Sistema Automatizado?</strong></h3>
           <p>Agora que você entende como funcionam as surebets, deixe nosso <strong>sistema inteligente</strong> fazer todo o trabalho pesado por você!</p>
           
           <div class="system-benefits">
             <h4>🎯 <strong>Por que Escolher o SureStake?</strong></h4>
             <ul>
               <li><strong>🤖 100% Automatizado:</strong> Você só precisa configurar e lucrar</li>
               <li><strong>⚡ Velocidade de Execução:</strong> Aproveita oportunidades em milissegundos</li>
               <li><strong>🎯 Foco em 2-Way:</strong> Menos erros, mais lucros consistentes</li>
               <li><strong>🛡️ Proteção Anti-Detecção:</strong> Nossa experiência protege suas contas</li>
               <li><strong>📊 Resultados Comprovados:</strong> Milhares de usuários já lucrando</li>
             </ul>
           </div>

           <div class="cta-buttons">
             <router-link to="/surebets" class="cta-btn primary">🚀 Começar a Lucrar</router-link>
             <router-link to="/ranking" class="cta-btn secondary">📊 Ver Ranking</router-link>
           </div>
         </div>
       </section>

      <!-- Espaçamento final -->
      <div class="scroll-spacer"></div>
    </main>

    <!-- Modal do Glossário -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'

export default {
  name: 'SurebetsGuideView',
  components: {
    Sidebar,
    GlossaryModal
  },
  
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false
    }
  },
  
  computed: {
    ...mapGetters([
      'isAdmin',
      'userCredits',
      'canUseSystem'
    ])
  },
  
  mounted() {
    // Smooth scroll para navegação
    this.setupSmoothScroll()
    
    // Highlight da navegação ativa
    this.setupActiveNavigation()
  },
  
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },
    
        closeGlossary() {
      this.showGlossaryModal = false
    },
    
    setupSmoothScroll() {
      // Smooth scroll para links internos
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault()
          const target = document.querySelector(this.getAttribute('href'))
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          }
        })
      })
    },
    
    setupActiveNavigation() {
      // Highlight da navegação ativa baseado no scroll
      window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.guide-section')
        const navItems = document.querySelectorAll('.nav-item')
        
        let current = ''
        sections.forEach(section => {
          const sectionTop = section.offsetTop
          const sectionHeight = section.clientHeight
          if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id')
          }
        })
        
        navItems.forEach(item => {
          item.classList.remove('active')
          if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active')
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.surebets-guide-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
  width: 100%;
  align-items: stretch;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: auto;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 200px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  height: 100vh;
}

/* Scrollbar personalizada */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.scroll-spacer {
  height: 200px;
  flex-shrink: 0;
  min-height: 200px;
  margin-bottom: 50px;
}

/* Header */
.guide-header {
  text-align: center;
  margin-bottom: 32px;
}

.guide-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.guide-icon {
  width: 36px;
  height: 36px;
  color: #00ff88;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

.guide-subtitle {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
}

/* Navegação */
.guide-navigation {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 16px;
  background: rgba(42, 42, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  transform: translateY(-2px);
}

.nav-item.active {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  border-color: #00ff88;
  font-weight: 600;
}

/* Seções */
.guide-section {
  margin-bottom: 40px;
}

.section-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 255, 136, 0.3);
}

.content-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-2px);
}

.content-card h3 {
  color: #00ff88;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.content-card h4 {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.section-text {
  color: #cccccc;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
}

 /* Boxes especiais */
 .example-box {
   background: rgba(0, 255, 136, 0.1);
   border: 1px solid rgba(0, 255, 136, 0.3);
   border-radius: 8px;
   padding: 16px;
   margin: 16px 0;
 }

 .system-highlight {
   background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 106, 0.15));
   border: 2px solid rgba(0, 255, 136, 0.4);
   border-radius: 12px;
   padding: 20px;
   margin: 20px 0;
   position: relative;
   overflow: hidden;
 }

 .system-highlight::before {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   height: 3px;
   background: linear-gradient(90deg, #00ff88, #00cc6a, #00ff88);
   animation: shimmer 2s infinite;
 }

 @keyframes shimmer {
   0% { transform: translateX(-100%); }
   100% { transform: translateX(100%); }
 }

 .specialty-highlight {
   background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
   border: 2px solid rgba(255, 215, 0, 0.4);
   border-radius: 12px;
   padding: 20px;
   margin: 20px 0;
 }

 .experience-highlight {
   background: linear-gradient(135deg, rgba(13, 202, 240, 0.1), rgba(0, 123, 255, 0.1));
   border: 2px solid rgba(13, 202, 240, 0.4);
   border-radius: 12px;
   padding: 20px;
   margin: 20px 0;
 }

 .our-specialty {
   background: linear-gradient(135deg, #00ff88, #00cc6a);
   color: #1a1a1a;
   padding: 4px 12px;
   border-radius: 20px;
   font-size: 14px;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.5px;
   box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
 }

.warning-box {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.info-box {
  background: rgba(13, 202, 240, 0.1);
  border: 1px solid rgba(13, 202, 240, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

/* Listas */
.content-card ul, .content-card ol {
  color: #cccccc;
  padding-left: 20px;
  margin: 12px 0;
}

.content-card li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.content-card strong {
  color: #ffffff;
}

/* Fórmulas matemáticas */
.math-formula {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-family: 'Courier New', monospace;
}

.math-formula p {
  margin: 8px 0;
  color: #00ff88;
}

.math-steps {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.math-steps p {
  margin: 6px 0;
  color: #cccccc;
}

/* Passo a passo */
.step-by-step {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.step-by-step ol {
  counter-reset: step-counter;
  list-style: none;
  padding: 0;
}

.step-by-step li {
  counter-increment: step-counter;
  margin-bottom: 12px;
  padding-left: 40px;
  position: relative;
}

.step-by-step li::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

/* Estratégias */
.strategy-benefits ul {
  list-style: none;
  padding: 0;
}

.strategy-benefits li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 24px;
}

.strategy-benefits li::before {
  content: '✅';
  position: absolute;
  left: 0;
}

.strategy-benefits li:last-child {
  border-bottom: none;
}

/* Riscos */
.risk-item {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.risk-item h4 {
  color: #ff4444;
  margin: 0 0 8px 0;
}

/* Ferramentas */
.tool-features ul {
  list-style: none;
  padding: 0;
}

.tool-features li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 24px;
}

.tool-features li::before {
  content: '🔧';
  position: absolute;
  left: 0;
}

.tool-features li:last-child {
  border-bottom: none;
}

/* FAQ */
.faq-container {
  display: grid;
  gap: 16px;
}

.faq-item {
  background: rgba(42, 42, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.faq-item h4 {
  color: #00ff88;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.faq-item p {
  color: #cccccc;
  margin: 0;
  line-height: 1.5;
}

/* Call to Action */
.cta-card {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 106, 0.1));
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin: 40px 0;
}

.cta-card h3 {
  color: #00ff88;
  font-size: 24px;
  margin: 0 0 16px 0;
}

 .cta-card p {
   color: #cccccc;
   font-size: 16px;
   margin: 0 0 24px 0;
   line-height: 1.6;
 }

 .system-benefits {
   background: rgba(0, 0, 0, 0.2);
   border-radius: 12px;
   padding: 20px;
   margin: 20px 0;
 }

 .system-benefits h4 {
   color: #00ff88;
   margin: 0 0 16px 0;
   font-size: 18px;
 }

 .system-benefits ul {
   list-style: none;
   padding: 0;
   margin: 0;
 }

 .system-benefits li {
   padding: 8px 0;
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   position: relative;
   padding-left: 24px;
   color: #cccccc;
 }

 .system-benefits li::before {
   content: '🚀';
   position: absolute;
   left: 0;
 }

 .system-benefits li:last-child {
   border-bottom: none;
 }

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.cta-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 1200px) {
  .main-content {
    margin-left: 0;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
    padding-bottom: 120px;
  }
  
  .guide-title {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 22px;
  }
  
  .guide-navigation {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-item {
    width: 100%;
    text-align: center;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 200px;
  }
}





</style>
