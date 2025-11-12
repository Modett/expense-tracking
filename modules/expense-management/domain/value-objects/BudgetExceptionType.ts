export enum BudgetExceptionTypeEnum {
  NONE = "none",
  EMERGENCY = "emergency",
  ANNUAL = "annual",
  RECURRING = "recurring",
}

/**
 * BudgetExceptionType Value Object
 * Defines the type of budget override for expenses exceeding allocated budget
 *
 * NONE: No exception, expense must stay within budget
 * EMERGENCY: One-time emergency override (requires special approval, documentation)
 * ANNUAL: Planned annual exception (e.g., end-of-year spending, Q4 campaigns)
 * RECURRING: Recurring exception for predictable overages (e.g., seasonal spikes)
 */
export class BudgetExceptionType {
  private constructor(private readonly value: BudgetExceptionTypeEnum) {
    if (!value) {
      throw new Error("BudgetExceptionType cannot be empty");
    }

    if (!Object.values(BudgetExceptionTypeEnum).includes(value)) {
      throw new Error(
        `Invalid BudgetExceptionType: ${value}. Must be one of: ${Object.values(
          BudgetExceptionTypeEnum
        ).join(", ")}`
      );
    }
  }

  static create(type: BudgetExceptionTypeEnum): BudgetExceptionType {
    return new BudgetExceptionType(type);
  }

  static none(): BudgetExceptionType {
    return new BudgetExceptionType(BudgetExceptionTypeEnum.NONE);
  }

  static emergency(): BudgetExceptionType {
    return new BudgetExceptionType(BudgetExceptionTypeEnum.EMERGENCY);
  }

  static annual(): BudgetExceptionType {
    return new BudgetExceptionType(BudgetExceptionTypeEnum.ANNUAL);
  }

  static recurring(): BudgetExceptionType {
    return new BudgetExceptionType(BudgetExceptionTypeEnum.RECURRING);
  }

  static fromString(value: string): BudgetExceptionType {
    const lowerValue = value.toLowerCase() as BudgetExceptionTypeEnum;
    return new BudgetExceptionType(lowerValue);
  }

  getValue(): BudgetExceptionTypeEnum {
    return this.value;
  }

  equals(other: BudgetExceptionType): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isNone(): boolean {
    return this.value === BudgetExceptionTypeEnum.NONE;
  }

  isEmergency(): boolean {
    return this.value === BudgetExceptionTypeEnum.EMERGENCY;
  }

  isAnnual(): boolean {
    return this.value === BudgetExceptionTypeEnum.ANNUAL;
  }

  isRecurring(): boolean {
    return this.value === BudgetExceptionTypeEnum.RECURRING;
  }

  /**
   * Check if this exception type requires special approval workflow
   */
  requiresSpecialApproval(): boolean {
    return this.value !== BudgetExceptionTypeEnum.NONE;
  }

  /**
   * Check if this exception requires justification documentation
   */
  requiresJustification(): boolean {
    return (
      this.value === BudgetExceptionTypeEnum.EMERGENCY ||
      this.value === BudgetExceptionTypeEnum.ANNUAL
    );
  }

  /**
   * Check if this exception requires CFO/CEO approval
   */
  requiresExecutiveApproval(): boolean {
    return (
      this.value === BudgetExceptionTypeEnum.EMERGENCY ||
      this.value === BudgetExceptionTypeEnum.ANNUAL
    );
  }

  /**
   * Get minimum approval level required
   * Returns the role level: 1=Manager, 2=Finance, 3=CFO, 4=CEO
   */
  getMinimumApprovalLevel(): number {
    switch (this.value) {
      case BudgetExceptionTypeEnum.NONE:
        return 1; // Normal approval chain
      case BudgetExceptionTypeEnum.RECURRING:
        return 2; // Finance Director minimum
      case BudgetExceptionTypeEnum.ANNUAL:
        return 3; // CFO minimum
      case BudgetExceptionTypeEnum.EMERGENCY:
        return 3; // CFO minimum (with fast-track)
      default:
        return 1;
    }
  }

  /**
   * Get description for UI/notification
   */
  getDescription(): string {
    switch (this.value) {
      case BudgetExceptionTypeEnum.NONE:
        return "No budget exception";
      case BudgetExceptionTypeEnum.EMERGENCY:
        return "Emergency budget override - Requires immediate CFO approval with justification";
      case BudgetExceptionTypeEnum.ANNUAL:
        return "Annual budget exception - Pre-planned override for end-of-year spending";
      case BudgetExceptionTypeEnum.RECURRING:
        return "Recurring budget exception - Authorized for predictable seasonal overages";
      default:
        return "Unknown exception type";
    }
  }
}
