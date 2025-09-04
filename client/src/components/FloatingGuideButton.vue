<template>
  <div>
    <!-- Botão Flutuante do Guia Interativo -->
    <div class="floating-guide-btn" @click="openGuideModal">
      <div class="icon-container">
        <i class="bi bi-journal-text guide-icon"></i>
      </div>
      <!-- Texto removido para manter apenas o ícone -->
    </div>

    <!-- Modal do Guia Interativo -->
    <div v-if="showGuideModal" class="guide-modal-overlay" @click="closeGuideModal">
      <div class="guide-modal" :class="{ 'modal-open': showGuideModal }" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <svg class="modal-icon" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              {{ currentTip.title }}
            </h2>
            <button class="close-btn" @click="closeGuideModal">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="tip-description">{{ currentTip.description }}</p>
            
            <div v-if="currentTip.highlight" class="highlight-section">
              <h4>💡 Destaque:</h4>
              <div class="highlight-content">
                <a 
                  v-if="currentTip.highlight.type === 'link'" 
                  :href="currentTip.highlight.target" 
                  class="highlight-link"
                  @click="scrollToSection(currentTip.highlight.target)"
                >
                  {{ currentTip.highlight.text }}
                </a>
                <span v-else class="highlight-text">{{ currentTip.highlight.text }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="tip-progress">
              <span class="progress-text">{{ currentTipIndex + 1 }} de {{ guideTips.length }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button 
                v-if="currentTipIndex > 0" 
                class="action-btn secondary" 
                @click="previousTip"
              >
                ← Anterior
              </button>
              <button 
                v-if="currentTipIndex < guideTips.length - 1" 
                class="action-btn primary" 
                @click="nextTip"
              >
                Próxima Dica →
              </button>
              <button 
                v-else 
                class="action-btn primary" 
                @click="closeGuideModal"
              >
                Finalizar Guia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatingGuideButton',
  data() {
    return {
      showGuideModal: false,
      currentTipIndex: 0,
      guideTips: [
        {
          title: "Bem-vindo ao Guia de Surebets!",
          description: "Uma Surebet é uma situação onde você pode apostar em todos os resultados possíveis de um evento esportivo e ainda assim ter lucro garantido, independentemente do resultado final. É uma estratégia matemática válida para lucrar com apostas esportivas.",
          highlight: {
            type: 'link',
            text: "Ver seção 'O que é'",
            target: "/guide#o-que-e"
          }
        },
        {
          title: "Como Funciona a Arbitragem?",
          description: "A arbitragem funciona explorando diferenças nas odds oferecidas por diferentes casas de apostas para o mesmo evento. Você encontra oportunidades onde a soma das probabilidades (1/odds) é menor que 1.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Como Funciona'",
            target: "/guide#como-funciona"
          }
        },
        {
          title: "Tipos de Surebets",
          description: "Existem diferentes tipos de surebets: 2-way (casa/fora), 3-way (casa/empate/fora) e Middle (Meio). 2-way são as mais comuns e oferecem ROI geralmente mais alto.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Tipos'",
            target: "/guide#tipos"
          }
        },
        {
          title: "Cálculos e Fórmulas",
          description: "A fórmula básica de arbitragem é Σ(1/odds) < 1. O lucro é (1 / Σ(1/odds)) - 1. Por exemplo, se você investir R$ 1000 e lucrar R$ 50, o ROI é 5%.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Cálculos'",
            target: "/guide#calculos"
          }
        },
        {
          title: "Estratégias de Arbitragem",
          description: "Existem duas abordagens principais: estratégia conservadora (ROI baixo mas seguro) e agressiva (ROI alto mas com mais risco). A diversificação é uma boa prática.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Estratégias'",
            target: "/guide#estrategias"
          }
        },
        {
          title: "Riscos e Desafios",
          description: "Os principais riscos incluem timing, limites de apostas, contas bloqueadas e erros de cálculo. Para evitar limitações, use múltiplas casas de apostas e valores variados.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Riscos'",
            target: "/guide#riscos"
          }
        },
        {
          title: "Ferramentas e Recursos",
          description: "Calculadoras automáticas, sistema automatizado, software de monitoramento e gestão de capital são recursos essenciais para o sucesso na arbitragem.",
          highlight: {
            type: 'link',
            text: "Ver seção 'Ferramentas'",
            target: "/guide#ferramentas"
          }
        },
        {
          title: "Pronto para Começar?",
          description: "Agora que você entende como funcionam as surebets, deixe nosso sistema inteligente fazer todo o trabalho pesado por você! Clique no link abaixo para ver o ranking de usuários.",
          highlight: {
            type: 'link',
            text: "Ver Ranking de Usuários",
            target: "/ranking"
          }
        },
        {
          title: "Guia Completo de Surebets",
          description: "Quer aprender mais detalhadamente sobre arbitragem esportiva? Acesse nosso guia completo com explicações detalhadas, exemplos práticos e estratégias avançadas.",
          highlight: {
            type: 'link',
            text: "Ver Guia Completo",
            target: "/guide"
          }
        }
      ]
    }
  },
  computed: {
    currentTip() {
      return this.guideTips[this.currentTipIndex];
    },
    progressPercentage() {
      return (this.currentTipIndex / this.guideTips.length) * 100;
    }
  },
  methods: {
    openGuideModal() {
      this.showGuideModal = true;
      this.currentTipIndex = 0; // Resetar para a primeira dica
    },

    closeGuideModal() {
      this.showGuideModal = false;
    },

    nextTip() {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.guideTips.length;
    },

    previousTip() {
      this.currentTipIndex = (this.currentTipIndex - 1 + this.guideTips.length) % this.guideTips.length;
    },

    scrollToSection(targetId) {
      if (targetId.startsWith('#')) {
        // Navegação interna na página
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          this.closeGuideModal();
        }
      } else if (targetId.includes('#')) {
        // Navegação para outra página com âncora
        const [path, hash] = targetId.split('#');
        this.$router.push(path).then(() => {
          // Aguarda um momento para a página carregar
          this.$nextTick(() => {
            setTimeout(() => {
              const targetElement = document.querySelector(`#${hash}`);
              if (targetElement) {
                targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 100);
          });
        });
        this.closeGuideModal();
      } else {
        // Navegação para outra página
        this.$router.push(targetId);
        this.closeGuideModal();
      }
    }
  }
}
</script>

<style scoped>
/* Botão Flutuante do Guia Interativo */
.floating-guide-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  z-index: 1000;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0.9;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.floating-guide-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 255, 136, 0.4);
  opacity: 1;
}

.icon-container {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-icon {
  color: #1a1a1a;
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.floating-guide-btn:hover .guide-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.4));
}

.btn-text {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
}

.floating-guide-btn:hover .btn-text {
  opacity: 1;
}

/* Modal do Guia Interativo */
.guide-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.guide-modal {
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.5s ease-out;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.guide-modal.modal-open {
  transform: translateY(0);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00ff88;
  font-size: 24px;
  font-weight: 700;
}

.modal-icon {
  color: #00ff88;
  width: 28px;
  height: 28px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #ffffff;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff4444;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  color: #cccccc;
  font-size: 16px;
  line-height: 1.6;
}

.tip-description {
  margin-bottom: 15px;
}

.highlight-section {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.highlight-section h4 {
  color: #00ff88;
  margin: 0 0 10px 0;
  font-size: 18px;
}

.highlight-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-link {
  color: #00cc6a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.highlight-link:hover {
  color: #00ff88;
}

.highlight-text {
  color: #cccccc;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.tip-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cccccc;
  font-size: 14px;
}

.progress-text {
  font-weight: 500;
}

.progress-bar {
  width: 150px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Animações adicionais para o efeito "gênio saindo da lâmpada" */
@keyframes modal-enter {
  0% {
    transform: scale(0.1) translateY(100vh);
    opacity: 0;
  }
  50% {
    transform: scale(0.8) translateY(20vh);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.guide-modal.modal-open {
  animation: modal-enter 0.6s ease-out forwards;
}

/* Efeito de brilho no botão flutuante */
.floating-guide-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ff88, #00cc6a, #00ff88);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: pulse-glow 2s infinite;
}

.floating-guide-btn:hover::before {
  opacity: 0.3;
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .floating-guide-btn {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
  }

  .icon-container {
    width: 32px;
    height: 32px;
  }

  .btn-text {
    display: none;
  }

  .guide-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-icon {
    width: 24px;
    height: 24px;
  }

  .modal-body {
    font-size: 14px;
  }

  .tip-progress {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .progress-bar {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
