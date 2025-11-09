import {
  PurchaseOrderId,
  PONumber,
  TotalValue,
  POStatus,
  VendorId,
} from "../value-objects/index.js";

export interface PurchaseOrderProps {
  id: PurchaseOrderId;
  poNumber: PONumber;
  vendorId: VendorId;
  totalValue: TotalValue;
  status: POStatus;
  description: string | null;
  issuedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseOrderProps {
  poNumber: PONumber;
  vendorId: VendorId;
  totalValue: TotalValue;
  description?: string;
  issuedDate: Date;
}

export class PurchaseOrder {
  private constructor(private props: PurchaseOrderProps) {
    this.validate();
  }

  static create(props: CreatePurchaseOrderProps): PurchaseOrder {
    const now = new Date();

    return new PurchaseOrder({
      id: PurchaseOrderId.create(),
      poNumber: props.poNumber,
      vendorId: props.vendorId,
      totalValue: props.totalValue,
      status: POStatus.draft(),
      description: props.description || null,
      issuedDate: props.issuedDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PurchaseOrderProps): PurchaseOrder {
    return new PurchaseOrder(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("PurchaseOrder must have an ID");
    }
    if (!this.props.poNumber) {
      throw new Error("PurchaseOrder must have a PO number");
    }
    if (!this.props.vendorId) {
      throw new Error("PurchaseOrder must have a vendor ID");
    }
    if (!this.props.totalValue) {
      throw new Error("PurchaseOrder must have a total value");
    }
    if (!this.props.status) {
      throw new Error("PurchaseOrder must have a status");
    }
    if (!this.props.issuedDate) {
      throw new Error("PurchaseOrder must have an issued date");
    }
  }

  // Getters
  get id(): PurchaseOrderId {
    return this.props.id;
  }

  get poNumber(): PONumber {
    return this.props.poNumber;
  }

  get vendorId(): VendorId {
    return this.props.vendorId;
  }

  get totalValue(): TotalValue {
    return this.props.totalValue;
  }

  get status(): POStatus {
    return this.props.status;
  }

  get description(): string | null {
    return this.props.description;
  }

  get issuedDate(): Date {
    return this.props.issuedDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods

  updateDescription(description: string): void {
    if (!this.status.canBeModified()) {
      throw new Error("Cannot update description of a non-draft purchase order");
    }

    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateTotalValue(totalValue: TotalValue): void {
    if (!this.status.canBeModified()) {
      throw new Error("Cannot update total value of a non-draft purchase order");
    }

    this.props.totalValue = totalValue;
    this.props.updatedAt = new Date();
  }

  issue(): void {
    if (!this.status.isDraft()) {
      throw new Error("Only draft purchase orders can be issued");
    }

    this.props.status = POStatus.issued();
    this.props.updatedAt = new Date();
  }

  markAsReceived(): void {
    if (!this.status.isIssued() && !this.status.isPartial()) {
      throw new Error(
        "Only issued or partial purchase orders can be marked as received"
      );
    }

    this.props.status = POStatus.received();
    this.props.updatedAt = new Date();
  }

  markAsPartial(): void {
    if (!this.status.isIssued()) {
      throw new Error("Only issued purchase orders can be marked as partial");
    }

    this.props.status = POStatus.partial();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (!this.status.canBeCancelled()) {
      throw new Error("Purchase order cannot be cancelled in its current status");
    }

    this.props.status = POStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  close(): void {
    if (!this.status.isReceived() && !this.status.isPartial()) {
      throw new Error(
        "Only received or partial purchase orders can be closed"
      );
    }

    this.props.status = POStatus.closed();
    this.props.updatedAt = new Date();
  }

  // Query methods

  isDraft(): boolean {
    return this.status.isDraft();
  }

  isIssued(): boolean {
    return this.status.isIssued();
  }

  isReceived(): boolean {
    return this.status.isReceived();
  }

  isCancelled(): boolean {
    return this.status.isCancelled();
  }

  isClosed(): boolean {
    return this.status.isClosed();
  }

  canBeModified(): boolean {
    return this.status.canBeModified();
  }

  canBeCancelled(): boolean {
    return this.status.canBeCancelled();
  }

  isForVendor(vendorId: VendorId): boolean {
    return this.vendorId.equals(vendorId);
  }

  equals(other: PurchaseOrder): boolean {
    if (!other) return false;
    return this.id.equals(other.id);
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      poNumber: this.props.poNumber.getValue(),
      vendorId: this.props.vendorId.getValue(),
      totalValue: this.props.totalValue.getValue(),
      status: this.props.status.getValue(),
      description: this.props.description,
      issuedDate: this.props.issuedDate,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
