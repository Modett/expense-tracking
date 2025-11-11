# Monthly Approved Expenses Report Feature

## Overview

This feature allows administrators to generate a monthly report (CSV format) of all approved expenses for a specific month, with optional filtering by department or user.

## Endpoint

**GET** `/expenses/reports/monthly`

### Authentication

- Requires authentication (JWT token)
- Requires admin role

### Query Parameters

- `month` (required): Integer 1-12 (January-December)
- `year` (required): Integer (e.g., 2025)
- `departmentId` (optional): UUID of department to filter
- `userId` (optional): UUID of user to filter

### Example Request

```bash
GET /expenses/reports/monthly?month=1&year=2025
GET /expenses/reports/monthly?month=1&year=2025&departmentId=123e4567-e89b-12d3-a456-426614174000
```

### Response

- Returns a CSV file with approved expenses for the specified month
- Filename format: `monthly-report-{MonthName}-{Year}.csv`
- Includes summary totals at the bottom of the file

## CSV Structure

### Columns

1. Expense ID
2. User ID
3. Vendor ID
4. Category ID
5. Department ID
6. Description
7. Net Amount
8. Tax Amount
9. Total Amount
10. Expense Date
11. Approved At
12. Linked PO ID
13. Inventory Drop ID

### Summary Section

At the end of the CSV file:

- Total Expenses (count)
- Total Net Amount
- Total Tax Amount
- Total Amount

## Implementation Files

### New Files

- `modules/expense-management/application/services/ExpenseMonthlyReportService.ts`
  - Main service that generates the monthly report
  - Filters expenses by APPROVED status and date range
  - Calculates totals and formats CSV output

### Modified Files

- `modules/expense-management/infra/http/controllers/ExpenseController.ts`

  - Added `generateMonthlyReport()` method
  - Handles request validation and file streaming

- `modules/expense-management/module.ts`

  - Registers `ExpenseMonthlyReportService`
  - Wires service into controller

- `modules/expense-management/infra/http/routes.ts`
  - Added route: `GET /expenses/reports/monthly`
  - Admin-only access

## Use Cases

1. **End-of-Month Financial Reports**: Generate monthly expense reports for accounting
2. **Department Tracking**: Filter by department to see specific team expenses
3. **User Expense Tracking**: Filter by user to audit individual spending
4. **Budget Reconciliation**: Compare approved expenses against budget allocations

## Testing

Use Swagger UI or API client:

```bash
# With authentication token
curl -X GET "http://localhost:3000/expenses/reports/monthly?month=1&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output monthly-report.csv
```

## Notes

- Only APPROVED expenses are included in the report
- Date range is calculated based on the full calendar month
- CSV file is generated on-the-fly and streamed to the client
- Temporary files are created in the `./exports` directory
