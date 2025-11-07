import { NetAmount } from "./NetAmount.js";
import { TaxAmount } from "./TaxAmount.js";
import { TotalAmount } from "./TotalAmount.js";

export class ExpenseAmount {
  private constructor(
    private readonly netAmount: NetAmount,
    private readonly taxAmount: TaxAmount,
    private readonly totalAmount: TotalAmount
  ) {
    const calculatedTotal = netAmount.getValue() + taxAmount.getValue();
    const actualTotal = totalAmount.getValue();

    const difference = Math.abs(calculatedTotal - actualTotal);
    if (difference > 0.01) {
      throw new Error(
        `Invalid expense amount: total (${actualTotal}) must equal net (${netAmount.getValue()}) + tax (${taxAmount.getValue()}). Difference: ${difference}`
      );
    }
  }

  static create(
    netAmount: number,
    taxAmount: number,
    totalAmount: number
  ): ExpenseAmount {
    const net = NetAmount.create(netAmount);
    const tax = TaxAmount.create(taxAmount);
    const total = TotalAmount.create(totalAmount);

    return new ExpenseAmount(net, tax, total);
  }

  static fromValueObjects(
    netAmount: NetAmount,
    taxAmount: TaxAmount,
    totalAmount: TotalAmount
  ): ExpenseAmount {
    return new ExpenseAmount(netAmount, taxAmount, totalAmount);
  }

  static fromNetAndTax(netAmount: number, taxAmount: number): ExpenseAmount {
    const net = NetAmount.create(netAmount);
    const tax = TaxAmount.create(taxAmount);
    const calculatedTotal = netAmount + taxAmount;
    const total = TotalAmount.create(calculatedTotal);

    return new ExpenseAmount(net, tax, total);
  }

  static fromNetAndTaxRate(netAmount: number, taxRate: number): ExpenseAmount {
    if (taxRate < 0 || taxRate > 100) {
      throw new Error("Tax rate must be between 0 and 100 percent");
    }

    const net = NetAmount.create(netAmount);
    const taxAmount = (netAmount * taxRate) / 100;
    const tax = TaxAmount.create(taxAmount);
    const total = TotalAmount.create(netAmount + taxAmount);

    return new ExpenseAmount(net, tax, total);
  }

  static zero(): ExpenseAmount {
    return new ExpenseAmount(
      NetAmount.zero(),
      TaxAmount.zero(),
      TotalAmount.zero()
    );
  }

  getNetAmount(): NetAmount {
    return this.netAmount;
  }

  getTaxAmount(): TaxAmount {
    return this.taxAmount;
  }

  getTotalAmount(): TotalAmount {
    return this.totalAmount;
  }

  getNetValue(): number {
    return this.netAmount.getValue();
  }

  getTaxValue(): number {
    return this.taxAmount.getValue();
  }

  getTotalValue(): number {
    return this.totalAmount.getValue();
  }

  equals(other: ExpenseAmount): boolean {
    if (!other) return false;
    return (
      this.netAmount.equals(other.netAmount) &&
      this.taxAmount.equals(other.taxAmount) &&
      this.totalAmount.equals(other.totalAmount)
    );
  }

  toString(): string {
    return `Net: ${this.netAmount.toString()}, Tax: ${this.taxAmount.toString()}, Total: ${this.totalAmount.toString()}`;
  }

  isZero(): boolean {
    return (
      this.netAmount.isZero() &&
      this.taxAmount.isZero() &&
      this.totalAmount.isZero()
    );
  }

  hasNoTax(): boolean {
    return this.taxAmount.isZero();
  }

  getTaxRate(): number {
    if (this.netAmount.isZero()) {
      return 0;
    }
    return (this.taxAmount.getValue() / this.netAmount.getValue()) * 100;
  }

  getTaxRateFormatted(): string {
    return `${this.getTaxRate().toFixed(2)}%`;
  }

  add(other: ExpenseAmount): ExpenseAmount {
    const newNet = this.netAmount.add(other.netAmount);
    const newTax = this.taxAmount.add(other.taxAmount);
    const newTotal = this.totalAmount.add(other.totalAmount);

    return new ExpenseAmount(newNet, newTax, newTotal);
  }

  multiply(factor: number): ExpenseAmount {
    if (factor < 0) {
      throw new Error("Cannot multiply expense amount by negative factor");
    }
    if (!Number.isFinite(factor)) {
      throw new Error("Factor must be a finite number");
    }

    const newNet = this.netAmount.multiply(factor);
    const newTax = this.taxAmount.multiply(factor);
    const newTotal = this.totalAmount.multiply(factor);

    return new ExpenseAmount(newNet, newTax, newTotal);
  }

  percentage(percent: number): ExpenseAmount {
    if (percent < 0 || percent > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }
    return this.multiply(percent / 100);
  }

  isGreaterThan(other: ExpenseAmount): boolean {
    return this.totalAmount.isGreaterThan(other.totalAmount);
  }

  isLessThan(other: ExpenseAmount): boolean {
    return this.totalAmount.isLessThan(other.totalAmount);
  }

  formatForDisplay(): string {
    return `${this.totalAmount.formatForDisplay()} (Net: ${this.netAmount.formatForDisplay()}, Tax: ${this.taxAmount.formatForDisplay()})`;
  }

  toPlainObject(): {
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  } {
    return {
      netAmount: this.netAmount.getValue(),
      taxAmount: this.taxAmount.getValue(),
      totalAmount: this.totalAmount.getValue(),
    };
  }

  validate(): boolean {
    if (this.netAmount.getValue() < 0) return false;
    if (this.taxAmount.getValue() < 0) return false;
    if (this.totalAmount.getValue() < 0) return false;

    const calculatedTotal =
      this.netAmount.getValue() + this.taxAmount.getValue();
    const difference = Math.abs(calculatedTotal - this.totalAmount.getValue());
    if (difference > 0.01) return false;

    if (!this.netAmount.isZero()) {
      const taxRate = this.getTaxRate();
      if (taxRate < 0 || taxRate > 100) return false;
    }

    return true;
  }
}
