import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PurchaseOrderId } from "../../../domain/index.js";
import type { IssuePurchaseOrderCommand } from "./command.js";

export interface IssuePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
}

export class IssuePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository
  ) {}

  async handle(
    command: IssuePurchaseOrderCommand
  ): Promise<IssuePurchaseOrderResponse> {
    const purchaseOrderId = PurchaseOrderId.fromString(command.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(purchaseOrderId);
    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${command.purchaseOrderId} not found`);
    }

    purchaseOrder.issue();

    await this.purchaseOrderCommandRepo.save(purchaseOrder);

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id.getValue(),
    };
  }
}
