<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <!-- Logo e Header -->
    <div class="sidebar-header">
      <div class="logo">
        <svg class="logo-icon" v-show="!sidebarCollapsed" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
          <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
        </svg>
        <h1 v-show="!sidebarCollapsed">SureStake</h1>
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
        <div class="user-details" v-show="!sidebarCollapsed">
          <p class="user-greeting">Olá, {{ currentUser?.email || 'Usuário' }}</p>
          <div class="user-status"> 
            <span class="status-dot"></span>
            <span class="status-text">Online</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu de Navegação -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item" :class="{ active: $route.path === '/' }">
          <router-link to="/" class="nav-link" :title="sidebarCollapsed ? 'Dashboard' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 1 13.5V7.207l5-5 5 5Z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: $route.path === '/reports' }">
          <router-link to="/reports" class="nav-link" :title="sidebarCollapsed ? 'Relatórios' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Relatórios</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: $route.path === '/settings' }">
          <router-link to="/settings" class="nav-link" :title="sidebarCollapsed ? 'Configurações' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Configurações</span>
          </router-link>
        </li>
        <li v-if="isAdmin" class="nav-item" :class="{ active: $route.path === '/admin' }">
          <router-link to="/admin" class="nav-link" :title="sidebarCollapsed ? 'Administração' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Administração</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: $route.path === '/plans' }">
          <router-link to="/plans" class="nav-link" :title="sidebarCollapsed ? 'Planos' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.75 0a.75.75 0 0 0-.75.75V4c0 .414.336.75.75.75h.75v4a.75.75 0 0 0 1.5 0V4.75h1.5v4a.75.75 0 0 0 1.5 0V4.75H9V4a.75.75 0 0 0-.75-.75h-4.5ZM9 3V1.5a.75.75 0 0 0-1.5 0V3h1.5Z"/>
              <path d="M2.5 6a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11Zm0 1h11v6h-11v-6Z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Planos</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: $route.path === '/referrals' }">
          <router-link to="/referrals" class="nav-link" :title="sidebarCollapsed ? 'Indicações' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
              <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V4.5A.5.5 0 0 1 8 4z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Indicações</span>
          </router-link>
        </li>
              <li class="nav-item" :class="{ active: $route.path === '/support' }">
        <router-link to="/support" class="nav-link" :title="sidebarCollapsed ? 'Suporte' : ''">
          <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
            <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
          </svg>
          <span class="nav-text" v-show="!sidebarCollapsed">Suporte</span>
        </router-link>
      </li>
      <li class="nav-item" :class="{ active: $route.path === '/compound-interest' }">
        <router-link to="/compound-interest" class="nav-link" :title="sidebarCollapsed ? 'Juros Compostos' : ''">
          <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 0 1 8 8c0 1.162-.362 2.35-.938 3.299a.5.5 0 0 1-.463.301h-1.196a.5.5 0 0 1-.463-.301A7.725 7.725 0 0 1 8 1a7.725 7.725 0 0 1-3.299.938.5.5 0 0 1-.301.463V3.5a.5.5 0 0 1 .301.463A7.725 7.725 0 0 1 8 0z"/>
            <path d="M4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4z"/>
          </svg>
          <span class="nav-text" v-show="!sidebarCollapsed">Juros Compostos</span>
        </router-link>
      </li>
        <li class="nav-item">
          <button class="nav-link glossary-btn" @click="openGlossary" :title="sidebarCollapsed ? 'Glosário' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Glosário</span>
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link logout-btn" @click="logout" :title="sidebarCollapsed ? 'Sair' : ''">
            <svg class="nav-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            <span class="nav-text" v-show="!sidebarCollapsed">Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    }
  },
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar')
    },
    openGlossary() {
      this.$emit('open-glossary')
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
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
