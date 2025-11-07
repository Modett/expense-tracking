export class AddTagsToExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly tagIds: string[]
  ) {}
}
