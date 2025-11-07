import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import { ExpenseTag } from "../../../domain/entities/ExpenseTag.js";
import type { AddTagsToExpenseCommand } from "./command.js";

export interface AddTagsToExpenseResponse {
  success: boolean;
  expenseId: string;
  addedTagIds: string[];
  skippedTagIds: string[];
}

export class AddTagsToExpenseCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: AddTagsToExpenseCommand): Promise<AddTagsToExpenseResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const tagIds = command.tagIds.map((id) => TagId.fromString(id));

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const expenseTags: ExpenseTag[] = [];
    const addedTagIds: string[] = [];
    const skippedTagIds: string[] = [];

    for (const tagId of tagIds) {
      if (expense.hasTag(tagId)) {
        skippedTagIds.push(tagId.getValue());
        continue;
      }

      expense.addTag(tagId);
      const expenseTag = ExpenseTag.create({ expenseId, tagId });
      expenseTags.push(expenseTag);
      addedTagIds.push(tagId.getValue());
    }

    if (expenseTags.length > 0) {
      await this.expenseCommandRepo.save(expense);
      await this.expenseTagCommandRepo.addMany(expenseTags);
    }

    return {
      success: true,
      expenseId: command.expenseId,
      addedTagIds,
      skippedTagIds,
    };
  }
}
