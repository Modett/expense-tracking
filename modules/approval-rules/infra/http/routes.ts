import type { FastifyInstance } from "fastify";
import type { ApprovalRuleController } from "./controllers/ApprovalRuleController.js";
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

const createApprovalRuleResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    approvalRuleId: { type: "string", format: "uuid" },
    categoryId: { type: "string", format: "uuid" },
    minAmount: { type: "number" },
    approverRole: { type: "string" },
    approvalOrder: { type: "number" },
  },
  required: [
    "success",
    "approvalRuleId",
    "categoryId",
    "minAmount",
    "approverRole",
    "approvalOrder",
  ],
  additionalProperties: false,
};

export async function registerApprovalRulesRoutes(
  fastify: FastifyInstance,
  approvalRuleController: ApprovalRuleController
): Promise<void> {
  // Create approval rule
  fastify.post(
    "/approval-rules",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Create a new approval rule (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: [
            "categoryId",
            "minAmount",
            "approverRole",
            "approvalOrder",
          ],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            minAmount: { type: "number", minimum: 0 },
            approverRole: { type: "string", enum: ["staff", "manager", "finance", "admin"] },
            approvalOrder: { type: "number", minimum: 1 },
          },
        },
        response: {
          201: createApprovalRuleResponseSchema,
          400: errorSchema,
          401: errorSchema,
          409: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => approvalRuleController.create(request as any, reply)
  );

  // Get all approval rules
  fastify.get(
    "/approval-rules",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Get all approval rules with filters (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            categoryId: { type: "string", format: "uuid" },
            approverRole: { type: "string", enum: ["staff", "manager", "finance", "admin"] },
            isActive: { type: "string", enum: ["true", "false"] },
            minAmountGreaterThan: { type: "string" },
            minAmountLessThan: { type: "string" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => approvalRuleController.getAll(request as any, reply)
  );

  // Get approval rule by ID
  fastify.get(
    "/approval-rules/:id",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Get approval rule by ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
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
    async (request, reply) => approvalRuleController.getById(request as any, reply)
  );

  // Get approval rules by category
  fastify.get(
    "/approval-rules/category/:categoryId",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Get approval rules by category ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["categoryId"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
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
      approvalRuleController.getByCategory(request as any, reply)
  );

  // Get applicable rules
  fastify.get(
    "/approval-rules/applicable",
    {
      schema: {
        tags: ["Approval Rules"],
        summary:
          "Get applicable approval rules for category and amount (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["categoryId", "amount"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            amount: { type: "string" },
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
      approvalRuleController.getApplicableRules(request as any, reply)
  );

  // Update approval rule
  fastify.patch(
    "/approval-rules/:id",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Update approval rule (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            categoryId: { type: "string", format: "uuid" },
            minAmount: { type: "number", minimum: 0 },
            approverRole: { type: "string", enum: ["staff", "manager", "finance", "admin"] },
            approvalOrder: { type: "number", minimum: 1 },
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
    async (request, reply) => approvalRuleController.update(request as any, reply)
  );

  // Activate approval rule
  fastify.post(
    "/approval-rules/:id/activate",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Activate approval rule (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
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
    async (request, reply) => approvalRuleController.activate(request as any, reply)
  );

  // Deactivate approval rule
  fastify.post(
    "/approval-rules/:id/deactivate",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Deactivate approval rule (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
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
    async (request, reply) => approvalRuleController.deactivate(request as any, reply)
  );

  // Delete approval rule
  fastify.delete(
    "/approval-rules/:id",
    {
      schema: {
        tags: ["Approval Rules"],
        summary: "Delete an approval rule (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
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
    async (request, reply) => approvalRuleController.delete(request as any, reply)
  );
}
