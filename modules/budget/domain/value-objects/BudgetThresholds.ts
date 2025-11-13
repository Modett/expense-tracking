/**
 * BudgetThresholds Value Object
 *
 * Defines warning thresholds for budget utilization alerts
 */
export class BudgetThresholds {
  private constructor(
    private readonly warning1: number, // First warning threshold (default 80%)
    private readonly warning2: number, // Second warning threshold (default 90%)
    private readonly critical: number // Critical threshold (default 100%)
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.warning1 < 0 || this.warning1 > 100) {
      throw new Error(
        `Warning threshold 1 must be between 0 and 100, got ${this.warning1}`
      );
    }

    if (this.warning2 < 0 || this.warning2 > 100) {
      throw new Error(
        `Warning threshold 2 must be between 0 and 100, got ${this.warning2}`
      );
    }

    if (this.critical < 0 || this.critical > 100) {
      throw new Error(
        `Critical threshold must be between 0 and 100, got ${this.critical}`
      );
    }

    if (this.warning1 >= this.warning2) {
      throw new Error(
        `Warning threshold 1 (${this.warning1}) must be less than warning threshold 2 (${this.warning2})`
      );
    }

    if (this.warning2 > this.critical) {
      throw new Error(
        `Warning threshold 2 (${this.warning2}) must be less than or equal to critical threshold (${this.critical})`
      );
    }
  }

  static create(
    warning1: number = 80,
    warning2: number = 90,
    critical: number = 100
  ): BudgetThresholds {
    return new BudgetThresholds(warning1, warning2, critical);
  }

  static default(): BudgetThresholds {
    return new BudgetThresholds(80, 90, 100);
  }

  getWarning1(): number {
    return this.warning1;
  }

  getWarning2(): number {
    return this.warning2;
  }

  getCritical(): number {
    return this.critical;
  }

  /**
   * Get the highest threshold that has been exceeded
   */
  getExceededThreshold(utilizationPercentage: number): {
    level: "none" | "warning1" | "warning2" | "critical";
    threshold: number;
  } {
    if (utilizationPercentage >= this.critical) {
      return { level: "critical", threshold: this.critical };
    }

    if (utilizationPercentage >= this.warning2) {
      return { level: "warning2", threshold: this.warning2 };
    }

    if (utilizationPercentage >= this.warning1) {
      return { level: "warning1", threshold: this.warning1 };
    }

    return { level: "none", threshold: 0 };
  }

  /**
   * Check if any threshold has been exceeded
   */
  isThresholdExceeded(utilizationPercentage: number): boolean {
    return utilizationPercentage >= this.warning1;
  }

  /**
   * Check if critical threshold has been exceeded
   */
  isCriticalThresholdExceeded(utilizationPercentage: number): boolean {
    return utilizationPercentage >= this.critical;
  }

  toPlainObject() {
    return {
      warning1: this.warning1,
      warning2: this.warning2,
      critical: this.critical,
    };
  }

  equals(other: BudgetThresholds): boolean {
    if (!other) return false;
    return (
      this.warning1 === other.warning1 &&
      this.warning2 === other.warning2 &&
      this.critical === other.critical
    );
  }
}
