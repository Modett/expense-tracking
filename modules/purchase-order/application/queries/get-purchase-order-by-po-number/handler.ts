import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PONumber } from "../../../domain/index.js";
import type { GetPurchaseOrderByPONumberQuery } from "./query.js";

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

export class GetPurchaseOrderByPONumberQueryHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository
  ) {}

  async handle(query: GetPurchaseOrderByPONumberQuery): Promise<PurchaseOrderDTO | null> {
    const poNumber = PONumber.create(query.poNumber);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findByPONumber(poNumber);

    if (!purchaseOrder) {
      return null;
    }

    return purchaseOrder.toPlainObject();
  }
}
