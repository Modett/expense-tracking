export class UpdateApprovalRuleCommand {
  constructor(
    public readonly approvalRuleId: string,
    public readonly categoryId?: string | null,
    public readonly departmentId?: string | null,
    public readonly minAmount?: number,
    public readonly approverRole?: string,
    public readonly approvalOrder?: number
  ) {}
}
