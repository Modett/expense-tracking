export class Email {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Email cannot be empty string, use null instead");
      }

      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
      }

      if (value.length > 255) {
        throw new Error("Email cannot exceed 255 characters");
      }
    }
  }

  static create(email?: string): Email {
    if (!email || email.trim().length === 0) {
      return new Email(null);
    }
    return new Email(email.trim().toLowerCase());
  }

  static fromString(value: string | null): Email {
    if (value === null) {
      return new Email(null);
    }
    return new Email(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: Email): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
