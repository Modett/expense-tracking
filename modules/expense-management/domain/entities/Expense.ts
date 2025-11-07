import {
  ExpenseId,
  ExpenseDescription,
  ExpenseStatus,
  DateOfExpense,
  ExpenseAmount,
  Receipt,
  PurchaseOrderId,
  InventoryDropId,
  UserId,
  VendorId,
  CategoryId,
  DepartmentId,
  TagId,
} from "../value-objects/index.js";

export interface ExpenseProps {
  id: ExpenseId;
  userId: UserId;
  vendorId: VendorId;
  categoryId: CategoryId;
  departmentId: DepartmentId;
  description: ExpenseDescription;
  amount: ExpenseAmount;
  status: ExpenseStatus;
  receipt?: Receipt | undefined;
  dateOfExpense: DateOfExpense;
  linkedPOId?: PurchaseOrderId | undefined;
  inventoryDropId?: InventoryDropId | undefined;
  tagIds: TagId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseProps {
  userId: UserId;
  vendorId: VendorId;
  categoryId: CategoryId;
  departmentId: DepartmentId;
  description: ExpenseDescription;
  amount: ExpenseAmount;
  dateOfExpense: DateOfExpense;
  receipt?: Receipt;
  linkedPOId?: PurchaseOrderId;
  inventoryDropId?: InventoryDropId;
  tagIds?: TagId[];
}

export class Expense {
  private constructor(private props: ExpenseProps) {
    this.validate();
  }

  static create(props: CreateExpenseProps): Expense {
    const now = new Date();

    return new Expense({
      id: ExpenseId.create(),
      userId: props.userId,
      vendorId: props.vendorId,
      categoryId: props.categoryId,
      departmentId: props.departmentId,
      description: props.description,
      amount: props.amount,
      status: ExpenseStatus.draft(),
      receipt: props.receipt,
      dateOfExpense: props.dateOfExpense,
      linkedPOId: props.linkedPOId,
      inventoryDropId: props.inventoryDropId,
      tagIds: props.tagIds || [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ExpenseProps): Expense {
    return new Expense(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("Expense ID is required");
    }
    if (!this.props.userId) {
      throw new Error("User ID is required");
    }
    if (!this.props.vendorId) {
      throw new Error("Vendor ID is required");
    }
    if (!this.props.categoryId) {
      throw new Error("Category ID is required");
    }
    if (!this.props.departmentId) {
      throw new Error("Department ID is required");
    }
    if (!this.props.description) {
      throw new Error("Description is required");
    }
    if (!this.props.amount) {
      throw new Error("Amount is required");
    }
    if (!this.props.status) {
      throw new Error("Status is required");
    }
    if (!this.props.dateOfExpense) {
      throw new Error("Date of expense is required");
    }
  }

  get id(): ExpenseId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get vendorId(): VendorId {
    return this.props.vendorId;
  }

  get categoryId(): CategoryId {
    return this.props.categoryId;
  }

  get departmentId(): DepartmentId {
    return this.props.departmentId;
  }

  get description(): ExpenseDescription {
    return this.props.description;
  }

  get amount(): ExpenseAmount {
    return this.props.amount;
  }

  get status(): ExpenseStatus {
    return this.props.status;
  }

  get receipt(): Receipt | undefined {
    return this.props.receipt;
  }

  get dateOfExpense(): DateOfExpense {
    return this.props.dateOfExpense;
  }

  get linkedPOId(): PurchaseOrderId | undefined {
    return this.props.linkedPOId;
  }

  get inventoryDropId(): InventoryDropId | undefined {
    return this.props.inventoryDropId;
  }

  get tagIds(): TagId[] {
    return [...this.props.tagIds];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDescription(description: ExpenseDescription): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update description: expense is ${this.status.toString()}`
      );
    }
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateVendor(vendorId: VendorId): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update vendor: expense is ${this.status.toString()}`
      );
    }
    this.props.vendorId = vendorId;
    this.props.updatedAt = new Date();
  }

  updateCategory(categoryId: CategoryId): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update category: expense is ${this.status.toString()}`
      );
    }
    this.props.categoryId = categoryId;
    this.props.updatedAt = new Date();
  }

  updateDepartment(departmentId: DepartmentId): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update department: expense is ${this.status.toString()}`
      );
    }
    this.props.departmentId = departmentId;
    this.props.updatedAt = new Date();
  }

  updateAmount(amount: ExpenseAmount): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update amount: expense is ${this.status.toString()}`
      );
    }
    this.props.amount = amount;
    this.props.updatedAt = new Date();
  }

  updateDateOfExpense(dateOfExpense: DateOfExpense): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot update date: expense is ${this.status.toString()}`
      );
    }
    this.props.dateOfExpense = dateOfExpense;
    this.props.updatedAt = new Date();
  }

  attachReceipt(receipt: Receipt): void {
    if (this.status.isFinal()) {
      throw new Error(
        `Cannot attach receipt: expense is ${this.status.toString()}`
      );
    }
    this.props.receipt = receipt;
    this.props.updatedAt = new Date();
  }

  removeReceipt(): void {
    if (!this.status.canBeEdited()) {
      throw new Error(
        `Cannot remove receipt: expense is ${this.status.toString()}`
      );
    }
    this.props.receipt = undefined;
    this.props.updatedAt = new Date();
  }

  linkPurchaseOrder(poId: PurchaseOrderId): void {
    if (this.status.isFinal()) {
      throw new Error(`Cannot link PO: expense is ${this.status.toString()}`);
    }
    this.props.linkedPOId = poId;
    this.props.updatedAt = new Date();
  }

  unlinkPurchaseOrder(): void {
    if (this.status.isFinal()) {
      throw new Error(`Cannot unlink PO: expense is ${this.status.toString()}`);
    }
    this.props.linkedPOId = undefined;
    this.props.updatedAt = new Date();
  }

  linkInventoryDrop(dropId: InventoryDropId): void {
    if (this.status.isFinal()) {
      throw new Error(
        `Cannot link inventory drop: expense is ${this.status.toString()}`
      );
    }
    this.props.inventoryDropId = dropId;
    this.props.updatedAt = new Date();
  }

  unlinkInventoryDrop(): void {
    if (this.status.isFinal()) {
      throw new Error(
        `Cannot unlink inventory drop: expense is ${this.status.toString()}`
      );
    }
    this.props.inventoryDropId = undefined;
    this.props.updatedAt = new Date();
  }

  addTag(tagId: TagId): void {
    const tagExists = this.props.tagIds.some((t) => t.equals(tagId));
    if (tagExists) {
      throw new Error("Tag already added to this expense");
    }

    this.props.tagIds.push(tagId);
    this.props.updatedAt = new Date();
  }

  removeTag(tagId: TagId): void {
    const initialLength = this.props.tagIds.length;
    this.props.tagIds = this.props.tagIds.filter((t) => !t.equals(tagId));

    if (this.props.tagIds.length === initialLength) {
      throw new Error("Tag not found on this expense");
    }

    this.props.updatedAt = new Date();
  }

  hasTag(tagId: TagId): boolean {
    return this.props.tagIds.some((t) => t.equals(tagId));
  }

  submit(): void {
    if (!this.status.canBeSubmitted()) {
      throw new Error(`Cannot submit: expense is ${this.status.toString()}`);
    }

    if (!this.props.receipt || this.props.receipt.isEmpty()) {
      throw new Error("Cannot submit expense without a receipt");
    }

    if (this.props.amount.isZero()) {
      throw new Error("Cannot submit expense with zero amount");
    }

    this.props.status = ExpenseStatus.submitted();
    this.props.updatedAt = new Date();
  }

  approve(): void {
    if (!this.status.canBeApproved()) {
      throw new Error(`Cannot approve: expense is ${this.status.toString()}`);
    }

    this.props.status = ExpenseStatus.approved();
    this.props.updatedAt = new Date();
  }

  reject(): void {
    if (!this.status.canBeRejected()) {
      throw new Error(`Cannot reject: expense is ${this.status.toString()}`);
    }

    this.props.status = ExpenseStatus.rejected();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (!this.status.canBeCancelled()) {
      throw new Error(`Cannot cancel: expense is ${this.status.toString()}`);
    }

    this.props.status = ExpenseStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId.equals(userId);
  }

  belongsToCategory(categoryId: CategoryId): boolean {
    return this.props.categoryId.equals(categoryId);
  }

  belongsToDepartment(departmentId: DepartmentId): boolean {
    return this.props.departmentId.equals(departmentId);
  }

  isFromVendor(vendorId: VendorId): boolean {
    return this.props.vendorId.equals(vendorId);
  }

  hasReceipt(): boolean {
    return this.props.receipt !== undefined && !this.props.receipt.isEmpty();
  }

  isLinkedToPO(): boolean {
    return (
      this.props.linkedPOId !== undefined && this.props.linkedPOId.hasValue()
    );
  }

  isLinkedToInventoryDrop(): boolean {
    return (
      this.props.inventoryDropId !== undefined &&
      this.props.inventoryDropId.hasValue()
    );
  }

  hasTags(): boolean {
    return this.props.tagIds.length > 0;
  }

  getTagCount(): number {
    return this.props.tagIds.length;
  }

  equals(other: Expense): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      userId: this.props.userId.getValue(),
      vendorId: this.props.vendorId.getValue(),
      categoryId: this.props.categoryId.getValue(),
      departmentId: this.props.departmentId.getValue(),
      description: this.props.description.getValue(),
      amountNet: this.props.amount.getNetValue(),
      taxAmount: this.props.amount.getTaxValue(),
      totalAmount: this.props.amount.getTotalValue(),
      status: this.props.status.getValue(),
      receiptUrl: this.props.receipt?.getValue() || null,
      dateOfExpense: this.props.dateOfExpense.toDate(),
      linkedPOId: this.props.linkedPOId?.getValue() || null,
      inventoryDropId: this.props.inventoryDropId?.getValue() || null,
      tagIds: this.props.tagIds.map((tagId) => tagId.getValue()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
