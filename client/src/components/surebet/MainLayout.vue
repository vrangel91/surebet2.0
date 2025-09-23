<template>
  <div class="surebets-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="$emit('toggle-sidebar', $event)"
      @sidebar-state-loaded="$emit('sidebar-state-loaded', $event)" />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />

      <!-- Slot para conteúdo específico da página -->
      <slot />
    </main>
  </div>
</template>

<script>
import Sidebar from "../Sidebar.vue";
import Header from "../Header.vue";

export default {
  name: "MainLayout",
  components: {
    Sidebar,
    Header,
  },
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "toggle-sidebar",
    "sidebar-state-loaded",
  ],
};
</script>

<style lang="scss" scoped>
.surebets-container {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100% - 280px);
  margin-left: 280px;
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
  }
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
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

/* Scrollbar personalizada para o main-content */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Responsividade */
@media (max-width: 1024px) {
  .surebets-container {
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .surebets-container {
    width: 100vw;
    max-width: 100vw;
    margin: 0;

    &.sidebar-collapsed {
      margin-left: 0;
      width: 100vw;
      max-width: 100vw;
    }
  }
}
</style>

