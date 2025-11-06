import { randomUUID } from "crypto";

export class VendorId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("VendorId cannot be empty");
    }

    // UUID v4 validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("VendorId must be a valid UUID");
    }
  }

  static create(): VendorId {
    return new VendorId(randomUUID());
  }

  static fromString(value: string): VendorId {
    return new VendorId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: VendorId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
