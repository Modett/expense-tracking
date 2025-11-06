export class DepartmentCode {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Department code cannot be empty string, use null instead");
      }

      if (value.length < 2) {
        throw new Error("Department code must be at least 2 characters long");
      }

      if (value.length > 20) {
        throw new Error("Department code cannot exceed 20 characters");
      }

      // Department codes are typically alphanumeric, uppercase, may contain hyphens/underscores
      const codeRegex = /^[A-Z0-9_-]+$/;
      if (!codeRegex.test(value)) {
        throw new Error("Department code must contain only uppercase letters, numbers, hyphens, and underscores");
      }
    }
  }

  static create(code?: string): DepartmentCode {
    if (!code || code.trim().length === 0) {
      return new DepartmentCode(null);
    }
    return new DepartmentCode(code.trim().toUpperCase());
  }

  static fromString(value: string | null): DepartmentCode {
    if (value === null) {
      return new DepartmentCode(null);
    }
    return new DepartmentCode(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: DepartmentCode): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
