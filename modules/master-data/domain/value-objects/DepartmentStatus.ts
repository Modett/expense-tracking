export class DepartmentStatus {
  private constructor(private readonly isActive: boolean) {}

  static active(): DepartmentStatus {
    return new DepartmentStatus(true);
  }

  static inactive(): DepartmentStatus {
    return new DepartmentStatus(false);
  }

  static fromBoolean(value: boolean): DepartmentStatus {
    return new DepartmentStatus(value);
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  activate(): DepartmentStatus {
    return DepartmentStatus.active();
  }

  deactivate(): DepartmentStatus {
    return DepartmentStatus.inactive();
  }

  equals(other: DepartmentStatus): boolean {
    if (!other) return false;
    return this.isActive === other.isActive;
  }

  toString(): string {
    return this.isActive ? "Active" : "Inactive";
  }
}
