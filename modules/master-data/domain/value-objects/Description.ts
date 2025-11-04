export class Description {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Description cannot be empty string, use null instead");
      }

      if (value.length > 500) {
        throw new Error("Description cannot exceed 500 characters");
      }
    }
  }

  static create(description?: string): Description {
    if (!description || description.trim().length === 0) {
      return new Description(null);
    }
    return new Description(description.trim());
  }

  static fromString(value: string | null): Description {
    return new Description(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null || this.value.trim().length === 0;
  }

  equals(other: Description): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
