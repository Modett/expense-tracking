export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: ["dashboard", "stats"] as const,
    pendingTasks: ["dashboard", "pending-tasks"] as const,
    recentExpenses: (limit?: number) =>
      ["dashboard", "recent-expenses", limit] as const,
    teamSpending: (period: string) =>
      ["dashboard", "team-spending", period] as const,
    expensesByCategory: (period: string) =>
      ["dashboard", "expenses-by-category", period] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["expenses", "list", filters] as const,
    detail: (id: string) => ["expenses", "detail", id] as const,
    stats: ["expenses", "stats"] as const,
  },
  approvals: {
    all: ["approvals"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["approvals", "list", filters] as const,
    detail: (id: string) => ["approvals", "detail", id] as const,
    pending: ["approvals", "pending"] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["budgets", "list", filters] as const,
    detail: (id: string) => ["budgets", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: ["categories", "list"] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: ["departments", "list"] as const,
  },
  tags: {
    all: ["tags"] as const,
    list: ["tags", "list"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  analytics: {
    spending: (filters?: Record<string, unknown>) =>
      ["analytics", "spending", filters] as const,
    budgetTracking: (filters?: Record<string, unknown>) =>
      ["analytics", "budget-tracking", filters] as const,
  },
  audit: {
    logs: (filters?: Record<string, unknown>) =>
      ["audit", "logs", filters] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
};
