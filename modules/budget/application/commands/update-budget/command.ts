export class UpdateBudgetCommand {
  constructor(
    public readonly budgetId: string,
    public readonly budgetAmount: number
  ) {}
}
