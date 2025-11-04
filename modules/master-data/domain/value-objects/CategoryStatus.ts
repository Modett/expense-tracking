export class CategoryStatus {
  private constructor(private readonly isActive: boolean) {}

  static active(): CategoryStatus {
    return new CategoryStatus(true);
  }

  static inactive(): CategoryStatus {
    return new CategoryStatus(false);
  }

  static fromBoolean(value: boolean): CategoryStatus {
    return new CategoryStatus(value);
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  activate(): CategoryStatus {
    return CategoryStatus.active();
  }

  deactivate(): CategoryStatus {
    return CategoryStatus.inactive();
  }

  equals(other: CategoryStatus): boolean {
    if (!other) return false;
    return this.isActive === other.isActive;
  }

  toString(): string {
    return this.isActive ? "Active" : "Inactive";
  }
}
