import type { FastifyInstance } from "fastify";
import type { InventoryDropController } from "./controllers/InventoryDropController.js";
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
    data: {}, // Allow any type (object or array)
  },
  additionalProperties: true,
};

const createInventoryDropResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    inventoryDropId: { type: "string", format: "uuid" },
    dropNumber: { type: "string" },
  },
  required: ["success", "inventoryDropId", "dropNumber"],
  additionalProperties: false,
};

export async function registerInventoryRoutes(
  fastify: FastifyInstance,
  inventoryDropController: InventoryDropController
): Promise<void> {
  // Create inventory drop
  fastify.post(
    "/inventory-drops",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Create a new inventory drop (Authenticated)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["dropNumber", "fabricType", "quantity", "unitCost"],
          properties: {
            dropNumber: { type: "string" },
            fabricType: { type: "string" },
            quantity: { type: "number", minimum: 0 },
            unitCost: { type: "number", minimum: 0 },
            receivedOn: { type: "string", format: "date-time" },
            supplier: { type: "string" },
          },
        },
        response: {
          201: createInventoryDropResponseSchema,
          400: errorSchema,
          401: errorSchema,
          409: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      inventoryDropController.create(request as any, reply)
  );

  // Get all inventory drops
  fastify.get(
    "/inventory-drops",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Get all inventory drops with filters (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            fabricType: { type: "string" },
            supplier: { type: "string" },
            receivedDateFrom: { type: "string", format: "date-time" },
            receivedDateTo: { type: "string", format: "date-time" },
            minQuantity: { type: "number", minimum: 0 },
            maxQuantity: { type: "number", minimum: 0 },
            minTotalCost: { type: "number", minimum: 0 },
            maxTotalCost: { type: "number", minimum: 0 },
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
      inventoryDropController.getAll(request as any, reply)
  );

  // Get inventory drop by ID
  fastify.get(
    "/inventory-drops/:id",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Get inventory drop by ID (Authenticated)",
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
    async (request, reply) =>
      inventoryDropController.getById(request as any, reply)
  );

  // Get inventory drop by drop number
  fastify.get(
    "/inventory-drops/drop-number/:dropNumber",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Get inventory drop by drop number (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["dropNumber"],
          properties: {
            dropNumber: { type: "string" },
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
    async (request, reply) =>
      inventoryDropController.getByDropNumber(request as any, reply)
  );

  // Get inventory drops by fabric type
  fastify.get(
    "/inventory-drops/fabric-type/:fabricType",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Get inventory drops by fabric type (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["fabricType"],
          properties: {
            fabricType: { type: "string" },
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
      inventoryDropController.getByFabricType(request as any, reply)
  );

  // Update inventory drop
  fastify.patch(
    "/inventory-drops/:id",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Update inventory drop (Authenticated)",
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
            quantity: { type: "number", minimum: 0 },
            unitCost: { type: "number", minimum: 0 },
            supplier: { type: "string" },
            receivedOn: { type: "string", format: "date-time" },
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
      inventoryDropController.update(request as any, reply)
  );

  // Delete inventory drop
  fastify.delete(
    "/inventory-drops/:id",
    {
      schema: {
        tags: ["Inventory"],
        summary: "Delete inventory drop (Authenticated)",
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
    async (request, reply) =>
      inventoryDropController.delete(request as any, reply)
  );
}
