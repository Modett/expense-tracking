import type { FastifyInstance } from "fastify";
import type { CategoryController } from "./controllers/CategoryController.js";
import type { DepartmentController } from "./controllers/DepartmentController.js";
import type { VendorController } from "./controllers/VendorController.js";
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

export async function registerDepartmentRoutes(
  fastify: FastifyInstance,
  departmentController: DepartmentController
): Promise<void> {
  fastify.post(
    "/departments",
    {
      schema: {
        tags: ["Departments"],
        summary: "Create a new department (Admin only)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            code: { type: "string", minLength: 2, maxLength: 20 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              code: { type: ["string", "null"] },
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
    async (request, reply) => departmentController.create(request as any, reply)
  );

  fastify.get(
    "/departments",
    {
      schema: {
        tags: ["Departments"],
        summary: "Get all departments (Authenticated)",
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
              departments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    code: { type: ["string", "null"] },
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
    async (request, reply) => departmentController.getAll(request as any, reply)
  );

  fastify.get(
    "/departments/:id",
    {
      schema: {
        tags: ["Departments"],
        summary: "Get department by ID (Authenticated)",
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
              code: { type: ["string", "null"] },
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
    async (request, reply) => departmentController.getById(request as any, reply)
  );

  fastify.put(
    "/departments/:id",
    {
      schema: {
        tags: ["Departments"],
        summary: "Update department (Admin only)",
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
            code: { type: "string", minLength: 2, maxLength: 20 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              code: { type: ["string", "null"] },
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
    async (request, reply) => departmentController.update(request as any, reply)
  );

  fastify.delete(
    "/departments/:id",
    {
      schema: {
        tags: ["Departments"],
        summary: "Delete department (Admin only)",
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
            description: "Department deleted successfully",
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => departmentController.delete(request as any, reply)
  );

  fastify.patch(
    "/departments/:id/activate",
    {
      schema: {
        tags: ["Departments"],
        summary: "Activate department (Admin only)",
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
    async (request, reply) => departmentController.activate(request as any, reply)
  );

  fastify.patch(
    "/departments/:id/deactivate",
    {
      schema: {
        tags: ["Departments"],
        summary: "Deactivate department (Admin only)",
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
    async (request, reply) => departmentController.deactivate(request as any, reply)
  );
}

export async function registerVendorRoutes(
  fastify: FastifyInstance,
  vendorController: VendorController
): Promise<void> {
  fastify.post(
    "/vendors",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Create a new vendor (Admin only)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 200 },
            gstNumber: { type: "string", minLength: 15, maxLength: 15 },
            email: { type: "string", format: "email", maxLength: 255 },
            phone: { type: "string", minLength: 10, maxLength: 20 },
            address: { type: "string", maxLength: 500 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              gstNumber: { type: ["string", "null"] },
              email: { type: ["string", "null"] },
              phone: { type: ["string", "null"] },
              address: { type: ["string", "null"] },
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
    async (request, reply) => vendorController.create(request as any, reply)
  );

  fastify.get(
    "/vendors",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Get all vendors (Authenticated)",
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
              vendors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    gstNumber: { type: ["string", "null"] },
                    email: { type: ["string", "null"] },
                    phone: { type: ["string", "null"] },
                    address: { type: ["string", "null"] },
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
    async (request, reply) => vendorController.getAll(request as any, reply)
  );

  fastify.get(
    "/vendors/:id",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Get vendor by ID (Authenticated)",
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
              gstNumber: { type: ["string", "null"] },
              email: { type: ["string", "null"] },
              phone: { type: ["string", "null"] },
              address: { type: ["string", "null"] },
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
    async (request, reply) => vendorController.getById(request as any, reply)
  );

  fastify.put(
    "/vendors/:id",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Update vendor (Admin only)",
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
            name: { type: "string", minLength: 2, maxLength: 200 },
            gstNumber: { type: "string", minLength: 15, maxLength: 15 },
            email: { type: "string", format: "email", maxLength: 255 },
            phone: { type: "string", minLength: 10, maxLength: 20 },
            address: { type: "string", maxLength: 500 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              gstNumber: { type: ["string", "null"] },
              email: { type: ["string", "null"] },
              phone: { type: ["string", "null"] },
              address: { type: ["string", "null"] },
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
    async (request, reply) => vendorController.update(request as any, reply)
  );

  fastify.delete(
    "/vendors/:id",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Delete vendor (Admin only)",
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
            description: "Vendor deleted successfully",
          },
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
      onRequest: [authenticate, authorizeAdmin],
    },
    async (request, reply) => vendorController.delete(request as any, reply)
  );

  fastify.patch(
    "/vendors/:id/activate",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Activate vendor (Admin only)",
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
    async (request, reply) => vendorController.activate(request as any, reply)
  );

  fastify.patch(
    "/vendors/:id/deactivate",
    {
      schema: {
        tags: ["Vendors"],
        summary: "Deactivate vendor (Admin only)",
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
    async (request, reply) => vendorController.deactivate(request as any, reply)
  );
}
