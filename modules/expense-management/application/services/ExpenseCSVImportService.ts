import csv from "csv-parser";
import fs from "fs";
import type { IExpenseCommandRepository } from "../../domain/repositories/IExpenseCommandRepository.js";
import { Expense } from "../../domain/entities/Expense.js";
import {
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
  ExpenseDescription,
  ExpenseAmount,
  DateOfExpense,
  Receipt,
} from "../../domain/value-objects/index.js";

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{ row: number; error: string }>;
  importedExpenseIds: string[];
}

interface ExpenseCSVRow {
  userId: string;
  vendorId: string;
  categoryId: string;
  departmentId: string;
  description: string;
  netAmount: string;
  taxAmount: string;
  totalAmount: string;
  expenseDate: string;
  receiptUrl?: string;
}

export class ExpenseCSVImportService {
  constructor(private readonly expenseCommandRepo: IExpenseCommandRepository) {}

  async importFromCSV(filePath: string): Promise<CSVImportResult> {
    const results: ExpenseCSVRow[] = [];
    const errors: Array<{ row: number; error: string }> = [];
    const importedExpenseIds: string[] = [];
    let rowNumber = 0;

    // Read CSV file
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data: ExpenseCSVRow) => {
          rowNumber++;
          results.push(data);
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    let successfulImports = 0;
    let failedImports = 0;

    // Process each row
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const currentRow = i + 2; // +2 because: +1 for array index, +1 for header row

      try {
        if (!row) {
          throw new Error("Invalid row data");
        }

        // Validate required fields
        if (
          !row.userId ||
          !row.vendorId ||
          !row.categoryId ||
          !row.departmentId ||
          !row.description ||
          !row.netAmount ||
          !row.taxAmount ||
          !row.totalAmount ||
          !row.expenseDate
        ) {
          throw new Error("Missing required fields");
        }

        // Create value objects
        const userId = UserId.fromString(row.userId);
        const vendorId = VendorId.fromString(row.vendorId);
        const categoryId = CategoryId.fromString(row.categoryId);
        const departmentId = DepartmentId.fromString(row.departmentId);
        const description = ExpenseDescription.fromString(row.description);
        const amount = ExpenseAmount.create(
          parseFloat(row.netAmount),
          parseFloat(row.taxAmount),
          parseFloat(row.totalAmount)
        );
        const dateOfExpense = DateOfExpense.create(new Date(row.expenseDate));
        const receipt = row.receiptUrl
          ? Receipt.fromString(row.receiptUrl)
          : undefined;

        // Create expense entity
        const expense = receipt
          ? Expense.create({
              userId,
              vendorId,
              categoryId,
              departmentId,
              description,
              amount,
              dateOfExpense,
              receipt,
            })
          : Expense.create({
              userId,
              vendorId,
              categoryId,
              departmentId,
              description,
              amount,
              dateOfExpense,
            });

        // Save to database
        await this.expenseCommandRepo.save(expense);

        importedExpenseIds.push(expense.id.getValue());
        successfulImports++;
      } catch (error) {
        failedImports++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push({
          row: currentRow,
          error: errorMessage,
        });
      }
    }

    return {
      success: failedImports === 0,
      totalRows: results.length,
      successfulImports,
      failedImports,
      errors,
      importedExpenseIds,
    };
  }
}
