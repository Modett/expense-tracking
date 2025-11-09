import type { PurchaseOrder } from "../entities/PurchaseOrder.js";
import type {
  PurchaseOrderId,
  VendorId,
  PONumber,
  POStatus,
} from "../value-objects/index.js";

export interface PurchaseOrderFilters {
  vendorId?: VendorId;
  status?: POStatus;
  issuedDateFrom?: Date;
  issuedDateTo?: Date;
  minTotalValue?: number;
  maxTotalValue?: number;
}

export interface IPurchaseOrderQueryRepository {
  findById(purchaseOrderId: PurchaseOrderId): Promise<PurchaseOrder | null>;
  findByPONumber(poNumber: PONumber): Promise<PurchaseOrder | null>;
  findByVendor(vendorId: VendorId): Promise<PurchaseOrder[]>;
  findByStatus(status: POStatus): Promise<PurchaseOrder[]>;
  findAll(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]>;
  count(filters?: PurchaseOrderFilters): Promise<number>;
  existsByPONumber(poNumber: PONumber): Promise<boolean>;
}
