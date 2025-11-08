export class UpdateApprovalCommand {
  constructor(
    public readonly approvalId: string,
    public readonly comments: string
  ) {}
}
