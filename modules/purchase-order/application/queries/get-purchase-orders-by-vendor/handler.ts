import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { VendorId } from "../../../domain/index.js";
import type { GetPurchaseOrdersByVendorQuery } from "./query.js";

export interface PurchaseOrderDTO {
  id: string;
  poNumber: string;
  vendorId: string;
  totalValue: number;
  status: string;
  description: string | null;
  issuedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class GetPurchaseOrdersByVendorQueryHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository
  ) {}

  async handle(query: GetPurchaseOrdersByVendorQuery): Promise<PurchaseOrderDTO[]> {
    const vendorId = VendorId.fromString(query.vendorId);

    const purchaseOrders = await this.purchaseOrderQueryRepo.findByVendor(vendorId);

    return purchaseOrders.map((po) => po.toPlainObject());
  }
}
