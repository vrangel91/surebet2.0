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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 32px;
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
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }
}
</style>
