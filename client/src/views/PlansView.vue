<template>
  <div class="plans-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />

      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Planos</h2>
          <p class="page-subtitle">Escolha o plano ideal para suas necessidades</p>
        </div>
        <div class="header-right">
          <!-- WebSocket Status -->
          <div class="websocket-status" :class="{ connected: websocketConnected }">
            <span class="status-dot"></span>
            {{ websocketConnected ? 'WebSocket Conectado' : 'WebSocket Desconectado' }}
          </div>
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
          <button v-for="category in planCategories" :key="category.id" @click="selectCategory(category.id)" :class="['category-btn', {
            active: selectedCategory === category.id,
            disabled: category.disabled
          }]" :disabled="category.disabled">
            <!-- Pre-Game Icon -->
            <svg v-if="category.id === 'pre-game'" class="category-icon" width="20" height="20" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z" />
            </svg>

            <!-- Live Icon -->
            <svg v-else-if="category.id === 'live'" class="category-icon" width="20" height="20" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
            </svg>

            <!-- Pre-Live Icon (Combination) -->
            <svg v-else-if="category.id === 'pre-live'" class="category-icon" width="20" height="20" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
            </svg>

            <!-- Valuebet Icon -->
            <svg v-else-if="category.id === 'valuebet'" class="category-icon" width="20" height="20" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
              <path d="M3.5 4.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-7z" />
              <path d="M4.5 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-6z" />
            </svg>

            <!-- Full Plan Icon -->
            <svg v-else-if="category.id === 'full'" class="category-icon" width="20" height="20" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
              <path d="M3.5 4.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-7z" />
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
          <div v-for="plan in currentCategory.plans" :key="plan.id" class="plan-card">
            <div class="plan-header">
              <span class="plan-duration">{{ plan.duration }}</span>
            </div>

            <div class="plan-content">
              <h3 class="plan-title">{{ plan.title }}</h3>

              <ul class="plan-features">
                <li v-for="feature in plan.features" :key="feature.text"
                  :class="['feature-item', { included: feature.included }]">
                  <svg v-if="feature.included" class="feature-icon included" width="16" height="16" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path
                      d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                  </svg>
                  <svg v-else class="feature-icon excluded" width="16" height="16" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
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
                  <path
                    d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                <span class="buy-text">Comprar Plano</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Glossary Modal -->


    <!-- Payment Method Selection Modal -->
    <div v-if="showPaymentMethodModal" class="modal-overlay" @click="closePaymentMethodModal">
      <div class="payment-method-modal" @click.stop>
        <div class="modal-header">
          <h3>Escolha o Método de Pagamento</h3>
          <button class="close-btn" @click="closePaymentMethodModal">×</button>
        </div>

        <div class="modal-body">
          <div class="selected-plan-info">
            <p class="selected-plan">Plano selecionado:</p>
            <h4 class="plan-name">{{ selectedPlan?.title }}</h4>
            <div class="plan-price-display">
              <span class="price-currency">R$</span>
              <span class="price-value">{{ selectedPlan?.price }}</span>
              <span class="price-decimal">,00</span>
            </div>
          </div>

          <div class="payment-methods">
            <div class="payment-method-option" @click="selectPaymentMethod('pix')">
              <div class="method-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
                  <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z" />
                </svg>
              </div>
              <div class="method-info">
                <h4>PIX</h4>
                <p>Pagamento instantâneo via PIX</p>
                <span class="method-advantage">Aprovação imediata</span>
              </div>
              <div class="method-arrow">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
                </svg>
              </div>
            </div>

            <div class="payment-method-option" @click="selectPaymentMethod('credit_card')">
              <div class="method-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  <path d="M6 8h2v2H6zm3 0h2v2H9zm3 0h2v2h-2z" />
                </svg>
              </div>
              <div class="method-info">
                <h4>Cartão de Crédito</h4>
                <p>Pagamento em até 12x sem juros</p>
                <span class="method-advantage">Checkout transparente</span>
              </div>
              <div class="method-arrow">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Required Modal -->
    <div v-if="showLoginRequiredModal" class="modal-overlay" @click="closeLoginRequiredModal">
      <div class="login-required-modal" @click.stop>
        <div class="modal-header">
          <h3>Login Obrigatório</h3>
          <button class="close-btn" @click="closeLoginRequiredModal">×</button>
        </div>

        <div class="modal-body">
          <div class="login-required-content">
            <div class="login-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
            </div>

            <h4 class="login-title">Faça login para continuar</h4>
            <p class="login-description">
              Para comprar o plano <strong>{{ selectedPlan?.title }}</strong> por R$ {{ selectedPlan?.price }},00,
              você precisa estar logado em sua conta.
            </p>

            <div class="plan-summary">
              <div class="plan-info">
                <span class="plan-name">{{ selectedPlan?.title }}</span>
                <span class="plan-price">R$ {{ selectedPlan?.price }},00</span>
              </div>
            </div>

            <div class="login-actions">
              <button class="btn-primary" @click="goToLogin">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
                </svg>
                Fazer Login
              </button>

              <button class="btn-secondary" @click="closeLoginRequiredModal">
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="modal-header">
          <h3>Checkout Seguro</h3>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>

        <div class="modal-body">
          <div class="selected-plan-info">
            <p class="selected-plan">Plano selecionado:</p>
            <h4 class="plan-name">{{ selectedPlan?.title }}</h4>
            <div class="plan-price-display">
              <span class="price-currency">R$</span>
              <span class="price-value">{{ selectedPlan?.price }}</span>
              <span class="price-decimal">,00</span>
            </div>
          </div>

          <!-- Checkout Form -->
          <form @submit.prevent="processPayment" class="checkout-form">
            <div class="form-section">
              <h5 class="section-title">Dados Pessoais</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>Nome Completo</label>
                  <input v-model="checkoutData.firstName" type="text" required placeholder="Seu nome completo"
                    class="form-input" />
                </div>
                <div class="form-group">
                  <label>Sobrenome</label>
                  <input v-model="checkoutData.lastName" type="text" required placeholder="Seu sobrenome"
                    class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>E-mail</label>
                <input v-model="checkoutData.email" type="email" required placeholder="seu@email.com"
                  class="form-input" />
              </div>

              <div class="form-group">
                <label>CPF</label>
                <input v-model="checkoutData.cpf" type="text" required placeholder="000.000.000-00"
                  class="form-input cpf-input" v-mask="'###.###.###-##'" />
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">Dados de Pagamento</h5>
              <div class="form-group">
                <label>Número do Cartão</label>
                <input v-model="checkoutData.cardNumber" type="text" required placeholder="0000 0000 0000 0000"
                  class="form-input card-input" v-mask="'#### #### #### ####'" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Validade</label>
                  <input v-model="checkoutData.expiry" type="text" required placeholder="MM/AA"
                    class="form-input expiry-input" v-mask="'##/##'" />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input v-model="checkoutData.cvv" type="text" required placeholder="123" class="form-input cvv-input"
                    v-mask="'###'" />
                </div>
              </div>

              <div class="form-group">
                <label>Nome no Cartão</label>
                <input v-model="checkoutData.cardName" type="text" required placeholder="Como está impresso no cartão"
                  class="form-input" />
              </div>

              <div class="form-group">
                <label>Parcelas</label>
                <select v-model="checkoutData.installments" class="form-input">
                  <option value="1">1x sem juros</option>
                  <option value="2">2x sem juros</option>
                  <option value="3">3x sem juros</option>
                  <option value="4">4x sem juros</option>
                  <option value="5">5x sem juros</option>
                  <option value="6">6x sem juros</option>
                </select>
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">Endereço de Cobrança</h5>
              <div class="form-group">
                <label>CEP</label>
                <input v-model="checkoutData.cep" type="text" required placeholder="00000-000"
                  class="form-input cep-input" v-mask="'#####-###'" @blur="searchCep" />
              </div>

              <div class="form-group">
                <label>Endereço</label>
                <input v-model="checkoutData.address" type="text" required placeholder="Rua, número e complemento"
                  class="form-input" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Bairro</label>
                  <input v-model="checkoutData.neighborhood" type="text" required placeholder="Bairro"
                    class="form-input" />
                </div>
                <div class="form-group">
                  <label>Cidade</label>
                  <input v-model="checkoutData.city" type="text" required placeholder="Cidade" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>Estado</label>
                <select v-model="checkoutData.state" class="form-input" required>
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div class="payment-summary">
              <div class="summary-item">
                <span>Subtotal:</span>
                <span>R$ {{ selectedPlan?.price }},00</span>
              </div>
              <div class="summary-item">
                <span>Taxa:</span>
                <span>R$ 0,00</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>R$ {{ selectedPlan?.price }},00</span>
              </div>
            </div>

            <div class="security-info">
              <div class="security-item">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                <span>Pagamento 100% seguro</span>
              </div>
              <div class="security-item">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
                </svg>
                <span>SSL criptografado</span>
              </div>
            </div>

            <button type="submit" class="submit-payment-btn" :disabled="processingPayment">
              <svg v-if="processingPayment" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"
                  stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416"
                    repeatCount="indefinite" />
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416"
                    repeatCount="indefinite" />
                </circle>
              </svg>
              <span v-if="!processingPayment">Finalizar Compra</span>
              <span v-else>Processando...</span>
            </button>
          </form>
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
              <!-- QR Code real do PIX -->
              <div v-if="pixCodeBase64" class="qr-code-generated">
                <img :src="`data:image/jpeg;base64,${pixCodeBase64}`" alt="QR Code PIX" class="qr-code-image">
              </div>
              <div v-else-if="pixCode" class="qr-code-text">
                <p>PIX Gerado</p>
                <small>Código: {{ pixCode.substring(0, 20) }}...</small>
              </div>
              <div v-else class="qr-code-loading">
                <p>Gerando PIX...</p>
                <div class="spinner"></div>
              </div>
            </div>

            <p class="qr-instructions">Use seu aplicativo bancário para ler o QR Code acima ou copie o código abaixo.
            </p>

            <!-- Botão para abrir PIX em nova janela -->
            <div v-if="ticketUrl" class="pix-ticket-section">
              <a :href="ticketUrl" target="_blank" class="pix-ticket-btn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                Abrir PIX em nova janela
              </a>
            </div>

            <div class="pix-code-section">
              <label for="pixCodeInput">Código PIX (Copia e Cola):</label>
              <input id="pixCodeInput" ref="pixCodeInput" type="text" :value="pixCode" readonly class="pix-code-input">
              <button class="copy-btn" @click="copyPixCode">
                <svg v-if="!codeCopied" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                  <path
                    d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
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
              <rect width="120" height="60" rx="8" fill="#009EE3" />
              <!-- MP Text -->
              <text x="60" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24"
                font-weight="bold">MP</text>
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
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
              <span>Pagamento 100% seguro</span>
            </div>
            <div class="security-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z" />
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

    <!-- Payment Success Notification -->
    <PaymentSuccessNotification :show="showPaymentSuccess" :planName="successPlanName" @close="closePaymentSuccess" />

    <!-- Payment Confirmation Modal -->
    <PaymentConfirmationModal :show="showPaymentConfirmation" :planName="confirmationPlanName"
      :paymentId="confirmationPaymentId" :expiresAt="confirmationExpiresAt" :planBenefits="confirmationPlanBenefits"
      @close="closePaymentConfirmation" />

  </div>
</template>

<script>
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'
import PaymentSuccessNotification from '../components/UI/PaymentSuccessNotification.vue'
import PaymentConfirmationModal from '../components/Modals/PaymentConfirmationModal.vue'


export default {
  name: 'PlansView',
  components: {
    Sidebar,
    Header,
    PaymentSuccessNotification,
    PaymentConfirmationModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      selectedCategory: 'pre-game',

      // Payment success notification
      showPaymentSuccess: false,
      successPlanName: '',

      // Payment confirmation modal
      showPaymentConfirmation: false,
      confirmationPlanName: '',
      confirmationPaymentId: '',
      confirmationExpiresAt: '',
      confirmationPlanBenefits: [],

      // WebSocket para notificações de pagamento
      websocket: null,
      websocketConnected: false,
      websocketReconnectAttempts: 0,
      maxReconnectAttempts: 5,
      websocketReconnectInterval: 3000,

      // Debug mode
      debugMode: true,

      // Mercado Pago Configuration
      mercadopagoConfig: {
        publicKey: 'APP_USR-b493216a-34ea-4dab-98ab-a0d38aa43828',
        accessToken: 'APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918'
      },

      // Device ID para Mercado Pago
      deviceId: null,

      // Payment modals
      showPaymentModal: false,
      showPaymentMethodModal: false,
      showProcessingModal: false,
      showPixModal: false,
      showRedirectModal: false,
      showLoginRequiredModal: false,
      selectedPlan: null,
      processingText: 'Processando...',

      // Checkout data
      checkoutData: {
        firstName: '',
        lastName: '',
        email: '',
        cpf: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: '',
        installments: '1',
        cep: '',
        address: '',
        neighborhood: '',
        city: '',
        state: ''
      },

      // Payment processing
      processingPayment: false,
      currentOrder: null,

      // PIX payment data
      timeRemaining: 570, // 9:30 em segundos
      pixCode: '',
      pixCodeBase64: '',
      ticketUrl: '',
      codeCopied: false,
      timerInterval: null,

      // Plan categories data
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
              title: 'SUREBET \nPRÉ JOGO DIÁRIO',
              price: '1',
              days: 1,
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
              price: '57',
              days: 7,
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
              price: '97',
              days: 30,
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
              price: '597',
              days: 365,
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
              days: 1,
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
              days: 7,
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
              days: 30,
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
              days: 365,
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
              days: 1,
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
              days: 7,
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
              days: 30,
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
              days: 365,
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
              days: 1,
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
              days: 7,
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
              days: 30,
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
              days: 365,
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
              duration: 'Diário',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET DIÁRIO',
              price: '67',
              days: 1,
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
              duration: 'Semanal',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET SEMANAL',
              price: '197',
              days: 7,
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
              duration: 'Mensal',
              title: 'FULL - PRÉLIVE + LIVE + VALUEBET MENSAL',
              price: '497',
              days: 30,
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
              days: 365,
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

  mounted() {
    console.log('🚀 PlansView mounted - Iniciando configuração...')

    // Preencher dados do usuário logado se disponível
    if (this.currentUser) {
      console.log('👤 Usuário logado encontrado:', this.currentUser.email)
      this.checkoutData.firstName = this.currentUser.firstName || ''
      this.checkoutData.lastName = this.currentUser.lastName || ''
      this.checkoutData.email = this.currentUser.email || ''
      this.checkoutData.cpf = this.currentUser.cpf || ''
    } else {
      console.log('⚠️ Nenhum usuário logado encontrado')
    }

    // Inicializar Mercado Pago
    this.initializeMercadoPago()

    // Inicializar WebSocket para notificações de pagamento
    this.initializeWebSocket()

    console.log('✅ PlansView inicializado com sucesso')
  },

  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    // Debug methods
    debugLog(message, data = null) {
      if (this.debugMode) {
        const timestamp = new Date().toLocaleTimeString('pt-BR')
        console.log(`🔍 [${timestamp}] [PLANS DEBUG] ${message}`, data || '')
      }
    },

    debugError(message, error = null) {
      if (this.debugMode) {
        const timestamp = new Date().toLocaleTimeString('pt-BR')
        console.error(`❌ [${timestamp}] [PLANS ERROR] ${message}`, error || '')
      }
    },

    debugSuccess(message, data = null) {
      if (this.debugMode) {
        const timestamp = new Date().toLocaleTimeString('pt-BR')
        console.log(`✅ [${timestamp}] [PLANS SUCCESS] ${message}`, data || '')
      }
    },

    debugWarning(message, data = null) {
      if (this.debugMode) {
        const timestamp = new Date().toLocaleTimeString('pt-BR')
        console.warn(`⚠️ [${timestamp}] [PLANS WARNING] ${message}`, data || '')
      }
    },

    // WebSocket methods
    initializeWebSocket() {
      console.log('🔌 [WEBSOCKET] Inicializando WebSocket...')
      this.debugLog('Inicializando WebSocket...')

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const hostname = window.location.hostname
        const wsUrl = `${protocol}//${hostname}/ws`

        console.log('🔌 [WEBSOCKET] URL do WebSocket:', wsUrl)
        console.log('🔌 [WEBSOCKET] Protocolo:', protocol)
        console.log('🔌 [WEBSOCKET] Hostname:', hostname)
        console.log('🔌 [WEBSOCKET] Location:', window.location.href)
        this.debugLog('Conectando ao WebSocket', { url: wsUrl })

        this.websocket = new WebSocket(wsUrl)

        this.websocket.onopen = () => {
          this.debugSuccess('WebSocket conectado com sucesso')
          this.websocketConnected = true
          this.websocketReconnectAttempts = 0
        }

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.debugLog('Mensagem WebSocket recebida', data)
            this.handleWebSocketMessage(data)
          } catch (error) {
            this.debugError('Erro ao processar mensagem WebSocket', { error: error.message })
          }
        }

        this.websocket.onclose = (event) => {
          this.debugWarning('WebSocket desconectado', { code: event.code, reason: event.reason })
          this.websocketConnected = false
          this.attemptReconnect()
        }

        this.websocket.onerror = (error) => {
          console.error('❌ [WEBSOCKET ERROR] Erro no WebSocket:', error)
          console.error('❌ [WEBSOCKET ERROR] Evento de erro:', error.type)
          console.error('❌ [WEBSOCKET ERROR] Código de erro:', error.code)
          console.error('❌ [WEBSOCKET ERROR] Mensagem de erro:', error.message)
          console.error('❌ [WEBSOCKET ERROR] ReadyState:', this.websocket?.readyState)
          this.debugError('Erro no WebSocket', {
            error: error.message || 'Erro desconhecido',
            type: error.type,
            code: error.code,
            readyState: this.websocket?.readyState
          })
        }

      } catch (error) {
        this.debugError('Erro ao inicializar WebSocket', { error: error.message })
      }
    },

    attemptReconnect() {
      if (this.websocketReconnectAttempts < this.maxReconnectAttempts) {
        this.websocketReconnectAttempts++
        this.debugLog(`Tentativa de reconexão ${this.websocketReconnectAttempts}/${this.maxReconnectAttempts}`)

        setTimeout(() => {
          this.initializeWebSocket()
        }, this.websocketReconnectInterval)
      } else {
        this.debugLog('Máximo de tentativas de reconexão atingido')
      }
    },

    handleWebSocketMessage(data) {
      switch (data.type) {
        case 'payment_confirmed':
          this.debugLog('Pagamento confirmado via WebSocket', data)
          this.handlePaymentConfirmation(data.paymentData)
          break

        case 'payment_updated':
          this.debugLog('Status do pagamento atualizado via WebSocket', data)
          this.handlePaymentUpdate(data.paymentData)
          break

        case 'initial_state':
          this.debugLog('Estado inicial recebido via WebSocket', data)
          break

        default:
          this.debugLog('Mensagem WebSocket não reconhecida', data)
      }
    },

    handlePaymentConfirmation(paymentData) {
      console.log('🎉 [PAYMENT CONFIRMED] Processando confirmação de pagamento', paymentData)
      this.debugLog('Processando confirmação de pagamento', paymentData)

      // Fechar modais de pagamento
      console.log('🔍 [DEBUG] Fechando modais de pagamento...')
      this.closePixModal()
      this.closePaymentModal()
      this.closeProcessingModal()

      // Preparar dados para o modal de confirmação
      const confirmationData = {
        planName: paymentData.planName || this.selectedPlan?.title || 'VIP',
        paymentId: paymentData.paymentId || paymentData.id,
        expiresAt: paymentData.expiresAt || paymentData.expiration_date,
        benefits: paymentData.benefits || this.getDefaultPlanBenefits(paymentData.planName)
      }

      console.log('🔍 [DEBUG] Dados para modal de confirmação:', confirmationData)

      // Mostrar modal de confirmação
      this.showPaymentConfirmationModal(confirmationData)

      // Atualizar estado do usuário se necessário
      if (paymentData.userData) {
        console.log('🔍 [DEBUG] Atualizando dados do usuário...')
        this.$store.dispatch('updateUser', paymentData.userData)
      }

      console.log('✅ [SUCCESS] Modal de confirmação de pagamento exibido')
    },

    handlePaymentUpdate(paymentData) {
      this.debugLog('Processando atualização de pagamento', paymentData)

      // Atualizar status do pagamento se estiver em processamento
      if (this.showProcessingModal || this.showPixModal) {
        // Pode atualizar a UI com o novo status
        console.log('Status do pagamento atualizado:', paymentData.status)
      }
    },

    // Cleanup WebSocket
    beforeUnmount() {
      this.debugLog('Limpeza do WebSocket...')
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }
    },


    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
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
      console.log('🔍 [DEBUG] buyPlan chamado com:', plan)
      console.log('🔍 [DEBUG] plan.id:', plan?.id)
      console.log('🔍 [DEBUG] plan.title:', plan?.title)
      console.log('🔍 [DEBUG] plan.price:', plan?.price)

      // Verificar se o usuário está logado
      if (!this.currentUser) {
        console.log('🔍 [DEBUG] Usuário não logado - mostrando modal de login')
        // Usuário não logado - mostrar modal de login
        this.showLoginRequiredModal = true
        this.selectedPlan = plan
        console.log('🔍 [DEBUG] selectedPlan definido para usuário não logado:', this.selectedPlan)
        return
      }

      console.log('🔍 [DEBUG] Usuário logado - prosseguindo com compra')
      // Usuário logado - prosseguir com a compra
      this.selectedPlan = plan
      this.showPaymentMethodModal = true
      console.log('🔍 [DEBUG] selectedPlan definido:', this.selectedPlan)
      console.log('🔍 [DEBUG] showPaymentMethodModal definido como:', this.showPaymentMethodModal)
    },

    resetCheckoutForm() {
      // Manter dados do usuário se já estiver logado
      if (this.currentUser) {
        this.checkoutData.firstName = this.currentUser.firstName || ''
        this.checkoutData.lastName = this.currentUser.lastName || ''
        this.checkoutData.email = this.currentUser.email || ''
        this.checkoutData.cpf = this.currentUser.cpf || ''
      } else {
        this.checkoutData.firstName = ''
        this.checkoutData.lastName = ''
        this.checkoutData.email = ''
        this.checkoutData.cpf = ''
      }

      // Resetar outros campos
      this.checkoutData.cardNumber = ''
      this.checkoutData.expiry = ''
      this.checkoutData.cvv = ''
      this.checkoutData.cardName = ''
      this.checkoutData.installments = '1'
      this.checkoutData.cep = ''
      this.checkoutData.address = ''
      this.checkoutData.neighborhood = ''
      this.checkoutData.city = ''
      this.checkoutData.state = ''
    },

    // Payment method selection methods
    closePaymentMethodModal() {
      this.showPaymentMethodModal = false
      this.selectedPlan = null
    },

    // Login required modal methods
    closeLoginRequiredModal() {
      this.showLoginRequiredModal = false
      this.selectedPlan = null
    },

    goToLogin() {
      // Salvar o plano selecionado para redirecionamento após login
      localStorage.setItem('redirectAfterLogin', `/plans`)
      localStorage.setItem('selectedPlanId', this.selectedPlan.id)

      // Fechar modal e redirecionar para login
      this.closeLoginRequiredModal()
      this.$router.push('/login')
    },

    selectPaymentMethod(method) {
      console.log('🔍 [DEBUG] selectPaymentMethod chamado com:', method)
      console.log('🔍 [DEBUG] selectedPlan atual:', this.selectedPlan)
      console.log('🔍 [DEBUG] selectedPlan existe?', !!this.selectedPlan)
      console.log('🔍 [DEBUG] selectedPlan.id:', this.selectedPlan?.id)
      console.log('🔍 [DEBUG] selectedPlan.title:', this.selectedPlan?.title)

      this.debugLog('selectPaymentMethod chamado', {
        method,
        selectedPlan: this.selectedPlan,
        hasSelectedPlan: !!this.selectedPlan,
        selectedPlanId: this.selectedPlan?.id,
        selectedPlanTitle: this.selectedPlan?.title
      })

      if (method === 'pix') {
        console.log('🔍 [DEBUG] Abrindo modal PIX')
        this.showPaymentMethodModal = false
        this.showPixModal = true
        console.log('🔍 [DEBUG] Chamando createPixOrder...')
        this.createPixOrder()
      } else if (method === 'credit_card') {
        console.log('🔍 [DEBUG] Abrindo modal de cartão de crédito')
        this.showPaymentMethodModal = false
        this.showPaymentModal = true
        this.resetCheckoutForm()
      }
    },

    // Payment modal methods
    closePaymentModal() {
      this.showPaymentModal = false
      this.selectedPlan = null
      this.processingPayment = false
    },

    async searchCep() {
      if (this.checkoutData.cep.length === 9) {
        try {
          const cep = this.checkoutData.cep.replace(/\D/g, '')
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
          const data = await response.json()

          if (!data.erro) {
            this.checkoutData.address = data.logradouro
            this.checkoutData.neighborhood = data.bairro
            this.checkoutData.city = data.localidade
            this.checkoutData.state = data.uf
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error)
        }
      }
    },

    initializeMercadoPago() {
      // Carregar SDK do Mercado Pago
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.onload = () => {
        if (window.Mercadopago) {
          window.Mercadopago.setPublishableKey(this.mercadopagoConfig.publicKey)

          // Inicializar identificador de dispositivo
          this.initializeDeviceId()

          console.log('Mercado Pago SDK carregado com sucesso')
        }
      }
      document.head.appendChild(script)
    },

    initializeDeviceId() {
      // Gerar identificador único de dispositivo
      this.deviceId = this.generateDeviceId()

      // Configurar device ID no SDK do Mercado Pago
      if (window.Mercadopago && window.Mercadopago.setDeviceId) {
        window.Mercadopago.setDeviceId(this.deviceId)
        console.log('Device ID configurado:', this.deviceId)
      }
    },

    generateDeviceId() {
      // Gerar um ID único baseado em características do dispositivo
      let deviceId = localStorage.getItem('mercadopago_device_id')

      if (!deviceId) {
        // Combinar informações do navegador para criar um ID único
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Device fingerprint', 2, 2)

        const fingerprint = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          canvas.toDataURL(),
          navigator.hardwareConcurrency || 'unknown',
          navigator.maxTouchPoints || 'unknown'
        ].join('|')

        // Criar hash simples do fingerprint
        deviceId = this.simpleHash(fingerprint)

        // Salvar no localStorage para reutilização
        localStorage.setItem('mercadopago_device_id', deviceId)
      }

      return deviceId
    },

    simpleHash(str) {
      let hash = 0
      if (str.length === 0) return hash.toString()

      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }

      return Math.abs(hash).toString(36)
    },

    async createPixOrder() {
      console.log('🔍 [DEBUG] createPixOrder iniciado')
      console.log('🔍 [DEBUG] this.selectedPlan:', this.selectedPlan)
      console.log('🔍 [DEBUG] typeof this.selectedPlan:', typeof this.selectedPlan)

      try {
        // Validar se selectedPlan existe
        if (!this.selectedPlan) {
          console.error('❌ [ERROR] selectedPlan não está definido')
          this.debugError('selectedPlan não está definido')
          throw new Error('Plano não selecionado. Tente novamente.')
        }

        console.log('✅ [DEBUG] selectedPlan encontrado:', {
          id: this.selectedPlan.id,
          title: this.selectedPlan.title,
          price: this.selectedPlan.price,
          days: this.selectedPlan.days
        })

        this.debugLog('selectedPlan encontrado', {
          id: this.selectedPlan.id,
          title: this.selectedPlan.title,
          price: this.selectedPlan.price
        })

        // 1. Preparar dados do pedido PIX
        const orderData = {
          userId: this.currentUser?.id || 'guest',
          planId: this.selectedPlan.id,
          planName: this.selectedPlan.title,
          planDays: this.selectedPlan.days,
          amount: parseFloat(this.selectedPlan.price),
          customerData: {
            firstName: this.currentUser?.firstName || 'Usuário',
            lastName: this.currentUser?.lastName || 'Convidado',
            email: this.currentUser?.email || 'guest@example.com',
            cpf: this.currentUser?.cpf || '00000000000'
          }
        }

        this.debugLog('Criando pedido PIX...', orderData)

        // 2. Criar pedido PIX via API
        const response = await fetch('/api/orders/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify(orderData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao criar pedido PIX')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error('Falha ao processar pedido PIX')
        }

        // 3. Configurar dados do PIX
        this.pixCode = result.pix.pixCode
        this.pixCodeBase64 = result.pix.pixCodeBase64
        this.ticketUrl = result.pix.ticketUrl
        this.currentOrder = result.order
        this.timeRemaining = 570 // 9:30 em segundos

        // 4. Iniciar timer para verificação de pagamento
        this.startPixTimer(result.order.id)

        console.log('PIX gerado com sucesso:', result.pix)

      } catch (error) {
        console.error('Erro ao processar PIX:', error)
        this.showErrorMessage(error.message || 'Erro ao gerar PIX. Tente novamente.')
        this.closePixModal()
      }
    },



    startPixTimer(orderId) {
      this.timerInterval = setInterval(() => {
        this.timeRemaining--

        if (this.timeRemaining <= 0) {
          clearInterval(this.timerInterval)
          this.checkPixPaymentStatus(orderId)
        }
      }, 1000)
    },

    async checkPixPaymentStatus(orderId) {
      try {
        // Verificar status real do pagamento via API
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${this.$store.state.authToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Erro ao verificar status do pedido')
        }

        const result = await response.json()
        const order = result.order

        if (order.status === 'approved') {
          await this.activateVIP(orderId)
          this.showSuccessMessage('PIX aprovado! Seu VIP foi ativado com sucesso.')
          this.closePixModal()
        } else if (order.status === 'pending') {
          // Continuar verificando se ainda há tempo
          if (this.timeRemaining > 0) {
            this.showSuccessMessage('PIX ainda pendente. Aguarde a confirmação.')
          } else {
            this.showErrorMessage('Tempo expirado. PIX não foi confirmado.')
            this.closePixModal()
          }
        } else if (order.status === 'rejected') {
          this.showErrorMessage('PIX foi rejeitado. Tente novamente.')
          this.closePixModal()
        }
      } catch (error) {
        console.error('Erro ao verificar status PIX:', error)
        this.showErrorMessage('Erro ao verificar status do PIX')
      }
    },

    async processPayment() {
      if (this.processingPayment) return

      this.processingPayment = true
      this.debugLog('Iniciando processamento de pagamento...', {
        plan: this.selectedPlan?.title,
        price: this.selectedPlan?.price,
        paymentMethod: this.selectedPaymentMethod
      })

      try {
        // 1. Validar dados do formulário
        this.debugLog('Validando formulário de checkout...')
        if (!this.validateCheckoutForm()) {
          throw new Error('Por favor, preencha todos os campos obrigatórios')
        }
        this.debugLog('Formulário validado com sucesso')

        // 2. Criar pedido no sistema
        this.debugLog('Criando pedido no sistema...')
        const order = await this.createOrder()
        this.debugLog('Pedido criado com sucesso', { orderId: order.id })

        // 3. Processar pagamento baseado no método selecionado
        let paymentResult
        if (this.selectedPaymentMethod === 'pix') {
          this.debugLog('Processando pagamento PIX...')
          paymentResult = await this.processPixPayment(order)
        } else {
          this.debugLog('Processando pagamento no Mercado Pago...')
          paymentResult = await this.processMercadoPagoPayment(order)
        }

        this.debugLog('Pagamento processado', {
          status: paymentResult.status,
          paymentId: paymentResult.paymentId
        })

        // 4. Atualizar status do pedido
        await this.updateOrderStatus(order.id, paymentResult.status)

        // 5. Iniciar polling para verificar status do pagamento
        if (paymentResult.status === 'pending') {
          this.debugLog('Pagamento pendente - iniciando polling...')
          this.showSuccessMessage('Pagamento processado! Aguardando confirmação...')
          this.closePaymentModal()

          // Iniciar polling para verificar status
          this.startPaymentPolling(order.id, paymentResult.paymentId)

        } else if (paymentResult.status === 'approved') {
          // Pagamento já aprovado (caso raro)
          this.debugLog('Pagamento aprovado imediatamente')
          await this.handleApprovedPayment(order)
        } else {
          this.debugLog('Pagamento não aprovado', { status: paymentResult.status })
          this.showErrorMessage('Pagamento não aprovado. Tente novamente.')
        }

      } catch (error) {
        this.debugError('Erro ao processar pagamento', {
          error: error.message,
          stack: error.stack
        })
        console.error('❌ Erro no processamento do pagamento:', error)
        this.showErrorMessage(error.message || 'Erro ao processar pagamento. Tente novamente.')
      } finally {
        this.processingPayment = false
        this.debugLog('Processamento de pagamento finalizado')
      }
    },

    // Método para processar pagamento PIX
    async processPixPayment(order) {
      this.debugLog('Iniciando processamento de PIX...', { orderId: order.id })

      try {
        // 1. Gerar PIX via API
        const response = await fetch('/api/payments/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.getters.token}`
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: parseFloat(this.selectedPlan.price),
            planId: this.selectedPlan.id,
            planName: this.selectedPlan.title,
            customerData: this.checkoutData
          })
        })

        this.debugLog('Resposta da API PIX recebida', {
          status: response.status,
          statusText: response.statusText
        })

        const result = await response.json()
        this.debugLog('Dados do PIX processados', {
          success: result.success,
          hasPixCode: !!result.pix?.pixCode,
          hasQrCode: !!result.pix?.pixCodeBase64
        })

        if (!result.success) {
          throw new Error(result.error || 'Falha ao processar pedido PIX')
        }

        // 2. Configurar dados do PIX
        this.pixCode = result.pix.pixCode
        this.pixCodeBase64 = result.pix.pixCodeBase64
        this.ticketUrl = result.pix.ticketUrl
        this.currentOrder = result.order
        this.timeRemaining = 570 // 9:30 em segundos

        this.debugLog('PIX configurado com sucesso', {
          hasPixCode: !!this.pixCode,
          hasQrCode: !!this.pixCodeBase64,
          ticketUrl: this.ticketUrl,
          timeRemaining: this.timeRemaining
        })

        // 3. Iniciar timer para verificação de pagamento
        this.startPixTimer(result.order.id)

        // 4. Notificar via WebSocket se conectado
        if (this.websocketConnected) {
          this.debugLog('Enviando notificação de PIX gerado via WebSocket')
          this.websocket.send(JSON.stringify({
            type: 'pix_generated',
            orderId: result.order.id,
            planName: this.selectedPlan.title,
            amount: parseFloat(this.selectedPlan.price)
          }))
        }

        // 5. Mostrar modal PIX
        this.showPixModal = true

        this.debugSuccess('PIX gerado com sucesso', result.pix)

        return {
          status: 'pending',
          paymentId: result.order.id,
          pixData: result.pix
        }

      } catch (error) {
        this.debugError('Erro ao processar PIX', {
          error: error.message,
          stack: error.stack
        })
        console.error('❌ Erro ao processar PIX:', error)
        throw error
      }
    },

    // Método para iniciar polling do status do pagamento
    startPaymentPolling(orderId, paymentId) {
      console.log(`🔄 Iniciando polling para pedido ${orderId}, pagamento ${paymentId}`)

      let attempts = 0
      const maxAttempts = 60 // 5 minutos (5 segundos * 60)

      const pollInterval = setInterval(async () => {
        attempts++

        try {
          const response = await this.$http.get(`/api/payment-status/pending/${orderId}`)

          if (response.data.success) {
            const { status, vipActivated, vipDetails } = response.data.data

            if (status === 'approved' && vipActivated) {
              console.log('✅ Pagamento aprovado e VIP ativado!')
              clearInterval(pollInterval)

              // Mostrar notificação de sucesso
              this.handlePaymentSuccess({
                planName: this.selectedPlan.title,
                paymentId: paymentId,
                expiresAt: vipDetails?.expiresAt || '',
                benefits: this.getDefaultPlanBenefits(this.selectedPlan.title)
              })

              // Fechar modal de pagamento
              this.closePaymentModal()

            } else if (status === 'rejected' || status === 'cancelled') {
              console.log('❌ Pagamento rejeitado ou cancelado')
              clearInterval(pollInterval)
              this.showErrorMessage('Pagamento não foi aprovado. Tente novamente.')

            } else if (attempts >= maxAttempts) {
              console.log('⏰ Timeout no polling do pagamento')
              clearInterval(pollInterval)
              this.showErrorMessage('Tempo limite excedido. Verifique o status do pagamento em alguns minutos.')
            }
          }

        } catch (error) {
          console.error('Erro no polling do pagamento:', error)

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            this.showErrorMessage('Erro ao verificar status do pagamento. Tente novamente mais tarde.')
          }
        }
      }, 5000) // Verificar a cada 5 segundos
    },

    // Método para tratar pagamento já aprovado
    async handleApprovedPayment(order) {
      await this.activateVIP(order)

      // Mostrar notificação de sucesso
      this.handlePaymentSuccess({
        planName: this.selectedPlan.title,
        paymentId: order.id,
        expiresAt: '',
        benefits: this.getDefaultPlanBenefits(this.selectedPlan.title)
      })

      // Fechar modal
      this.closePaymentModal()
    },

    validateCheckoutForm() {
      const requiredFields = [
        'firstName', 'lastName', 'email', 'cpf', 'cardNumber',
        'expiry', 'cvv', 'cardName', 'cep', 'address',
        'neighborhood', 'city', 'state'
      ]

      for (const field of requiredFields) {
        if (!this.checkoutData[field] || this.checkoutData[field].trim() === '') {
          return false
        }
      }

      // Validar formato do CPF
      const cpf = this.checkoutData.cpf.replace(/\D/g, '')
      if (cpf.length !== 11) {
        return false
      }

      // Validar formato do cartão
      const cardNumber = this.checkoutData.cardNumber.replace(/\s/g, '')
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false
      }

      // Validar formato da data de validade
      const expiry = this.checkoutData.expiry
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return false
      }

      // Validar CVV
      const cvv = this.checkoutData.cvv
      if (cvv.length < 3 || cvv.length > 4) {
        return false
      }

      return true
    },

    async createOrder() {
      const orderData = {
        userId: this.currentUser?.id || 'guest',
        planId: this.selectedPlan.id,
        planName: this.selectedPlan.title,
        planDays: this.selectedPlan.days,
        amount: parseFloat(this.selectedPlan.price),
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'credit_card',
        installments: parseInt(this.checkoutData.installments),
        customerData: {
          firstName: this.checkoutData.firstName,
          lastName: this.checkoutData.lastName,
          email: this.checkoutData.email,
          cpf: this.checkoutData.cpf.replace(/\D/g, ''),
          address: {
            cep: this.checkoutData.cep.replace(/\D/g, ''),
            street: this.checkoutData.address,
            neighborhood: this.checkoutData.neighborhood,
            city: this.checkoutData.city,
            state: this.checkoutData.state
          }
        }
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify(orderData)
        })

        if (!response.ok) {
          throw new Error('Erro ao criar pedido')
        }

        const order = await response.json()
        this.currentOrder = order
        return order

      } catch (error) {
        console.error('Erro ao criar pedido:', error)
        throw error
      }
    },

    async processMercadoPagoPayment(order) {
      try {
        // Criar token do cartão usando SDK do Mercado Pago
        const cardToken = await this.createCardToken()

        const paymentData = {
          transaction_amount: order.amount,
          description: `Plano ${order.planName}`,
          payment_method_id: 'master', // Será detectado automaticamente
          installments: order.installments,
          payer: {
            email: this.checkoutData.email,
            first_name: this.checkoutData.firstName,
            last_name: this.checkoutData.lastName,
            identification: {
              type: 'CPF',
              number: this.checkoutData.cpf.replace(/\D/g, '')
            },
            address: {
              zip_code: this.checkoutData.cep.replace(/\D/g, ''),
              street_name: this.checkoutData.address,
              street_number: '123',
              neighborhood: this.checkoutData.neighborhood,
              city: this.checkoutData.city,
              federal_unit: this.checkoutData.state
            }
          },
          // Adicionar items para melhorar índice de aprovação
          items: [{
            id: order.planId,
            title: order.planName,
            description: `Acesso VIP ao plano ${order.planName} por ${order.planDays} dias - SureStake`,
            category_id: 'services', // Categoria de serviços
            quantity: 1,
            unit_price: order.amount
          }],
          card_token: cardToken,
          external_reference: order.id,
          notification_url: `${window.location.origin}/api/webhooks/mercadopago`,
          statement_descriptor: 'SUREBET',
          // Incluir device ID para melhor segurança
          device_id: this.deviceId
        }

        // Processar pagamento via API do Mercado Pago
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.mercadopagoConfig.accessToken}`
          },
          body: JSON.stringify(paymentData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao processar pagamento')
        }

        const paymentResult = await response.json()

        // Salvar dados do pagamento no pedido
        await this.savePaymentData(order.id, paymentResult)

        return {
          status: paymentResult.status,
          paymentId: paymentResult.id,
          transactionId: paymentResult.external_reference
        }

      } catch (error) {
        console.error('Erro ao processar pagamento MP:', error)
        throw error
      }
    },

    async createCardToken() {
      return new Promise((resolve, reject) => {
        if (!window.Mercadopago) {
          reject(new Error('SDK do Mercado Pago não carregado'))
          return
        }

        const cardData = {
          cardNumber: this.checkoutData.cardNumber.replace(/\s/g, ''),
          cardholderName: this.checkoutData.cardName,
          expirationMonth: this.checkoutData.expiry.split('/')[0],
          expirationYear: '20' + this.checkoutData.expiry.split('/')[1],
          securityCode: this.checkoutData.cvv,
          // Incluir device ID para melhor segurança
          deviceId: this.deviceId
        }

        console.log('Criando token do cartão com device ID:', this.deviceId)

        window.Mercadopago.createCardToken(cardData, (status, response) => {
          if (status === 200 || status === 201) {
            console.log('Token do cartão criado com sucesso')
            resolve(response.id)
          } else {
            console.error('Erro ao criar token do cartão:', response)
            reject(new Error(response.error || 'Erro ao criar token do cartão'))
          }
        })
      })
    },

    async savePaymentData(orderId, paymentData) {
      try {
        const response = await fetch(`/api/orders/${orderId}/payment-data`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify({
            paymentId: paymentData.id,
            status: paymentData.status,
            paymentMethod: paymentData.payment_method_id,
            installments: paymentData.installments,
            transactionAmount: paymentData.transaction_amount,
            processedAt: new Date().toISOString()
          })
        })

        if (!response.ok) {
          console.error('Erro ao salvar dados do pagamento')
        }

      } catch (error) {
        console.error('Erro ao salvar dados do pagamento:', error)
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify({ status })
        })

        if (!response.ok) {
          throw new Error('Erro ao atualizar status do pedido')
        }

      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        throw error
      }
    },

    async activateVIP(order) {
      try {
        const vipData = {
          userId: order.userId,
          planId: order.planId,
          planDays: order.planDays,
          activatedAt: new Date().toISOString(),
          expiresAt: this.calculateExpiryDate(order.planDays),
          orderId: order.id
        }

        const response = await fetch('/api/users/activate-vip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify(vipData)
        })

        if (!response.ok) {
          throw new Error('Erro ao ativar VIP')
        }

        // Atualizar estado do usuário no store
        await this.$store.dispatch('refreshUserData')

      } catch (error) {
        console.error('Erro ao ativar VIP:', error)
        throw error
      }
    },

    calculateExpiryDate(days) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + days)
      return expiryDate.toISOString()
    },

    showSuccessMessage(message) {
      // Implementar notificação de sucesso
      alert(message) // Substituir por sistema de notificação real
    },

    showErrorMessage(message) {
      // Implementar notificação de erro
      alert(message) // Substituir por sistema de notificação real
    },

    cancelProcessing() {
      this.showProcessingModal = false
      this.showPaymentModal = true
    },

    cancelRedirect() {
      this.showRedirectModal = false
      this.showPaymentModal = true
    },

    // PIX modal methods (mantidos para compatibilidade)
    closePixModal() {
      this.showPixModal = false
      this.selectedPlan = null
      this.codeCopied = false
      this.stopTimer()
    },

    // Payment success methods
    handlePaymentSuccess(paymentData) {
      this.successPlanName = paymentData.planName
      this.showPaymentSuccess = true

      // Também mostrar o modal de confirmação após um pequeno delay
      setTimeout(() => {
        this.showPaymentConfirmationModal(paymentData)
      }, 2000)
    },

    closePaymentSuccess() {
      this.showPaymentSuccess = false
      this.successPlanName = ''
    },

    // Payment confirmation modal methods
    showPaymentConfirmationModal(paymentData) {
      console.log('🔍 [DEBUG] showPaymentConfirmationModal chamado com:', paymentData)

      this.confirmationPlanName = paymentData.planName
      this.confirmationPaymentId = paymentData.paymentId || ''
      this.confirmationExpiresAt = paymentData.expiresAt || ''
      this.confirmationPlanBenefits = paymentData.benefits || this.getDefaultPlanBenefits(paymentData.planName)
      this.showPaymentConfirmation = true

      console.log('🔍 [DEBUG] Modal de confirmação configurado:', {
        planName: this.confirmationPlanName,
        paymentId: this.confirmationPaymentId,
        expiresAt: this.confirmationExpiresAt,
        benefits: this.confirmationPlanBenefits,
        showPaymentConfirmation: this.showPaymentConfirmation
      })
    },

    closePaymentConfirmation() {
      this.showPaymentConfirmation = false
      this.confirmationPlanName = ''
      this.confirmationPaymentId = ''
      this.confirmationExpiresAt = ''
      this.confirmationPlanBenefits = []
    },

    getDefaultPlanBenefits(planName) {
      const benefits = {
        'Plano Básico': [
          'Acesso a surebets básicas',
          'Suporte por email',
          'Atualizações diárias'
        ],
        'Plano Premium': [
          'Acesso a todas as surebets',
          'Alertas em tempo real',
          'Suporte prioritário',
          'Análises detalhadas'
        ],
        'Plano VIP': [
          'Acesso a todas as surebets',
          'Alertas em tempo real',
          'Suporte VIP 24/7',
          'Análises exclusivas',
          'Estratégias avançadas'
        ]
      }

      return benefits[planName] || benefits['Plano VIP']
    },

    startTimer() {
      this.timeRemaining = 570
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
    this.stopTimer()
  }
}
</script>

<style scoped>
.plans-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px);
  /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px;
  /* Espaço para o sidebar fixo */
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px);
    /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    margin-left: 0;
    /* Remove margem em mobile/tablet */
    width: 100%;
    max-width: 100%;
    height: 100vh;
    overflow-x: hidden;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
  }
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 768px) {
    min-height: auto;
  }
}

/* Plans Main Content */
.plans-main {
  flex: 1;
  padding: 32px 24px;
  width: 100%;
  overflow-y: auto;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 24px 20px;
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 20px 24px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    gap: 12px;
  }
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    font-size: 28px;
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
}

/* Plans Title */
.plans-title {
  text-align: center;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    margin-bottom: 28px;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
}

.plans-title h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 8px 0;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    font-size: 32px;
  }

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
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
  scrollbar-color: var(--border-primary) transparent;
  -webkit-overflow-scrolling: touch;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    gap: 10px;
    margin-bottom: 28px;
    padding: 0 12px;
  }

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 24px;
    padding: 0 8px;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 20px;
    padding: 0 4px;
  }
}

.plan-categories::-webkit-scrollbar {
  height: 6px;
}

.plan-categories::-webkit-scrollbar-track {
  background: transparent;
}

.plan-categories::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 3px;
}

.plan-categories::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 25px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
  box-sizing: border-box;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 10px 20px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 11px;
    border-radius: 15px;
    gap: 6px;
  }
}

.category-btn:hover {
  background: var(--bg-overlay);
  border-color: var(--accent-primary);
}

.category-btn.active {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.category-btn.disabled {
  background: var(--bg-overlay);
  color: var(--text-disabled);
  border-color: var(--border-primary);
  cursor: not-allowed;
  opacity: 0.5;
}

.category-btn.disabled:hover {
  background: var(--bg-overlay);
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

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
  }
}

/* Plan Description */
.plan-description {
  text-align: center;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    margin-bottom: 32px;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    margin-bottom: 28px;
  }

  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
}

.description-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 8px 0;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    font-size: 24px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
}

.description-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
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

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
    margin-bottom: 28px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 20px;
  }
}

.plan-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    border-radius: 8px;
  }
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.plan-header {
  padding: 12px 20px;
  background: var(--bg-overlay);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.plan-duration {
  background: var(--bg-overlay);
  color: var(--text-primary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.plan-content {
  padding: 24px;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.plan-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  line-height: 1.3;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 15px;
    margin: 0 0 16px 0;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin: 0 0 12px 0;
  }
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    margin: 0 0 20px 0;
  }

  @media (max-width: 480px) {
    margin: 0 0 16px 0;
  }
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
}

.feature-item.included {
  color: var(--text-primary);
}

.feature-item:not(.included) {
  color: var(--text-disabled);
}

.feature-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 480px) {
    width: 12px;
    height: 12px;
  }
}

.feature-icon.included {
  color: var(--accent-primary);
}

.feature-icon.excluded {
  color: var(--error-color);
}

.plan-price {
  text-align: center;
  margin-bottom: 24px;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
}

.price-currency {
  font-size: 20px;
  font-weight: 600;
  color: var(--accent-primary);
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-primary);
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
}

.price-decimal {
  font-size: 20px;
  font-weight: 600;
  color: var(--accent-primary);
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
}

.buy-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 15px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
    border-radius: 5px;
    gap: 6px;
  }
}

.buy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--accent-primary-rgb), 0.3);
}

.buy-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
  }
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
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 20px 10px;
    overflow-y: auto;
  }

  @media (max-width: 480px) {
    padding: 10px 5px;
  }
}

.payment-modal,
.payment-method-modal,
.processing-modal,
.login-required-modal {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  max-width: 600px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    max-width: 95%;
    width: 95%;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    max-width: 98%;
    width: 98%;
    max-height: 95vh;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}

.pix-modal {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  max-width: 480px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    max-width: 95%;
    width: 95%;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    max-width: 98%;
    width: 98%;
    max-height: 90vh;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}

@media (max-width: 480px) {
  .pix-modal {
    max-width: 95%;
    width: 95%;
    max-height: 90vh;
  }

  .qr-code-placeholder,
  .qr-code-generated,
  .qr-code-loading {
    width: 160px;
    height: 160px;
    padding: 12px;
  }

  .qr-code {
    padding: 12px;
    margin-bottom: 12px;
  }

  .timer-section {
    margin-bottom: 12px;
    padding: 0 12px;
  }

  .qr-instructions {
    font-size: 12px;
    margin: 0 0 10px 0;
    padding: 0 12px;
  }

  .pix-code-section {
    padding: 0 12px;
    margin-bottom: 12px;
  }

  .pix-code-input {
    padding: 10px;
    font-size: 11px;
    min-height: 36px;
  }

  .copy-btn {
    padding: 10px 14px;
    font-size: 12px;
  }

  .payment-wait {
    font-size: 12px;
    margin: 0 0 12px 0;
    padding: 0 12px;
  }
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
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 20px 20px 14px 20px;
  }

  @media (max-width: 768px) {
    padding: 16px 16px 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 12px 12px 8px 12px;
  }
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  transition: color 0.3s ease;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
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
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;

  /* Responsividade para diferentes tipos de tela */
  @media (max-width: 1023px) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

/* Payment Modal Specific */
.selected-plan-info {
  margin-bottom: 32px;
}

.selected-plan {
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  font-size: 14px;
  transition: color 0.3s ease;
}

.plan-name {
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Payment Method Selection Modal */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-method-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-overlay);
}

.payment-method-option:hover {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.05);
  transform: translateY(-2px);
}

.payment-method-option:active {
  transform: translateY(0);
}

.method-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.method-info p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

.method-advantage {
  display: inline-block;
  background: rgba(var(--accent-primary-rgb), 0.1);
  color: var(--accent-primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.method-arrow {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.payment-method-option:hover .method-arrow {
  color: var(--accent-primary);
}

/* Login Required Modal Specific */
.login-required-modal {
  max-width: 500px;
  text-align: center;
}

.login-required-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.login-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  margin-bottom: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.login-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  max-width: 400px;
  transition: color 0.3s ease;
}

.login-description strong {
  color: var(--accent-primary);
}

.plan-summary {
  background: rgba(var(--accent-primary-rgb), 0.1);
  border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.plan-info .plan-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.plan-info .plan-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--bg-primary);
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(var(--accent-primary-rgb), 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(var(--accent-primary-rgb), 0.4);
  background: linear-gradient(135deg, var(--accent-hover) 0%, var(--accent-secondary) 100%);
}

.btn-primary:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(var(--accent-primary-rgb), 0.3);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.btn-primary:hover svg {
  transform: scale(1.1);
}

.btn-secondary {
  background: var(--bg-overlay);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.plan-price-display {
  text-align: center;
  margin-bottom: 32px;
  color: #198754;
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

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #198754;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  color: var(--text-secondary, #888888);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  padding: 12px;
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #198754;
  outline: none;
}

.form-input.cpf-input {
  width: 150px;
  /* Adjust as needed */
}

.form-input.card-input {
  width: 100%;
}

.form-input.expiry-input {
  width: 80px;
  /* Adjust as needed */
}

.form-input.cvv-input {
  width: 60px;
  /* Adjust as needed */
}

.form-input.cep-input {
  width: 100px;
  /* Adjust as needed */
}

.payment-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-total {
  font-size: 20px;
  font-weight: 700;
  color: #198754;
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
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
  border-color: #198754;
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
  border: 3px solid rgba(25, 135, 84, 0.3);
  border-top: 3px solid #198754;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.processing-text {
  color: var(--text-primary, #ffffff);
  margin: 0 0 24px 0;
  font-size: 16px;
}

/* PIX Modal */
.timer-section {
  text-align: right;
  margin-bottom: 16px;
  padding: 0 16px;
}

.timer-text {
  color: var(--text-primary);
  margin: 0;
  font-size: 14px;
  transition: color 0.3s ease;
}

.timer {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 16px;
  transition: color 0.3s ease;
}

.qr-code-section {
  text-align: center;
  padding: 0 16px;
}

.qr-code {
  display: inline-block;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-code-placeholder,
.qr-code-generated,
.qr-code-loading {
  width: 180px;
  height: 180px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: #ffffff;
  padding: 16px;
}

.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.qr-code-placeholder p {
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.qr-code-loading p {
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.qr-instructions {
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  font-size: 13px;
  line-height: 1.5;
  padding: 0 16px;
  transition: color 0.3s ease;
}

.pix-code-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  padding: 0 16px;
}

.pix-code-section label {
  color: var(--text-primary, #ffffff);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.pix-code-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: monospace;
  word-break: break-all;
  min-height: 40px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  width: 100%;
  margin-top: 6px;
}

.copy-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.payment-wait {
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  font-size: 13px;
  text-align: center;
  padding: 0 16px;
  transition: color 0.3s ease;
}

.secondary-btn {
  background: var(--bg-overlay);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.submit-payment-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #198754 0%, #146c43 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.submit-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(25, 135, 84, 0.3);
}

.submit-payment-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, #888888);
  border-color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  opacity: 0.7;
}

.submit-payment-btn .loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Redirect Modal Styles */
.redirect-modal {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-radius: 16px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  animation: slideInUp 0.4s ease-out;
  transition: background-color 0.3s ease, border-color 0.3s ease;
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
  background: #198754;
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
  color: var(--accent-primary);
  margin: 0 0 12px 0;
  animation: textGlow 2s ease-in-out infinite alternate;
}

.redirect-text p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.5;
  transition: color 0.3s ease;
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
  background: rgba(var(--accent-primary-rgb), 0.1);
  border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
  border-radius: 8px;
  color: var(--accent-primary);
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.security-item svg {
  flex-shrink: 0;
}

.cancel-redirect-btn {
  background: var(--bg-overlay);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.cancel-redirect-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* Animations */
@keyframes logoGlow {
  0% {
    filter: drop-shadow(0 0 10px rgba(25, 135, 84, 0.3));
  }

  100% {
    filter: drop-shadow(0 0 20px rgba(25, 135, 84, 0.6));
  }
}

@keyframes dotPulse {

  0%,
  80%,
  100% {
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
    text-shadow: 0 0 10px rgba(25, 135, 84, 0.3);
  }

  100% {
    text-shadow: 0 0 20px rgba(25, 135, 84, 0.6);
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
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.plans-footer p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

/* Media queries para telas muito grandes */
@media (min-width: 1400px) {
  .plans-main {
    padding: 40px 32px;
  }

  .content-header {
    padding: 32px 40px;
  }

  .plans-title {
    margin-bottom: 40px;
  }

  .plans-title h1 {
    font-size: 40px;
  }

  .plan-categories {
    gap: 16px;
    margin-bottom: 40px;
  }

  .plan-description {
    margin-bottom: 48px;
  }

  .description-title {
    font-size: 32px;
  }

  .plans-grid {
    gap: 32px;
    margin-bottom: 48px;
  }

  .plan-content {
    padding: 32px;
  }
}

/* Media queries para tablets em landscape */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .plan-categories {
    justify-content: center;
  }
}

/* Media queries para tablets em portrait */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-categories {
    justify-content: flex-start;
  }
}

/* Media queries para telas médias */
@media (min-width: 1200px) and (max-width: 1399px) {
  .plans-main {
    padding: 32px 24px;
  }

  .content-header {
    padding: 24px 32px;
  }

  .plans-title h1 {
    font-size: 36px;
  }

  .plan-categories {
    gap: 14px;
  }

  .description-title {
    font-size: 28px;
  }

  .plans-grid {
    gap: 24px;
  }

  .plan-content {
    padding: 28px;
  }
}

/* Media queries para laptops */
@media (min-width: 1024px) and (max-width: 1199px) {
  .plans-main {
    padding: 28px 20px;
  }

  .content-header {
    padding: 20px 28px;
  }

  .plans-title h1 {
    font-size: 32px;
  }

  .plan-categories {
    gap: 12px;
  }

  .description-title {
    font-size: 26px;
  }

  .plans-grid {
    gap: 20px;
  }

  .plan-content {
    padding: 24px;
  }
}

/* Responsividade */
@media (max-width: 1023px) {
  .plans-container {
    margin-left: 0;
    /* Remove margem em mobile/tablet */
  }
}

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

  /* Checkout responsivo */
  .payment-modal {
    max-width: 95%;
    width: 95%;
    margin: 20px;
  }

  /* Login Required Modal responsivo */
  .login-required-modal {
    max-width: 95%;
    width: 95%;
    margin: 20px;
  }

  .login-required-content {
    gap: 20px;
  }

  .login-icon {
    width: 60px;
    height: 60px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-description {
    font-size: 14px;
  }

  .plan-summary {
    padding: 16px;
  }

  .login-actions {
    max-width: 100%;
  }

  .btn-primary {
    padding: 14px 20px;
    font-size: 15px;
  }

  .btn-primary svg {
    width: 18px;
    height: 18px;
  }

  .form-section {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .payment-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .summary-total {
    width: 100%;
    justify-content: space-between;
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

  /* Checkout mobile */
  .payment-modal {
    max-width: 98%;
    width: 98%;
    margin: 10px;
  }

  .modal-header {
    padding: 16px 16px 12px 16px;
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-section {
    padding: 12px;
  }

  .form-input {
    padding: 10px;
    font-size: 13px;
  }

  .submit-payment-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .btn-primary {
    padding: 12px 18px;
    font-size: 14px;
    border-radius: 10px;
  }

  .btn-primary svg {
    width: 16px;
    height: 16px;
  }

  .selected-plan-info {
    margin-bottom: 24px;
  }

  .plan-name {
    font-size: 16px;
  }

  .plan-price-display .price-value {
    font-size: 28px;
  }

  /* Melhorias adicionais para mobile pequeno */
  .content-header {
    padding: 16px 20px;
  }

  .plans-title p {
    font-size: 14px;
  }

  .plan-categories {
    margin-bottom: 20px;
  }

  .plan-description {
    margin-bottom: 24px;
  }

  .description-text {
    font-size: 14px;
  }

  .plans-grid {
    gap: 12px;
    margin-bottom: 24px;
  }

  .plan-title {
    font-size: 18px;
  }

  .plan-features {
    gap: 8px;
  }

  .feature-item {
    font-size: 12px;
  }

  .feature-icon {
    width: 12px;
    height: 12px;
  }

  .plan-price {
    margin: 16px 0;
  }

  .price-currency {
    font-size: 14px;
  }

  .price-value {
    font-size: 24px;
  }

  .price-decimal {
    font-size: 16px;
  }

  .buy-button {
    padding: 10px 16px;
    font-size: 12px;
  }

  .buy-icon {
    width: 14px;
    height: 14px;
  }

  .modal-overlay {
    padding: 16px;
  }

  .payment-modal,
  .payment-method-modal,
  .processing-modal,
  .login-required-modal,
  .pix-modal {
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

  .selected-plan-info {
    padding: 12px;
  }

  .plan-info-title {
    font-size: 14px;
  }

  .plan-info-price {
    font-size: 16px;
  }
}

/* WebSocket Status */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.websocket-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.websocket-status.connected {
  color: #28a745;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
  transition: background-color 0.3s ease;
}

.websocket-status.connected .status-dot {
  background: #28a745;
}
</style>
