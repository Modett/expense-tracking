export class Quantity {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Quantity cannot be negative");
    }
  }

  static create(quantity: number): Quantity {
    return new Quantity(quantity);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error("Resulting quantity cannot be negative");
    }
    return new Quantity(result);
  }
}
