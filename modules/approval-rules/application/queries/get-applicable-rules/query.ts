export class GetApplicableRulesQuery {
  constructor(
    public readonly categoryId: string,
    public readonly amount: number
  ) {}
}
