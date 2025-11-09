export class UnitCost {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Unit cost cannot be negative");
    }
  }

  static create(unitCost: number): UnitCost {
    return new UnitCost(unitCost);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: UnitCost): boolean {
    return this.value === other.value;
  }
}
