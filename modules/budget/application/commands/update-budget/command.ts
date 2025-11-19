export class UpdateBudgetCommand {
  constructor(
    public readonly budgetId: string,
    public readonly departmentId?: string | null,
    public readonly categoryId?: string | null,
    public readonly budgetAmount?: number,
    public readonly enforcementType?: "soft" | "hard",
    public readonly overrideAllowed?: boolean,
    public readonly warningThreshold1?: number,
    public readonly warningThreshold2?: number,
    public readonly criticalThreshold?: number
  ) {}
}
