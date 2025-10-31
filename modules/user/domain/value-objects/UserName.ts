export class UserName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;
  private static readonly VALID_NAME_REGEX = /^[a-zA-Z\s'-]+$/;

  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("UserName cannot be empty");
    }
    const trimmedValue = value.trim();

    if (trimmedValue.length < UserName.MIN_LENGTH) {
      throw new Error(
        `UserName must be at least ${UserName.MIN_LENGTH} characters long`
      );
    }
    if (trimmedValue.length > UserName.MAX_LENGTH) {
      throw new Error(
        `UserName cannot exceed ${UserName.MAX_LENGTH} characters`
      );
    }
    if (!UserName.VALID_NAME_REGEX.test(trimmedValue)) {
      throw new Error(
        "UserName can only contain letters, spaces, hyphens, and apostrophes"
      );
    }
    if (this.hasConsecutiveSpaces(trimmedValue)) {
      throw new Error("UserName cannot contain consecutive spaces");
    }
  }

  static create(name: string): UserName {
    const normalized = name.trim().replace(/\s+/g, " "); // Normalize multiple spaces to single space
    return new UserName(normalized);
  }

  static fromString(name: string): UserName {
    return new UserName(name);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserName): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getFirstName(): string {
    const parts = this.value.split(" ");
    return parts[0] || "";
  }

  getLastName(): string {
    const parts = this.value.split(" ");
    return parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  }

  getInitials(): string {
    const parts = this.value.split(" ");
    if (parts.length === 1) {
      return parts[0]!.charAt(0).toUpperCase();
    }
    const first = parts[0]!.charAt(0);
    const last = parts[parts.length - 1]!.charAt(0);
    return `${first}${last}`.toUpperCase();
  }

  private hasConsecutiveSpaces(value: string): boolean {
    return /\s{2,}/.test(value);
  }
}
