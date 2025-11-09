import { randomUUID } from "crypto";

export class InventoryDropId {
  private constructor(private readonly value: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("InventoryDropId must be a valid UUID");
    }
  }

  static create(): InventoryDropId {
    return new InventoryDropId(randomUUID());
  }

  static fromString(id: string): InventoryDropId {
    return new InventoryDropId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: InventoryDropId): boolean {
    return this.value === other.value;
  }
}
