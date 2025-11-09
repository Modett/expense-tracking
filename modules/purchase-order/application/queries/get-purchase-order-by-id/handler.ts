import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PurchaseOrderId } from "../../../domain/index.js";
import type { GetPurchaseOrderByIdQuery } from "./query.js";

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

export class GetPurchaseOrderByIdQueryHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository
  ) {}

  async handle(query: GetPurchaseOrderByIdQuery): Promise<PurchaseOrderDTO | null> {
    const purchaseOrderId = PurchaseOrderId.fromString(query.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(purchaseOrderId);

    if (!purchaseOrder) {
      return null;
    }

    return purchaseOrder.toPlainObject();
  }
}
