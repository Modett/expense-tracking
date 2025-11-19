import {
  BudgetId,
  BudgetAmount,
  FiscalPeriod,
  BudgetPeriod,
  DepartmentId,
  CategoryId,
  BudgetEnforcementType,
  BudgetThresholds,
} from "../value-objects/index.js";

export interface BudgetProps {
  id: BudgetId;
  departmentId: DepartmentId | null;
  categoryId: CategoryId | null; // Optional for backward compatibility
  amount: BudgetAmount;
  fiscalPeriod: FiscalPeriod;
  period: BudgetPeriod;
  isActive: boolean;
  enforcementType: BudgetEnforcementType;
  overrideAllowed: boolean;
  thresholds: BudgetThresholds;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetProps {
  departmentId: DepartmentId | null;
  categoryId?: CategoryId | null; // Optional - department-based budgets
  budgetAmount: number;
  fiscalPeriod: FiscalPeriod;
  startDate: Date;
  endDate: Date;
  enforcementType?: BudgetEnforcementType;
  overrideAllowed?: boolean;
  thresholds?: BudgetThresholds;
}

export class Budget {
  private constructor(private props: BudgetProps) {
    this.validate();
  }

  static create(props: CreateBudgetProps): Budget {
    const now = new Date();

    return new Budget({
      id: BudgetId.create(),
      departmentId: props.departmentId,
      categoryId: props.categoryId ?? null,
      amount: BudgetAmount.create(props.budgetAmount, 0),
      fiscalPeriod: props.fiscalPeriod,
      period: BudgetPeriod.create(props.startDate, props.endDate),
      isActive: true,
      enforcementType: props.enforcementType ?? BudgetEnforcementType.soft(),
      overrideAllowed: props.overrideAllowed ?? true,
      thresholds: props.thresholds ?? BudgetThresholds.create(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: BudgetProps): Budget {
    return new Budget(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("Budget ID is required");
    }
    // departmentId can be null for organization-wide budgets
    // CategoryId is now optional for department-based budgets
    if (!this.props.amount) {
      throw new Error("Budget amount is required");
    }
    if (!this.props.fiscalPeriod) {
      throw new Error("Fiscal period is required");
    }
    if (!this.props.period) {
      throw new Error("Budget period is required");
    }
    if (!this.props.enforcementType) {
      throw new Error("Enforcement type is required");
    }
    if (!this.props.thresholds) {
      throw new Error("Budget thresholds are required");
    }
  }

  get id(): BudgetId {
    return this.props.id;
  }

  get departmentId(): DepartmentId | null {
    return this.props.departmentId;
  }

  get categoryId(): CategoryId | null {
    return this.props.categoryId;
  }

  get amount(): BudgetAmount {
    return this.props.amount;
  }

  get fiscalPeriod(): FiscalPeriod {
    return this.props.fiscalPeriod;
  }

  get period(): BudgetPeriod {
    return this.props.period;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get enforcementType(): BudgetEnforcementType {
    return this.props.enforcementType;
  }

  get overrideAllowed(): boolean {
    return this.props.overrideAllowed;
  }

  get thresholds(): BudgetThresholds {
    return this.props.thresholds;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods

  updateAssignment(departmentId?: string | null, categoryId?: string | null): void {
    if (departmentId !== undefined) {
      this.props.departmentId = departmentId ? DepartmentId.fromString(departmentId) : null;
    }
    if (categoryId !== undefined) {
      this.props.categoryId = categoryId ? CategoryId.fromString(categoryId) : null;
    }
    this.props.updatedAt = new Date();
  }

  updateBudgetAmount(newAmount: number): void {
    this.props.amount = this.props.amount.updateBudgetAmount(newAmount);
    this.props.updatedAt = new Date();
  }

  updateEnforcement(
    enforcementType: BudgetEnforcementType,
    overrideAllowed: boolean
  ): void {
    this.props.enforcementType = enforcementType;
    this.props.overrideAllowed = overrideAllowed;
    this.props.updatedAt = new Date();
  }

  updateThresholds(thresholds: BudgetThresholds): void {
    this.props.thresholds = thresholds;
    this.props.updatedAt = new Date();
  }

  addSpent(amount: number): void {
    if (!this.isActive) {
      throw new Error("Cannot add spending to inactive budget");
    }

    if (amount <= 0) {
      throw new Error("Amount to add must be positive");
    }

    this.props.amount = this.props.amount.addSpent(amount);
    this.props.updatedAt = new Date();
  }

  subtractSpent(amount: number): void {
    if (!this.isActive) {
      throw new Error("Cannot subtract spending from inactive budget");
    }

    if (amount <= 0) {
      throw new Error("Amount to subtract must be positive");
    }

    this.props.amount = this.props.amount.subtractSpent(amount);
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.isActive) {
      throw new Error("Budget is already active");
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new Error("Budget is already inactive");
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  // Query methods

  getRemainingAmount(): number {
    return this.props.amount.getRemainingAmount();
  }

  getUtilizationPercentage(): number {
    return this.props.amount.getUtilizationPercentage();
  }

  isOverBudget(): boolean {
    return this.props.amount.isOverBudget();
  }

  isNearLimit(threshold?: number): boolean {
    const thresholdToUse = threshold ?? this.props.thresholds.getWarning1();
    return this.props.amount.isNearLimit(thresholdToUse);
  }

  isExhausted(): boolean {
    return this.props.amount.isExhausted();
  }

  canAccommodateExpense(expenseAmount: number): boolean {
    return this.props.amount.canAccommodate(expenseAmount);
  }

  isPeriodActive(): boolean {
    return this.props.period.isActive();
  }

  isPeriodExpired(): boolean {
    return this.props.period.isExpired();
  }

  belongsToDepartment(departmentId: DepartmentId): boolean {
    if (!this.props.departmentId) return false;
    return this.props.departmentId.equals(departmentId);
  }

  belongsToCategory(categoryId: CategoryId): boolean {
    if (!this.props.categoryId) return true; // Department-only budget matches any category
    return this.props.categoryId.equals(categoryId);
  }

  isForFiscalPeriod(fiscalPeriod: FiscalPeriod): boolean {
    return this.props.fiscalPeriod.equals(fiscalPeriod);
  }

  getExceededThreshold(): { level: string; threshold: number } | null {
    const utilization = this.getUtilizationPercentage();
    return this.props.thresholds.getExceededThreshold(utilization);
  }

  isHardEnforcement(): boolean {
    return this.props.enforcementType.isHard();
  }

  isSoftEnforcement(): boolean {
    return this.props.enforcementType.isSoft();
  }

  equals(other: Budget): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      departmentId: this.props.departmentId?.getValue() ?? null,
      categoryId: this.props.categoryId?.getValue() ?? null,
      budgetAmount: this.props.amount.getBudgetAmount(),
      spentAmount: this.props.amount.getSpentAmount(),
      remainingAmount: this.getRemainingAmount(),
      utilizationPercentage: this.getUtilizationPercentage(),
      fiscalPeriod: this.props.fiscalPeriod.getValue(),
      startDate: this.props.period.getStartDate(),
      endDate: this.props.period.getEndDate(),
      isActive: this.props.isActive,
      enforcementType: this.props.enforcementType.getValue(),
      overrideAllowed: this.props.overrideAllowed,
      thresholds: {
        warning1: this.props.thresholds.getWarning1(),
        warning2: this.props.thresholds.getWarning2(),
        critical: this.props.thresholds.getCritical(),
      },
      exceededThreshold: this.getExceededThreshold(),
      isOverBudget: this.isOverBudget(),
      isNearLimit: this.isNearLimit(),
      isExhausted: this.isExhausted(),
      isPeriodActive: this.isPeriodActive(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
