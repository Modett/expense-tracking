import { randomUUID } from "crypto";

export class BudgetId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("BudgetId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("BudgetId must be a valid UUID");
    }
  }

  static create(): BudgetId {
    return new BudgetId(randomUUID());
  }

  static fromString(value: string): BudgetId {
    return new BudgetId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BudgetId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
