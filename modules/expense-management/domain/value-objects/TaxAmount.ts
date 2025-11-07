export class TaxAmount {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Tax amount cannot be negative");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Tax amount must be a finite number");
    }

    if (Math.round(value * 100) / 100 !== value) {
      throw new Error("Tax amount cannot have more than 2 decimal places");
    }

    if (value > 500000) {
      throw new Error("Tax amount cannot exceed 500,000");
    }
  }

  static create(amount: number): TaxAmount {
    const roundedAmount = Math.round(amount * 100) / 100;
    return new TaxAmount(roundedAmount);
  }

  static fromDecimal(amount: number): TaxAmount {
    return TaxAmount.create(amount);
  }

  static fromCents(cents: number): TaxAmount {
    return TaxAmount.create(cents / 100);
  }

  static zero(): TaxAmount {
    return new TaxAmount(0);
  }

  static calculateFromNetAmount(netAmount: number, taxRate: number): TaxAmount {
    if (taxRate < 0 || taxRate > 100) {
      throw new Error("Tax rate must be between 0 and 100 percent");
    }
    const taxAmount = (netAmount * taxRate) / 100;
    return TaxAmount.create(taxAmount);
  }

  getValue(): number {
    return this.value;
  }

  getValueInCents(): number {
    return Math.round(this.value * 100);
  }

  equals(other: TaxAmount): boolean {
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

  add(other: TaxAmount): TaxAmount {
    return new TaxAmount(this.value + other.value);
  }

  subtract(other: TaxAmount): TaxAmount {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error("Subtraction would result in negative tax amount");
    }
    return new TaxAmount(result);
  }

  multiply(factor: number): TaxAmount {
    if (factor < 0) {
      throw new Error("Cannot multiply tax amount by negative factor");
    }
    if (!Number.isFinite(factor)) {
      throw new Error("Factor must be a finite number");
    }
    const result = Math.round(this.value * factor * 100) / 100;
    return new TaxAmount(result);
  }

  calculateTaxRate(netAmount: number): number {
    if (netAmount <= 0) {
      throw new Error("Net amount must be positive to calculate tax rate");
    }
    return (this.value / netAmount) * 100;
  }

  isGreaterThan(other: TaxAmount): boolean {
    return this.value > other.value;
  }

  isLessThan(other: TaxAmount): boolean {
    return this.value < other.value;
  }

  formatForDisplay(): string {
    return this.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
