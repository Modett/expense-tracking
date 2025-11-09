import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PurchaseOrderId } from "../../../domain/index.js";
import type { DeletePurchaseOrderCommand } from "./command.js";

export interface DeletePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
}

export class DeletePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository
  ) {}

  async handle(
    command: DeletePurchaseOrderCommand
  ): Promise<DeletePurchaseOrderResponse> {
    const purchaseOrderId = PurchaseOrderId.fromString(command.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(purchaseOrderId);
    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${command.purchaseOrderId} not found`);
    }

    // Only allow deletion of draft purchase orders
    if (!purchaseOrder.isDraft()) {
      throw new Error("Only draft purchase orders can be deleted");
    }

    await this.purchaseOrderCommandRepo.delete(purchaseOrderId);

    return {
      success: true,
      purchaseOrderId: purchaseOrderId.getValue(),
    };
  }
}
