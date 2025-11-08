export class AdjustBudgetSpentCommand {
  constructor(
    public readonly budgetId: string,
    public readonly amount: number,
    public readonly operation: "add" | "subtract"
  ) {}
}
