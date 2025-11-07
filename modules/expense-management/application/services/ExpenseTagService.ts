import { Expense } from "../../domain/entities/Expense.js";
import { ExpenseTag } from "../../domain/entities/ExpenseTag.js";
import { ExpenseId, TagId } from "../../domain/value-objects/index.js";
import type { IExpenseTagCommandRepository } from "../../domain/repositories/IExpenseTagCommandRepository.js";
import type { IExpenseTagQueryRepository } from "../../domain/repositories/IExpenseTagQueryRepository.js";

export class ExpenseTagService {
  constructor(
    private readonly commandRepo: IExpenseTagCommandRepository,
    private readonly queryRepo: IExpenseTagQueryRepository
  ) {}

  async addTagToExpense(expense: Expense, tagId: TagId): Promise<void> {
    if (expense.hasTag(tagId)) {
      throw new Error("Tag already exists on this expense");
    }

    expense.addTag(tagId);
    const expenseTag = ExpenseTag.create({
      expenseId: expense.id,
      tagId: tagId,
    });
    await this.commandRepo.add(expenseTag);
  }

  async removeTagFromExpense(expense: Expense, tagId: TagId): Promise<void> {
    if (!expense.hasTag(tagId)) {
      throw new Error("Tag does not exist on this expense");
    }

    expense.removeTag(tagId);
    await this.commandRepo.remove(expense.id, tagId);
  }

  async bulkAddTagsToExpense(
    expense: Expense,
    tagIds: TagId[]
  ): Promise<void> {
    const expenseTags: ExpenseTag[] = [];

    for (const tagId of tagIds) {
      if (!expense.hasTag(tagId)) {
        expense.addTag(tagId);
        const expenseTag = ExpenseTag.create({
          expenseId: expense.id,
          tagId: tagId,
        });
        expenseTags.push(expenseTag);
      }
    }

    if (expenseTags.length > 0) {
      await this.commandRepo.addMany(expenseTags);
    }
  }

  async bulkRemoveTagsFromExpense(
    expense: Expense,
    tagIds: TagId[]
  ): Promise<void> {
    const relationships: Array<{ expenseId: ExpenseId; tagId: TagId }> = [];

    for (const tagId of tagIds) {
      if (expense.hasTag(tagId)) {
        expense.removeTag(tagId);
        relationships.push({ expenseId: expense.id, tagId });
      }
    }

    if (relationships.length > 0) {
      await this.commandRepo.removeMany(relationships);
    }
  }

  async addTagToMultipleExpenses(
    expenses: Expense[],
    tagId: TagId
  ): Promise<void> {
    const expenseTags: ExpenseTag[] = [];

    for (const expense of expenses) {
      if (!expense.hasTag(tagId)) {
        expense.addTag(tagId);
        const expenseTag = ExpenseTag.create({
          expenseId: expense.id,
          tagId: tagId,
        });
        expenseTags.push(expenseTag);
      }
    }

    if (expenseTags.length > 0) {
      await this.commandRepo.addMany(expenseTags);
    }
  }

  async removeTagFromMultipleExpenses(
    expenses: Expense[],
    tagId: TagId
  ): Promise<void> {
    const relationships: Array<{ expenseId: ExpenseId; tagId: TagId }> = [];

    for (const expense of expenses) {
      if (expense.hasTag(tagId)) {
        expense.removeTag(tagId);
        relationships.push({ expenseId: expense.id, tagId });
      }
    }

    if (relationships.length > 0) {
      await this.commandRepo.removeMany(relationships);
    }
  }

  async syncExpenseTags(expense: Expense): Promise<void> {
    const existingTags = await this.queryRepo.findByExpenseId(expense.id);
    const currentTagIds = expense.tagIds;

    const existingTagIds = existingTags.map((et) => et.tagId);
    const tagsToAdd = currentTagIds.filter(
      (tagId) => !existingTagIds.some((etId) => etId.equals(tagId))
    );
    const tagsToRemove = existingTagIds.filter(
      (etId) => !currentTagIds.some((tagId) => tagId.equals(etId))
    );

    if (tagsToAdd.length > 0) {
      const expenseTags = tagsToAdd.map((tagId) =>
        ExpenseTag.create({ expenseId: expense.id, tagId })
      );
      await this.commandRepo.addMany(expenseTags);
    }

    if (tagsToRemove.length > 0) {
      const relationships = tagsToRemove.map((tagId) => ({
        expenseId: expense.id,
        tagId,
      }));
      await this.commandRepo.removeMany(relationships);
    }
  }

  async clearAllTagsFromExpense(expense: Expense): Promise<void> {
    const existingTags = expense.tagIds;
    for (const tagId of existingTags) {
      expense.removeTag(tagId);
    }
    await this.commandRepo.removeAllForExpense(expense.id);
  }

  async getExpenseTagCount(expenseId: ExpenseId): Promise<number> {
    return await this.queryRepo.countByExpenseId(expenseId);
  }

  async getTagUsageCount(tagId: TagId): Promise<number> {
    return await this.queryRepo.countByTagId(tagId);
  }

  async hasAnyExpensesWithTag(tagId: TagId): Promise<boolean> {
    const count = await this.queryRepo.countByTagId(tagId);
    return count > 0;
  }

  async findExpensesByTag(tagId: TagId): Promise<ExpenseTag[]> {
    return await this.queryRepo.findByTagId(tagId);
  }

  async findExpensesByAllTags(tagIds: TagId[]): Promise<ExpenseId[]> {
    return await this.queryRepo.findExpensesByAllTags(tagIds);
  }

  async validateTagsExist(
    expenseId: ExpenseId,
    tagIds: TagId[]
  ): Promise<Map<string, boolean>> {
    const relationships = tagIds.map((tagId) => ({ expenseId, tagId }));
    return await this.queryRepo.existsMany(relationships);
  }
}
