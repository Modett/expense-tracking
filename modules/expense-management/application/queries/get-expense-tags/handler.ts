import type { IExpenseTagQueryRepository } from "../../../domain/repositories/IExpenseTagQueryRepository.js";
import { ExpenseId } from "../../../domain/value-objects/index.js";
import type { GetExpenseTagsQuery } from "./query.js";

export interface ExpenseTagResponse {
  expenseId: string;
  tagId: string;
  createdAt: Date;
}

export interface GetExpenseTagsResponse {
  expenseId: string;
  tags: ExpenseTagResponse[];
  count: number;
}

export class GetExpenseTagsQueryHandler {
  constructor(
    private readonly expenseTagQueryRepo: IExpenseTagQueryRepository
  ) {}

  async handle(query: GetExpenseTagsQuery): Promise<GetExpenseTagsResponse> {
    const expenseId = ExpenseId.fromString(query.expenseId);

    const expenseTags = await this.expenseTagQueryRepo.findByExpenseId(expenseId);

    return {
      expenseId: query.expenseId,
      tags: expenseTags.map((et) => ({
        expenseId: et.expenseId.getValue(),
        tagId: et.tagId.getValue(),
        createdAt: et.createdAt,
      })),
      count: expenseTags.length,
    };
  }
}
