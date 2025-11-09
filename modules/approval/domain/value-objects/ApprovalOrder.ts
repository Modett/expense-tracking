export class ApprovalOrder {
  private constructor(private readonly value: number) {
    if (value < 1) {
      throw new Error("Approval order must be at least 1");
    }
  }

  static create(order: number): ApprovalOrder {
    return new ApprovalOrder(order);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: ApprovalOrder): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  isGreaterThan(other: ApprovalOrder): boolean {
    return this.value > other.value;
  }

  isLessThan(other: ApprovalOrder): boolean {
    return this.value < other.value;
  }

  next(): ApprovalOrder {
    return new ApprovalOrder(this.value + 1);
  }
}
