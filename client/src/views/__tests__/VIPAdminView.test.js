import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import VIPAdminView from '../VIPAdminView.vue';

// Mock do axios
vi.mock('@/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock dos componentes
vi.mock('@/components/Sidebar.vue', () => ({
  default: {
    name: 'Sidebar',
    template: '<div class="sidebar">Sidebar</div>'
  }
}));

vi.mock('@/components/Header.vue', () => ({
  default: {
    name: 'Header',
    template: '<div class="header">Header</div>'
  }
}));

vi.mock('@/components/RouteGuard.vue', () => ({
  default: {
    name: 'RouteGuard',
    template: '<div class="route-guard"><slot /></div>'
  }
}));

// Mock dos ícones
vi.mock('lucide-vue-next', () => ({
  Crown: { name: 'Crown', template: '<div class="icon-crown"></div>' },
  RefreshCw: { name: 'RefreshCw', template: '<div class="icon-refresh"></div>' },
  Plus: { name: 'Plus', template: '<div class="icon-plus"></div>' },
  Clock: { name: 'Clock', template: '<div class="icon-clock"></div>' },
  AlertTriangle: { name: 'AlertTriangle', template: '<div class="icon-alert"></div>' },
  DollarSign: { name: 'DollarSign', template: '<div class="icon-dollar"></div>' },
  History: { name: 'History', template: '<div class="icon-history"></div>' },
  Settings: { name: 'Settings', template: '<div class="icon-settings"></div>' },
  BarChart3: { name: 'BarChart3', template: '<div class="icon-chart"></div>' },
  User: { name: 'User', template: '<div class="icon-user"></div>' },
  X: { name: 'X', template: '<div class="icon-x"></div>' },
  Bell: { name: 'Bell', template: '<div class="icon-bell"></div>' },
  Play: { name: 'Play', template: '<div class="icon-play"></div>' },
  Square: { name: 'Square', template: '<div class="icon-square"></div>' },
  FileText: { name: 'FileText', template: '<div class="icon-file"></div>' }
}));

describe('VIPAdminView', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    // Criar store mock
    store = createStore({
      state: {
        auth: {
          token: 'mock-token',
          user: {
            id: 1,
            email: 'admin@test.com',
            first_name: 'Admin',
            last_name: 'User',
            is_admin: true,
            role: 'admin'
          }
        },
        plans: {
          plans: [
            { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30 },
            { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30 }
          ],
          plansLoaded: true
        }
      },
      getters: {
        authToken: () => 'mock-token',
        currentUser: (state) => state.auth.user,
        isAdmin: () => true,
        isAuthenticated: () => true,
        allPlans: (state) => state.plans.plans,
        plansLoaded: (state) => state.plans.plansLoaded,
        getPlanByType: (state) => (type) => state.plans.plans.find(p => p.type === type),
        getPlanByDisplayName: (state) => (name) => state.plans.plans.find(p => p.display_name === name),
        getPlanDisplayName: (state) => (type) => {
          const plan = state.plans.plans.find(p => p.type === type);
          return plan ? plan.display_name : type;
        }
      },
      actions: {
        setPlans: vi.fn(),
        loadPlansIfNeeded: vi.fn()
      }
    });

    // Mock do axios
    const axios = require('@/utils/axios').default;
    axios.get.mockResolvedValue({
      data: {
        success: true,
        plans: [
          { id: 1, name: 'basic', display_name: 'Plano Básico', type: 'basic', category: 'Básicos', price: 29.90, duration_days: 30 },
          { id: 2, name: 'premium', display_name: 'Plano Premium', type: 'premium', category: 'Básicos', price: 49.90, duration_days: 30 }
        ]
      }
    });

    // Montar componente
    wrapper = mount(VIPAdminView, {
      global: {
        plugins: [store],
        stubs: {
          'router-link': true,
          'router-view': true
        }
      }
    });
  });

  describe('Renderização', () => {
    it('deve renderizar o componente corretamente', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.vip-admin-page').exists()).toBe(true);
    });

    it('deve exibir o título da página', () => {
      expect(wrapper.find('.page-header h1').text()).toContain('Administração VIP');
    });

    it('deve exibir as tabs de navegação', () => {
      expect(wrapper.find('.tabs-nav').exists()).toBe(true);
      expect(wrapper.findAll('.tab-btn')).toHaveLength(5);
    });

    it('deve exibir o botão de ativar VIP', () => {
      expect(wrapper.find('.btn-primary').text()).toContain('Ativar VIP');
    });
  });

  describe('Funcionalidades de Planos', () => {
    it('deve carregar planos do store', () => {
      expect(wrapper.vm.plans).toHaveLength(2);
      expect(wrapper.vm.plans[0].name).toBe('basic');
      expect(wrapper.vm.plans[1].name).toBe('premium');
    });

    it('deve agrupar planos por categoria', () => {
      const groupedPlans = wrapper.vm.groupedPlans;
      expect(groupedPlans).toHaveProperty('Básicos');
      expect(groupedPlans['Básicos']).toHaveLength(2);
    });

    it('deve obter ID do plano por tipo', () => {
      const planId = wrapper.vm.getPlanId('premium');
      expect(planId).toBe(2);
    });

    it('deve obter nome de exibição do plano por tipo', () => {
      const displayName = wrapper.vm.getPlanDisplayName('premium');
      expect(displayName).toBe('Plano Premium');
    });

    it('deve obter tipo do plano por nome de exibição', () => {
      const planType = wrapper.vm.getPlanTypeFromName('Plano Premium');
      expect(planType).toBe('premium');
    });
  });

  describe('Formulários', () => {
    it('deve validar formulário de ativação', () => {
      expect(wrapper.vm.canActivateVIP).toBe(false);
      
      wrapper.vm.activateForm.userId = '1';
      wrapper.vm.activateForm.planType = 'premium';
      wrapper.vm.activateForm.duration = 30;
      wrapper.vm.activateForm.amount = 49.90;
      
      expect(wrapper.vm.canActivateVIP).toBe(true);
    });

    it('deve validar formulário de edição', () => {
      expect(wrapper.vm.canUpdateVIP).toBe(false);
      
      wrapper.vm.editForm.duration = 30;
      wrapper.vm.editForm.amount = 49.90;
      wrapper.vm.editForm.planType = 'premium';
      
      expect(wrapper.vm.canUpdateVIP).toBe(true);
    });
  });

  describe('Filtros e Busca', () => {
    it('deve filtrar VIPs ativos por busca', () => {
      wrapper.vm.searchTerm = 'João';
      wrapper.vm.activeVIPs = [
        {
          id: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium'
        },
        {
          id: 2,
          user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          planName: 'VIP'
        }
      ];
      
      const filtered = wrapper.vm.filteredActiveVIPs;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].user.first_name).toBe('João');
    });

    it('deve filtrar VIPs ativos por plano', () => {
      wrapper.vm.planFilter = 'Premium';
      wrapper.vm.activeVIPs = [
        {
          id: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium'
        },
        {
          id: 2,
          user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          planName: 'VIP'
        }
      ];
      
      const filtered = wrapper.vm.filteredActiveVIPs;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].planName).toBe('Premium');
    });

    it('deve filtrar VIPs ativos por status', () => {
      wrapper.vm.statusFilter = 'active';
      wrapper.vm.activeVIPs = [
        {
          id: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium',
          dataFim: '2024-12-31'
        },
        {
          id: 2,
          user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          planName: 'VIP',
          dataFim: '2024-01-01'
        }
      ];
      
      const filtered = wrapper.vm.filteredActiveVIPs;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].user.first_name).toBe('João');
    });
  });

  describe('Utilitários', () => {
    it('deve formatar data corretamente', () => {
      const date = '2024-01-15';
      const formatted = wrapper.vm.formatDate(date);
      expect(formatted).toBe('15/01/2024');
    });

    it('deve formatar moeda corretamente', () => {
      const value = 1234.56;
      const formatted = wrapper.vm.formatCurrency(value);
      expect(formatted).toBe('1234.56');
    });

    it('deve calcular dias restantes corretamente', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const daysRemaining = wrapper.vm.getDaysRemaining(futureDate.toISOString());
      expect(daysRemaining).toBe(10);
    });

    it('deve obter classe de status corretamente', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const status = wrapper.vm.getVIPStatus(futureDate.toISOString());
      expect(status.status).toBe('active');
      expect(status.label).toBe('Ativo');
      expect(status.class).toBe('active');
    });

    it('deve obter classe de dias restantes corretamente', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      const className = wrapper.vm.getDaysRemainingClass(futureDate.toISOString());
      expect(className).toBe('urgent');
    });
  });

  describe('Modais', () => {
    it('deve abrir modal de ativação', () => {
      wrapper.vm.showActivateModal = true;
      expect(wrapper.vm.showActivateModal).toBe(true);
    });

    it('deve fechar modal de ativação', () => {
      wrapper.vm.showActivateModal = true;
      wrapper.vm.showActivateModal = false;
      expect(wrapper.vm.showActivateModal).toBe(false);
    });

    it('deve abrir modal de edição', () => {
      wrapper.vm.showEditModal = true;
      expect(wrapper.vm.showEditModal).toBe(true);
    });

    it('deve fechar modal de edição', () => {
      wrapper.vm.showEditModal = true;
      wrapper.vm.showEditModal = false;
      expect(wrapper.vm.showEditModal).toBe(false);
    });
  });

  describe('Ações de VIP', () => {
    it('deve editar VIP', () => {
      const vip = {
        id: 1,
        userId: 1,
        user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
        planName: 'Premium',
        planDays: 30,
        amount: 49.90,
        autoRenew: false,
        notes: 'Teste'
      };
      
      wrapper.vm.editVIP(vip);
      
      expect(wrapper.vm.editForm.id).toBe(1);
      expect(wrapper.vm.editForm.userId).toBe(1);
      expect(wrapper.vm.editForm.planType).toBe('premium');
      expect(wrapper.vm.editForm.duration).toBe(30);
      expect(wrapper.vm.editForm.amount).toBe(49.90);
      expect(wrapper.vm.showEditModal).toBe(true);
    });

    it('deve verificar VIP existente', () => {
      wrapper.vm.activeVIPs = [
        {
          id: 1,
          userId: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium',
          dataFim: '2024-12-31',
          amount: 49.90,
          autoRenew: false,
          notes: 'Teste'
        }
      ];
      
      wrapper.vm.activateForm.userId = '1';
      wrapper.vm.checkExistingVIP();
      
      expect(wrapper.vm.existingVIPInfo).toBeTruthy();
      expect(wrapper.vm.existingVIPInfo.planName).toBe('Premium');
    });
  });

  describe('Filtros de Histórico', () => {
    it('deve filtrar histórico por busca', () => {
      wrapper.vm.historySearchTerm = 'João';
      wrapper.vm.vipHistory = [
        {
          id: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium'
        },
        {
          id: 2,
          user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          planName: 'VIP'
        }
      ];
      
      const filtered = wrapper.vm.filteredVIPHistory;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].user.first_name).toBe('João');
    });

    it('deve filtrar histórico por período', () => {
      wrapper.vm.dateRangeFilter = 'month';
      wrapper.vm.vipHistory = [
        {
          id: 1,
          user: { first_name: 'João', last_name: 'Silva', email: 'joao@test.com' },
          planName: 'Premium',
          dataFim: '2024-01-15'
        },
        {
          id: 2,
          user: { first_name: 'Maria', last_name: 'Santos', email: 'maria@test.com' },
          planName: 'VIP',
          dataFim: '2023-12-15'
        }
      ];
      
      const filtered = wrapper.vm.filteredVIPHistory;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].user.first_name).toBe('João');
    });
  });

  describe('Relatórios', () => {
    it('deve verificar se há dados de relatórios', () => {
      wrapper.vm.reports = {
        revenue: { summary: { totalRevenue: 1000 } },
        conversion: { metrics: { conversionRate: 10 } },
        retention: { metrics: { retentionRate: 80 } },
        plans: [{ planId: 1, planName: 'Premium', activations: 5 }]
      };
      
      expect(wrapper.vm.hasReportsData).toBe(true);
    });

    it('deve formatar porcentagem corretamente', () => {
      const percentage = wrapper.vm.formatPercentage(15.5);
      expect(percentage).toBe('15.50');
    });

    it('deve formatar última geração de relatório', () => {
      wrapper.vm.reports = {
        revenue: { generatedAt: '2024-01-20T10:00:00Z' }
      };
      
      const formatted = wrapper.vm.formatLastGenerated();
      expect(formatted).toContain('20/01/2024');
    });
  });

  describe('Cron Jobs', () => {
    it('deve formatar data de cron corretamente', () => {
      const date = '2024-01-20T10:00:00Z';
      const formatted = wrapper.vm.formatCronDate(date);
      expect(formatted).toContain('20/01/2024');
    });

    it('deve lidar com data inválida de cron', () => {
      const formatted = wrapper.vm.formatCronDate('invalid-date');
      expect(formatted).toBe('Data inválida');
    });
  });
});
