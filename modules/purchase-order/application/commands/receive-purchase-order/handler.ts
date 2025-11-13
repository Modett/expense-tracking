import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import { PurchaseOrderId } from "../../../domain/index.js";
import type { ReceivePurchaseOrderCommand } from "./command.js";
// TODO: Create InventoryOrchestrationService when implementing inventory module
// import type { InventoryOrchestrationService } from "../../../inventory/application/services/InventoryOrchestrationService.js";

export interface ReceivePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
  inventoryCreated?: boolean;
  inventoryDropId?: string;
}

export class ReceivePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository,
    private readonly inventoryOrchestrationService?: any // InventoryOrchestrationService | null
  ) {}

  async handle(
    command: ReceivePurchaseOrderCommand
  ): Promise<ReceivePurchaseOrderResponse> {
    const purchaseOrderId = PurchaseOrderId.fromString(command.purchaseOrderId);

    const purchaseOrder = await this.purchaseOrderQueryRepo.findById(
      purchaseOrderId
    );
    if (!purchaseOrder) {
      throw new Error(
        `Purchase order with ID ${command.purchaseOrderId} not found`
      );
    }

    if (command.isPartial) {
      purchaseOrder.markAsPartial();
    } else {
      purchaseOrder.markAsReceived();
    }

    await this.purchaseOrderCommandRepo.save(purchaseOrder);

    // Automatically create inventory drop when PO is received (not for partial)
    if (!command.isPartial && this.inventoryOrchestrationService) {
      try {
        const inventoryResult =
          await this.inventoryOrchestrationService.createInventoryFromPurchaseOrder(
            purchaseOrder.id.getValue()
          );

        if (inventoryResult.success) {
          return {
            success: true,
            purchaseOrderId: purchaseOrder.id.getValue(),
            inventoryCreated: true,
            inventoryDropId: inventoryResult.inventoryDropId,
          };
        } else {
          // Inventory creation failed but PO receipt succeeded
          // Log error but don't fail the operation
          console.error(
            `Failed to create inventory after PO receipt: ${inventoryResult.error}`
          );
        }
      } catch (error) {
        // Log error but don't fail the operation
        console.error(`Error creating inventory after PO receipt:`, error);
      }
    }

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id.getValue(),
      inventoryCreated: false,
    };
  }
}
