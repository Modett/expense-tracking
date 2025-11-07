import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import type { Expense } from "../../../domain/entities/Expense.js";
import type { RemoveTagFromExpensesCommand } from "./command.js";

export interface RemoveTagFromExpensesResponse {
  success: boolean;
  tagId: string;
  processedCount: number;
  skippedCount: number;
  processedExpenseIds: string[];
  skippedExpenseIds: string[];
}

export class RemoveTagFromExpensesCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: RemoveTagFromExpensesCommand): Promise<RemoveTagFromExpensesResponse> {
    const expenseIds = command.expenseIds.map((id) => ExpenseId.fromString(id));
    const tagId = TagId.fromString(command.tagId);

    const expenses: Expense[] = [];
    const relationships: Array<{ expenseId: ExpenseId; tagId: TagId }> = [];
    const processedExpenseIds: string[] = [];
    const skippedExpenseIds: string[] = [];

    for (const expenseId of expenseIds) {
      const expense = await this.expenseQueryRepo.findById(expenseId);

      if (!expense) {
        skippedExpenseIds.push(expenseId.getValue());
        continue;
      }

      if (!expense.hasTag(tagId)) {
        skippedExpenseIds.push(expenseId.getValue());
        continue;
      }

      expense.removeTag(tagId);
      expenses.push(expense);
      relationships.push({ expenseId, tagId });
      processedExpenseIds.push(expenseId.getValue());
    }

    if (expenses.length > 0) {
      await this.expenseCommandRepo.saveMany(expenses);
      await this.expenseTagCommandRepo.removeMany(relationships);
    }

    return {
      success: true,
      tagId: command.tagId,
      processedCount: processedExpenseIds.length,
      skippedCount: skippedExpenseIds.length,
      processedExpenseIds,
      skippedExpenseIds,
    };
  }
}
