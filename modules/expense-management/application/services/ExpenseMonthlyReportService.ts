import { createObjectCsvWriter } from "csv-writer";
import type { IExpenseQueryRepository } from "../../domain/repositories/IExpenseQueryRepository.js";
import { ExpenseStatus } from "../../domain/value-objects/ExpenseStatus.js";

export interface MonthlyReportOptions {
  month: number; // 1-12
  year: number;
  departmentId?: string | undefined;
  userId?: string | undefined;
  categoryId?: string | undefined;
  vendorId?: string | undefined;
  status?: string | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  tagIds?: string[] | undefined;
}

export class ExpenseMonthlyReportService {
  constructor(private readonly expenseQueryRepo: IExpenseQueryRepository) {}

  async generateMonthlyReport(options: MonthlyReportOptions): Promise<string> {
    const {
      month,
      year,
      departmentId,
      userId,
      categoryId,
      vendorId,
      status,
      minAmount,
      maxAmount,
      tagIds,
    } = options;

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build filters for expenses
    const filters: any = {
      status: status
        ? ExpenseStatus.fromString(status)
        : ExpenseStatus.fromString("APPROVED"),
    };

    if (departmentId) {
      const { DepartmentId } = await import(
        "../../domain/value-objects/index.js"
      );
      filters.departmentId = DepartmentId.fromString(departmentId);
    }

    if (userId) {
      const { UserId } = await import("../../domain/value-objects/index.js");
      filters.userId = UserId.fromString(userId);
    }

    if (categoryId) {
      const { CategoryId } = await import(
        "../../domain/value-objects/index.js"
      );
      filters.categoryId = CategoryId.fromString(categoryId);
    }

    if (vendorId) {
      const { VendorId } = await import("../../domain/value-objects/index.js");
      filters.vendorId = VendorId.fromString(vendorId);
    }

    // Fetch all expenses with filters
    const allExpenses = await this.expenseQueryRepo.findAll(filters);

    // Filter by approval date (updatedAt) and additional criteria in memory
    const expenses = allExpenses.filter((expense) => {
      const approvalDate = expense.updatedAt;

      // Date range filter
      if (approvalDate < startDate || approvalDate > endDate) {
        return false;
      }

      // Amount range filter
      const totalAmount = expense.amount.getTotalValue();
      if (minAmount !== undefined && totalAmount < minAmount) {
        return false;
      }
      if (maxAmount !== undefined && totalAmount > maxAmount) {
        return false;
      }

      // Tag filter
      if (tagIds && tagIds.length > 0) {
        const expenseTagIds = expense.tagIds.map((tag) => tag.getValue());
        const hasMatchingTag = tagIds.some((tagId) =>
          expenseTagIds.includes(tagId)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });

    // Calculate totals
    const totalNet = expenses.reduce(
      (sum, exp) => sum + exp.amount.getNetValue(),
      0
    );
    const totalTax = expenses.reduce(
      (sum, exp) => sum + exp.amount.getTaxValue(),
      0
    );
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + exp.amount.getTotalValue(),
      0
    );

    // Define CSV file path
    const timestamp = Date.now();
    const monthName = new Date(year, month - 1).toLocaleString("default", {
      month: "long",
    });
    const filePath = `./exports/monthly-report-${monthName}-${year}-${timestamp}.csv`;

    // Create CSV writer with summary at the top
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "expenseId", title: "Expense ID" },
        { id: "userId", title: "User ID" },
        { id: "vendorId", title: "Vendor ID" },
        { id: "categoryId", title: "Category ID" },
        { id: "departmentId", title: "Department ID" },
        { id: "description", title: "Description" },
        { id: "netAmount", title: "Net Amount" },
        { id: "taxAmount", title: "Tax Amount" },
        { id: "totalAmount", title: "Total Amount" },
        { id: "expenseDate", title: "Expense Date" },
        { id: "approvedAt", title: "Approved At" },
        { id: "linkedPOId", title: "Linked PO ID" },
        { id: "inventoryDropId", title: "Inventory Drop ID" },
      ],
    });

    // Map expenses to CSV format
    const records = expenses.map((expense) => ({
      expenseId: expense.id.getValue(),
      userId: expense.userId.getValue(),
      vendorId: expense.vendorId.getValue(),
      categoryId: expense.categoryId.getValue(),
      departmentId: expense.departmentId.getValue(),
      description: expense.description.getValue(),
      netAmount: expense.amount.getNetValue(),
      taxAmount: expense.amount.getTaxValue(),
      totalAmount: expense.amount.getTotalValue(),
      expenseDate: expense.dateOfExpense.getValue().toISOString().split("T")[0],
      approvedAt: expense.updatedAt.toISOString().split("T")[0],
      linkedPOId: expense.linkedPOId?.getValue() || "",
      inventoryDropId: expense.inventoryDropId?.getValue() || "",
    }));

    // Write expenses to CSV
    await csvWriter.writeRecords(records);

    // Append summary to the file
    const fs = await import("fs");
    const summaryText = `\n\nMONTHLY SUMMARY - ${monthName} ${year}\n`;
    const summaryLines = [
      `Total Expenses,${expenses.length}`,
      `Total Net Amount,${totalNet.toFixed(2)}`,
      `Total Tax Amount,${totalTax.toFixed(2)}`,
      `Total Amount,${totalAmount.toFixed(2)}`,
    ].join("\n");

    await fs.promises.appendFile(filePath, summaryText + summaryLines);

    return filePath;
  }
}
