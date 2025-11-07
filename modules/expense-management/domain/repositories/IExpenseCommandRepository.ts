import { Expense } from "../entities/Expense.js";
import { ExpenseId } from "../value-objects/index.js";

export interface IExpenseCommandRepository {
  save(expense: Expense): Promise<Expense>;
  delete(expenseId: ExpenseId): Promise<void>;
  exists(expenseId: ExpenseId): Promise<boolean>;
  saveMany(expenses: Expense[]): Promise<Expense[]>;
}
