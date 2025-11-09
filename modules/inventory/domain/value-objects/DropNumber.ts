export class DropNumber {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Drop number cannot be empty");
    }
  }

  static create(dropNumber: string): DropNumber {
    return new DropNumber(dropNumber);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DropNumber): boolean {
    return this.value === other.value;
  }
}
