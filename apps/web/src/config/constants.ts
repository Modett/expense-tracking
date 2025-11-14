export const APP_NAME = "Expense Tracker";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const MAX_FILE_SIZE = parseInt(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "5242880"
);

export const ALLOWED_FILE_TYPES = (
  process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES ||
  "image/jpeg,image/png,application/pdf"
).split(",");

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const EXPENSE_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  FINANCE: "FINANCE",
} as const;

export const DATE_FORMAT = {
  DISPLAY: "MMM dd, yyyy",
  API: "yyyy-MM-dd",
  FULL: "MMMM dd, yyyy HH:mm",
} as const;
