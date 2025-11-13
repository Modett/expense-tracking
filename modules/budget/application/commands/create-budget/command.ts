export class CreateBudgetCommand {
  constructor(
    public readonly departmentId: string,
    public readonly categoryId: string | null, // Optional for department-based budgets
    public readonly budgetAmount: number,
    public readonly fiscalPeriod: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly enforcementType?: string,
    public readonly overrideAllowed?: boolean,
    public readonly warningThreshold1?: number,
    public readonly warningThreshold2?: number,
    public readonly criticalThreshold?: number
  ) {}
}
