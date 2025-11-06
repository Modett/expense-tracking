export class VendorName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Vendor name cannot be empty");
    }

    if (value.trim().length < 2) {
      throw new Error("Vendor name must be at least 2 characters long");
    }

    if (value.length > 200) {
      throw new Error("Vendor name cannot exceed 200 characters");
    }
  }

  static create(name: string): VendorName {
    return new VendorName(name.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: VendorName): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
