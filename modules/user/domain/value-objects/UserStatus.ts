export enum UserStatusType {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export class UserStatus {
  private constructor(private readonly value: UserStatusType) {
    if (!value) {
      throw new Error("UserStatus cannot be empty");
    }

    if (!Object.values(UserStatusType).includes(value)) {
      throw new Error(
        `Invalid UserStatus: ${value}. Must be one of: ${Object.values(
          UserStatusType
        ).join(", ")}`
      );
    }
  }

  static create(status: UserStatusType): UserStatus {
    return new UserStatus(status);
  }

  static active(): UserStatus {
    return new UserStatus(UserStatusType.ACTIVE);
  }

  static inactive(): UserStatus {
    return new UserStatus(UserStatusType.INACTIVE);
  }

  static suspended(): UserStatus {
    return new UserStatus(UserStatusType.SUSPENDED);
  }

  static pending(): UserStatus {
    return new UserStatus(UserStatusType.PENDING);
  }

  static fromString(value: string): UserStatus {
    const upperValue = value.toUpperCase() as UserStatusType;
    return new UserStatus(upperValue);
  }

  getValue(): UserStatusType {
    return this.value;
  }

  equals(other: UserStatus): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Business logic methods
  isActive(): boolean {
    return this.value === UserStatusType.ACTIVE;
  }

  isInactive(): boolean {
    return this.value === UserStatusType.INACTIVE;
  }

  isSuspended(): boolean {
    return this.value === UserStatusType.SUSPENDED;
  }

  isPending(): boolean {
    return this.value === UserStatusType.PENDING;
  }

  canLogin(): boolean {
    return this.value === UserStatusType.ACTIVE;
  }

  canBeActivated(): boolean {
    return (
      this.value === UserStatusType.PENDING ||
      this.value === UserStatusType.INACTIVE
    );
  }

  canBeSuspended(): boolean {
    return this.value === UserStatusType.ACTIVE;
  }
}
