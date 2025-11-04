import { randomUUID } from "crypto";

export class CategoryId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("CategoryId cannot be empty");
    }

    // UUID v4 validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("CategoryId must be a valid UUID");
    }
  }

  static create(): CategoryId {
    return new CategoryId(randomUUID());
  }

  static fromString(value: string): CategoryId {
    return new CategoryId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CategoryId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
