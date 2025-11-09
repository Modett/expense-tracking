export class CreatePurchaseOrderCommand {
  constructor(
    public readonly poNumber: string,
    public readonly vendorId: string,
    public readonly totalValue: number,
    public readonly description: string | undefined,
    public readonly issuedDate: Date | undefined
  ) {}
}
