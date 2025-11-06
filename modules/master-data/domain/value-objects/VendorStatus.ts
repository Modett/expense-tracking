export class VendorStatus {
  private constructor(private readonly isActive: boolean) {}

  static active(): VendorStatus {
    return new VendorStatus(true);
  }

  static inactive(): VendorStatus {
    return new VendorStatus(false);
  }

  static fromBoolean(value: boolean): VendorStatus {
    return new VendorStatus(value);
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  activate(): VendorStatus {
    return VendorStatus.active();
  }

  deactivate(): VendorStatus {
    return VendorStatus.inactive();
  }

  equals(other: VendorStatus): boolean {
    if (!other) return false;
    return this.isActive === other.isActive;
  }

  toString(): string {
    return this.isActive ? "Active" : "Inactive";
  }
}
