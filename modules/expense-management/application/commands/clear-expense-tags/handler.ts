import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId } from "../../../domain/value-objects/index.js";
import type { ClearExpenseTagsCommand } from "./command.js";

export interface ClearExpenseTagsResponse {
  success: boolean;
  expenseId: string;
  removedCount: number;
  removedTagIds: string[];
}

export class ClearExpenseTagsCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: ClearExpenseTagsCommand): Promise<ClearExpenseTagsResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const removedTagIds = expense.tagIds.map((tagId) => tagId.getValue());
    const removedCount = removedTagIds.length;

    for (const tagId of expense.tagIds) {
      expense.removeTag(tagId);
    }

    await this.expenseCommandRepo.save(expense);
    await this.expenseTagCommandRepo.removeAllForExpense(expenseId);

    return {
      success: true,
      expenseId: command.expenseId,
      removedCount,
      removedTagIds,
    };
  }
}
