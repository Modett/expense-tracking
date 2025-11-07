export class TagName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Tag name cannot be empty");
    }

    if (value.trim().length < 2) {
      throw new Error("Tag name must be at least 2 characters long");
    }

    if (value.length > 100) {
      throw new Error("Tag name cannot exceed 100 characters");
    }
  }

  static create(name: string): TagName {
    return new TagName(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TagName): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
