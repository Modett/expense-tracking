export class ReceivePurchaseOrderCommand {
  constructor(
    public readonly purchaseOrderId: string,
    public readonly isPartial: boolean
  ) {}
}
