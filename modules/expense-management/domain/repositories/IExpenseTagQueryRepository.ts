import { ExpenseTag } from "../entities/ExpenseTag.js";
import { ExpenseId, TagId } from "../value-objects/index.js";

export interface IExpenseTagQueryRepository {
  findByExpenseId(expenseId: ExpenseId): Promise<ExpenseTag[]>;
  findByTagId(tagId: TagId): Promise<ExpenseTag[]>;
  findByExpenseIds(expenseIds: ExpenseId[]): Promise<ExpenseTag[]>;
  findByTagIds(tagIds: TagId[]): Promise<ExpenseTag[]>;
  findExpensesByAllTags(tagIds: TagId[]): Promise<ExpenseId[]>;
  exists(expenseId: ExpenseId, tagId: TagId): Promise<boolean>;
  existsMany(relationships: Array<{ expenseId: ExpenseId; tagId: TagId }>): Promise<Map<string, boolean>>;
  hasAnyTags(expenseId: ExpenseId): Promise<boolean>;
  countByExpenseId(expenseId: ExpenseId): Promise<number>;
  countByTagId(tagId: TagId): Promise<number>;
  findUniqueTagIdsByExpenses(expenseIds: ExpenseId[]): Promise<TagId[]>;
}
