export enum POStatusType {
  DRAFT = "draft",
  ISSUED = "issued",
  RECEIVED = "received",
  PARTIAL = "partial",
  CANCELLED = "cancelled",
  CLOSED = "closed",
}

export class POStatus {
  private constructor(private readonly value: POStatusType) {}

  static create(value: string): POStatus {
    const normalizedValue = value.toLowerCase();

    if (!Object.values(POStatusType).includes(normalizedValue as POStatusType)) {
      throw new Error(
        `Invalid PO status: ${value}. Must be one of: ${Object.values(POStatusType).join(", ")}`
      );
    }

    return new POStatus(normalizedValue as POStatusType);
  }

  static fromString(value: string): POStatus {
    return POStatus.create(value);
  }

  static draft(): POStatus {
    return new POStatus(POStatusType.DRAFT);
  }

  static issued(): POStatus {
    return new POStatus(POStatusType.ISSUED);
  }

  static received(): POStatus {
    return new POStatus(POStatusType.RECEIVED);
  }

  static partial(): POStatus {
    return new POStatus(POStatusType.PARTIAL);
  }

  static cancelled(): POStatus {
    return new POStatus(POStatusType.CANCELLED);
  }

  static closed(): POStatus {
    return new POStatus(POStatusType.CLOSED);
  }

  getValue(): string {
    return this.value;
  }

  isDraft(): boolean {
    return this.value === POStatusType.DRAFT;
  }

  isIssued(): boolean {
    return this.value === POStatusType.ISSUED;
  }

  isReceived(): boolean {
    return this.value === POStatusType.RECEIVED;
  }

  isPartial(): boolean {
    return this.value === POStatusType.PARTIAL;
  }

  isCancelled(): boolean {
    return this.value === POStatusType.CANCELLED;
  }

  isClosed(): boolean {
    return this.value === POStatusType.CLOSED;
  }

  canBeModified(): boolean {
    return this.value === POStatusType.DRAFT;
  }

  canBeCancelled(): boolean {
    return this.value === POStatusType.DRAFT || this.value === POStatusType.ISSUED;
  }

  equals(other: POStatus): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
