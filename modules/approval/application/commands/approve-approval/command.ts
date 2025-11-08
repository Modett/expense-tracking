export class ApproveApprovalCommand {
  constructor(
    public readonly approvalId: string,
    public readonly approverId: string,
    public readonly comments?: string
  ) {}
}
