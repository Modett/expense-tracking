export class BudgetPeriod {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }
  }

  static create(startDate: Date, endDate: Date): BudgetPeriod {
    // Normalize dates to midnight UTC for consistent comparison with expense dates
    const normalizedStart = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );

    const normalizedEnd = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    return new BudgetPeriod(normalizedStart, normalizedEnd);
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  isActive(date: Date = new Date()): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  isFuture(date: Date = new Date()): boolean {
    return this.startDate > date;
  }

  isExpired(date: Date = new Date()): boolean {
    return this.endDate < date;
  }

  getDurationInDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: BudgetPeriod): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  equals(other: BudgetPeriod): boolean {
    if (!other) return false;
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }
}
