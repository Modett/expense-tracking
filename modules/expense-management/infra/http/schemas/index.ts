// Fastify JSON schemas for expense API responses and documentation

export const expenseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    vendorId: { type: "string", format: "uuid" },
    categoryId: { type: "string", format: "uuid" },
    departmentId: { type: ["string", "null"], format: "uuid" },
    description: { type: "string" },
    amountNet: { type: "number", minimum: 0 },
    taxAmount: { type: "number", minimum: 0 },
    totalAmount: { type: "number", minimum: 0 },
    status: {
      type: "string",
      enum: ["draft", "submitted", "approved", "rejected", "cancelled"],
    },
    priority: {
      type: "string",
      enum: ["routine", "standard", "urgent", "emergency"],
    },
    budgetOverride: {
      type: "string",
      enum: ["none", "emergency", "annual", "recurring"],
    },
    justification: { type: ["string", "null"] },
    approvalDeadline: { type: ["string", "null"], format: "date-time" },
    receiptUrl: { type: ["string", "null"], format: "uri" },
    dateOfExpense: { type: "string", format: "date-time" },
    linkedPoId: { type: ["string", "null"], format: "uuid" },
    inventoryDropId: { type: ["string", "null"], format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const expenseListSchema = {
  type: "object",
  properties: {
    expenses: {
      type: "array",
      items: expenseSchema,
    },
    pagination: {
      type: "object",
      properties: {
        page: { type: "number" },
        limit: { type: "number" },
        total: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  },
} as const;

export const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    details: { type: "string" },
  },
} as const;

export const messageSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
} as const;
