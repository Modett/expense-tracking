export class UpdateApprovalRuleCommand {
  constructor(
    public readonly approvalRuleId: string,
    public readonly categoryId?: string,
    public readonly minAmount?: number,
    public readonly approverRole?: string,
    public readonly approvalOrder?: number
  ) {}
}
