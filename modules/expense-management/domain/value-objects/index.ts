// Export all value objects
// Note: Files are currently empty placeholders - will be implemented as needed

// Core expense value objects (owned by this module)
export * from "./ExpenseId.js";
export * from "./ExpenseDescription.js";
export * from "./ExpenseStatus.js";
export * from "./DateOfExpense.js";

// Amount value objects (owned by this module)
export * from "./NetAmount.js";
export * from "./TaxAmount.js";
export * from "./TotalAmount.js";
export * from "./ExpenseAmount.js";

// Optional reference value objects (owned by this module)
export * from "./PurchaseOrderId.js";
export * from "./InventoryDropId.js";

// Receipt and attachment value objects (owned by this module)
export * from "./Receipt.js";

// Re-export value objects from other modules (proper DDD approach)
export { UserId } from "../../../user/domain/value-objects/index.js";
export {
  CategoryId,
  DepartmentId,
  TagId,
  VendorId,
} from "../../../master-data/domain/value-objects/index.js";
