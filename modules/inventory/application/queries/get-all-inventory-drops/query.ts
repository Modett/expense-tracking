export class GetAllInventoryDropsQuery {
  constructor(
    public readonly fabricType?: string,
    public readonly supplier?: string,
    public readonly receivedDateFrom?: Date,
    public readonly receivedDateTo?: Date,
    public readonly minQuantity?: number,
    public readonly maxQuantity?: number,
    public readonly minTotalCost?: number,
    public readonly maxTotalCost?: number
  ) {}
}
