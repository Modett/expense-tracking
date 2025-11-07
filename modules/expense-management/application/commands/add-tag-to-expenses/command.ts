export class AddTagToExpensesCommand {
  constructor(
    public readonly expenseIds: string[],
    public readonly tagId: string
  ) {}
}
