export class ExpenseDescription {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("ExpenseDescription cannot be empty");
    }

    if (value.trim().length === 0) {
      throw new Error("Expense Description cannot be only whitespace");
    }

    if (value.length < 3) {
      throw new Error("Expense Description must be at least 3 characters long");
    }

    if (value.length > 500) {
      throw new Error("Expense Description cannot exceed 500 characters");
    }

    const invalidCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (invalidCharsRegex.test(value)) {
      throw new Error("Expense Description contains invalid characters");
    }
  }

  static create(description: string): ExpenseDescription {
    const normalized = description.trim().replace(/\s+/g, " ");
    return new ExpenseDescription(normalized);
  }

  static fromString(value: string): ExpenseDescription {
    return new ExpenseDescription(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ExpenseDescription): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getLength(): number {
    return this.value.length;
  }

  getWordCount(): number {
    return this.value.split(/\s+/).filter((word) => word.length > 0).length;
  }

  containsKeyword(keyword: string): boolean {
    return this.value.toLowerCase().includes(keyword.toLowerCase());
  }

  getPreview(maxLength: number = 50): string {
    if (this.value.length <= maxLength) {
      return this.value;
    }
    return this.value.substring(0, maxLength - 3) + "...";
  }
}
