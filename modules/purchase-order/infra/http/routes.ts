import type { FastifyInstance } from "fastify";
import type { PurchaseOrderController } from "./controllers/PurchaseOrderController.js";
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
    data: { type: "object" },
  },
  additionalProperties: true,
};

const createPurchaseOrderResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    poNumber: { type: "string" },
    vendorId: { type: "string", format: "uuid" },
    totalValue: { type: "number" },
    status: { type: "string" },
    description: { type: "string", nullable: true },
    issuedDate: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "poNumber", "vendorId", "totalValue", "status", "issuedDate", "createdAt", "updatedAt"],
  additionalProperties: false,
};

export async function registerPurchaseOrderRoutes(
  fastify: FastifyInstance,
  purchaseOrderController: PurchaseOrderController
): Promise<void> {
  // Create purchase order
  fastify.post(
    "/purchase-orders",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Create a new purchase order (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["poNumber", "vendorId", "totalValue"],
          properties: {
            poNumber: { type: "string" },
            vendorId: { type: "string", format: "uuid" },
            totalValue: { type: "number", minimum: 0 },
            description: { type: "string" },
            issuedDate: { type: "string", format: "date-time" },
          },
        },
        response: {
          201: createPurchaseOrderResponseSchema,
          400: errorSchema,
          401: errorSchema,
          409: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => purchaseOrderController.create(request as any, reply)
  );

  // Get all purchase orders
  fastify.get(
    "/purchase-orders",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Get all purchase orders with filters (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            vendorId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["draft", "issued", "received", "partial", "cancelled", "closed"],
            },
            issuedDateFrom: { type: "string", format: "date-time" },
            issuedDateTo: { type: "string", format: "date-time" },
            minTotalValue: { type: "number", minimum: 0 },
            maxTotalValue: { type: "number", minimum: 0 },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => purchaseOrderController.getAll(request as any, reply)
  );

  // Get purchase order by ID
  fastify.get(
    "/purchase-orders/:id",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Get purchase order by ID (Authenticated)",
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
    async (request, reply) => purchaseOrderController.getById(request as any, reply)
  );

  // Get purchase orders by vendor
  fastify.get(
    "/purchase-orders/vendor/:vendorId",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Get purchase orders by vendor ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["vendorId"],
          properties: {
            vendorId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: successSchema,
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => purchaseOrderController.getByVendor(request as any, reply)
  );

  // Get purchase order by PO number
  fastify.get(
    "/purchase-orders/po-number/:poNumber",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Get purchase order by PO number (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["poNumber"],
          properties: {
            poNumber: { type: "string" },
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
    async (request, reply) => purchaseOrderController.getByPONumber(request as any, reply)
  );

  // Update purchase order
  fastify.patch(
    "/purchase-orders/:id",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Update purchase order (Authenticated)",
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
            totalValue: { type: "number", minimum: 0 },
            description: { type: "string" },
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
    async (request, reply) => purchaseOrderController.update(request as any, reply)
  );

  // Issue purchase order
  fastify.post(
    "/purchase-orders/:id/issue",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Issue purchase order (Authenticated)",
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
    async (request, reply) => purchaseOrderController.issue(request as any, reply)
  );

  // Cancel purchase order
  fastify.post(
    "/purchase-orders/:id/cancel",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Cancel purchase order (Authenticated)",
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
    async (request, reply) => purchaseOrderController.cancel(request as any, reply)
  );

  // Receive purchase order
  fastify.post(
    "/purchase-orders/:id/receive",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Receive purchase order (Authenticated)",
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
            isPartial: { type: "boolean", default: false },
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
    async (request, reply) => purchaseOrderController.receive(request as any, reply)
  );

  // Close purchase order
  fastify.post(
    "/purchase-orders/:id/close",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Close purchase order (Authenticated)",
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
    async (request, reply) => purchaseOrderController.close(request as any, reply)
  );

  // Delete purchase order
  fastify.delete(
    "/purchase-orders/:id",
    {
      schema: {
        tags: ["Purchase Orders"],
        summary: "Delete purchase order (Authenticated)",
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
    async (request, reply) => purchaseOrderController.delete(request as any, reply)
  );
}
