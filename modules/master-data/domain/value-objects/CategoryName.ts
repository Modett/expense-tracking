export class CategoryName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }

    if (value.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters long");
    }

    if (value.length > 100) {
      throw new Error("Category name cannot exceed 100 characters");
    }
  }

  static create(name: string): CategoryName {
    return new CategoryName(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CategoryName): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
