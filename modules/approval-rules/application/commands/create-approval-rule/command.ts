export class CreateApprovalRuleCommand {
  constructor(
    public readonly categoryId: string | null | undefined,
    public readonly departmentId: string | null | undefined,
    public readonly minAmount: number,
    public readonly approverRole: string,
    public readonly approvalOrder: number
  ) {}
}
