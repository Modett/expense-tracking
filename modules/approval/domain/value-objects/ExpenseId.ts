import { randomUUID } from "crypto";

export class ExpenseId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("ExpenseId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("ExpenseId must be a valid UUID");
    }
  }

  static create(): ExpenseId {
    return new ExpenseId(randomUUID());
  }

  static fromString(value: string): ExpenseId {
    return new ExpenseId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ExpenseId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
