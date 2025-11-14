import { useState } from "react";
import { PAGINATION } from "@/config";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage || PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState(options.initialLimit || PAGINATION.DEFAULT_LIMIT);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetPagination = () => {
    setPage(PAGINATION.DEFAULT_PAGE);
    setLimit(PAGINATION.DEFAULT_LIMIT);
  };

  return {
    page,
    limit,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    resetPagination,
  };
}
