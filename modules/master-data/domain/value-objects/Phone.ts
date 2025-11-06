export class Phone {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Phone cannot be empty string, use null instead");
      }

      // Remove spaces, hyphens, parentheses for validation
      const cleaned = value.replace(/[\s\-()]/g, "");

      // Allow + prefix for international numbers, then digits
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleaned)) {
        throw new Error("Invalid phone format. Must be 10-15 digits, optional + prefix");
      }

      if (value.length > 20) {
        throw new Error("Phone cannot exceed 20 characters");
      }
    }
  }

  static create(phone?: string): Phone {
    if (!phone || phone.trim().length === 0) {
      return new Phone(null);
    }
    return new Phone(phone.trim());
  }

  static fromString(value: string | null): Phone {
    if (value === null) {
      return new Phone(null);
    }
    return new Phone(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: Phone): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
