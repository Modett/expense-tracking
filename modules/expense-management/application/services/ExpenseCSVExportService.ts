import { createObjectCsvWriter } from "csv-writer";
import type { IExpenseQueryRepository } from "../../domain/repositories/IExpenseQueryRepository.js";
import type { ExpenseFilters } from "../../domain/repositories/IExpenseQueryRepository.js";

export class ExpenseCSVExportService {
  constructor(private readonly expenseQueryRepo: IExpenseQueryRepository) {}

  async exportToCSV(filters?: ExpenseFilters): Promise<string> {
    // Fetch expenses based on filters
    const expenses = await this.expenseQueryRepo.findAll(filters);

    // Define CSV file path (temporary)
    const timestamp = Date.now();
    const filePath = `./exports/expenses-${timestamp}.csv`;

    // Create CSV writer
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
        { id: "status", title: "Status" },
        { id: "expenseDate", title: "Expense Date" },
        { id: "linkedPOId", title: "Linked PO ID" },
        { id: "inventoryDropId", title: "Inventory Drop ID" },
        { id: "createdAt", title: "Created At" },
        { id: "updatedAt", title: "Updated At" },
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
      status: expense.status.getValue(),
      expenseDate: expense.dateOfExpense.getValue().toISOString(),
      linkedPOId: expense.linkedPOId?.getValue() || "",
      inventoryDropId: expense.inventoryDropId?.getValue() || "",
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    // Write to CSV
    await csvWriter.writeRecords(records);

    return filePath;
  }
}
