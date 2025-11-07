export class RemoveTagsFromExpenseCommand {
  constructor(
    public readonly expenseId: string,
    public readonly tagIds: string[]
  ) {}
}
