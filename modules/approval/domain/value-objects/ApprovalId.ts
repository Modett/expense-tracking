import { randomUUID } from "crypto";

export class ApprovalId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("ApprovalId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("ApprovalId must be a valid UUID");
    }
  }

  static create(): ApprovalId {
    return new ApprovalId(randomUUID());
  }

  static fromString(value: string): ApprovalId {
    return new ApprovalId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ApprovalId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
