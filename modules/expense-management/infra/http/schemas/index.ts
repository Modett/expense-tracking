// Fastify JSON schemas for expense API responses and documentation

export const expenseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    vendorId: { type: "string", format: "uuid" },
    categoryId: { type: "string", format: "uuid" },
    departmentId: { type: "string", format: "uuid" },
    amount: { type: "number", minimum: 0 },
    currency: { type: "string", minLength: 3, maxLength: 3 },
    description: { type: "string" },
    status: {
      type: "string",
      enum: ["draft", "submitted", "approved", "rejected", "cancelled"],
    },
    receiptUrl: { type: "string", format: "uri" },
    expenseDate: { type: "string", format: "date" },
    submittedAt: { type: "string", format: "date-time" },
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
