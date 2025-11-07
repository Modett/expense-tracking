export class PurchaseOrderId {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (!value) {
        throw new Error(
          "PurchaseOrderId cannot be empty string, use null instead"
        );
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error("PurchaseOrderId must be a valid UUID");
      }
    }
  }

  static create(id?: string): PurchaseOrderId {
    if (!id || id.trim().length === 0) {
      return new PurchaseOrderId(null);
    }
    return new PurchaseOrderId(id.trim());
  }

  static fromString(value: string | null): PurchaseOrderId {
    if (value === null) {
      return new PurchaseOrderId(null);
    }
    return new PurchaseOrderId(value);
  }

  static empty(): PurchaseOrderId {
    return new PurchaseOrderId(null);
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

  equals(other: PurchaseOrderId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
