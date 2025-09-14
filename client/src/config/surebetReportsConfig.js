// Configurações para a view de relatórios de surebets
export const surebetReportsConfig = {
  // Status dos relatórios
  statusOptions: [
    { value: "", label: "Todos os Status" },
    { value: "pending", label: "Pendentes" },
    { value: "completed", label: "Concluídos" },
    { value: "cancelled", label: "Cancelados" },
  ],

  // Mapeamento de status para texto
  statusTextMap: {
    pending: "Pendente",
    completed: "Concluído",
    cancelled: "Cancelado",
  },

  // Textos da interface
  texts: {
    pageTitle: "Relatório de Surebets",
    pageSubtitle: "Gerencie e confirme resultados das suas surebets",
    refreshButton: "Atualizar",
    totalReports: "Total de Relatórios",
    pendingReports: "Pendentes",
    totalProfit: "Lucro Total",
    reportsSectionTitle: "Relatórios de Surebets",
    emptyStateTitle: "Nenhum relatório encontrado",
    emptyStateDescription:
      "Registre surebets para começar a acompanhar seus resultados.",
    gameNotIdentified: "Jogo não identificado",
    totalInvestment: "Investimento Total:",
    expectedProfit: "Lucro Esperado:",
    actualProfit: "Lucro Real:",
    betsPerformed: "Apostas Realizadas",
    confirmResult: "Confirmar Resultado",
    cancel: "Cancelar",
    viewDetails: "Ver Detalhes",
    confirmResultModalTitle: "Confirmar Resultado",
    resultSummary: "Resumo do Resultado",
    expectedReturn: "Retorno Esperado:",
    profitLoss: "Lucro/Prejuízo:",
    cancelConfirmation: "Tem certeza que deseja cancelar este relatório?",
    resultConfirmed: "Resultado confirmado com sucesso!",
    reportCancelled: "Relatório cancelado com sucesso!",
    sessionExpired: "Sessão expirada. Faça login novamente.",
    errorLoadingReports: "Erro ao carregar relatórios:",
    errorConfirmingResult: "Erro ao confirmar resultado:",
    errorCancellingReport: "Erro ao cancelar relatório:",
  },

  // Configurações de formatação
  formatting: {
    currency: {
      locale: "pt-BR",
      currency: "BRL",
    },
    date: {
      locale: "pt-BR",
      options: {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    },
  },

  // Configurações de cores (para referência, usar variáveis CSS)
  colors: {
    status: {
      pending: "#f59e0b",
      completed: "#22c55e",
      cancelled: "#ef4444",
    },
    profit: {
      positive: "#22c55e",
      negative: "#ef4444",
    },
  },

  // Configurações de API
  api: {
    endpoints: {
      reports: "/api/surebet-reports",
      confirmResult: (id) => `/api/surebet-reports/${id}/confirm-result`,
      cancel: (id) => `/api/surebet-reports/${id}/cancel`,
    },
  },
};
