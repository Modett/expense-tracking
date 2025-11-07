import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/value-objects/index.js";
import type { GetExpenseByIdQuery } from "./query.js";

export interface GetExpenseByIdResponse {
  id: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId: string;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  receiptUrl?: string;
  dateOfExpense: Date;
  linkedPOId?: string;
  inventoryDropId?: string;
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class GetExpenseByIdQueryHandler {
  constructor(private readonly expenseQueryRepo: IExpenseQueryRepository) {}

  async handle(query: GetExpenseByIdQuery): Promise<GetExpenseByIdResponse> {
    const expenseId = ExpenseId.fromString(query.expenseId);

    const expense = await this.expenseQueryRepo.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const plainObject = expense.toPlainObject();

    const response: GetExpenseByIdResponse = {
      id: plainObject.id,
      userId: plainObject.userId,
      vendorId: plainObject.vendorId,
      categoryId: plainObject.categoryId,
      departmentId: plainObject.departmentId,
      description: plainObject.description,
      netAmount: plainObject.amountNet,
      taxAmount: plainObject.taxAmount,
      totalAmount: plainObject.totalAmount,
      status: plainObject.status,
      dateOfExpense: plainObject.dateOfExpense,
      tagIds: plainObject.tagIds,
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };

    if (plainObject.receiptUrl) {
      response.receiptUrl = plainObject.receiptUrl;
    }
    if (plainObject.linkedPOId) {
      response.linkedPOId = plainObject.linkedPOId;
    }
    if (plainObject.inventoryDropId) {
      response.inventoryDropId = plainObject.inventoryDropId;
    }

    return response;
  }
}
