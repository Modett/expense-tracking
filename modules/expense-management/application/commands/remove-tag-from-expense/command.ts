export class RemoveTagFromExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly tagId: string
  ) {}
}
