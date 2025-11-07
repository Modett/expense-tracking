export class AddTagToExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly tagId: string
  ) {}
}
