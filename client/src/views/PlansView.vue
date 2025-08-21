<template>
  <div class="plans-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Planos</h2>
          <p class="page-subtitle">Escolha o plano ideal para suas necessidades</p>
        </div>
      </header>

      <!-- Main Content -->
      <div class="plans-main">
        <!-- Title -->
        <div class="plans-title">          
          <h1>Escolha seu Plano</h1>
        </div>

        <!-- Plan Categories -->
        <div class="plan-categories">
          <button 
            v-for="category in planCategories" 
            :key="category.id"
            @click="selectCategory(category.id)"
            :class="['category-btn', { 
              active: selectedCategory === category.id,
              disabled: category.disabled 
            }]"
            :disabled="category.disabled"
          >
            <!-- Pre-Game Icon -->
            <svg v-if="category.id === 'pre-game'" class="category-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
            </svg>
            
            <!-- Live Icon -->
            <svg v-else-if="category.id === 'live'" class="category-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
            </svg>
            
            <!-- Pre-Live Icon (Combination) -->
            <svg v-else-if="category.id === 'pre-live'" class="category-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
            </svg>
            
            <!-- Valuebet Icon -->
            <svg v-else-if="category.id === 'valuebet'" class="category-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M3.5 4.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-7z"/>
              <path d="M4.5 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-6z"/>
            </svg>
            
            <!-- Full Plan Icon -->
            <svg v-else-if="category.id === 'full'" class="category-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
              <path d="M3.5 4.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-7z"/>
            </svg>
            <span class="category-text">{{ category.name }}</span>
            <span v-if="category.disabled" class="disabled-badge">Em Breve</span>
          </button>
        </div>

        <!-- Plan Description -->
        <div class="plan-description">
          <h2 class="description-title">{{ currentCategory.title }}</h2>
          <p class="description-subtitle">{{ currentCategory.description }}</p>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid">
          <div 
            v-for="plan in currentCategory.plans" 
            :key="plan.id"
            class="plan-card"
          >
            <div class="plan-header">
              <span class="plan-duration">{{ plan.duration }}</span>
            </div>
            
            <div class="plan-content">
              <h3 class="plan-title">{{ plan.title }}</h3>
              
              <ul class="plan-features">
                <li 
                  v-for="feature in plan.features" 
                  :key="feature.text"
                  :class="['feature-item', { included: feature.included }]"
                >
                  <svg v-if="feature.included" class="feature-icon included" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  <svg v-else class="feature-icon excluded" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                  <span class="feature-text">{{ feature.text }}</span>
                </li>
              </ul>
              
              <div class="plan-price">
                <span class="price-currency">R$</span>
                <span class="price-value">{{ plan.price }}</span>
                <span class="price-decimal">,00</span>
              </div>
              
              <button class="buy-button" @click="buyPlan(plan)">
                <svg class="buy-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <span class="buy-text">Comprar Plano</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Glossary Modal -->
    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
    
    <!-- Payment Method Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="modal-header">
          <h3>Escolha a forma de pagamento</h3>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="modal-body">
          <p class="selected-plan">Você selecionou:</p>
          <h4 class="plan-name">{{ selectedPlan?.title }}</h4>
          <div class="plan-price-display">
            <span class="price-currency">R$</span>
            <span class="price-value">{{ selectedPlan?.price }}</span>
            <span class="price-decimal">,00</span>
          </div>
          
          <div class="payment-methods">
            <button class="payment-method-btn" @click="selectPaymentMethod('pix')">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 7.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M7.5 4.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-.5z"/>
              </svg>
              <div class="payment-info">
                <span class="payment-title">Pagar com PIX</span>
                <span class="payment-subtitle">QR Code • Confirmação rápida</span>
              </div>
            </button>
            
            <button class="payment-method-btn" @click="selectPaymentMethod('credit')">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2z"/>
                <path d="M0 7v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7H0zm3 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V9z"/>
              </svg>
              <div class="payment-info">
                <span class="payment-title">Cartão de Crédito</span>
                <span class="payment-subtitle">Checkout seguro Mercado Pago</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Processing Modal -->
    <div v-if="showProcessingModal" class="modal-overlay">
      <div class="processing-modal" @click.stop>
        <div class="modal-header">
          <h3>Processando...</h3>
        </div>
        
        <div class="modal-body">
          <div class="loading-spinner"></div>
          <p class="processing-text">{{ processingText }}</p>
          <button class="secondary-btn" @click="cancelProcessing">Voltar</button>
        </div>
      </div>
    </div>
    
    <!-- PIX Payment Modal -->
    <div v-if="showPixModal" class="modal-overlay" @click="closePixModal">
      <div class="pix-modal" @click.stop>
        <div class="modal-header">
          <h3>Pagamento PIX</h3>
          <button class="close-btn" @click="closePixModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="timer-section">
            <p class="timer-text">Tempo restante: <span class="timer">{{ formatTime(timeRemaining) }}</span></p>
          </div>
          
          <div class="qr-code-section">
            <div class="qr-code">
              <!-- QR Code genérico -->
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <rect width="200" height="200" fill="white"/>
                <rect x="20" y="20" width="20" height="20" fill="black"/>
                <rect x="60" y="20" width="20" height="20" fill="black"/>
                <rect x="100" y="20" width="20" height="20" fill="black"/>
                <rect x="140" y="20" width="20" height="20" fill="black"/>
                <rect x="180" y="20" width="20" height="20" fill="black"/>
                <rect x="20" y="60" width="20" height="20" fill="black"/>
                <rect x="180" y="60" width="20" height="20" fill="black"/>
                <rect x="20" y="100" width="20" height="20" fill="black"/>
                <rect x="60" y="100" width="20" height="20" fill="black"/>
                <rect x="100" y="100" width="20" height="20" fill="black"/>
                <rect x="140" y="100" width="20" height="20" fill="black"/>
                <rect x="180" y="100" width="20" height="20" fill="black"/>
                <rect x="20" y="140" width="20" height="20" fill="black"/>
                <rect x="180" y="140" width="20" height="20" fill="black"/>
                <rect x="20" y="180" width="20" height="20" fill="black"/>
                <rect x="60" y="180" width="20" height="20" fill="black"/>
                <rect x="100" y="180" width="20" height="20" fill="black"/>
                <rect x="140" y="180" width="20" height="20" fill="black"/>
                <rect x="180" y="180" width="20" height="20" fill="black"/>
              </svg>
            </div>
            
            <p class="qr-instructions">Use seu aplicativo bancário para ler o QR Code acima ou copie o código abaixo.</p>
            
            <div class="pix-code-section">
              <input 
                ref="pixCodeInput"
                type="text" 
                :value="pixCode" 
                readonly 
                class="pix-code-input"
              >
              <button class="copy-btn" @click="copyPixCode">
                <svg v-if="!codeCopied" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                <span v-if="codeCopied">✓</span>
                {{ codeCopied ? 'Copiado' : 'Copiar' }}
              </button>
            </div>
            
            <p class="payment-wait">Aguardando confirmação do pagamento</p>
            
            <button class="secondary-btn" @click="closePixModal">Voltar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Redirect Modal -->
    <div v-if="showRedirectModal" class="modal-overlay">
      <div class="redirect-modal" @click.stop>
        <div class="redirect-content">
          <!-- Logo Mercado Pago -->
          <div class="mercadopago-logo">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
              <!-- Background -->
              <rect width="120" height="60" rx="8" fill="#009EE3"/>
              <!-- MP Text -->
              <text x="60" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">MP</text>
            </svg>
          </div>
          
          <!-- Loading Animation -->
          <div class="redirect-loading">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
          
          <!-- Redirect Text -->
          <div class="redirect-text">
            <h3>Redirecionando para checkout seguro</h3>
            <p>Você será direcionado para o Mercado Pago em instantes...</p>
          </div>
          
          <!-- Security Info -->
          <div class="security-info">
            <div class="security-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
              <span>Pagamento 100% seguro</span>
            </div>
            <div class="security-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
              </svg>
              <span>SSL criptografado</span>
            </div>
          </div>
          
          <!-- Cancel Button -->
          <button class="cancel-redirect-btn" @click="cancelRedirect">
            Cancelar redirecionamento
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'

export default {
  name: 'PlansView',
  components: {
    Sidebar,
    GlossaryModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      selectedCategory: 'pre-game',
      
      // Payment modals
      showPaymentModal: false,
      showProcessingModal: false,
      showPixModal: false,
      showRedirectModal: false,
      selectedPlan: null,
      processingText: 'Processando...',
      
      // PIX payment data
      timeRemaining: 570, // 9:30 em segundos
      pixCode: '00020126580014br.gov.bcb.pix0136434b7a2b-3b63-4de5-bfab-3f0ac5c5e2f952040000530398654041900621622',
      codeCopied: false,
      timerInterval: null,
      planCategories: [
        {
          id: 'pre-game',
          name: 'Surebet Pré-Jogo',
          title: 'Surebet Pré-Jogo',
          description: 'Apostas seguras em jogos pré-live com análise detalhada',
          disabled: false,
          plans: [
            {
              id: 'pre-daily',
              duration: 'Diário',
              title: 'SUREBET PRÉ JOGO DIÁRIO',
              price: '19',
              features: [
                { text: '1 dia de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'pre-weekly',
              duration: 'Semanal',
              title: 'SUREBET PRÉ JOGO SEMANAL',
              price: '67',
              features: [
                { text: '7 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'pre-monthly',
              duration: 'Mensal',
              title: 'SUREBET PRÉ JOGO MENSAL',
              price: '147',
              features: [
                { text: '30 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'pre-yearly',
              duration: 'Anual',
              title: 'SUREBET PRÉ JOGO ANUAL',
              price: '897',
              features: [
                { text: '365 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Suporte Técnico', included: true }
              ]
            }
          ]
        },
        {
          id: 'live',
          name: 'Surebet Live',
          title: 'Surebet Live',
          description: 'Apostas seguras em tempo real durante os jogos',
          disabled: true,
          plans: [
            {
              id: 'live-daily',
              duration: 'Diário',
              title: 'SUREBET LIVE DIÁRIO',
              price: '29',
              features: [
                { text: '1 dia de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'live-weekly',
              duration: 'Semanal',
              title: 'SUREBET LIVE SEMANAL',
              price: '127',
              features: [
                { text: '7 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'live-monthly',
              duration: 'Mensal',
              title: 'SUREBET LIVE MENSAL',
              price: '297',
              features: [
                { text: '30 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'live-yearly',
              duration: 'Anual',
              title: 'SUREBET LIVE ANUAL',
              price: '1697',
              features: [
                { text: '365 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            }
          ]
        },
        {
          id: 'pre-live',
          name: 'Pré + Live',
          title: 'Surebet Pré + Live',
          description: 'Combinação completa: apostas pré-jogo e ao vivo',
          disabled: true,
          plans: [
            {
              id: 'prelive-daily',
              duration: 'Diário',
              title: 'SUREBET PRÉ + LIVE DIÁRIO',
              price: '39',
              features: [
                { text: '1 dia de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'prelive-weekly',
              duration: 'Semanal',
              title: 'SUREBET PRÉ + LIVE SEMANAL',
              price: '137',
              features: [
                { text: '7 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'prelive-monthly',
              duration: 'Mensal',
              title: 'SUREBET PRÉ + LIVE MENSAL',
              price: '347',
              features: [
                { text: '30 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'prelive-yearly',
              duration: 'Anual',
              title: 'SUREBET PRÉ + LIVE ANUAL',
              price: '1997',
              features: [
                { text: '365 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            }
          ]
        },
        {
          id: 'valuebet',
          name: 'Valuebet',
          title: 'Valuebet',
          description: 'Apostas de valor com odds favoráveis identificadas por IA',
          disabled: true,
          plans: [
            {
              id: 'value-daily',
              duration: 'Diário',
              title: 'VALUEBET DIÁRIO',
              price: '39',
              features: [
                { text: '1 dia de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Valuebet Premium', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'value-weekly',
              duration: 'Semanal',
              title: 'VALUEBET SEMANAL',
              price: '137',
              features: [
                { text: '7 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Valuebet Premium', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'value-monthly',
              duration: 'Mensal',
              title: 'VALUEBET MENSAL',
              price: '347',
              features: [
                { text: '30 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Valuebet Premium', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            },
            {
              id: 'value-yearly',
              duration: 'Anual',
              title: 'VALUEBET ANUAL',
              price: '1997',
              features: [
                { text: '365 dias de acesso', included: true },
                { text: 'Jogos Pré-Jogo', included: false },
                { text: 'Jogos Ao-vivo', included: false },
                { text: 'Valuebet Premium', included: true },
                { text: 'Suporte Técnico', included: true }
              ]
            }
          ]
        },
        {
          id: 'full',
          name: 'Plano Full',
          title: 'Plano Full',
          description: 'Acesso completo a todas as funcionalidades da plataforma',
          disabled: true,
          plans: [
            {
              id: 'full-daily',
              duration: 'Anual',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET DIÁRIO',
              price: '67',
              features: [
                { text: '1 dia de acesso completo', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Valuebet Premium', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true },
                { text: 'Acesso Completo', included: true }
              ]
            },
            {
              id: 'full-weekly',
              duration: 'Anual',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET SEMANAL',
              price: '197',
              features: [
                { text: '7 dias de acesso completo', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Valuebet Premium', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true },
                { text: 'Acesso Completo', included: true }
              ]
            },
            {
              id: 'full-monthly',
              duration: 'Anual',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET MENSAL',
              price: '497',
              features: [
                { text: '30 dias de acesso completo', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Valuebet Premium', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true },
                { text: 'Acesso Completo', included: true }
              ]
            },
            {
              id: 'full-yearly',
              duration: 'Anual',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET ANUAL',
              price: '2997',
              features: [
                { text: '365 dias de acesso completo', included: true },
                { text: 'Jogos Pré-Jogo', included: true },
                { text: 'Jogos Ao-vivo', included: true },
                { text: 'Valuebet Premium', included: true },
                { text: 'Calculadora Automática', included: true },
                { text: 'Suporte Técnico', included: true },
                { text: 'Acesso Completo', included: true }
              ]
            }
          ]
        }
      ]
    }
  },
  
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    currentCategory() {
      return this.planCategories.find(cat => cat.id === this.selectedCategory)
    }
  },
  
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },

    closeGlossary() {
      this.showGlossaryModal = false
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    selectCategory(categoryId) {
      const category = this.planCategories.find(cat => cat.id === categoryId)
      if (category && !category.disabled) {
        this.selectedCategory = categoryId
      }
    },
    
    buyPlan(plan) {
      this.selectedPlan = plan
      this.showPaymentModal = true
    },
    
    // Payment modal methods
    closePaymentModal() {
      this.showPaymentModal = false
      this.selectedPlan = null
    },
    
    selectPaymentMethod(method) {
      this.showPaymentModal = false
      
      if (method === 'pix') {
        this.showProcessingModal = true
        this.processingText = 'Gerando cobrança PIX...'
        
        // Simula processamento por 2 segundos
        setTimeout(() => {
          this.showProcessingModal = false
          this.showPixModal = true
          this.startTimer()
        }, 2000)
      } else if (method === 'credit') {
        // Mostra modal de redirecionamento
        this.showRedirectModal = true
        
        // Simula redirecionamento após 3 segundos
        setTimeout(() => {
          this.showRedirectModal = false
          this.selectedPlan = null
          // Aqui você pode adicionar o redirecionamento real para o Mercado Pago
          // window.location.href = 'https://www.mercadopago.com.br/checkout/...'
        }, 3000)
      }
    },
    
    cancelProcessing() {
      this.showProcessingModal = false
      this.showPaymentModal = true
    },
    
    cancelRedirect() {
      this.showRedirectModal = false
      this.showPaymentModal = true
    },
    
    // PIX modal methods
    closePixModal() {
      this.showPixModal = false
      this.selectedPlan = null
      this.codeCopied = false
      this.stopTimer()
    },
    
    startTimer() {
      this.timeRemaining = 570 // Reset timer to 9:30
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
        } else {
          this.stopTimer()
          this.closePixModal()
          alert('Tempo expirado! Tente novamente.')
        }
      }, 1000)
    },
    
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    async copyPixCode() {
      try {
        await navigator.clipboard.writeText(this.pixCode)
        this.codeCopied = true
        setTimeout(() => {
          this.codeCopied = false
        }, 2000)
      } catch (err) {
        // Fallback para browsers que não suportam clipboard API
        this.$refs.pixCodeInput.select()
        document.execCommand('copy')
        this.codeCopied = true
        setTimeout(() => {
          this.codeCopied = false
        }, 2000)
      }
    }
  },
  
  beforeDestroy() {
    // Limpa o timer se o componente for destruído
    this.stopTimer()
  }
}
</script>

<style scoped>
.plans-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  transition: background-color 0.3s ease, color 0.3s ease;
}



/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Plans Main Content */
.plans-main {
  flex: 1;
  padding: 32px 24px;
  width: 100%;
  overflow-y: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #00ff88;
  margin: 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

/* Plans Title */
.plans-title {
  text-align: center;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.plans-title h1 {
  font-size: 36px;
  font-weight: 700;
  color: #00ff88;
  margin: 0 0 8px 0;
}

.title-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

/* Plan Categories */
.plan-categories {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  overflow-x: auto;
  padding: 0 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.plan-categories::-webkit-scrollbar {
  height: 6px;
}

.plan-categories::-webkit-scrollbar-track {
  background: transparent;
}

.plan-categories::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.plan-categories::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 25px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-btn.active {
  background: #00ff88;
  color: #1a1a1a;
  border-color: #00ff88;
}

.category-btn.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #666666;
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  opacity: 0.5;
}

.category-btn.disabled:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: none;
  box-shadow: none;
}

.disabled-badge {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Plan Description */
.plan-description {
  text-align: center;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.description-title {
  font-size: 28px;
  font-weight: 700;
  color: #00ff88;
  margin: 0 0 8px 0;
}

.description-subtitle {
  font-size: 16px;
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.plan-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.plan-header {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-duration {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-content {
  padding: 24px;
}

.plan-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.feature-item.included {
  color: var(--text-primary, #ffffff);
}

.feature-item:not(.included) {
  color: var(--text-secondary, #888888);
}

.feature-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.feature-icon.included {
  color: #00ff88;
}

.feature-icon.excluded {
  color: #ff4444;
}

.plan-price {
  text-align: center;
  margin-bottom: 24px;
}

.price-currency {
  font-size: 20px;
  font-weight: 600;
  color: #00ff88;
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  color: #00ff88;
}

.price-decimal {
  font-size: 20px;
  font-weight: 600;
  color: #00ff88;
}

.buy-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

  .buy-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .payment-modal,
  .processing-modal,
  .pix-modal {
    background: var(--bg-secondary, #2a2a2a);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease-out;
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .modal-header {
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    color: var(--text-primary, #ffffff);
    font-size: 20px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary, #888888);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #ffffff);
  }
  
  .modal-body {
    padding: 24px;
  }
  
  /* Payment Modal Specific */
  .selected-plan {
    color: var(--text-secondary, #888888);
    margin: 0 0 8px 0;
    font-size: 14px;
  }
  
  .plan-name {
    color: var(--text-primary, #ffffff);
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  .plan-price-display {
    text-align: center;
    margin-bottom: 32px;
    color: #00ff88;
  }
  
  .plan-price-display .price-currency {
    font-size: 20px;
    font-weight: 600;
  }
  
  .plan-price-display .price-value {
    font-size: 36px;
    font-weight: 700;
  }
  
  .plan-price-display .price-decimal {
    font-size: 20px;
    font-weight: 600;
  }
  
  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .payment-method-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(42, 42, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-primary, #ffffff);
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }
  
  .payment-method-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #00ff88;
    transform: translateY(-2px);
  }
  
  .payment-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .payment-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #ffffff);
    margin-bottom: 4px;
  }
  
  .payment-subtitle {
    font-size: 14px;
    color: var(--text-secondary, #888888);
  }
  
  /* Processing Modal */
  .processing-modal {
    text-align: center;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 255, 136, 0.3);
    border-top: 3px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 24px auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .processing-text {
    color: var(--text-primary, #ffffff);
    margin: 0 0 24px 0;
    font-size: 16px;
  }
  
  /* PIX Modal */
  .timer-section {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .timer-text {
    color: var(--text-primary, #ffffff);
    margin: 0;
    font-size: 16px;
  }
  
  .timer {
    color: #00ff88;
    font-weight: 600;
    font-size: 18px;
  }
  
  .qr-code-section {
    text-align: center;
  }
  
  .qr-code {
    display: inline-block;
    padding: 16px;
    background: white;
    border-radius: 8px;
    margin-bottom: 24px;
  }
  
  .qr-instructions {
    color: var(--text-secondary, #888888);
    margin: 0 0 24px 0;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .pix-code-section {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .pix-code-input {
    flex: 1;
    padding: 12px;
    background: rgba(42, 42, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: var(--text-primary, #ffffff);
    font-size: 12px;
    font-family: monospace;
  }
  
  .copy-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #00ff88;
    color: #1a1a1a;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .copy-btn:hover {
    background: #00cc6a;
    transform: translateY(-1px);
  }
  
  .payment-wait {
    color: var(--text-secondary, #888888);
    margin: 0 0 24px 0;
    font-size: 14px;
  }
  
  .secondary-btn {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #ffffff);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  /* Redirect Modal Styles */
  .redirect-modal {
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-radius: 16px;
    padding: 0;
    max-width: 480px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    animation: slideInUp 0.4s ease-out;
  }

  .redirect-content {
    padding: 48px 32px;
    position: relative;
  }

  .mercadopago-logo {
    margin-bottom: 32px;
    animation: logoGlow 2s ease-in-out infinite alternate;
  }

  .redirect-loading {
    margin-bottom: 32px;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    background: #00ff88;
    border-radius: 50%;
    animation: dotPulse 1.4s ease-in-out infinite both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  .dot:nth-child(3) {
    animation-delay: 0s;
  }

  .redirect-text h3 {
    font-size: 24px;
    font-weight: 700;
    color: #00ff88;
    margin: 0 0 12px 0;
    animation: textGlow 2s ease-in-out infinite alternate;
  }

  .redirect-text p {
    font-size: 16px;
    color: var(--text-secondary, #cccccc);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .security-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .security-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.2);
    border-radius: 8px;
    color: #00ff88;
    font-size: 14px;
    font-weight: 500;
  }

  .security-item svg {
    flex-shrink: 0;
  }

  .cancel-redirect-btn {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary, #cccccc);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .cancel-redirect-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-primary, #ffffff);
    transform: translateY(-1px);
  }

  /* Animations */
  @keyframes logoGlow {
    0% {
      filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
    }
    100% {
      filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
    }
  }

  @keyframes dotPulse {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes textGlow {
    0% {
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    100% {
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Footer */
.plans-footer {
  text-align: center;
  padding: 24px;
  background: var(--bg-secondary, #2a2a2a);
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.plans-footer p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #888888);
}

/* Responsividade */
@media (max-width: 768px) {
  .plans-main {
    padding: 24px 16px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .plans-title h1 {
    font-size: 28px;
  }
  
  .title-icon {
    font-size: 36px;
  }
  
  .plan-categories {
    gap: 8px;
    max-width: 100%;
    padding: 0 8px;
  }

  .redirect-modal {
    max-width: 90%;
    width: 90%;
  }

  .redirect-content {
    padding: 32px 24px;
  }

  .mercadopago-logo {
    margin-bottom: 24px;
  }

  .redirect-text h3 {
    font-size: 20px;
  }

  .redirect-text p {
    font-size: 14px;
  }

  .security-info {
    gap: 12px;
  }

  .security-item {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .plans-grid {
    max-width: 100%;
  }
  
  .category-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: 100%;
  }
  
  .plan-content {
    padding: 20px;
  }
  
  .description-title {
    font-size: 24px;
  }
  
  .description-subtitle {
    font-size: 14px;
  }
  
  .plan-description {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .plans-main {
    padding: 16px 12px;
  }
  
  .plans-title h1 {
    font-size: 24px;
  }
  
  .title-icon {
    font-size: 32px;
  }
  
  .plan-categories {
    gap: 6px;
    padding: 0 4px;
  }
  
  .category-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-width: auto;
  }
  
  .category-text {
    font-size: 11px;
  }
  
  .description-title {
    font-size: 20px;
  }
  
  .plan-content {
    padding: 16px;
  }
}
</style>
