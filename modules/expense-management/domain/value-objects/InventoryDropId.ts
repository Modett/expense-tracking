export class InventoryDropId {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (!value) {
        throw new Error(
          "InventoryDropId cannot be empty string, use null instead"
        );
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error("InventoryDropId must be a valid UUID");
      }
    }
  }

  static create(id?: string): InventoryDropId {
    if (!id || id.trim().length === 0) {
      return new InventoryDropId(null);
    }
    return new InventoryDropId(id.trim());
  }

  static fromString(value: string | null): InventoryDropId {
    if (value === null) {
      return new InventoryDropId(null);
    }
    return new InventoryDropId(value);
  }

  static empty(): InventoryDropId {
    return new InventoryDropId(null);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  hasValue(): boolean {
    return this.value !== null;
  }

  equals(other: InventoryDropId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
