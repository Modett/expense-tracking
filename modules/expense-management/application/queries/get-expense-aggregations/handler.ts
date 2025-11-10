import type {
  IExpenseQueryRepository,
  ExpenseFilters,
  ExpenseAggregation,
} from "../../../domain/repositories/IExpenseQueryRepository.js";
import {
  ExpenseStatus,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
} from "../../../domain/value-objects/index.js";
import type { GetExpenseAggregationsQuery } from "./query.js";

export class GetExpenseAggregationsQueryHandler {
  constructor(private readonly expenseQueryRepo: IExpenseQueryRepository) {}

  async handle(
    query: GetExpenseAggregationsQuery
  ): Promise<ExpenseAggregation[]> {
    const filters: ExpenseFilters = {};

    // Apply filters
    if (query.status) {
      filters.status = ExpenseStatus.fromString(query.status);
    }

    if (query.userId) {
      filters.userId = UserId.fromString(query.userId);
    }

    if (query.vendorId) {
      filters.vendorId = VendorId.fromString(query.vendorId);
    }

    if (query.categoryId) {
      filters.categoryId = CategoryId.fromString(query.categoryId);
    }

    if (query.departmentId) {
      filters.departmentId = DepartmentId.fromString(query.departmentId);
    }

    if (query.dateFrom) {
      filters.dateFrom = new Date(query.dateFrom);
    }

    if (query.dateTo) {
      filters.dateTo = new Date(query.dateTo);
    }

    // Default group by department, vendor, category if not specified
    const groupBy = query.groupBy || ["department", "vendor", "category"];

    return await this.expenseQueryRepo.getAggregations(filters, groupBy);
  }
}
