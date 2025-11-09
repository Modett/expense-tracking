import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import {
  PurchaseOrderId,
  TotalValue,
} from "../../../domain/index.js";
import type { UpdatePurchaseOrderCommand } from "./command.js";

export interface UpdatePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
}

export class UpdatePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository
  ) {}

  async handle(
    command: UpdatePurchaseOrderCommand
  ): Promise<UpdatePurchaseOrderResponse> {
    const purchaseOrderId = PurchaseOrderId.fromString(command.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(purchaseOrderId);
    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${command.purchaseOrderId} not found`);
    }

    // Update total value if provided
    if (command.totalValue !== undefined) {
      const totalValue = TotalValue.create(command.totalValue);
      purchaseOrder.updateTotalValue(totalValue);
    }

    // Update description if provided
    if (command.description !== undefined) {
      purchaseOrder.updateDescription(command.description);
    }

    await this.purchaseOrderCommandRepo.save(purchaseOrder);

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id.getValue(),
    };
  }
}
