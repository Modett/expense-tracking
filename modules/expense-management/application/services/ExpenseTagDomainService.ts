import type { IExpenseTagQueryRepository } from "../../domain/repositories/IExpenseTagQueryRepository.js";
import type { ExpenseId, TagId } from "../../domain/value-objects/index.js";

export class ExpenseTagDomainService {
  constructor(
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository
  ) {}

  async ensureTagDoesNotExist(
    expenseId: ExpenseId,
    tagId: TagId
  ): Promise<void> {
    const exists = await this.expenseTagQueryRepo.exists(expenseId, tagId);
    if (exists) {
      throw new Error("Tag already exists on this expense");
    }
  }

  async ensureTagExists(expenseId: ExpenseId, tagId: TagId): Promise<void> {
    const exists = await this.expenseTagQueryRepo.exists(expenseId, tagId);
    if (!exists) {
      throw new Error("Tag does not exist on this expense");
    }
  }

  async ensureExpenseHasTags(expenseId: ExpenseId): Promise<void> {
    const hasTags = await this.expenseTagQueryRepo.hasAnyTags(expenseId);
    if (!hasTags) {
      throw new Error("Expense must have at least one tag");
    }
  }

  async ensureTagLimitNotExceeded(
    expenseId: ExpenseId,
    maxTags: number = 10
  ): Promise<void> {
    const count = await this.expenseTagQueryRepo.countByExpenseId(expenseId);
    if (count >= maxTags) {
      throw new Error(`Expense cannot have more than ${maxTags} tags`);
    }
  }

  async findExpensesWithAllTags(tagIds: TagId[]): Promise<ExpenseId[]> {
    if (tagIds.length === 0) {
      return [];
    }
    return await this.expenseTagQueryRepo.findExpensesByAllTags(tagIds);
  }

  async filterNonExistingTags(
    expenseId: ExpenseId,
    tagIds: TagId[]
  ): Promise<TagId[]> {
    const relationships = tagIds.map((tagId) => ({ expenseId, tagId }));
    const existenceMap = await this.expenseTagQueryRepo.existsMany(
      relationships
    );

    return tagIds.filter((tagId) => {
      const key = `${expenseId.getValue()}_${tagId.getValue()}`;
      return !existenceMap.get(key);
    });
  }

  async filterExistingTags(
    expenseId: ExpenseId,
    tagIds: TagId[]
  ): Promise<TagId[]> {
    const relationships = tagIds.map((tagId) => ({ expenseId, tagId }));
    const existenceMap = await this.expenseTagQueryRepo.existsMany(
      relationships
    );

    return tagIds.filter((tagId) => {
      const key = `${expenseId.getValue()}_${tagId.getValue()}`;
      return existenceMap.get(key) === true;
    });
  }
}
