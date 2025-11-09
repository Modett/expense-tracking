export class UpdatePurchaseOrderCommand {
  constructor(
    public readonly purchaseOrderId: string,
    public readonly totalValue?: number,
    public readonly description?: string
  ) {}
}
