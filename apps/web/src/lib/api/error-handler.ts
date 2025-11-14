import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 400 && data?.errors) {
      return {
        message: "Validation error",
        status,
        errors: data.errors,
      };
    }

    if (status === 401) {
      return {
        message: "Unauthorized. Please login again.",
        status,
      };
    }

    if (status === 403) {
      return {
        message: "You don't have permission to perform this action.",
        status,
      };
    }

    if (status === 404) {
      return {
        message: "Resource not found.",
        status,
      };
    }

    if (status === 500) {
      return {
        message: "Server error. Please try again later.",
        status,
      };
    }

    return {
      message: data?.message || error.message || "An error occurred",
      status,
    };
  }

  return {
    message: "An unexpected error occurred",
  };
}

export function showErrorToast(error: unknown) {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
}
