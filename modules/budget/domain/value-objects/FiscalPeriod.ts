export class FiscalPeriod {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error("FiscalPeriod cannot be empty");
    }

    // Validate format: YYYY, YYYY-QN, YYYY-HN, YYYY-MM
    const validFormats = [
      /^\d{4}$/, // Annual: 2024
      /^\d{4}-Q[1-4]$/, // Quarterly: 2024-Q1
      /^\d{4}-H[1-2]$/, // Half-yearly: 2024-H1
      /^\d{4}-(0[1-9]|1[0-2])$/, // Monthly: 2024-01
    ];

    const isValid = validFormats.some((regex) => regex.test(value));
    if (!isValid) {
      throw new Error(
        "FiscalPeriod must be in format: YYYY, YYYY-QN, YYYY-HN, or YYYY-MM"
      );
    }
  }

  static create(value: string): FiscalPeriod {
    return new FiscalPeriod(value);
  }

  static fromString(value: string): FiscalPeriod {
    return new FiscalPeriod(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FiscalPeriod): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isAnnual(): boolean {
    return /^\d{4}$/.test(this.value);
  }

  isQuarterly(): boolean {
    return /^\d{4}-Q[1-4]$/.test(this.value);
  }

  isHalfYearly(): boolean {
    return /^\d{4}-H[1-2]$/.test(this.value);
  }

  isMonthly(): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(this.value);
  }

  getYear(): number {
    return parseInt(this.value.substring(0, 4));
  }

  getQuarter(): number | null {
    if (!this.isQuarterly()) return null;
    return parseInt(this.value.substring(6));
  }

  getHalf(): number | null {
    if (!this.isHalfYearly()) return null;
    return parseInt(this.value.substring(6));
  }

  getMonth(): number | null {
    if (!this.isMonthly()) return null;
    return parseInt(this.value.substring(5));
  }
}
