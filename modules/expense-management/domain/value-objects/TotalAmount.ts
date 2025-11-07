export class TotalAmount {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Total amount cannot be negative");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Total amount must be a finite number");
    }

    if (Math.round(value * 100) / 100 !== value) {
      throw new Error("Total amount cannot have more than 2 decimal places");
    }

    if (value > 1500000) {
      throw new Error("Total amount cannot exceed 1,500,000");
    }
  }

  static create(amount: number): TotalAmount {
    const roundedAmount = Math.round(amount * 100) / 100;
    return new TotalAmount(roundedAmount);
  }

  static fromDecimal(amount: number): TotalAmount {
    return TotalAmount.create(amount);
  }

  static fromCents(cents: number): TotalAmount {
    return TotalAmount.create(cents / 100);
  }

  static zero(): TotalAmount {
    return new TotalAmount(0);
  }

  static calculateFromNetAndTax(
    netAmount: number,
    taxAmount: number
  ): TotalAmount {
    const total = netAmount + taxAmount;
    return TotalAmount.create(total);
  }

  getValue(): number {
    return this.value;
  }

  getValueInCents(): number {
    return Math.round(this.value * 100);
  }

  equals(other: TotalAmount): boolean {
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

  add(other: TotalAmount): TotalAmount {
    return new TotalAmount(this.value + other.value);
  }

  subtract(other: TotalAmount): TotalAmount {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error("Subtraction would result in negative total amount");
    }
    return new TotalAmount(result);
  }

  multiply(factor: number): TotalAmount {
    if (factor < 0) {
      throw new Error("Cannot multiply total amount by negative factor");
    }
    if (!Number.isFinite(factor)) {
      throw new Error("Factor must be a finite number");
    }
    const result = Math.round(this.value * factor * 100) / 100;
    return new TotalAmount(result);
  }

  validateCalculation(
    netAmount: number,
    taxAmount: number,
    tolerance: number = 0.01
  ): boolean {
    const expectedTotal = netAmount + taxAmount;
    const difference = Math.abs(this.value - expectedTotal);
    return difference <= tolerance;
  }

  calculateNetAmount(taxAmount: number): number {
    if (taxAmount < 0) {
      throw new Error("Tax amount cannot be negative");
    }
    if (taxAmount > this.value) {
      throw new Error("Tax amount cannot be greater than total amount");
    }
    return this.value - taxAmount;
  }

  calculateTaxAmount(netAmount: number): number {
    if (netAmount < 0) {
      throw new Error("Net amount cannot be negative");
    }
    if (netAmount > this.value) {
      throw new Error("Net amount cannot be greater than total amount");
    }
    return this.value - netAmount;
  }

  isGreaterThan(other: TotalAmount): boolean {
    return this.value > other.value;
  }

  isLessThan(other: TotalAmount): boolean {
    return this.value < other.value;
  }

  formatForDisplay(): string {
    return this.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
