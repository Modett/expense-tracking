import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import { ExpenseTag } from "../../../domain/entities/ExpenseTag.js";
import type { AddTagToExpenseCommand } from "./command.js";

export interface AddTagToExpenseResponse {
  success: boolean;
  expenseId: string;
  tagId: string;
}

export class AddTagToExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: AddTagToExpenseCommand): Promise<AddTagToExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const tagId = TagId.fromString(command.tagId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    if (expense.hasTag(tagId)) {
      throw new Error("Tag already exists on this expense");
    }

    expense.addTag(tagId);
    const expenseTag = ExpenseTag.create({ expenseId, tagId });

    await this.expenseCommandRepo.save(expense);
    await this.expenseTagCommandRepo.add(expenseTag);

    return {
      success: true,
      expenseId: command.expenseId,
      tagId: command.tagId,
    };
  }
}
