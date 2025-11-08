export class ApprovalOrder {
  private constructor(private readonly value: number) {
    if (value < 1) {
      throw new Error("ApprovalOrder must be at least 1");
    }

    if (value > 10) {
      throw new Error("ApprovalOrder cannot exceed 10");
    }

    if (!Number.isInteger(value)) {
      throw new Error("ApprovalOrder must be an integer");
    }
  }

  static create(value: number): ApprovalOrder {
    return new ApprovalOrder(value);
  }

  static first(): ApprovalOrder {
    return new ApprovalOrder(1);
  }

  getValue(): number {
    return this.value;
  }

  isFirst(): boolean {
    return this.value === 1;
  }

  next(): ApprovalOrder {
    if (this.value >= 10) {
      throw new Error("Cannot create next approval order beyond 10");
    }
    return new ApprovalOrder(this.value + 1);
  }

  previous(): ApprovalOrder {
    if (this.value <= 1) {
      throw new Error("Cannot create previous approval order below 1");
    }
    return new ApprovalOrder(this.value - 1);
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

  toString(): string {
    return this.value.toString();
  }
}
