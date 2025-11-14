import { Expense, ExpenseStatusEnum, User, Department } from "@/types/common.types";

export interface PendingTask {
  id: string;
  type: 'approval' | 'trip' | 'expense' | 'upcoming' | 'advance';
  label: string;
  count: number;
  amount?: number;
}

export interface RecentExpenseItem extends Partial<Expense> {
  expenseId: string;
  description: string;
  totalAmount: number;
  status: ExpenseStatusEnum;
  dateOfExpense: string;
  user?: User;
  department?: Department;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
}

export interface TeamSpendingData {
  team: string;
  amount: number;
  color?: string;
}

export interface ExpenseCategoryData {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface DashboardStats {
  totalExpenses: number;
  pendingApprovals: number;
  monthlyBudget: number;
  teamMembers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  pendingTasks: PendingTask[];
  recentExpenses: RecentExpenseItem[];
  quickActions: QuickAction[];
  teamSpending: TeamSpendingData[];
  expensesByCategory: ExpenseCategoryData[];
}
