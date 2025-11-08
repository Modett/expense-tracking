export class MinAmount {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("MinAmount cannot be negative");
    }
  }

  static create(value: number): MinAmount {
    return new MinAmount(value);
  }

  static zero(): MinAmount {
    return new MinAmount(0);
  }

  getValue(): number {
    return this.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isGreaterThan(amount: number): boolean {
    return this.value > amount;
  }

  isLessThanOrEqual(amount: number): boolean {
    return this.value <= amount;
  }

  matches(amount: number): boolean {
    return amount >= this.value;
  }

  equals(other: MinAmount): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
