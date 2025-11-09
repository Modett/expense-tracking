export enum ApprovalStatusType {
  WAITING = "waiting",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SKIPPED = "skipped",
}

export class ApprovalStatus {
  private constructor(private readonly value: ApprovalStatusType) {
    if (!value) {
      throw new Error("ApprovalStatus cannot be empty");
    }

    if (!Object.values(ApprovalStatusType).includes(value)) {
      throw new Error(
        `Invalid ApprovalStatus: ${value}. Must be one of: ${Object.values(
          ApprovalStatusType
        ).join(", ")}`
      );
    }
  }

  static create(status: ApprovalStatusType): ApprovalStatus {
    return new ApprovalStatus(status);
  }

  static waiting(): ApprovalStatus {
    return new ApprovalStatus(ApprovalStatusType.WAITING);
  }

  static pending(): ApprovalStatus {
    return new ApprovalStatus(ApprovalStatusType.PENDING);
  }

  static approved(): ApprovalStatus {
    return new ApprovalStatus(ApprovalStatusType.APPROVED);
  }

  static rejected(): ApprovalStatus {
    return new ApprovalStatus(ApprovalStatusType.REJECTED);
  }

  static skipped(): ApprovalStatus {
    return new ApprovalStatus(ApprovalStatusType.SKIPPED);
  }

  static fromString(value: string): ApprovalStatus {
    const lowerValue = value.toLowerCase() as ApprovalStatusType;
    return new ApprovalStatus(lowerValue);
  }

  getValue(): ApprovalStatusType {
    return this.value;
  }

  equals(other: ApprovalStatus): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isWaiting(): boolean {
    return this.value === ApprovalStatusType.WAITING;
  }

  isPending(): boolean {
    return this.value === ApprovalStatusType.PENDING;
  }

  isApproved(): boolean {
    return this.value === ApprovalStatusType.APPROVED;
  }

  isRejected(): boolean {
    return this.value === ApprovalStatusType.REJECTED;
  }

  isSkipped(): boolean {
    return this.value === ApprovalStatusType.SKIPPED;
  }

  canBeModified(): boolean {
    return this.value === ApprovalStatusType.PENDING;
  }

  canBeApproved(): boolean {
    return this.value === ApprovalStatusType.PENDING;
  }

  canBeActivated(): boolean {
    return this.value === ApprovalStatusType.WAITING;
  }

  isFinal(): boolean {
    return (
      this.value === ApprovalStatusType.APPROVED ||
      this.value === ApprovalStatusType.REJECTED ||
      this.value === ApprovalStatusType.SKIPPED
    );
  }
}
