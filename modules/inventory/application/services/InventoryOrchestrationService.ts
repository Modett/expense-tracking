import type { IInventoryDropCommandRepository } from "../../domain/repositories/IInventoryDropCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../purchase-order/domain/repositories/IPurchaseOrderQueryRepository.js";
import type { IExpenseQueryRepository } from "../../../expense-management/domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseCommandRepository } from "../../../expense-management/domain/repositories/IExpenseCommandRepository.js";
import type { IBudgetQueryRepository } from "../../../budget/domain/repositories/IBudgetQueryRepository.js";
import type { IBudgetCommandRepository } from "../../../budget/domain/repositories/IBudgetCommandRepository.js";
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
import { DepartmentId as BudgetDepartmentId } from "../../../budget/domain/value-objects/DepartmentId.js";
import { CategoryId as BudgetCategoryId } from "../../../budget/domain/value-objects/CategoryId.js";

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
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly budgetQueryRepo: IBudgetQueryRepository,
    private readonly budgetCommandRepo: IBudgetCommandRepository
  ) {}

  /**
   * Creates an Inventory Drop from a received Purchase Order
   * Called when a Purchase Order is marked as received
   */
  async createInventoryFromPurchaseOrder(
    purchaseOrderId: string
  ): Promise<InventoryCreationResult> {
    try {
      console.log("[Inventory] Creating inventory from PO:", purchaseOrderId);

      // Get Purchase Order
      const poIdVO = POModulePurchaseOrderId.fromString(purchaseOrderId);
      const purchaseOrder = await this.purchaseOrderQueryRepo.findById(poIdVO);

      if (!purchaseOrder) {
        console.error("[Inventory] Purchase order not found:", purchaseOrderId);
        return {
          success: false,
          error: `Purchase order with ID ${purchaseOrderId} not found`,
        };
      }

      console.log(
        "[Inventory] PO found, status:",
        purchaseOrder.status.getValue()
      );

      // Check if PO is received
      if (!purchaseOrder.isReceived() && !purchaseOrder.isClosed()) {
        console.error(
          "[Inventory] PO not received, status:",
          purchaseOrder.status.getValue()
        );
        return {
          success: false,
          error: `Cannot create inventory: PO status is ${purchaseOrder.status.getValue()}, expected received or closed`,
        };
      }

      // Find expense linked to this PO
      console.log("[Inventory] Finding expense linked to PO:", purchaseOrderId);
      const expense = await this.findExpenseByPOId(purchaseOrderId);

      if (!expense) {
        console.error(
          "[Inventory] No expense found linked to PO:",
          purchaseOrderId
        );
        return {
          success: false,
          error: `No expense found linked to purchase order ${purchaseOrderId}`,
        };
      }

      console.log("[Inventory] Found expense:", expense.id.getValue());

      // Check if inventory already exists for this expense
      if (expense.inventoryDropId) {
        return {
          success: false,
          error: `Inventory drop already exists for expense ${expense.id.getValue()}`,
        };
      }

      // Generate drop number (format: DROP-YYYYMMDD-HHMMSS-XXXXX for uniqueness)
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(today.getHours()).padStart(2, "0")}${String(
        today.getMinutes()
      ).padStart(2, "0")}${String(today.getSeconds()).padStart(2, "0")}`;
      const dropNumberStr = `DROP-${dateStr}-${timeStr}-${purchaseOrderId
        .substring(0, 5)
        .toUpperCase()}`;
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
      const supplier = `Vendor-${purchaseOrder.vendorId
        .getValue()
        .substring(0, 8)}`;

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

      // Update budget spent amount
      try {
        console.log(
          "[Inventory] Updating budget for expense:",
          expense.id.getValue()
        );
        await this.updateBudgetSpent(expense);
      } catch (budgetError) {
        console.warn("[Inventory] Failed to update budget:", budgetError);
        // Don't fail the entire operation if budget update fails
      }

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
      console.log(
        "[Inventory] Searching for expense with linkedPOId:",
        purchaseOrderId
      );

      // Query expense by linkedPOId
      const expenses = await this.expenseQueryRepo.findAll({});

      console.log("[Inventory] Total expenses found:", expenses.length);

      // Find expense with matching linkedPOId
      const expense = expenses.find((exp) => {
        const linkedPOId = exp.linkedPOId?.getValue();
        console.log(
          "[Inventory] Checking expense:",
          exp.id.getValue(),
          "linkedPOId:",
          linkedPOId
        );
        return linkedPOId === purchaseOrderId;
      });

      console.log(
        "[Inventory] Expense match result:",
        expense ? expense.id.getValue() : "none"
      );

      return expense || null;
    } catch (error) {
      console.error(
        `[Inventory] Error finding expense by PO ID ${purchaseOrderId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Updates the budget spent amount when an expense is converted to inventory
   */
  private async updateBudgetSpent(expense: any): Promise<void> {
    const budgetDepartmentId = BudgetDepartmentId.fromString(
      expense.departmentId.getValue()
    );
    const budgetCategoryId = BudgetCategoryId.fromString(
      expense.categoryId.getValue()
    );

    console.log(
      "[Inventory] Finding budget for department:",
      budgetDepartmentId.getValue(),
      "category:",
      budgetCategoryId.getValue()
    );

    // Find active budgets for the expense's department and category
    const budgets = await this.budgetQueryRepo.findByDepartmentAndCategory(
      budgetDepartmentId,
      budgetCategoryId
    );

    console.log("[Inventory] Found budgets:", budgets.length);

    if (budgets.length === 0) {
      console.warn(
        "[Inventory] No budget found for department:",
        budgetDepartmentId.getValue(),
        "category:",
        budgetCategoryId.getValue()
      );
      return;
    }

    // Find an active budget that covers the expense date (or just use the first active one)
    const expenseDate = expense.dateOfExpense.getValue();
    let activeBudget = budgets.find((budget) => {
      const isActive = budget.isActive;
      const startDate = budget.period.getStartDate();
      const endDate = budget.period.getEndDate();
      const isInPeriod = expenseDate >= startDate && expenseDate <= endDate;
      console.log(
        "[Inventory] Checking budget:",
        budget.id.getValue(),
        "isActive:",
        isActive,
        "isInPeriod (expense date):",
        isInPeriod,
        "expense date:",
        expenseDate
      );
      return isActive && isInPeriod;
    });

    // If no budget covers the expense date, try to find any active budget for this dept/category
    if (!activeBudget) {
      console.log(
        "[Inventory] No budget found for expense date, looking for any active budget"
      );
      activeBudget = budgets.find((budget) => budget.isActive);
    }

    if (!activeBudget) {
      console.warn(
        "[Inventory] No active budget found for department:",
        budgetDepartmentId.getValue(),
        "category:",
        budgetCategoryId.getValue()
      );
      return;
    }

    console.log(
      "[Inventory] Found active budget:",
      activeBudget.id.getValue(),
      "current spent:",
      activeBudget.amount.getSpentAmount()
    );

    // Add the expense amount to the budget spent
    const expenseAmount = expense.amount.getTotalValue();
    console.log("[Inventory] Adding expense amount to budget:", expenseAmount);

    activeBudget.addSpent(expenseAmount);
    await this.budgetCommandRepo.save(activeBudget);

    console.log(
      "[Inventory] Budget updated. New spent amount:",
      activeBudget.amount.getSpentAmount()
    );
  }
}
