export class CreateBudgetCommand {
  constructor(
    public readonly departmentId: string,
    public readonly categoryId: string | null, // Optional for department-based budgets
    public readonly budgetAmount: number,
    public readonly fiscalPeriod: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
