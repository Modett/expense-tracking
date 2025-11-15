import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  field?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || "Invalid request. Please check your input.",
          status,
          code: "BAD_REQUEST",
          field: data?.field,
        };

      case 401:
        return {
          message: "Your session has expired. Please log in again.",
          status,
          code: "UNAUTHORIZED",
        };

      case 403:
        return {
          message: "You don't have permission to perform this action.",
          status,
          code: "FORBIDDEN",
        };

      case 404:
        return {
          message: data?.message || "The requested resource was not found.",
          status,
          code: "NOT_FOUND",
        };

      case 409:
        return {
          message: data?.message || "This action conflicts with existing data.",
          status,
          code: "CONFLICT",
        };

      case 422:
        return {
          message: data?.message || "Validation failed. Please check your input.",
          status,
          code: "VALIDATION_ERROR",
          field: data?.field,
        };

      case 500:
        return {
          message: "A server error occurred. Please try again later.",
          status,
          code: "SERVER_ERROR",
        };

      case 503:
        return {
          message: "The service is temporarily unavailable. Please try again later.",
          status,
          code: "SERVICE_UNAVAILABLE",
        };

      default:
        return {
          message: data?.message || "An unexpected error occurred. Please try again.",
          status,
          code: "UNKNOWN_ERROR",
        };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred.",
      code: "CLIENT_ERROR",
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.code === "ERR_NETWORK";
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}
