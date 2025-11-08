export class GetBudgetStatusQuery {
  constructor(
    public readonly departmentId: string,
    public readonly categoryId: string,
    public readonly fiscalPeriod: string
  ) {}
}
