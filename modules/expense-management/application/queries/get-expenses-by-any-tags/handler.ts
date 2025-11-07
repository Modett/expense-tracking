import type { IExpenseTagQueryRepository } from "../../../domain/repositories/IExpenseTagQueryRepository.js";
import { TagId } from "../../../domain/value-objects/index.js";
import type { GetExpensesByAnyTagsQuery } from "./query.js";

export interface GetExpensesByAnyTagsResponse {
  tagIds: string[];
  expenseIds: string[];
  count: number;
}

export class GetExpensesByAnyTagsQueryHandler {
  constructor(
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository
  ) {}

  async handle(
    query: GetExpensesByAnyTagsQuery
  ): Promise<GetExpensesByAnyTagsResponse> {
    if (query.tagIds.length === 0) {
      return {
        tagIds: [],
        expenseIds: [],
        count: 0,
      };
    }

    const tagIds = query.tagIds.map((id) => TagId.fromString(id));

    const expenseTags = await this.expenseTagQueryRepo.findByTagIds(tagIds);

    const uniqueExpenseIds = new Set<string>();
    for (const expenseTag of expenseTags) {
      uniqueExpenseIds.add(expenseTag.expenseId.getValue());
    }

    const expenseIds = Array.from(uniqueExpenseIds);

    return {
      tagIds: query.tagIds,
      expenseIds,
      count: expenseIds.length,
    };
  }
}
