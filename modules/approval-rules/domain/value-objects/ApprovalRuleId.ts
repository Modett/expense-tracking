import { randomUUID } from "crypto";

export class ApprovalRuleId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("ApprovalRuleId cannot be empty");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("ApprovalRuleId must be a valid UUID");
    }
  }

  static create(): ApprovalRuleId {
    return new ApprovalRuleId(randomUUID());
  }

  static fromString(value: string): ApprovalRuleId {
    return new ApprovalRuleId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ApprovalRuleId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
