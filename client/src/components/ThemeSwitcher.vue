<template>
  <div class="theme-switcher">
    <button 
      @click="setTheme('dark')" 
      :class="['theme-btn', { active: currentTheme === 'dark' }]"
      title="Tema Escuro"
    >
      <i class="bi bi-moon-fill"></i>
      <span>Escuro</span>
    </button>
    
    <button 
      @click="setTheme('light')" 
      :class="['theme-btn', { active: currentTheme === 'light' }]"
      title="Tema Claro"
    >
      <i class="bi bi-sun-fill"></i>
      <span>Claro</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: 'dark'
    }
  },
  
  mounted() {
    // Restaurar tema salvo
    this.restoreTheme();
  },
  
  methods: {
    setTheme(theme) {
      this.currentTheme = theme;
      
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      // Salvar preferência
      localStorage.setItem('surebet-theme', theme);
      
      // Emitir evento para outros componentes
      this.$emit('theme-changed', theme);
    },
    
    restoreTheme() {
      const savedTheme = localStorage.getItem('surebet-theme');
      if (savedTheme) {
        this.setTheme(savedTheme);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/themes.scss';

.theme-switcher {
  display: flex;
  gap: 8px;
  align-items: center;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-accent);
    color: var(--text-accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }
  
  &.active {
    background: var(--accent-primary);
    color: var(--text-button-primary);
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-accent);
  }
  
  i {
    font-size: 16px;
  }
  
  span {
    @media (max-width: 768px) {
      display: none;
    }
  }
}

// Animações
.theme-btn {
  &:active {
    transform: translateY(0);
  }
}

// Responsividade
@media (max-width: 480px) {
  .theme-switcher {
    gap: 4px;
  }
  
  .theme-btn {
    padding: 6px 12px;
    font-size: 12px;
    
    i {
      font-size: 14px;
    }
  }
}
</style>
