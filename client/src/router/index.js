import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import SurebetsView from "../views/SurebetsView.vue";
import ReportsView from "../views/ReportsView.vue";
import SettingsView from "../views/SettingsView.vue";
import LoginView from "../views/LoginView.vue";
import AdminView from "../views/AdminView.vue";
import PlansView from "../views/PlansView.vue";
import ReferralsView from "../views/ReferralsView.vue";
import SupportView from "../views/SupportView.vue";
import CompoundInterestView from "../views/CompoundInterestView.vue";
import RankingView from "../views/RankingView.vue";
import BookmakerAccountsView from "../views/BookmakerAccountsView.vue";
import SurebetReportsView from "../views/SurebetReportsView.vue";
import SurebetsGuideView from "../views/SurebetsGuideView.vue";
import GuiaApostasView from "../views/GuiaApostasView.vue";
import GlossaryView from "../views/GlossaryView.vue";
import ProfileView from "../views/ProfileView.vue";
import VIPAdminView from "../views/VIPAdminView.vue";
import MonitoringView from "../views/MonitoringView.vue";
import PaymentConfirmation from "../views/PaymentConfirmation.vue";
import {
  requireAuth,
  requireGuest,
  requireAdmin,
  checkAuthStatus,
} from "./guards";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    name: "surebets",
    component: SurebetsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    name: "reports",
    component: ReportsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/monitoring",
    name: "monitoring",
    component: MonitoringView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/plans",
    name: "plans",
    component: PlansView,
  },
  {
    path: "/referrals",
    name: "referrals",
    component: ReferralsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/support",
    name: "support",
    component: SupportView,
    meta: { requiresAuth: true },
  },
  {
    path: "/compound-interest",
    name: "compound-interest",
    component: CompoundInterestView,
    meta: { requiresAuth: true },
  },
  {
    path: "/ranking",
    name: "ranking",
    component: RankingView,
    meta: { requiresAuth: true },
  },
  {
    path: "/bookmaker-accounts",
    name: "bookmaker-accounts",
    component: BookmakerAccountsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/surebet-reports",
    name: "surebet-reports",
    component: SurebetReportsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/guide",
    name: "guide",
    component: SurebetsGuideView,
    meta: { requiresAuth: true },
  },
  {
    path: "/guia-apostas",
    name: "guia-apostas",
    component: GuiaApostasView,
    meta: { requiresAuth: true },
  },
  {
    path: "/glossary",
    name: "glossary",
    component: GlossaryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/vip-admin",
    name: "vip-admin",
    component: VIPAdminView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/payment-confirmation",
    name: "payment-confirmation",
    component: PaymentConfirmation,
    meta: { requiresAuth: true },
  },
  // Rota catch-all para páginas não encontradas
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Guard global para todas as rotas
router.beforeEach((to, from, next) => {
  console.log(`🔄 Navegação: ${from.path} → ${to.path}`);

  // 🔄 Iniciar loader para transições de página
  if (from.path !== to.path) {
    store.dispatch("showLoader");
  }

  // Verifica se a rota requer guest (não autenticado)
  if (to.meta.requiresGuest && store.getters.isAuthenticated) {
    console.log("🔄 Usuário já autenticado, redirecionando...");
    console.log("🔄 Usuário admin?", store.getters.isAdmin);
    console.log("🔄 Usuário atual:", store.getters.currentUser);

    // Redirecionar para página inicial se já estiver logado
    next("/");
    return;
  }

  // Verifica se a rota requer autenticação
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    console.log("🚫 Rota protegida acessada sem autenticação:", to.path);
    localStorage.setItem("redirectAfterLogin", to.fullPath);
    next("/login");
    return;
  }

  // Verificação de VIP removida - agora apenas autenticação

  // Verifica se a rota requer admin
  if (
    to.meta.requiresAdmin &&
    (!store.getters.isAuthenticated || !store.getters.isAdmin)
  ) {
    console.log("🚫 Rota admin acessada sem permissão:", to.path);
    next("/plans");
    return;
  }

  next();
});

// Guard para parar o loader após a navegação
router.afterEach((to, from) => {
  // 🔄 Parar loader após a navegação ser concluída
  if (from.path !== to.path) {
    // Pequeno delay para garantir que a página foi carregada
    setTimeout(() => {
      store.dispatch("hideLoader");
    }, 100);
  }
});

// Verifica o status de autenticação ao carregar a aplicação
checkAuthStatus();

export default router;
