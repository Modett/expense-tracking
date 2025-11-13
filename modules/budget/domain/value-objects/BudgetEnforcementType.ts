export enum BudgetEnforcementTypeEnum {
  SOFT = "soft",
  HARD = "hard",
}

/**
 * BudgetEnforcementType Value Object
 *
 * SOFT: Budget is advisory - warns but allows overrides
 * HARD: Budget is strictly enforced - blocks expenses exceeding budget unless override is authorized
 */
export class BudgetEnforcementType {
  private constructor(private readonly value: BudgetEnforcementTypeEnum) {
    if (!value) {
      throw new Error("BudgetEnforcementType cannot be empty");
    }

    if (!Object.values(BudgetEnforcementTypeEnum).includes(value)) {
      throw new Error(
        `Invalid BudgetEnforcementType: ${value}. Must be 'soft' or 'hard'`
      );
    }
  }

  static create(type: BudgetEnforcementTypeEnum): BudgetEnforcementType {
    return new BudgetEnforcementType(type);
  }

  static soft(): BudgetEnforcementType {
    return new BudgetEnforcementType(BudgetEnforcementTypeEnum.SOFT);
  }

  static hard(): BudgetEnforcementType {
    return new BudgetEnforcementType(BudgetEnforcementTypeEnum.HARD);
  }

  static fromString(value: string): BudgetEnforcementType {
    const lowerValue = value.toLowerCase() as BudgetEnforcementTypeEnum;
    return new BudgetEnforcementType(lowerValue);
  }

  getValue(): BudgetEnforcementTypeEnum {
    return this.value;
  }

  isSoft(): boolean {
    return this.value === BudgetEnforcementTypeEnum.SOFT;
  }

  isHard(): boolean {
    return this.value === BudgetEnforcementTypeEnum.HARD;
  }

  equals(other: BudgetEnforcementType): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
