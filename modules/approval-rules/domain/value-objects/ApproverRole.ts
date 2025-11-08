export enum ApproverRoleType {
  STAFF = "staff",
  MANAGER = "manager",
  FINANCE = "finance",
  ADMIN = "admin",
}

export class ApproverRole {
  private constructor(private readonly value: ApproverRoleType) {
    if (!value) {
      throw new Error("ApproverRole cannot be empty");
    }

    if (!Object.values(ApproverRoleType).includes(value)) {
      throw new Error(
        `Invalid ApproverRole: ${value}. Must be one of: ${Object.values(
          ApproverRoleType
        ).join(", ")}`
      );
    }
  }

  static create(role: ApproverRoleType): ApproverRole {
    return new ApproverRole(role);
  }

  static staff(): ApproverRole {
    return new ApproverRole(ApproverRoleType.STAFF);
  }

  static manager(): ApproverRole {
    return new ApproverRole(ApproverRoleType.MANAGER);
  }

  static finance(): ApproverRole {
    return new ApproverRole(ApproverRoleType.FINANCE);
  }

  static admin(): ApproverRole {
    return new ApproverRole(ApproverRoleType.ADMIN);
  }

  static fromString(value: string): ApproverRole {
    const lowerValue = value.toLowerCase() as ApproverRoleType;
    return new ApproverRole(lowerValue);
  }

  getValue(): ApproverRoleType {
    return this.value;
  }

  equals(other: ApproverRole): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isStaff(): boolean {
    return this.value === ApproverRoleType.STAFF;
  }

  isManager(): boolean {
    return this.value === ApproverRoleType.MANAGER;
  }

  isFinance(): boolean {
    return this.value === ApproverRoleType.FINANCE;
  }

  isAdmin(): boolean {
    return this.value === ApproverRoleType.ADMIN;
  }
}
