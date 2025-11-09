import { randomUUID } from "crypto";

export class PurchaseOrderId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("PurchaseOrderId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("PurchaseOrderId must be a valid UUID");
    }
  }

  static create(): PurchaseOrderId {
    return new PurchaseOrderId(randomUUID());
  }

  static fromString(value: string): PurchaseOrderId {
    return new PurchaseOrderId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PurchaseOrderId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
