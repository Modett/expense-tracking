export class UpdateExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly vendorId?: string,
    public readonly categoryId?: string,
    public readonly departmentId?: string,
    public readonly description?: string,
    public readonly netAmount?: number,
    public readonly taxAmount?: number,
    public readonly totalAmount?: number,
    public readonly expenseDate?: Date,
    public readonly receiptUrl?: string
  ) {}
}
