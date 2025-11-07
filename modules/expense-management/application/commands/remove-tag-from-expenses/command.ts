export class RemoveTagFromExpensesCommand {
  constructor(
    public readonly expenseIds: string[],
    public readonly tagId: string
  ) {}
}
