export class CreateExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly vendorId: string | null,
    public readonly categoryId: string,
    public readonly departmentId: string | null,
    public readonly description: string,
    public readonly netAmount: number,
    public readonly taxAmount: number,
    public readonly totalAmount: number,
    public readonly expenseDate: Date,
    public readonly priority?: string, // 'routine' | 'standard' | 'urgent' | 'emergency'
    public readonly budgetOverride?: string, // 'none' | 'emergency' | 'annual' | 'recurring'
    public readonly justification?: string,
    public readonly receiptUrl?: string,
    public readonly tagIds: string[] = []
  ) {}
}
