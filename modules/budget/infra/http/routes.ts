import type { FastifyInstance } from "fastify";
import type { BudgetController } from "./controllers/BudgetController.js";
import { authenticate } from "../../../user/infra/http/middleware/authenticate.js";

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

const createBudgetResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    budgetId: { type: "string", format: "uuid" },
    departmentId: { type: "string", format: "uuid" },
    categoryId: { type: "string", format: "uuid" },
    budgetAmount: { type: "number" },
    fiscalPeriod: { type: "string" },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: "string", format: "date-time" },
  },
  required: [
    "success",
    "budgetId",
    "departmentId",
    "categoryId",
    "budgetAmount",
    "fiscalPeriod",
    "startDate",
    "endDate",
  ],
  additionalProperties: false,
};

export async function registerBudgetRoutes(
  fastify: FastifyInstance,
  budgetController: BudgetController
): Promise<void> {
  // Create budget
  fastify.post(
    "/budgets",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Create a new budget (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: [
            "departmentId",
            "categoryId",
            "budgetAmount",
            "fiscalPeriod",
            "startDate",
            "endDate",
          ],
          properties: {
            departmentId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            budgetAmount: { type: "number", minimum: 0 },
            fiscalPeriod: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
          },
        },
        response: {
          201: createBudgetResponseSchema,
          400: errorSchema,
          401: errorSchema,
          409: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.create(request as any, reply)
  );

  // Get all budgets
  fastify.get(
    "/budgets",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Get all budgets with filters (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            departmentId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            fiscalPeriod: { type: "string" },
            isActive: { type: "string", enum: ["true", "false"] },
            isOverBudget: { type: "string", enum: ["true", "false"] },
            isNearLimit: { type: "string", enum: ["true", "false"] },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.getAll(request as any, reply)
  );

  // Get budget by ID
  fastify.get(
    "/budgets/:budgetId",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Get budget by ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.getById(request as any, reply)
  );

  // Get budgets by department
  fastify.get(
    "/budgets/department/:departmentId",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Get budgets by department ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["departmentId"],
          properties: {
            departmentId: { type: "string", format: "uuid" },
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
      budgetController.getByDepartment(request as any, reply)
  );

  // Get budget status
  fastify.get(
    "/budgets/status",
    {
      schema: {
        tags: ["Budgets"],
        summary:
          "Check budget status for department/category/period (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["departmentId", "categoryId", "fiscalPeriod"],
          properties: {
            departmentId: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            fiscalPeriod: { type: "string" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.getStatus(request as any, reply)
  );

  // Update budget
  fastify.patch(
    "/budgets/:budgetId",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Update budget amount (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["budgetAmount"],
          properties: {
            budgetAmount: { type: "number", minimum: 0 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.update(request as any, reply)
  );

  // Adjust budget spent
  fastify.post(
    "/budgets/:budgetId/adjust-spent",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Adjust budget spent amount (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["amount", "operation"],
          properties: {
            amount: { type: "number", minimum: 0 },
            operation: { type: "string", enum: ["add", "subtract"] },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      budgetController.adjustSpent(request as any, reply)
  );

  // Activate budget
  fastify.post(
    "/budgets/:budgetId/activate",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Activate budget (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.activate(request as any, reply)
  );

  // Deactivate budget
  fastify.post(
    "/budgets/:budgetId/deactivate",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Deactivate budget (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.deactivate(request as any, reply)
  );

  // Delete budget
  fastify.delete(
    "/budgets/:budgetId",
    {
      schema: {
        tags: ["Budgets"],
        summary: "Delete a budget (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["budgetId"],
          properties: {
            budgetId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => budgetController.delete(request as any, reply)
  );
}
