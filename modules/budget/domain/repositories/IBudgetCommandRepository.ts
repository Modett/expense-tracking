import { Budget } from "../entities/Budget.js";
import { BudgetId } from "../value-objects/index.js";

export interface IBudgetCommandRepository {
  save(budget: Budget): Promise<Budget>;
  delete(budgetId: BudgetId): Promise<void>;
  exists(budgetId: BudgetId): Promise<boolean>;
  saveMany(budgets: Budget[]): Promise<Budget[]>;
}
