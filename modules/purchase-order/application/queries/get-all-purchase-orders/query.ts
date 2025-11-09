export class GetAllPurchaseOrdersQuery {
  constructor(
    public readonly vendorId?: string,
    public readonly status?: string,
    public readonly issuedDateFrom?: Date,
    public readonly issuedDateTo?: Date,
    public readonly minTotalValue?: number,
    public readonly maxTotalValue?: number
  ) {}
}
