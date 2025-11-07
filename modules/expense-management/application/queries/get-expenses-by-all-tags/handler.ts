import type { IExpenseTagQueryRepository } from "../../../domain/repositories/IExpenseTagQueryRepository.js";
import { TagId } from "../../../domain/value-objects/index.js";
import type { GetExpensesByAllTagsQuery } from "./query.js";

export interface GetExpensesByAllTagsResponse {
  tagIds: string[];
  expenseIds: string[];
  count: number;
}

export class GetExpensesByAllTagsQueryHandler {
  constructor(
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository
  ) {}

  async handle(query: GetExpensesByAllTagsQuery): Promise<GetExpensesByAllTagsResponse> {
    if (query.tagIds.length === 0) {
      return {
        tagIds: [],
        expenseIds: [],
        count: 0,
      };
    }

    const tagIds = query.tagIds.map((id) => TagId.fromString(id));

    const expenseIds = await this.expenseTagQueryRepo.findExpensesByAllTags(tagIds);

    return {
      tagIds: query.tagIds,
      expenseIds: expenseIds.map((id) => id.getValue()),
      count: expenseIds.length,
    };
  }
}
