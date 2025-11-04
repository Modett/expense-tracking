import { CategoryId, CategoryName, CategoryStatus, Description } from "../value-objects/index.js";

export class Category {
  private constructor(
    public readonly id: CategoryId,
    private name: CategoryName,
    private description: Description,
    private status: CategoryStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    name: CategoryName,
    description?: string
  ): Category {
    return new Category(
      CategoryId.create(),
      name,
      Description.create(description),
      CategoryStatus.active(),
      new Date(),
      new Date()
    );
  }

  static fromPersistence(
    id: CategoryId,
    name: CategoryName,
    description: Description,
    status: CategoryStatus,
    createdAt: Date,
    updatedAt: Date
  ): Category {
    return new Category(id, name, description, status, createdAt, updatedAt);
  }

  // Getters
  getName(): CategoryName {
    return this.name;
  }

  getDescription(): Description {
    return this.description;
  }

  getStatus(): CategoryStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status.isActiveStatus();
  }

  // Business Logic Methods
  updateName(name: CategoryName): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description: string | undefined): void {
    this.description = Description.create(description);
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = CategoryStatus.active();
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = CategoryStatus.inactive();
    this.updatedAt = new Date();
  }

  update(name: CategoryName, description: string | undefined): void {
    this.name = name;
    this.description = Description.create(description);
    this.updatedAt = new Date();
  }
}
