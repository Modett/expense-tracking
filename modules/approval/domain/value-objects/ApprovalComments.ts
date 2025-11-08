export class ApprovalComments {
  private constructor(private readonly value: string) {
    if (value && value.length > 1000) {
      throw new Error(
        "ApprovalComments cannot exceed 1000 characters"
      );
    }
  }

  static create(value: string = ""): ApprovalComments {
    return new ApprovalComments(value);
  }

  static fromString(value: string): ApprovalComments {
    return new ApprovalComments(value);
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  hasValue(): boolean {
    return !this.isEmpty();
  }

  toString(): string {
    return this.value;
  }

  equals(other: ApprovalComments): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
