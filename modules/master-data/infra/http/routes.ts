import type { FastifyInstance } from "fastify";
import type { CategoryController } from "./controllers/CategoryController.js";
import { authenticate } from "../../../user/infra/http/middleware/authenticate.js";
import { authorizeAdmin } from "../../../user/infra/http/middleware/authorize.js";

const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
};

export async function registerCategoryRoutes(
  fastify: FastifyInstance,
  categoryController: CategoryController
): Promise<void> {
  fastify.post(
    "/categories",
    {
      schema: {
        tags: ["Categories"],
        summary: "Create a new category (Admin only)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            description: { type: "string", maxLength: 500 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: ["string", "null"] },
              isActive: { type: "boolean" },
              createdAt: { type: "string" },
            },
          },
          401: errorSchema,
          403: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => categoryController.create(request as any, reply)
  );

  fastify.get(
    "/categories",
    {
      schema: {
        tags: ["Categories"],
        summary: "Get all categories (Authenticated)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "string" },
            offset: { type: "string" },
            isActive: { type: "string" },
            searchTerm: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: ["string", "null"] },
                    isActive: { type: "boolean" },
                    createdAt: { type: "string" },
                    updatedAt: { type: "string" },
                  },
                },
              },
              total: { type: "number" },
            },
          },
          401: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => categoryController.getAll(request as any, reply)
  );

  fastify.get(
    "/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary: "Get category by ID (Authenticated)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: ["string", "null"] },
              isActive: { type: "boolean" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          401: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => categoryController.getById(request as any, reply)
  );

  fastify.put(
    "/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary: "Update category (Admin only)",
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
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            description: { type: "string", maxLength: 500 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: ["string", "null"] },
              isActive: { type: "boolean" },
              updatedAt: { type: "string" },
            },
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => categoryController.update(request as any, reply)
  );

  fastify.delete(
    "/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary: "Delete category (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: {
            type: "null",
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => categoryController.delete(request as any, reply)
  );

  fastify.patch(
    "/categories/:id/activate",
    {
      schema: {
        tags: ["Categories"],
        summary: "Activate category (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => categoryController.activate(request as any, reply)
  );

  fastify.patch(
    "/categories/:id/deactivate",
    {
      schema: {
        tags: ["Categories"],
        summary: "Deactivate category (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => categoryController.deactivate(request as any, reply)
  );
}
