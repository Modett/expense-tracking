# API Integration Guide

## Response Patterns

The frontend handles three different API response patterns from the backend:

### Pattern 1: Wrapped Response (Most Endpoints)

```typescript
{
  success: boolean;
  data: T;
}
```

**Used by:**
- Budgets API (`/budgets/*`)
- Approval Rules API (`/approval-rules/*`)
- Approvals API (`/approvals/*`)
- Expenses (single) API (`/expenses/:id`)
- Users API (`/users/*`)

**Example:**
```typescript
const response = await apiClient.get<{ success: boolean; data: Budget }>(`/budgets/${id}`);
return response.data.data; // Extract the actual data
```

### Pattern 2: Paginated Response

```typescript
{
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}
```

**Used by:**
- Expenses List API (`/expenses`)

**Example:**
```typescript
const response = await apiClient.get<PaginatedExpensesResponse>("/expenses");
return response.data; // Direct response
```

### Pattern 3: Direct Response with ID Mapping (Master Data)

Backend returns raw DTOs with `id` field, frontend maps to `xxxId`:

```typescript
// Backend response
{
  categories: [{ id: "123", name: "Travel", ... }],
  total: 10
}

// Frontend mapping
const mapCategory = (dto) => ({
  categoryId: dto.id,  // Map id → categoryId
  name: dto.name,
  ...
});
```

**Used by:**
- Categories API (`/categories`)
- Vendors API (`/vendors`)
- Departments API (`/departments`)
- Tags API (`/tags`)

## Error Handling

All API calls should use the error handling utilities:

```typescript
import { handleApiError, getErrorMessage } from "@/lib/api/errors";

try {
  const data = await someApi.method();
  return data;
} catch (error) {
  const apiError = handleApiError(error);
  toast({
    title: "Error",
    description: apiError.message,
    variant: "destructive",
  });
  throw error;
}
```

### Error Types

| Status Code | Error Code | User Message |
|------------|------------|--------------|
| 400 | BAD_REQUEST | "Invalid request. Please check your input." |
| 401 | UNAUTHORIZED | "Your session has expired. Please log in again." |
| 403 | FORBIDDEN | "You don't have permission to perform this action." |
| 404 | NOT_FOUND | "The requested resource was not found." |
| 409 | CONFLICT | "This action conflicts with existing data." |
| 422 | VALIDATION_ERROR | "Validation failed. Please check your input." |
| 500 | SERVER_ERROR | "A server error occurred. Please try again later." |
| 503 | SERVICE_UNAVAILABLE | "The service is temporarily unavailable." |

## Safe Data Access

Use the response handler utilities for defensive programming:

```typescript
import {
  safeGet,
  safeArray,
  safeString,
  safeNumber,
  safeCurrency,
} from "@/lib/api/response-handler";

// Safe object access
const name = safeString(user?.name, "Unknown");

// Safe array access
const expenses = safeArray(response?.items);

// Safe currency formatting
const amount = safeCurrency(expense?.totalAmount); // "0.00" if null
```

## Authentication

### Token Management

Tokens are stored in localStorage and automatically included in requests:

```typescript
// Stored keys
- expense_tracker_token: Access token
- expense_tracker_refresh_token: Refresh token
```

### Automatic Token Refresh

The axios interceptor automatically refreshes expired tokens:

1. Request fails with 401
2. Interceptor queues the request
3. Refreshes the token using refresh token
4. Retries all queued requests with new token
5. If refresh fails, clears tokens and redirects to login

**Location:** `src/lib/api/interceptors.ts`

## React Query Integration

All API hooks use React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

### Query Keys

Centralized in `src/lib/query/keys.ts`:

```typescript
export const queryKeys = {
  expenses: {
    all: ["expenses"] as const,
    detail: (id: string) => ["expenses", id] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    detail: (id: string) => ["budgets", id] as const,
  },
  // ... etc
};
```

### Usage Example

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

// Query
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.expenses.all,
  queryFn: expensesApi.getAll,
});

// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: expensesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  },
});
```

## Backend Endpoints

### Base URL

Configure in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Available Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`, `/auth/refresh-token`, `/auth/change-password` |
| Expenses | `/expenses`, `/expenses/:id`, `/expenses/:id/submit` |
| Approvals | `/approvals`, `/approvals/:id`, `/approvals/:id/approve`, `/approvals/:id/reject` |
| Budgets | `/budgets`, `/budgets/:id`, `/budgets/:id/adjust-spent` |
| Categories | `/categories`, `/categories/:id` |
| Vendors | `/vendors`, `/vendors/:id` |
| Departments | `/departments`, `/departments/:id` |
| Tags | `/tags`, `/tags/:id` |
| Users | `/users`, `/users/:id` |
| Approval Rules | `/approval-rules`, `/approval-rules/:id` |

## Testing Checklist

Before deploying, verify:

- [ ] All endpoints return expected response format
- [ ] Token refresh works on 401 errors
- [ ] Error messages display correctly in toast notifications
- [ ] Loading states show while fetching
- [ ] Empty states display when no data
- [ ] Null/undefined values don't crash the UI
- [ ] Pagination works for expense lists
- [ ] Bulk actions complete successfully
- [ ] Form validation shows backend errors
- [ ] Network errors are handled gracefully
