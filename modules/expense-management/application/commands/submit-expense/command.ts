export class SubmitExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly budgetOverride?: string,
    public readonly justification?: string | null
  ) {}
}
