import type { PurchaseOrder } from "../entities/PurchaseOrder.js";
import type { PurchaseOrderId } from "../value-objects/index.js";

export interface IPurchaseOrderCommandRepository {
  save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
  saveMany(purchaseOrders: PurchaseOrder[]): Promise<PurchaseOrder[]>;
  delete(purchaseOrderId: PurchaseOrderId): Promise<void>;
  exists(purchaseOrderId: PurchaseOrderId): Promise<boolean>;
}
