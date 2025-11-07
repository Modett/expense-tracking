export class TagStatus {
  private constructor(private readonly isActive: boolean) {}

  static active(): TagStatus {
    return new TagStatus(true);
  }

  static inactive(): TagStatus {
    return new TagStatus(false);
  }

  static fromBoolean(value: boolean): TagStatus {
    return new TagStatus(value);
  }

  isActiveStatus(): boolean {
    return this.isActive;
  }

  activate(): TagStatus {
    return TagStatus.active();
  }

  deactivate(): TagStatus {
    return TagStatus.inactive();
  }

  equals(other: TagStatus): boolean {
    if (!other) return false;
    return this.isActive === other.isActive;
  }

  toString(): string {
    return this.isActive ? "Active" : "Inactive";
  }
}
