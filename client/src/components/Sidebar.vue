<template>
  <aside class="sidebar" :class="{ collapsed: shouldBeCollapsed }">
    <!-- Logo e Header -->
    <div class="sidebar-header">
      <div class="logo">
        <svg class="logo-icon" v-show="!shouldBeCollapsed" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
          <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
        </svg>
        <h1 v-show="!shouldBeCollapsed">SureStake</h1>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
    </div>

    <!-- Perfil do Usuário -->
    <div class="user-profile">
      <div class="user-info">
        <div class="user-avatar">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
          </svg>
        </div>
        <div class="user-details" v-show="!shouldBeCollapsed">
          <p class="user-greeting">Olá, {{ currentUser?.name || 'Usuário' }}</p>
          <div class="user-status"> 
            <span class="status-dot"></span>
            <span class="status-text">Online</span>
          </div>
        </div>
      </div>
      
      <!-- Status da Conta Compacto -->
      <CreditStatus :compact="true" v-show="!shouldBeCollapsed" />
      
      <!-- Ícones de Administração e Configurações -->
      <div class="admin-icons" v-show="!shouldBeCollapsed">
        <!-- Configurações -->
        <router-link to="/settings" class="admin-icon-link" title="Configurações">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
        </router-link>
        
                                  <!-- Administração (só para admins) -->
                          <router-link v-if="isAdmin" to="/admin" class="admin-icon-link" title="Administração">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                            </svg>
                          </router-link>
      </div>
    </div>

    <!-- Menu de Navegação -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Dashboard/Surebets sempre em primeiro -->
        <li class="nav-item" :class="{ active: $route.path === '/' }">
          <div class="nav-link" :class="{ 'locked': !hasCredits }" @click="handleDashboardClick" :title="shouldBeCollapsed ? 'Surebets' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2zM9 3v1h2V3H9z"/>
              <path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-.5-.5h-1v.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 7.5v6z"/>
              <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v4A1.5 1.5 0 0 0 1.5 9h11A1.5 1.5 0 0 0 14 7.5v-4A1.5 1.5 0 0 0 12.5 2h-11zm0 1h11a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5z"/>
              <path d="M8.5 5a.5.5 0 0 0-1 0v1H6a.5.5 0 0 0 0 1h1.5v1a.5.5 0 0 0 1 0V7H10a.5.5 0 0 0 0-1H8.5V5z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Surebets</span>
            <svg v-if="!hasCredits" class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
            </svg>
          </div>
        </li>

        <!-- Juros Compostos -->
        <li class="nav-item" :class="{ active: $route.path === '/compound-interest' }">
          <div class="nav-link" :class="{ 'locked': !hasCredits }" @click="handleCompoundInterestClick" :title="shouldBeCollapsed ? 'Juros Compostos' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1z"/>
              <path d="M3.5 5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1z"/>
              <path d="M3.5 8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1z"/>
              <path d="M3.5 11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1z"/>
              <path d="M3.5 14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Juros Compostos</span>
            <svg v-if="!hasCredits" class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
            </svg>
          </div>
        </li>

        <!-- Indicações -->
        <li class="nav-item" :class="{ active: $route.path === '/referrals' }">
          <router-link to="/referrals" class="nav-link" :title="shouldBeCollapsed ? 'Indicações' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Indicações</span>
          </router-link>
        </li>

        <!-- Planos -->
        <li class="nav-item" :class="{ active: $route.path === '/plans' }">
          <router-link to="/plans" class="nav-link" :title="shouldBeCollapsed ? 'Planos' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.75 0a.75.75 0 0 0-.75.75V4c0 .414.336.75.75.75h.75v4a.75.75 0 0 0 1.5 0V4.75h1.5v4a.75.75 0 0 0 1.5 0V4.75H9V4a.75.75 0 0 0-.75-.75h-4.5ZM9 3V1.5a.75.75 0 0 0-1.5 0V3h1.5Z"/>
              <path d="M2.5 6a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11Zm0 1h11v6h-11v-6Z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Planos</span>
          </router-link>
        </li>

        <!-- Relatórios -->
        <li class="nav-item" :class="{ active: $route.path === '/reports' }">
          <div class="nav-link" @click="handleReportsClick" :title="shouldBeCollapsed ? 'Relatórios' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Relatórios</span>
          </div>
        </li>

        <!-- Ranking -->
        <li class="nav-item" :class="{ active: $route.path === '/ranking' }">
          <router-link to="/ranking" class="nav-link" :title="shouldBeCollapsed ? 'Ranking' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.792l4.79 4.792A7 7 0 0 0 7.5 1.018zm0 1.96l3.976 3.976a5.5 5.5 0 1 1-7.952 0L7.5 2.978z"/>
              <path d="M6.94 7.146a.5.5 0 0 1 .12-.223l2.5-2.5a.5.5 0 0 1 .707.707L8.061 7.39l-.353.353-.354-.354L5.147 5.183a.5.5 0 0 1 .708-.707l2.206 2.207-1.06 1.06z"/>
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Ranking</span>
          </router-link>
        </li>

        <!-- Contas de Casas de Apostas -->
        <li class="nav-item" :class="{ active: $route.path === '/bookmaker-accounts' }">
          <router-link to="/bookmaker-accounts" class="nav-link" :title="shouldBeCollapsed ? 'Contas' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.708 2.825L15 11.105V5.383zm-.034 6.876l-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Contas</span>
          </router-link>
        </li>

        <!-- Suporte -->
        <li class="nav-item" :class="{ active: $route.path === '/support' }">
          <router-link to="/support" class="nav-link" :title="shouldBeCollapsed ? 'Suporte' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"/>
              <path d="M8 4.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V5a.5.5 0 0 1-.5-.5z"/>
              <path d="M8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Suporte</span>
          </router-link>
        </li>

        <!-- Glosário -->
        <li class="nav-item">
          <button class="nav-link glossary-btn" @click="openGlossary" :title="shouldBeCollapsed ? 'Glosário' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Glosário</span>
          </button>
        </li>

        <!-- Sair -->
        <li class="nav-item">
          <button class="nav-link logout-btn" @click="logout" :title="shouldBeCollapsed ? 'Sair' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            <span class="nav-text" v-show="!shouldBeCollapsed">Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import CreditStatus from './CreditStatus.vue'

export default {
  name: 'Sidebar',
  components: {
    CreditStatus
  },
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalCollapsed: false
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    // Computed para determinar se a sidebar deve estar colapsada
    shouldBeCollapsed() {
      return this.sidebarCollapsed || this.internalCollapsed
    },
    // Verificação de créditos
    userCredits() {
      return this.$store.getters.userCredits
    },
    canUseSystem() {
      return this.$store.getters.canUseSystem
    },
    hasCredits() {
      return this.userCredits > 0 && this.canUseSystem
    }
  },
  watch: {
    // Observar mudanças na prop sidebarCollapsed
    sidebarCollapsed: {
      handler(newValue) {
        this.internalCollapsed = newValue
        this.saveSidebarState(newValue)
      },
      immediate: true
    }
  },
  mounted() {
    this.loadSidebarState()
    
    // Monitorar mudanças no localStorage para configurações
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_settings') {
        this.loadSidebarState()
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
  },
  methods: {
    handleDashboardClick() {
      if (this.hasCredits) {
        this.$router.push('/')
      } else {
        this.showNotification('Você precisa de créditos para acessar os Surebets. Compre créditos para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    handleReportsClick() {
      if (this.hasCredits) {
        // Se já estiver na página de relatórios, força o refresh
        if (this.$route.path === '/reports') {
          // Força o refresh da página
          window.location.reload()
        } else {
          // Navega para a página de relatórios
          this.$router.push('/reports')
        }
      } else {
        this.showNotification('Você precisa de créditos para acessar os Relatórios. Compre créditos para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    handleCompoundInterestClick() {
      if (this.hasCredits) {
        this.$router.push('/compound-interest')
      } else {
        this.showNotification('Você precisa de créditos para acessar a Calculadora de Juros Compostos. Compre créditos para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    showNotification(message, type = 'info') {
      this.$emit('show-notification', { message, type })
    },
    toggleSidebar() {
      this.internalCollapsed = !this.internalCollapsed
      this.saveSidebarState(this.internalCollapsed)
      this.$emit('toggle-sidebar', this.internalCollapsed)
    },
    openGlossary() {
      this.$emit('open-glossary')
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    // Carregar estado da sidebar das configurações
    loadSidebarState() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.interface && settings.interface.sidebarCollapsed !== undefined) {
            this.internalCollapsed = settings.interface.sidebarCollapsed
            this.$emit('sidebar-state-loaded', this.internalCollapsed)

          }
        }
      } catch (error) {
        console.warn('Erro ao carregar estado da sidebar:', error)
      }
    },
    
    // Salvar estado da sidebar nas configurações
    saveSidebarState(collapsed) {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        let settings = savedSettings ? JSON.parse(savedSettings) : {}
        
        // Inicializar interface se não existir
        if (!settings.interface) {
          settings.interface = {}
        }
        
        // Atualizar estado da sidebar
        settings.interface.sidebarCollapsed = collapsed
        
        localStorage.setItem('app_settings', JSON.stringify(settings))

      } catch (error) {
        console.error('Erro ao salvar estado da sidebar:', error)
      }
    },
    
    handleStorageChange(event) {
      if (event.key === 'app_settings') {
        this.loadSidebarState()
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--bg-secondary, #2a2a2a);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  flex-shrink: 0;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-primary, #ffffff);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #00ff88;
  flex-shrink: 0;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.user-profile {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary, #00ff88);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary, #1a1a1a);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ff88;
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary, #cccccc);
}

/* Ícones de Administração */
.admin-icons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.admin-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  color: var(--text-secondary, #cccccc);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.admin-icon-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00ff88;
  color: #00ff88;
  transform: translateY(-1px);
}

.admin-icon-link svg {
  width: 16px;
  height: 16px;
}

.sidebar-nav {
  padding: 16px 20px;
  flex: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00ff88;
}

.nav-item.active .nav-link {
  background: #00ff88;
  color: #1a1a1a;
  border-color: #00ff88;
}

.nav-link.glossary-btn {
  color: #00ff88;
}

.nav-link.glossary-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
}

.nav-link.logout-btn {
  color: #ff4444;
}

.nav-link.logout-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.lock-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0.7;
  color: #ff4444;
}

.nav-link.locked {
  opacity: 0.6;
  cursor: not-allowed;
  position: relative;
}

.nav-link.locked:hover {
  background: var(--bg-secondary, #2a2a2a);
  border-color: var(--border-primary, rgba(255, 255, 255, 0.1));
  transform: none;
}

.nav-link.locked .nav-icon {
  opacity: 0.5;
}

.nav-link.locked .nav-text {
  opacity: 0.5;
}

.nav-text {
  flex-grow: 1;
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .sidebar.collapsed {
    width: 280px;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 12px 16px;
  }
  
  .logo h1 {
    font-size: 18px;
  }
  
  .sidebar-toggle {
    padding: 6px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .user-greeting {
    font-size: 12px;
  }

  .user-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .status-text {
    font-size: 10px;
  }
}
</style>
