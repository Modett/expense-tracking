import {
  DepartmentId,
  DepartmentName,
  DepartmentCode,
  DepartmentStatus,
} from "../value-objects/index.js";

export class Department {
  private constructor(
    public readonly id: DepartmentId,
    private name: DepartmentName,
    private code: DepartmentCode,
    private status: DepartmentStatus,
    private description: string | null,
    private isSystem: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    name: DepartmentName,
    code?: string,
    description?: string,
    isSystem: boolean = false
  ): Department {
    return new Department(
      DepartmentId.create(),
      name,
      DepartmentCode.create(code),
      DepartmentStatus.active(),
      description || null,
      isSystem,
      new Date(),
      new Date()
    );
  }

  static fromPersistence(
    id: DepartmentId,
    name: DepartmentName,
    code: DepartmentCode,
    status: DepartmentStatus,
    description: string | null,
    isSystem: boolean,
    createdAt: Date,
    updatedAt: Date
  ): Department {
    return new Department(
      id,
      name,
      code,
      status,
      description,
      isSystem,
      createdAt,
      updatedAt
    );
  }

  // Getters
  getName(): DepartmentName {
    return this.name;
  }

  getCode(): DepartmentCode {
    return this.code;
  }

  getStatus(): DepartmentStatus {
    return this.status;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsSystem(): boolean {
    return this.isSystem;
  }

  isActive(): boolean {
    return this.status.isActiveStatus();
  }

  isSystemDepartment(): boolean {
    return this.isSystem;
  }

  // Business Logic Methods
  updateName(name: DepartmentName): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateCode(code: string | undefined): void {
    this.code = DepartmentCode.create(code);
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = DepartmentStatus.active();
    this.updatedAt = new Date();
  }

  deactivate(): void {
    // System departments cannot be deactivated
    if (this.isSystem) {
      throw new Error(
        "Cannot deactivate system department. System departments are required for core functionality."
      );
    }
    this.status = DepartmentStatus.inactive();
    this.updatedAt = new Date();
  }

  update(
    name: DepartmentName,
    code: string | undefined,
    description?: string
  ): void {
    // System departments cannot be fully updated (only description)
    if (this.isSystem) {
      if (description !== undefined) {
        this.description = description;
        this.updatedAt = new Date();
      }
      return;
    }

    this.name = name;
    this.code = DepartmentCode.create(code);
    if (description !== undefined) {
      this.description = description;
    }
    this.updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Check if this department can be deleted
   * System departments cannot be deleted
   */
  canBeDeleted(): boolean {
    return !this.isSystem;
  }
}
