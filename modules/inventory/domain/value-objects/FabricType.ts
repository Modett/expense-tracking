export class FabricType {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Fabric type cannot be empty");
    }
  }

  static create(fabricType: string): FabricType {
    return new FabricType(fabricType);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FabricType): boolean {
    return this.value === other.value;
  }
}
