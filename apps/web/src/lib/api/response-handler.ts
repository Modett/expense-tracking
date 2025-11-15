import { AxiosResponse } from "axios";

/**
 * API Response Patterns in the Application:
 *
 * Pattern 1: Wrapped Response (most endpoints)
 * { success: boolean; data: T }
 * Used by: budgets, approval-rules, expenses (single), approvals, users
 *
 * Pattern 2: Direct Response (pagination)
 * { items: T[]; total: number } or PaginatedResponse
 * Used by: expenses list
 *
 * Pattern 3: Direct Array/Object (master data with mappers)
 * Raw DTOs that need mapping (id → xxxId)
 * Used by: categories, vendors, departments, tags
 */

interface WrappedResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Safely extracts data from API response, handling different response patterns
 */
export function extractResponseData<T>(
  response: AxiosResponse<T | WrappedResponse<T>>
): T {
  const data = response.data;

  // Check if response is wrapped
  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    "data" in data
  ) {
    return (data as WrappedResponse<T>).data;
  }

  // Return direct response
  return data as T;
}

/**
 * Checks if response indicates success
 */
export function isSuccessResponse<T>(
  response: AxiosResponse<T | WrappedResponse<T>>
): boolean {
  const data = response.data;

  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data
  ) {
    return (data as WrappedResponse<T>).success;
  }

  // If no success field, check HTTP status
  return response.status >= 200 && response.status < 300;
}

/**
 * Safely handles paginated responses
 */
export function extractPaginatedData<T>(
  response: AxiosResponse<PaginatedResponse<T>>
): { items: T[]; total: number } {
  const data = response.data;

  return {
    items: data.items || [],
    total: data.total || 0,
  };
}

/**
 * Safe data accessor with fallback
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  if (obj === null || obj === undefined) {
    return fallback;
  }
  return obj[key] ?? fallback;
}

/**
 * Safe array accessor
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr ?? [];
}

/**
 * Safe string accessor
 */
export function safeString(str: string | null | undefined, fallback = ""): string {
  return str ?? fallback;
}

/**
 * Safe number accessor
 */
export function safeNumber(num: number | null | undefined, fallback = 0): number {
  return num ?? fallback;
}

/**
 * Safe boolean accessor
 */
export function safeBoolean(bool: boolean | null | undefined, fallback = false): boolean {
  return bool ?? fallback;
}

/**
 * Safe date accessor
 */
export function safeDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  try {
    return typeof date === "string" ? new Date(date) : date;
  } catch {
    return null;
  }
}

/**
 * Format currency safely
 */
export function safeCurrency(
  amount: number | string | null | undefined,
  decimals = 2
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (num === null || num === undefined || isNaN(num)) {
    return "0.00";
  }

  return num.toFixed(decimals);
}
