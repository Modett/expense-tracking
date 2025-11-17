export enum RoleEnum {
  STAFF = "staff",
  MANAGER = "manager",
  FINANCE = "finance",
  ADMIN = "admin",
}

export enum ExpenseStatusEnum {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum ApprovalStatusEnum {
  WAITING = "waiting",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SKIPPED = "skipped",
}

export enum TagTypeEnum {
  COLLECTION = "collection",
  CAMPAIGN = "campaign",
  CUSTOM = "custom",
  DEPARTMENT = "department",
}

export enum ExpensePriorityEnum {
  ROUTINE = "routine",
  STANDARD = "standard",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

export enum BudgetExceptionTypeEnum {
  NONE = "none",
  EMERGENCY = "emergency",
  ANNUAL = "annual",
  RECURRING = "recurring",
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: RoleEnum;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  vendorId: string;
  name: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  departmentId: string;
  name: string;
  code?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  tagId: string;
  name: string;
  type: TagTypeEnum;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  expenseId: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId?: string;
  description: string;
  amountNet: number;
  taxAmount: number;
  totalAmount: number;
  status: ExpenseStatusEnum;
  priority: ExpensePriorityEnum;
  budgetOverride: BudgetExceptionTypeEnum;
  justification?: string;
  approvalDeadline?: string;
  receiptUrl?: string;
  dateOfExpense: string;
  linkedPoId?: string;
  inventoryDropId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  vendor?: Vendor;
  category?: Category;
  department?: Department;
  tags?: Tag[];
  approvals?: Approval[];
}

export interface Approval {
  approvalId: string;
  expenseId: string;
  approverId: string;
  approvalOrder: number;
  status: ApprovalStatusEnum;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  expense?: Expense;
  approver?: User;
}

export interface Budget {
  budgetId: string;
  departmentId: string;
  categoryId?: string;
  budgetAmount: number;
  spentAmount: number;
  fiscalPeriod: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  enforcementType: "soft" | "hard";
  overrideAllowed: boolean;
  warningThreshold1: number;
  warningThreshold2: number;
  criticalThreshold: number;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  category?: Category;
  notes?: string;
}

export interface ApprovalRule {
  ruleId: string;
  categoryId: string;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Additional common types
export type Status = "active" | "inactive" | "pending" | "archived";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = RoleEnum;
