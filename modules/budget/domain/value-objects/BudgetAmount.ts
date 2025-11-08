export class BudgetAmount {
  private constructor(
    private readonly budgetAmount: number,
    private readonly spentAmount: number
  ) {
    if (budgetAmount < 0) {
      throw new Error("Budget amount cannot be negative");
    }
    if (spentAmount < 0) {
      throw new Error("Spent amount cannot be negative");
    }
  }

  static create(budgetAmount: number, spentAmount: number = 0): BudgetAmount {
    return new BudgetAmount(budgetAmount, spentAmount);
  }

  getBudgetAmount(): number {
    return this.budgetAmount;
  }

  getSpentAmount(): number {
    return this.spentAmount;
  }

  getRemainingAmount(): number {
    return this.budgetAmount - this.spentAmount;
  }

  getUtilizationPercentage(): number {
    if (this.budgetAmount === 0) return 0;
    return (this.spentAmount / this.budgetAmount) * 100;
  }

  isOverBudget(): boolean {
    return this.spentAmount > this.budgetAmount;
  }

  isNearLimit(threshold: number = 80): boolean {
    return this.getUtilizationPercentage() >= threshold;
  }

  isExhausted(): boolean {
    return this.spentAmount >= this.budgetAmount;
  }

  canAccommodate(amount: number): boolean {
    return this.getRemainingAmount() >= amount;
  }

  addSpent(amount: number): BudgetAmount {
    if (amount < 0) {
      throw new Error("Cannot add negative amount to spent");
    }
    return new BudgetAmount(this.budgetAmount, this.spentAmount + amount);
  }

  subtractSpent(amount: number): BudgetAmount {
    if (amount < 0) {
      throw new Error("Cannot subtract negative amount from spent");
    }
    const newSpent = Math.max(0, this.spentAmount - amount);
    return new BudgetAmount(this.budgetAmount, newSpent);
  }

  updateBudgetAmount(newBudgetAmount: number): BudgetAmount {
    if (newBudgetAmount < 0) {
      throw new Error("Budget amount cannot be negative");
    }
    return new BudgetAmount(newBudgetAmount, this.spentAmount);
  }

  equals(other: BudgetAmount): boolean {
    if (!other) return false;
    return (
      this.budgetAmount === other.budgetAmount &&
      this.spentAmount === other.spentAmount
    );
  }
}
