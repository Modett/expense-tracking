export class Address {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Address cannot be empty string, use null instead");
      }

      if (value.length > 500) {
        throw new Error("Address cannot exceed 500 characters");
      }
    }
  }

  static create(address?: string): Address {
    if (!address || address.trim().length === 0) {
      return new Address(null);
    }
    return new Address(address.trim());
  }

  static fromString(value: string | null): Address {
    if (value === null) {
      return new Address(null);
    }
    return new Address(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: Address): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
