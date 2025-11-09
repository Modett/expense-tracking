export class PONumber {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("PO Number cannot be empty");
    }

    if (value.trim().length > 100) {
      throw new Error("PO Number cannot exceed 100 characters");
    }
  }

  static create(value: string): PONumber {
    return new PONumber(value.trim().toUpperCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PONumber): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
