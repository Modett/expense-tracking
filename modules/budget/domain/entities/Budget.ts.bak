import {
  BudgetId,
  BudgetAmount,
  FiscalPeriod,
  BudgetPeriod,
  DepartmentId,
  CategoryId,
} from "../value-objects/index.js";

export interface BudgetProps {
  id: BudgetId;
  departmentId: DepartmentId;
  categoryId: CategoryId | null; // Optional for backward compatibility
  amount: BudgetAmount;
  fiscalPeriod: FiscalPeriod;
  period: BudgetPeriod;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetProps {
  departmentId: DepartmentId;
  categoryId?: CategoryId | null; // Optional - department-based budgets
  budgetAmount: number;
  fiscalPeriod: FiscalPeriod;
  startDate: Date;
  endDate: Date;
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
    if (!this.props.departmentId) {
      throw new Error("Department ID is required");
    }
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
  }

  get id(): BudgetId {
    return this.props.id;
  }

  get departmentId(): DepartmentId {
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods

  updateBudgetAmount(newAmount: number): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive budget");
    }

    this.props.amount = this.props.amount.updateBudgetAmount(newAmount);
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

  isNearLimit(threshold: number = 80): boolean {
    return this.props.amount.isNearLimit(threshold);
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
    return this.props.departmentId.equals(departmentId);
  }

  belongsToCategory(categoryId: CategoryId): boolean {
    if (!this.props.categoryId) return true; // Department-only budget matches any category
    return this.props.categoryId.equals(categoryId);
  }

  isForFiscalPeriod(fiscalPeriod: FiscalPeriod): boolean {
    return this.props.fiscalPeriod.equals(fiscalPeriod);
  }

  equals(other: Budget): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      departmentId: this.props.departmentId.getValue(),
      categoryId: this.props.categoryId?.getValue() ?? null,
      budgetAmount: this.props.amount.getBudgetAmount(),
      spentAmount: this.props.amount.getSpentAmount(),
      remainingAmount: this.getRemainingAmount(),
      utilizationPercentage: this.getUtilizationPercentage(),
      fiscalPeriod: this.props.fiscalPeriod.getValue(),
      startDate: this.props.period.getStartDate(),
      endDate: this.props.period.getEndDate(),
      isActive: this.props.isActive,
      isOverBudget: this.isOverBudget(),
      isNearLimit: this.isNearLimit(),
      isExhausted: this.isExhausted(),
      isPeriodActive: this.isPeriodActive(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
