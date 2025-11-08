export class CreateApprovalRuleCommand {
  constructor(
    public readonly categoryId: string,
    public readonly minAmount: number,
    public readonly approverRole: string,
    public readonly approvalOrder: number
  ) {}
}
