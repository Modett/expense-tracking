import type { IPurchaseOrderCommandRepository } from "../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IExpenseQueryRepository } from "../../../expense-management/domain/repositories/IExpenseQueryRepository.js";
import type { IExpenseCommandRepository } from "../../../expense-management/domain/repositories/IExpenseCommandRepository.js";
import type { IApprovalQueryRepository } from "../../../approval/domain/repositories/IApprovalQueryRepository.js";
import { PurchaseOrder } from "../../domain/entities/PurchaseOrder.js";
import {
  PONumber,
  TotalValue,
  VendorId,
} from "../../domain/value-objects/index.js";
import { ExpenseId } from "../../../expense-management/domain/value-objects/ExpenseId.js";
import { ExpenseId as ApprovalExpenseId } from "../../../approval/domain/value-objects/ExpenseId.js";
import { PurchaseOrderId } from "../../../expense-management/domain/value-objects/PurchaseOrderId.js";

export interface POCreationResult {
  success: boolean;
  purchaseOrderId?: string;
  poNumber?: string;
  error?: string;
}

/**
 * Orchestrates the creation of Purchase Orders from approved expenses
 */
export class PurchaseOrderOrchestrationService {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly expenseCommandRepo: IExpenseCommandRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository,
    private readonly approvalQueryRepo: IApprovalQueryRepository
  ) {}

  /**
   * Creates a Purchase Order from an approved expense
   * Called when the final approval for an expense is completed
   */
  async createPurchaseOrderFromExpense(
    expenseId: string
  ): Promise<POCreationResult> {
    try {
      // Get expense
      const expenseIdVO = ExpenseId.fromString(expenseId);
      const expense = await this.expenseQueryRepo.findById(expenseIdVO);

      if (!expense) {
        return {
          success: false,
          error: `Expense with ID ${expenseId} not found`,
        };
      }

      // Check if expense is approved
      if (!expense.status.isApproved()) {
        return {
          success: false,
          error: `Cannot create PO: expense status is ${expense.status.toString()}, expected approved`,
        };
      }

      // Check if PO already exists for this expense
      if (expense.linkedPOId) {
        return {
          success: false,
          error: `Purchase order already exists for expense ${expenseId}`,
        };
      }

      // Generate PO number (format: PO-YYYYMMDD-XXXXX where XXXXX is first 5 chars of expense ID)
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      const poNumberStr = `PO-${dateStr}-${expenseId
        .substring(0, 5)
        .toUpperCase()}`;
      const poNumber = PONumber.create(poNumberStr);

      // Convert vendor ID from expense-management to purchase-order module
      const vendorId = VendorId.fromString(expense.vendorId.getValue());

      // Create total value from expense amount
      const totalValue = TotalValue.create(expense.amount.getTotalValue());

      // Create Purchase Order
      const purchaseOrder = PurchaseOrder.create({
        poNumber,
        vendorId,
        totalValue,
        description: `PO for expense: ${expense.description.getValue()}`,
        issuedDate: new Date(),
      });

      // Save Purchase Order
      await this.purchaseOrderCommandRepo.save(purchaseOrder);

      // Link PO to expense
      const purchaseOrderIdForExpense = PurchaseOrderId.fromString(
        purchaseOrder.id.getValue()
      );
      expense.linkPurchaseOrder(purchaseOrderIdForExpense);
      await this.expenseCommandRepo.save(expense);

      return {
        success: true,
        purchaseOrderId: purchaseOrder.id.getValue(),
        poNumber: purchaseOrder.poNumber.getValue(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to create purchase order: ${errorMessage}`,
      };
    }
  }

  /**
   * Checks if all approvals for an expense are complete
   */
  async areAllApprovalsComplete(expenseId: string): Promise<boolean> {
    try {
      const expenseIdForApproval = ApprovalExpenseId.fromString(expenseId);
      const approvals = await this.approvalQueryRepo.findByExpenseId(
        expenseIdForApproval
      );

      if (approvals.length === 0) {
        return false;
      }

      // All approvals must be approved
      return approvals.every((approval) => approval.status.isApproved());
    } catch (error) {
      return false;
    }
  }
}
