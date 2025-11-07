import type { IExpenseCommandRepository } from "../../../domain/repositories/IExpenseCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseTagCommandRepository } from "../../../domain/repositories/IExpenseTagCommandRepository.js";
import type { IExpenseTagQueryRepository } from "../../../domain/repositories/IExpenseTagQueryRepository.js";
import { ExpenseId, TagId } from "../../../domain/value-objects/index.js";
import { ExpenseTag } from "../../../domain/entities/ExpenseTag.js";
import type { ReplaceExpenseTagsCommand } from "./command.js";

export interface ReplaceExpenseTagsResponse {
  success: boolean;
  expenseId: string;
  previousTagIds: string[];
  newTagIds: string[];
  addedTagIds: string[];
  removedTagIds: string[];
}

export class ReplaceExpenseTagsCommandHandler {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository,
    private readonly expenseTagCommandRepo: IExpenseTagCommandRepository
  ) {}

  async handle(command: ReplaceExpenseTagsCommand): Promise<ReplaceExpenseTagsResponse> {
    const expenseId = ExpenseId.fromString(command.expenseId);
    const newTagIds = command.tagIds.map((id) => TagId.fromString(id));

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const existingTags = await this.expenseTagQueryRepo.findByExpenseId(expenseId);
    const existingTagIds = existingTags.map((et) => et.tagId);
    const previousTagIds = existingTagIds.map((id) => id.getValue());

    const tagsToAdd = newTagIds.filter(
      (tagId) => !existingTagIds.some((etId) => etId.equals(tagId))
    );
    const tagsToRemove = existingTagIds.filter(
      (etId) => !newTagIds.some((tagId) => tagId.equals(etId))
    );

    for (const tagId of tagsToRemove) {
      expense.removeTag(tagId);
    }

    for (const tagId of tagsToAdd) {
      expense.addTag(tagId);
    }

    await this.expenseCommandRepo.save(expense);

    if (tagsToRemove.length > 0) {
      const relationships = tagsToRemove.map((tagId) => ({ expenseId, tagId }));
      await this.expenseTagCommandRepo.removeMany(relationships);
    }

    if (tagsToAdd.length > 0) {
      const expenseTags = tagsToAdd.map((tagId) =>
        ExpenseTag.create({ expenseId, tagId })
      );
      await this.expenseTagCommandRepo.addMany(expenseTags);
    }

    return {
      success: true,
      expenseId: command.expenseId,
      previousTagIds,
      newTagIds: command.tagIds,
      addedTagIds: tagsToAdd.map((id) => id.getValue()),
      removedTagIds: tagsToRemove.map((id) => id.getValue()),
    };
  }
}
