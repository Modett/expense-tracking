import { ExpenseTag } from "../entities/ExpenseTag.js";
import { ExpenseId, TagId } from "../value-objects/index.js";

export interface IExpenseTagCommandRepository {
  add(expenseTag: ExpenseTag): Promise<ExpenseTag>;
  addMany(expenseTags: ExpenseTag[]): Promise<ExpenseTag[]>;
  remove(expenseId: ExpenseId, tagId: TagId): Promise<void>;
  removeMany(relationships: Array<{ expenseId: ExpenseId; tagId: TagId }>): Promise<void>;
  removeAllForExpense(expenseId: ExpenseId): Promise<void>;
  removeAllForExpenses(expenseIds: ExpenseId[]): Promise<void>;
  removeTagFromAllExpenses(tagId: TagId): Promise<void>;
}
