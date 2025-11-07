import type { IExpenseTagQueryRepository } from "../../../domain/repositories/IExpenseTagQueryRepository.js";
import { TagId } from "../../../domain/value-objects/index.js";
import type { GetExpensesByTagQuery } from "./query.js";

export interface GetExpensesByTagResponse {
  tagId: string;
  expenseIds: string[];
  count: number;
}

export class GetExpensesByTagQueryHandler {
  constructor(
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository
  ) {}

  async handle(query: GetExpensesByTagQuery): Promise<GetExpensesByTagResponse> {
    const tagId = TagId.fromString(query.tagId);

    const expenseTags = await this.expenseTagQueryRepo.findByTagId(tagId);

    return {
      tagId: query.tagId,
      expenseIds: expenseTags.map((et) => et.expenseId.getValue()),
      count: expenseTags.length,
    };
  }
}
