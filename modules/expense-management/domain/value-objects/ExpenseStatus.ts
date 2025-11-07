export enum ExpenseStatusType {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export class ExpenseStatus {
  private constructor(private readonly value: ExpenseStatusType) {
    if (!value) {
      throw new Error("ExpenseStatus cannot be empty");
    }

    if (!Object.values(ExpenseStatusType).includes(value)) {
      throw new Error(
        `Invalid ExpenseStatus: ${value}. Must be one of: ${Object.values(
          ExpenseStatusType
        ).join(", ")}`
      );
    }
  }

  static create(status: ExpenseStatusType): ExpenseStatus {
    return new ExpenseStatus(status);
  }

  static draft(): ExpenseStatus {
    return new ExpenseStatus(ExpenseStatusType.DRAFT);
  }

  static submitted(): ExpenseStatus {
    return new ExpenseStatus(ExpenseStatusType.SUBMITTED);
  }

  static approved(): ExpenseStatus {
    return new ExpenseStatus(ExpenseStatusType.APPROVED);
  }

  static rejected(): ExpenseStatus {
    return new ExpenseStatus(ExpenseStatusType.REJECTED);
  }

  static cancelled(): ExpenseStatus {
    return new ExpenseStatus(ExpenseStatusType.CANCELLED);
  }

  static fromString(value: string): ExpenseStatus {
    const lowerValue = value.toLowerCase() as ExpenseStatusType;
    return new ExpenseStatus(lowerValue);
  }

  getValue(): ExpenseStatusType {
    return this.value;
  }

  equals(other: ExpenseStatus): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isDraft(): boolean {
    return this.value === ExpenseStatusType.DRAFT;
  }

  isSubmitted(): boolean {
    return this.value === ExpenseStatusType.SUBMITTED;
  }

  isApproved(): boolean {
    return this.value === ExpenseStatusType.APPROVED;
  }

  isRejected(): boolean {
    return this.value === ExpenseStatusType.REJECTED;
  }

  isCancelled(): boolean {
    return this.value === ExpenseStatusType.CANCELLED;
  }

  canBeEdited(): boolean {
    return this.value === ExpenseStatusType.DRAFT;
  }

  canBeSubmitted(): boolean {
    return this.value === ExpenseStatusType.DRAFT;
  }

  canBeCancelled(): boolean {
    return (
      this.value === ExpenseStatusType.DRAFT ||
      this.value === ExpenseStatusType.SUBMITTED
    );
  }

  canBeApproved(): boolean {
    return this.value === ExpenseStatusType.SUBMITTED;
  }

  canBeRejected(): boolean {
    return this.value === ExpenseStatusType.SUBMITTED;
  }

  isFinal(): boolean {
    return (
      this.value === ExpenseStatusType.APPROVED ||
      this.value === ExpenseStatusType.REJECTED ||
      this.value === ExpenseStatusType.CANCELLED
    );
  }
}
