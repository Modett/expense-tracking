export enum RoleType {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  FINANCE = "FINANCE",
}

export class Role {
  private constructor(private readonly value: RoleType) {
    if (!value) {
      throw new Error("Role cannot be empty");
    }

    if (!Object.values(RoleType).includes(value)) {
      throw new Error(
        `Invalid Role: ${value}. Must be one of: ${Object.values(RoleType).join(
          ", "
        )}`
      );
    }
  }

  static create(role: RoleType): Role {
    return new Role(role);
  }

  static staff(): Role {
    return new Role(RoleType.STAFF);
  }

  static manager(): Role {
    return new Role(RoleType.MANAGER);
  }

  static admin(): Role {
    return new Role(RoleType.ADMIN);
  }

  static finance(): Role {
    return new Role(RoleType.FINANCE);
  }

  static fromString(value: string): Role {
    const upperValue = value.toUpperCase() as RoleType;
    return new Role(upperValue);
  }

  getValue(): RoleType {
    return this.value;
  }

  equals(other: Role): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Business logic methods
  isStaff(): boolean {
    return this.value === RoleType.STAFF;
  }

  isManager(): boolean {
    return this.value === RoleType.MANAGER;
  }

  isAdmin(): boolean {
    return this.value === RoleType.ADMIN;
  }

  isFinance(): boolean {
    return this.value === RoleType.FINANCE;
  }

  canManageUsers(): boolean {
    return this.value === RoleType.ADMIN;
  }

  canApproveExpenses(): boolean {
    return this.value === RoleType.ADMIN || this.value === RoleType.MANAGER;
  }

  canViewAllExpenses(): boolean {
    return (
      this.value === RoleType.ADMIN ||
      this.value === RoleType.MANAGER ||
      this.value === RoleType.FINANCE
    );
  }

  canAccessFinancialReports(): boolean {
    return this.value === RoleType.ADMIN || this.value === RoleType.FINANCE;
  }

  canViewDepartmentExpenses(): boolean {
    return this.value === RoleType.MANAGER;
  }

  hasHigherAuthorityThan(other: Role): boolean {
    const hierarchy = {
      [RoleType.ADMIN]: 4,
      [RoleType.FINANCE]: 3,
      [RoleType.MANAGER]: 2,
      [RoleType.STAFF]: 1,
    };

    return hierarchy[this.value] > hierarchy[other.value];
  }
}
