export class TotalCost {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Total cost cannot be negative");
    }
  }

  static create(totalCost: number): TotalCost {
    return new TotalCost(totalCost);
  }

  static calculateFromQuantityAndUnitCost(quantity: number, unitCost: number): TotalCost {
    return new TotalCost(quantity * unitCost);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: TotalCost): boolean {
    return this.value === other.value;
  }
}
