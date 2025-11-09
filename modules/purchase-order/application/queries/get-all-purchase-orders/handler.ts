import type {
  IPurchaseOrderQueryRepository,
  PurchaseOrderFilters,
} from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { VendorId, POStatus } from "../../../domain/index.js";
import type { GetAllPurchaseOrdersQuery } from "./query.js";

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

export class GetAllPurchaseOrdersQueryHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository
  ) {}

  async handle(query: GetAllPurchaseOrdersQuery): Promise<PurchaseOrderDTO[]> {
    const filters: PurchaseOrderFilters = {};

    if (query.vendorId) {
      filters.vendorId = VendorId.fromString(query.vendorId);
    }

    if (query.status) {
      filters.status = POStatus.fromString(query.status);
    }

    if (query.issuedDateFrom) {
      filters.issuedDateFrom = query.issuedDateFrom;
    }

    if (query.issuedDateTo) {
      filters.issuedDateTo = query.issuedDateTo;
    }

    if (query.minTotalValue !== undefined) {
      filters.minTotalValue = query.minTotalValue;
    }

    if (query.maxTotalValue !== undefined) {
      filters.maxTotalValue = query.maxTotalValue;
    }

    const purchaseOrders = await this.purchaseOrderQueryRepo.findAll(filters);

    return purchaseOrders.map((po) => po.toPlainObject());
  }
}
