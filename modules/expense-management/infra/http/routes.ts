import type { FastifyInstance } from "fastify";
import type { ExpenseController } from "./controllers/ExpenseController.js";
import type { ExpenseTagController } from "./controllers/ExpenseTagController.js";
import { authenticate } from "../../../user/infra/http/middleware/authenticate.js";
import { authorizeAdmin } from "../../../user/infra/http/middleware/authorize.js";

const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    details: { type: "object" },
  },
};

const successSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      additionalProperties: true,
    },
  },
};

export async function registerExpenseRoutes(
  fastify: FastifyInstance,
  expenseController: ExpenseController
): Promise<void> {
  // Create expense
  fastify.post(
    "/expenses",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Create a new expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: [
            "vendorId",
            "categoryId",
            "departmentId",
            "description",
            "netAmount",
            "taxAmount",
            "totalAmount",
            "expenseDate",
          ],
          properties: {
            vendorId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            departmentId: { type: "string", format: "uuid" },
            description: { type: "string", minLength: 1, maxLength: 1000 },
            netAmount: { type: "number", minimum: 0 },
            taxAmount: { type: "number", minimum: 0 },
            totalAmount: { type: "number", minimum: 0 },
            expenseDate: { type: "string", format: "date-time" },
            receiptUrl: { type: "string", format: "uri" },
          },
        },
        response: {
          201: successSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.create(request as any, reply)
  );

  // Get all expenses
  fastify.get(
    "/expenses",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Get all expenses with filters (Admin Only)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            vendorId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            departmentId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"],
            },
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
          403: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => expenseController.getAll(request as any, reply)
  );

  // Get expense by ID
  fastify.get(
    "/expenses/:expenseId",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Get expense by ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.getById(request as any, reply)
  );

  // Update expense
  fastify.put(
    "/expenses/:expenseId",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Update expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            vendorId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            departmentId: { type: "string", format: "uuid" },
            description: { type: "string", minLength: 1, maxLength: 1000 },
            netAmount: { type: "number", minimum: 0 },
            taxAmount: { type: "number", minimum: 0 },
            totalAmount: { type: "number", minimum: 0 },
            expenseDate: { type: "string", format: "date-time" },
            receiptUrl: { type: "string", format: "uri" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.update(request as any, reply)
  );

  // Delete expense
  fastify.delete(
    "/expenses/:expenseId",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Delete expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: { type: "null" },
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.delete(request as any, reply)
  );

  // Submit expense
  fastify.post(
    "/expenses/:expenseId/submit",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Submit expense for approval (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.submit(request as any, reply)
  );

  // Approve expense
  fastify.post(
    "/expenses/:expenseId/approve",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Approve expense (Admin Only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            approvalNotes: { type: "string", maxLength: 500 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => expenseController.approve(request as any, reply)
  );

  // Reject expense
  fastify.post(
    "/expenses/:expenseId/reject",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Reject expense (Admin Only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["rejectionReason"],
          properties: {
            rejectionReason: { type: "string", minLength: 1, maxLength: 500 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => expenseController.reject(request as any, reply)
  );

  // Cancel expense
  fastify.post(
    "/expenses/:expenseId/cancel",
    {
      schema: {
        tags: ["Expenses"],
        summary: "Cancel expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => expenseController.cancel(request as any, reply)
  );
}

export async function registerExpenseTagRoutes(
  fastify: FastifyInstance,
  expenseTagController: ExpenseTagController
): Promise<void> {
  // Add single tag to expense
  fastify.post(
    "/expenses/:expenseId/tags",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Add tag to expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["tagId"],
          properties: {
            tagId: { type: "string", format: "uuid" },
          },
        },
        response: {
          201: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.addTagToExpense(request as any, reply)
  );

  // Remove tag from expense
  fastify.delete(
    "/expenses/:expenseId/tags/:tagId",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Remove tag from expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId", "tagId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
            tagId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.removeTagFromExpense(request as any, reply)
  );

  // Add multiple tags to expense (bulk)
  fastify.post(
    "/expenses/:expenseId/tags/bulk",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Add multiple tags to expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["tagIds"],
          properties: {
            tagIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
            },
          },
        },
        response: {
          201: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.addTagsToExpense(request as any, reply)
  );

  // Add tag to multiple expenses
  fastify.post(
    "/expenses/tags",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Add tag to multiple expenses (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["expenseIds", "tagId"],
          properties: {
            expenseIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
            },
            tagId: { type: "string", format: "uuid" },
          },
        },
        response: {
          201: successSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.addTagToExpenses(request as any, reply)
  );

  // Remove multiple tags from expense
  fastify.delete(
    "/expenses/:expenseId/tags/bulk",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Remove multiple tags from expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["tagIds"],
          properties: {
            tagIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
            },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.removeTagsFromExpense(request as any, reply)
  );

  // Remove tag from multiple expenses
  fastify.delete(
    "/expenses/tags",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Remove tag from multiple expenses (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["expenseIds", "tagId"],
          properties: {
            expenseIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
            },
            tagId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.removeTagFromExpenses(request as any, reply)
  );

  // Replace all tags on expense (atomic)
  fastify.put(
    "/expenses/:expenseId/tags",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Replace all tags on expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["tagIds"],
          properties: {
            tagIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.replaceExpenseTags(request as any, reply)
  );

  // Clear all tags from expense
  fastify.delete(
    "/expenses/:expenseId/tags/all",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Remove all tags from expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: { type: "null" },
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.clearExpenseTags(request as any, reply)
  );

  // Get all tags for an expense
  fastify.get(
    "/expenses/:expenseId/tags",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Get all tags for expense (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["expenseId"],
          properties: {
            expenseId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.getExpenseTags(request as any, reply)
  );

  // Get expenses by tag
  fastify.get(
    "/tags/:tagId/expenses",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Get all expenses with specific tag (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["tagId"],
          properties: {
            tagId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.getExpensesByTag(request as any, reply)
  );

  // Search expenses by tags (AND/OR mode)
  fastify.get(
    "/expenses/tags/search",
    {
      schema: {
        tags: ["Expense Tags"],
        summary: "Search expenses by tags with AND/OR mode (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["tagIds"],
          properties: {
            tagIds: {
              type: "string",
              description: "Comma-separated UUID list",
            },
            mode: {
              type: "string",
              enum: ["all", "any"],
              default: "any",
              description: "all = AND filter, any = OR filter",
            },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      expenseTagController.getExpensesByTags(request as any, reply)
  );
}
