import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PurchaseOrderId } from "../../../domain/index.js";
import type { ClosePurchaseOrderCommand } from "./command.js";

export interface ClosePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
}

export class ClosePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository
  ) {}

  async handle(
    command: ClosePurchaseOrderCommand
  ): Promise<ClosePurchaseOrderResponse> {
    const purchaseOrderId = PurchaseOrderId.fromString(command.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(purchaseOrderId);
    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${command.purchaseOrderId} not found`);
    }

    purchaseOrder.close();

    await this.purchaseOrderCommandRepo.save(purchaseOrder);

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id.getValue(),
    };
  }
}
