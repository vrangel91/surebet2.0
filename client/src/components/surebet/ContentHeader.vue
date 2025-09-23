<template>
  <header class="content-header">
    <div class="header-left">
      <h2 class="page-title">{{ title }}</h2>
      <p class="page-subtitle">
        {{ subtitle }}
      </p>
    </div>
  </header>
</template>

<script>
export default {
  name: "ContentHeader",
  props: {
    title: {
      type: String,
      default: "Surebets",
    },
    subtitle: {
      type: String,
      default: "Encontre as melhores oportunidades de arbitragem",
    },
  },
};
</script>

<style lang="scss" scoped>
.content-header {
  padding: var(--spacing-xl) 0;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: var(--spacing-xl);
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
}

/* Responsividade */
@media (max-width: 768px) {
  .content-header {
    padding: var(--spacing-lg) 0;
    margin-bottom: var(--spacing-lg);
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .content-header {
    padding: var(--spacing-md) 0;
    margin-bottom: var(--spacing-md);
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }
}

/* Estados de hover e focus para acessibilidade */
.content-header:focus-within {
  border-bottom-color: var(--border-accent);
}

/* Animações suaves */
.content-header {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

