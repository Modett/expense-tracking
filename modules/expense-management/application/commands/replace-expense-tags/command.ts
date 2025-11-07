export class ReplaceExpenseTagsCommand {
  constructor(
    public readonly expenseId: string,
    public readonly tagIds: string[]
  ) {}
}
