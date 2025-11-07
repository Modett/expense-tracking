export class DateOfExpense {
  private constructor(private readonly value: Date) {
    const normalized = new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (normalized.getTime() > today.getTime()) {
      throw new Error("Expense date cannot be in the future");
    }

    const threeYearsAgo = new Date(today);
    threeYearsAgo.setUTCFullYear(today.getUTCFullYear() - 3);

    if (normalized.getTime() < threeYearsAgo.getTime()) {
      throw new Error("Expense date cannot be more than 3 years in the past");
    }

    this.value = normalized;
  }

  static create(date: Date | string): DateOfExpense {
    if (!date) {
      throw new Error("Expense date is required");
    }

    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid expense date");
    }

    return new DateOfExpense(parsedDate);
  }

  static today(): DateOfExpense {
    return new DateOfExpense(new Date());
  }

  static fromString(dateString: string): DateOfExpense {
    return DateOfExpense.create(dateString);
  }

  getValue(): Date {
    return new Date(this.value);
  }

  equals(other: DateOfExpense): boolean {
    if (!other) return false;
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString().split("T")[0] || "";
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toDate(): Date {
    return new Date(this.value);
  }

  isToday(): boolean {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return this.value.getTime() === today.getTime();
  }

  isWithinLast(days: number): boolean {
    if (days < 0) {
      throw new Error("Days must be a positive number");
    }

    const cutoffDate = new Date();
    cutoffDate.setUTCHours(0, 0, 0, 0);
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - days);

    return this.value.getTime() >= cutoffDate.getTime();
  }

  isInCurrentMonth(): boolean {
    const now = new Date();
    return (
      this.value.getUTCFullYear() === now.getUTCFullYear() &&
      this.value.getUTCMonth() === now.getUTCMonth()
    );
  }

  isInCurrentYear(): boolean {
    const now = new Date();
    return this.value.getUTCFullYear() === now.getUTCFullYear();
  }

  getAge(): number {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const diffInMs = today.getTime() - this.value.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Returns age in days
  }

  isBefore(other: DateOfExpense): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: DateOfExpense): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  getMonthYear(): string {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[this.value.getUTCMonth()]} ${this.value.getUTCFullYear()}`;
  }

  getQuarter(): number {
    return Math.floor(this.value.getUTCMonth() / 3) + 1;
  }

  getFiscalYear(fiscalYearStartMonth: number = 4): number {
    // Default fiscal year starts in April (month index 3)
    const year = this.value.getUTCFullYear();
    const month = this.value.getUTCMonth();

    if (month >= fiscalYearStartMonth - 1) {
      return year + 1;
    }
    return year;
  }

  formatForDisplay(locale: string = "en-US"): string {
    return this.value.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  }
}
