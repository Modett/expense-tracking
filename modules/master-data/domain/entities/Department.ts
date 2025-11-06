import { DepartmentId, DepartmentName, DepartmentCode, DepartmentStatus } from "../value-objects/index.js";

export class Department {
  private constructor(
    public readonly id: DepartmentId,
    private name: DepartmentName,
    private code: DepartmentCode,
    private status: DepartmentStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    name: DepartmentName,
    code?: string
  ): Department {
    return new Department(
      DepartmentId.create(),
      name,
      DepartmentCode.create(code),
      DepartmentStatus.active(),
      new Date(),
      new Date()
    );
  }

  static fromPersistence(
    id: DepartmentId,
    name: DepartmentName,
    code: DepartmentCode,
    status: DepartmentStatus,
    createdAt: Date,
    updatedAt: Date
  ): Department {
    return new Department(id, name, code, status, createdAt, updatedAt);
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

  isActive(): boolean {
    return this.status.isActiveStatus();
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
    this.status = DepartmentStatus.inactive();
    this.updatedAt = new Date();
  }

  update(name: DepartmentName, code: string | undefined): void {
    this.name = name;
    this.code = DepartmentCode.create(code);
    this.updatedAt = new Date();
  }
}
