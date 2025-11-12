export enum ExpensePriorityType {
  ROUTINE = "routine",
  STANDARD = "standard",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

/**
 * ExpensePriority Value Object
 * Determines urgency and SLA for expense approval
 *
 * ROUTINE: 7-day SLA, low urgency (e.g., office supplies)
 * STANDARD: 3-day SLA, normal urgency (e.g., software licenses)
 * URGENT: 24-hour SLA, high urgency (e.g., urgent repairs)
 * EMERGENCY: 4-hour SLA, critical urgency (e.g., system failures, legal urgency)
 */
export class ExpensePriority {
  private constructor(private readonly value: ExpensePriorityType) {
    if (!value) {
      throw new Error("ExpensePriority cannot be empty");
    }

    if (!Object.values(ExpensePriorityType).includes(value)) {
      throw new Error(
        `Invalid ExpensePriority: ${value}. Must be one of: ${Object.values(
          ExpensePriorityType
        ).join(", ")}`
      );
    }
  }

  static create(priority: ExpensePriorityType): ExpensePriority {
    return new ExpensePriority(priority);
  }

  static routine(): ExpensePriority {
    return new ExpensePriority(ExpensePriorityType.ROUTINE);
  }

  static standard(): ExpensePriority {
    return new ExpensePriority(ExpensePriorityType.STANDARD);
  }

  static urgent(): ExpensePriority {
    return new ExpensePriority(ExpensePriorityType.URGENT);
  }

  static emergency(): ExpensePriority {
    return new ExpensePriority(ExpensePriorityType.EMERGENCY);
  }

  static fromString(value: string): ExpensePriority {
    const lowerValue = value.toLowerCase() as ExpensePriorityType;
    return new ExpensePriority(lowerValue);
  }

  getValue(): ExpensePriorityType {
    return this.value;
  }

  equals(other: ExpensePriority): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isRoutine(): boolean {
    return this.value === ExpensePriorityType.ROUTINE;
  }

  isStandard(): boolean {
    return this.value === ExpensePriorityType.STANDARD;
  }

  isUrgent(): boolean {
    return this.value === ExpensePriorityType.URGENT;
  }

  isEmergency(): boolean {
    return this.value === ExpensePriorityType.EMERGENCY;
  }

  /**
   * Get SLA in hours for this priority level
   */
  getSLAHours(): number {
    switch (this.value) {
      case ExpensePriorityType.ROUTINE:
        return 168; // 7 days
      case ExpensePriorityType.STANDARD:
        return 72; // 3 days
      case ExpensePriorityType.URGENT:
        return 24; // 1 day
      case ExpensePriorityType.EMERGENCY:
        return 4; // 4 hours
      default:
        return 72; // default to standard
    }
  }

  /**
   * Check if this priority requires immediate notification
   */
  requiresImmediateNotification(): boolean {
    return (
      this.value === ExpensePriorityType.URGENT ||
      this.value === ExpensePriorityType.EMERGENCY
    );
  }

  /**
   * Check if this priority requires SMS/push notifications
   */
  requiresPushNotification(): boolean {
    return (
      this.value === ExpensePriorityType.URGENT ||
      this.value === ExpensePriorityType.EMERGENCY
    );
  }

  /**
   * Check if priority is higher than another
   */
  isHigherThan(other: ExpensePriority): boolean {
    const priorityOrder = {
      [ExpensePriorityType.ROUTINE]: 1,
      [ExpensePriorityType.STANDARD]: 2,
      [ExpensePriorityType.URGENT]: 3,
      [ExpensePriorityType.EMERGENCY]: 4,
    };

    return priorityOrder[this.value] > priorityOrder[other.value];
  }

  /**
   * Check if priority is lower than another
   */
  isLowerThan(other: ExpensePriority): boolean {
    return !this.isHigherThan(other) && !this.equals(other);
  }

  /**
   * Determine auto-escalation level
   * Returns how many levels to skip if SLA is violated
   */
  getEscalationLevels(): number {
    switch (this.value) {
      case ExpensePriorityType.ROUTINE:
        return 0; // No skip, proceed normally
      case ExpensePriorityType.STANDARD:
        return 0; // No skip, proceed normally
      case ExpensePriorityType.URGENT:
        return 1; // Skip 1 level if violated
      case ExpensePriorityType.EMERGENCY:
        return 2; // Skip 2 levels if violated, go to top authority
      default:
        return 0;
    }
  }
}
