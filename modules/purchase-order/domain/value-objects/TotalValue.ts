export class TotalValue {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Total value cannot be negative");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Total value must be a finite number");
    }

    // Ensure max 2 decimal places
    if (!this.hasMaxTwoDecimals(value)) {
      throw new Error("Total value can have at most 2 decimal places");
    }
  }

  private hasMaxTwoDecimals(value: number): boolean {
    return Number(value.toFixed(2)) === value;
  }

  static create(value: number): TotalValue {
    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100;
    return new TotalValue(rounded);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: TotalValue): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  isGreaterThan(other: TotalValue): boolean {
    return this.value > other.value;
  }

  isLessThan(other: TotalValue): boolean {
    return this.value < other.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }
}
