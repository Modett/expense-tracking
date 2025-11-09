import type { FastifyInstance } from "fastify";
import type { ApprovalController } from "./controllers/ApprovalController.js";
import { authenticate } from "../../../user/infra/http/middleware/authenticate.js";
import {
  authorizeManager,
  authorizeAdmin,
} from "../../../user/infra/http/middleware/authorize.js";

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
    data: {}, // Allow any type (object, array, etc.)
  },
  additionalProperties: true,
};

const createApprovalResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    approvalId: { type: "string", format: "uuid" },
  },
  required: ["success", "approvalId"],
  additionalProperties: false,
};

export async function registerApprovalRoutes(
  fastify: FastifyInstance,
  approvalController: ApprovalController
): Promise<void> {
  // Get all approvals
  fastify.get(
    "/approvals",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Get all approvals with filters (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            expenseId: { type: "string", format: "uuid" },
            approverId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["waiting", "pending", "approved", "rejected", "skipped"],
            },
            dateFrom: { type: "string", format: "date-time" },
            dateTo: { type: "string", format: "date-time" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => approvalController.getAll(request as any, reply)
  );

  // Get pending approvals
  fastify.get(
    "/approvals/pending",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Get my pending approvals (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            approverId: { type: "string", format: "uuid" },
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
      approvalController.getPending(request as any, reply)
  );

  // Get approval by ID
  fastify.get(
    "/approvals/:approvalId",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Get approval by ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["approvalId"],
          properties: {
            approvalId: { type: "string", format: "uuid" },
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
    async (request, reply) => approvalController.getById(request as any, reply)
  );

  // Get approvals by expense ID
  fastify.get(
    "/approvals/expense/:expenseId",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Get approvals by expense ID (Authenticated)",
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
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      approvalController.getByExpense(request as any, reply)
  );

  // Get approvals by approver ID
  fastify.get(
    "/approvals/approver/:approverId",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Get approvals by approver ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["approverId"],
          properties: {
            approverId: { type: "string", format: "uuid" },
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
      approvalController.getByApprover(request as any, reply)
  );

  // Approve approval
  fastify.post(
    "/approvals/:approvalId/approve",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Approve an approval request (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["approvalId"],
          properties: {
            approvalId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            comments: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => approvalController.approve(request as any, reply)
  );

  // Reject approval
  fastify.post(
    "/approvals/:approvalId/reject",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Reject an approval request (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["approvalId"],
          properties: {
            approvalId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            comments: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => approvalController.reject(request as any, reply)
  );

  // Update approval comments
  fastify.patch(
    "/approvals/:approvalId",
    {
      schema: {
        tags: ["Approvals"],
        summary: "Update approval comments (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["approvalId"],
          properties: {
            approvalId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["comments"],
          properties: {
            comments: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: successSchema,
          400: errorSchema,
          404: errorSchema,
          401: errorSchema,
          403: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => approvalController.update(request as any, reply)
  );
}
