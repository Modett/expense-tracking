import type { IInventoryDropCommandRepository } from "../../domain/repositories/IInventoryDropCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../purchase-order/domain/repositories/IPurchaseOrderQueryRepository.js";
import type { IExpenseQueryRepository } from "../../../expense-management/domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseCommandRepository } from "../../../expense-management/domain/repositories/IExpenseCommandRepository.js";
import { InventoryDrop } from "../../domain/entities/InventoryDrop.js";
import {
  DropNumber,
  FabricType,
  Quantity,
  UnitCost,
} from "../../domain/value-objects/index.js";
import { PurchaseOrderId as POModulePurchaseOrderId } from "../../../purchase-order/domain/value-objects/PurchaseOrderId.js";
import { ExpenseId } from "../../../expense-management/domain/value-objects/ExpenseId.js";
import { InventoryDropId } from "../../../expense-management/domain/value-objects/InventoryDropId.js";

export interface InventoryCreationResult {
  success: boolean;
  inventoryDropId?: string;
  dropNumber?: string;
  error?: string;
}

/**
 * Orchestrates the creation of Inventory Drops from received Purchase Orders
 */
export class InventoryOrchestrationService {
  constructor(
    private readonly inventoryDropCommandRepo: IInventoryDropCommandRepository,
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository
  ) {}

  /**
   * Creates an Inventory Drop from a received Purchase Order
   * Called when a Purchase Order is marked as received
   */
  async createInventoryFromPurchaseOrder(
    purchaseOrderId: string
  ): Promise<InventoryCreationResult> {
    try {
      // Get Purchase Order
      const poIdVO = POModulePurchaseOrderId.fromString(purchaseOrderId);
      const purchaseOrder = await this.purchaseOrderQueryRepo.findById(poIdVO);

      if (!purchaseOrder) {
        return {
          success: false,
          error: `Purchase order with ID ${purchaseOrderId} not found`,
        };
      }

      // Check if PO is received
      if (!purchaseOrder.isReceived() && !purchaseOrder.isClosed()) {
        return {
          success: false,
          error: `Cannot create inventory: PO status is ${purchaseOrder.status.getValue()}, expected received or closed`,
        };
      }

      // Find expense linked to this PO
      const expense = await this.findExpenseByPOId(purchaseOrderId);

      if (!expense) {
        return {
          success: false,
          error: `No expense found linked to purchase order ${purchaseOrderId}`,
        };
      }

      // Check if inventory already exists for this expense
      if (expense.inventoryDropId) {
        return {
          success: false,
          error: `Inventory drop already exists for expense ${expense.id.getValue()}`,
        };
      }

      // Generate drop number (format: DROP-YYYYMMDD-XXXXX where XXXXX is first 5 chars of PO ID)
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const dropNumberStr = `DROP-${dateStr}-${purchaseOrderId.substring(0, 5).toUpperCase()}`;
      const dropNumber = DropNumber.create(dropNumberStr);

      // Create fabric type from expense category or description
      // Note: This is a simplified mapping - in production, you'd have proper category mapping
      const fabricTypeStr = expense.categoryId.getValue() || "General";
      const fabricType = FabricType.create(fabricTypeStr);

      // Use PO total value to derive quantity and unit cost
      // Simplified: assume quantity = 1 and unit cost = total value
      // In production, this would come from PO line items
      const quantity = Quantity.create(1);
      const unitCost = UnitCost.create(purchaseOrder.totalValue.getValue());

      // Get vendor name as supplier (simplified - in production, fetch vendor details)
      const supplier = `Vendor-${purchaseOrder.vendorId.getValue().substring(0, 8)}`;

      // Create Inventory Drop
      const inventoryDrop = InventoryDrop.create({
        dropNumber,
        fabricType,
        quantity,
        unitCost,
        receivedOn: new Date(),
        supplier,
      });

      // Save Inventory Drop
      await this.inventoryDropCommandRepo.save(inventoryDrop);

      // Link inventory drop to expense
      const inventoryDropIdForExpense = InventoryDropId.fromString(
        inventoryDrop.id.getValue()
      );
      expense.linkInventoryDrop(inventoryDropIdForExpense);
      await this.expenseCommandRepo.save(expense);

      return {
        success: true,
        inventoryDropId: inventoryDrop.id.getValue(),
        dropNumber: inventoryDrop.dropNumber.getValue(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to create inventory drop: ${errorMessage}`,
      };
    }
  }

  /**
   * Finds an expense linked to a purchase order
   */
  private async findExpenseByPOId(purchaseOrderId: string) {
    try {
      // This is a simplified approach - in production, you'd have a proper query method
      // For now, we'll need to add this to the expense query repository
      // As a workaround, we can get all expenses and filter (not efficient but works for now)

      // Return null for now - we'll need to update the expense query repository
      // to support finding by linkedPOId
      return null;
    } catch (error) {
      return null;
    }
  }
}
