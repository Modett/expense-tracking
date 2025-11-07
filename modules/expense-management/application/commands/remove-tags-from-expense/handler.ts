import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import type { RemoveTagsFromExpenseCommand } from "./command.js";

export interface RemoveTagsFromExpenseResponse {
  success: boolean;
  expenseId: string;
  removedTagIds: string[];
  skippedTagIds: string[];
}

export class RemoveTagsFromExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: RemoveTagsFromExpenseCommand): Promise<RemoveTagsFromExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const tagIds = command.tagIds.map((id) => TagId.fromString(id));

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const relationships: Array<{ expenseId: ExpenseId; tagId: TagId }> = [];
    const removedTagIds: string[] = [];
    const skippedTagIds: string[] = [];

    for (const tagId of tagIds) {
      if (!expense.hasTag(tagId)) {
        skippedTagIds.push(tagId.getValue());
        continue;
      }

      expense.removeTag(tagId);
      relationships.push({ expenseId, tagId });
      removedTagIds.push(tagId.getValue());
    }

    if (relationships.length > 0) {
      await this.expenseCommandRepo.save(expense);
      await this.expenseTagCommandRepo.removeMany(relationships);
    }

    return {
      success: true,
      expenseId: command.expenseId,
      removedTagIds,
      skippedTagIds,
    };
  }
}
