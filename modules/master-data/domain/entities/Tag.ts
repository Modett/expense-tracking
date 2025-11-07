import { TagId, TagName, TagType, TagStatus } from "../value-objects/index.js";

export class Tag {
  private constructor(
    public readonly id: TagId,
    private name: TagName,
    private type: TagType,
    private status: TagStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    name: TagName,
    type: TagType
  ): Tag {
    return new Tag(
      TagId.create(),
      name,
      type,
      TagStatus.active(),
      new Date(),
      new Date()
    );
  }

  static fromPersistence(
    id: TagId,
    name: TagName,
    type: TagType,
    status: TagStatus,
    createdAt: Date,
    updatedAt: Date
  ): Tag {
    return new Tag(id, name, type, status, createdAt, updatedAt);
  }

  // Getters
  getName(): TagName {
    return this.name;
  }

  getType(): TagType {
    return this.type;
  }

  getStatus(): TagStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status.isActiveStatus();
  }

  // Business Logic Methods
  updateName(name: TagName): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateType(type: TagType): void {
    this.type = type;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = TagStatus.active();
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = TagStatus.inactive();
    this.updatedAt = new Date();
  }

  update(name: TagName, type: TagType): void {
    this.name = name;
    this.type = type;
    this.updatedAt = new Date();
  }
}
