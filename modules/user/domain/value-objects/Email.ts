export class Email {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("Email cannot be empty");
    }

    if (!this.isValidEmail(value)) {
      throw new Error("Invalid email format");
    }
  }

  static create(email: string): Email {
    return new Email(email.toLowerCase().trim());
  }

  static fromString(value: string): Email {
    return new Email(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getDomain(): string {
    const parts = this.value.split("@");
    if (parts.length < 2) {
      throw new Error("Invalid email format: missing domain");
    }
    return parts[1]!; //
  }

  getLocalPart(): string {
    const parts = this.value.split("@");
    if (parts.length < 2) {
      throw new Error("Invalid email format: missing local part");
    }
    return parts[0]!; //
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
