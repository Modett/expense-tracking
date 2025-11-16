import type { IExpenseQueryRepository } from "../../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseId } from "../../../domain/value-objects/index.js";
import type { GetExpenseByIdQuery } from "./query.js";

export interface GetExpenseByIdResponse {
  id: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId: string | null;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  priority: string;
  budgetOverride: string;
  justification?: string | null;
  approvalDeadline?: Date | null;
  receiptUrl?: string;
  dateOfExpense: Date;
  linkedPOId?: string;
  inventoryDropId?: string;
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
  // Nested relations for frontend display
  vendor?: {
    vendorId: string;
    name: string;
  } | null;
  category?: {
    categoryId: string;
    name: string;
  } | null;
  department?: {
    departmentId: string;
    name: string;
  } | null;
  user?: {
    userId: string;
    name: string;
    email: string;
  } | null;
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
      priority: plainObject.priority,
      budgetOverride: plainObject.budgetOverride,
      justification: plainObject.justification,
      approvalDeadline: plainObject.approvalDeadline,
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

    // Add nested relations if available (populated by query repository)
    if (plainObject.vendor) {
      response.vendor = {
        vendorId: plainObject.vendor.vendorId,
        name: plainObject.vendor.name,
      };
    }
    if (plainObject.category) {
      response.category = {
        categoryId: plainObject.category.categoryId,
        name: plainObject.category.name,
      };
    }
    if (plainObject.department) {
      response.department = {
        departmentId: plainObject.department.departmentId,
        name: plainObject.department.name,
      };
    }
    if (plainObject.user) {
      response.user = {
        userId: plainObject.user.userId,
        name: plainObject.user.name,
        email: plainObject.user.email,
      };
    }

    return response;
  }
}
