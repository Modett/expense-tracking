import {
  UserId,
  UserName,
  Email,
  Password,
  Role,
  UserStatus,
} from "../value-objects/index.js";

export interface UserProps {
  id: UserId;
  name: UserName;
  email: Email;
  password: Password;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {
    this.validate();
  }

  // Factory method to create a new user (for registration)
  static create(
    name: UserName,
    email: Email,
    password: Password,
    role: Role = Role.staff()
  ): User {
    return new User({
      id: UserId.create(),
      name,
      email,
      password,
      role,
      status: UserStatus.active(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Factory method to reconstruct user from database
  static fromPersistence(
    id: UserId,
    name: UserName,
    email: Email,
    password: Password,
    role: Role,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User({
      id,
      name,
      email,
      password,
      role,
      status,
      createdAt,
      updatedAt,
    });
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("User ID is required");
    }
    if (!this.props.name) {
      throw new Error("User name is required");
    }
    if (!this.props.email) {
      throw new Error("User email is required");
    }
    if (!this.props.password) {
      throw new Error("User password is required");
    }
    if (!this.props.role) {
      throw new Error("User role is required");
    }
    if (!this.props.status) {
      throw new Error("User status is required");
    }
  }

  // Getters
  get id(): UserId {
    return this.props.id;
  }

  get name(): UserName {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods

  /**
   * Activate the user account
   */
  activate(): void {
    if (!this.props.status.canBeActivated()) {
      throw new Error(
        `Cannot activate user with status: ${this.props.status.toString()}`
      );
    }
    this.props.status = UserStatus.active();
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivate the user account
   */
  deactivate(): void {
    if (this.props.status.isInactive()) {
      throw new Error("User is already inactive");
    }
    this.props.status = UserStatus.inactive();
    this.props.updatedAt = new Date();
  }

  /**
   * Suspend the user account
   */
  suspend(): void {
    if (!this.props.status.canBeSuspended()) {
      throw new Error(
        `Cannot suspend user with status: ${this.props.status.toString()}`
      );
    }
    this.props.status = UserStatus.suspended();
    this.props.updatedAt = new Date();
  }

  /**
   * Change user password
   */
  changePassword(newPassword: Password): void {
    if (!this.props.status.canLogin()) {
      throw new Error("Cannot change password for inactive user");
    }

    if (this.props.password.equals(newPassword)) {
      throw new Error("New password must be different from current password");
    }

    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  /**
   * Update user profile (name and email)
   */
  updateProfile(name: UserName, email: Email): void {
    this.props.name = name;
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  /**
   * Update user role (admin only)
   */
  updateRole(newRole: Role): void {
    if (this.props.role.equals(newRole)) {
      throw new Error("New role must be different from current role");
    }

    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if user can login
   */
  canLogin(): boolean {
    return this.props.status.canLogin();
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    return this.props.status.isActive();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: Role): boolean {
    return this.props.role.equals(role);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.props.role.isAdmin();
  }

  /**
   * Check if user is manager
   */
  isManager(): boolean {
    return this.props.role.isManager();
  }

  /**
   * Check if user is staff
   */
  isStaff(): boolean {
    return this.props.role.isStaff();
  }

  /**
   * Check if user is finance
   */
  isFinance(): boolean {
    return this.props.role.isFinance();
  }

  /**
   * Check if user can manage other users
   */
  canManageUsers(): boolean {
    return this.props.role.canManageUsers();
  }

  /**
   * Check if user can approve expenses
   */
  canApproveExpenses(): boolean {
    return this.props.role.canApproveExpenses();
  }

  /**
   * Check if user can view all expenses
   */
  canViewAllExpenses(): boolean {
    return this.props.role.canViewAllExpenses();
  }

  /**
   * Check if user can access financial reports
   */
  canAccessFinancialReports(): boolean {
    return this.props.role.canAccessFinancialReports();
  }

  /**
   * Verify if this user has higher authority than another user
   */
  hasHigherAuthorityThan(otherUser: User): boolean {
    return this.props.role.hasHigherAuthorityThan(otherUser.role);
  }

  /**
   * Equality comparison
   */
  equals(other: User): boolean {
    if (!other) return false;
    return this.props.id.equals(other.id);
  }

  /**
   * Convert to plain object (for logging, debugging)
   */
  toObject(): {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id.getValue(),
      name: this.props.name.getValue(),
      email: this.props.email.getValue(),
      role: this.props.role.toString(),
      status: this.props.status.toString(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
