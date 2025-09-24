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
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: var(--spacing-xl);
  background: var(--bg-primary);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  transition: color 0.3s ease;
  word-wrap: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-wrap: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Responsividade - Desktop Grande */
@media (min-width: 1200px) {
  .content-header {
    padding: var(--spacing-xxl) var(--spacing-xl);
  }

  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 18px;
  }
}

/* Responsividade - Desktop */
@media (max-width: 1199px) and (min-width: 992px) {
  .content-header {
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }
}

/* Responsividade - Tablet */
@media (max-width: 991px) and (min-width: 769px) {
  .content-header {
    padding: var(--spacing-lg) var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .page-title {
    font-size: 26px;
  }

  .page-subtitle {
    font-size: 15px;
  }
}

/* Responsividade - Mobile Grande */
@media (max-width: 768px) {
  .content-header {
    padding: var(--spacing-lg) var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .page-title {
    font-size: 24px;
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: 14px;
    line-height: 1.5;
  }
}

/* Responsividade - Mobile Médio */
@media (max-width: 576px) {
  .content-header {
    padding: var(--spacing-md) var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .page-title {
    font-size: 22px;
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* Responsividade - Mobile Pequeno */
@media (max-width: 480px) {
  .content-header {
    padding: var(--spacing-sm) var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  .page-title {
    font-size: 20px;
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: 12px;
    line-height: 1.4;
  }
}

/* Responsividade - Mobile Extra Pequeno */
@media (max-width: 360px) {
  .content-header {
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
  }

  .page-title {
    font-size: 18px;
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: 11px;
    line-height: 1.4;
  }
}

/* Orientação Landscape em Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .content-header {
    padding: var(--spacing-sm) var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  .page-title {
    font-size: 20px;
    line-height: 1.1;
  }

  .page-subtitle {
    font-size: 12px;
    line-height: 1.3;
  }

  .header-left {
    gap: var(--spacing-xs);
  }
}

/* Dispositivos com altura muito pequena */
@media (max-height: 400px) {
  .content-header {
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
  }

  .page-title {
    font-size: 16px;
    line-height: 1.1;
  }

  .page-subtitle {
    font-size: 10px;
    line-height: 1.2;
  }

  .header-left {
    gap: 2px;
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
