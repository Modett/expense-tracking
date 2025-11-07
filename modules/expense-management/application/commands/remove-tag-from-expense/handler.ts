import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import type { RemoveTagFromExpenseCommand } from "./command.js";

export interface RemoveTagFromExpenseResponse {
  success: boolean;
  expenseId: string;
  tagId: string;
}

export class RemoveTagFromExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: RemoveTagFromExpenseCommand): Promise<RemoveTagFromExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const tagId = TagId.fromString(command.tagId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (!expense.hasTag(tagId)) {
      throw new Error("Tag does not exist on this expense");
    }

    expense.removeTag(tagId);

    await this.expenseCommandRepo.save(expense);
    await this.expenseTagCommandRepo.remove(expenseId, tagId);

    return {
      success: true,
      expenseId: command.expenseId,
      tagId: command.tagId,
    };
  }
}
