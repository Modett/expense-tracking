export class GSTNumber {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("GST number cannot be empty string, use null instead");
      }

      // GST format: 15 characters (2 state code + 10 PAN + 1 entity + 1 Z + 1 checksum)
      // Example: 29ABCDE1234F1Z5
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(value.toUpperCase())) {
        throw new Error("Invalid GST number format. Expected format: 29ABCDE1234F1Z5");
      }
    }
  }

  static create(gstNumber?: string): GSTNumber {
    if (!gstNumber || gstNumber.trim().length === 0) {
      return new GSTNumber(null);
    }
    return new GSTNumber(gstNumber.trim().toUpperCase());
  }

  static fromString(value: string | null): GSTNumber {
    if (value === null) {
      return new GSTNumber(null);
    }
    return new GSTNumber(value);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  equals(other: GSTNumber): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }
}
