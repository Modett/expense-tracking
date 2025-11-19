export enum BudgetEnforcementType {
  SOFT = "soft",
  HARD = "hard",
}

export interface BudgetThresholds {
  warning1: number;
  warning2: number;
  critical: number;
}

export interface Budget {
  budgetId: string;
  departmentId: string | null;
  categoryId?: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  fiscalPeriod: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  enforcementType: BudgetEnforcementType;
  overrideAllowed: boolean;
  warningThreshold1: number;
  warningThreshold2: number;
  criticalThreshold: number;
  thresholds: BudgetThresholds;
  exceededThreshold?: { level: string; threshold: number } | null;
  isOverBudget: boolean;
  isNearLimit: boolean;
  isExhausted: boolean;
  isPeriodActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  department?: {
    departmentId: string;
    name: string;
    code?: string;
  };
  category?: {
    categoryId: string;
    name: string;
  } | null;
}

export interface CreateBudgetRequest {
  departmentId?: string | null;
  categoryId?: string | null;
  budgetAmount: number;
  fiscalPeriod: string;
  startDate: string;
  endDate: string;
  enforcementType?: BudgetEnforcementType;
  overrideAllowed?: boolean;
  warningThreshold1?: number;
  warningThreshold2?: number;
  criticalThreshold?: number;
}

export interface UpdateBudgetRequest {
  departmentId?: string | null;
  categoryId?: string | null;
  budgetAmount?: number;
  enforcementType?: BudgetEnforcementType;
  overrideAllowed?: boolean;
  warningThreshold1?: number;
  warningThreshold2?: number;
  criticalThreshold?: number;
}

export interface AdjustBudgetSpentRequest {
  amount: number;
  operation: "add" | "subtract";
}

export interface GetAllBudgetsParams {
  departmentId?: string;
  categoryId?: string;
  fiscalPeriod?: string;
  isActive?: boolean;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
}

export interface BudgetStatus {
  exists: boolean;
  budgetId?: string;
  budgetAmount?: number;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
  isExhausted?: boolean;
}

export interface CreateBudgetResponse {
  success: boolean;
  budgetId: string;
  departmentId: string | null;
  categoryId?: string | null;
  budgetAmount: number;
  fiscalPeriod: string;
  startDate: string;
  endDate: string;
}

export interface AdjustBudgetSpentResponse {
  success: boolean;
  budgetId: string;
  newSpentAmount: number;
}
