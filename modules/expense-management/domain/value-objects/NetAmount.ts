export class NetAmount {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Net amount cannot be negative");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Net amount must be a finite number");
    }

    if (Math.round(value * 100) / 100 !== value) {
      throw new Error("Net amount cannot have more than 2 decimal places");
    }

    if (value > 5000000) {
      throw new Error("Net amount cannot exceed 5,000,000");
    }
  }

  static create(amount: number): NetAmount {
    const roundedAmount = Math.round(amount * 100) / 100;
    return new NetAmount(roundedAmount);
  }

  static fromDecimal(amount: number): NetAmount {
    return NetAmount.create(amount);
  }

  static fromCents(cents: number): NetAmount {
    return NetAmount.create(cents / 100);
  }

  static zero(): NetAmount {
    return new NetAmount(0);
  }

  getValue(): number {
    return this.value;
  }

  getValueInCents(): number {
    return Math.round(this.value * 100);
  }

  equals(other: NetAmount): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  add(other: NetAmount): NetAmount {
    return new NetAmount(this.value + other.value);
  }

  subtract(other: NetAmount): NetAmount {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error("Subtraction would result in negative net amount");
    }
    return new NetAmount(result);
  }

  multiply(factor: number): NetAmount {
    if (factor < 0) {
      throw new Error("Cannot multiply net amount by negative factor");
    }
    if (!Number.isFinite(factor)) {
      throw new Error("Factor must be a finite number");
    }
    const result = Math.round(this.value * factor * 100) / 100;
    return new NetAmount(result);
  }

  percentage(percent: number): NetAmount {
    if (percent < 0 || percent > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }
    return this.multiply(percent / 100);
  }

  isGreaterThan(other: NetAmount): boolean {
    return this.value > other.value;
  }

  isLessThan(other: NetAmount): boolean {
    return this.value < other.value;
  }

  formatForDisplay(): string {
    return this.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
