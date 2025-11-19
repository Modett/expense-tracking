import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { AuthController } from "./controllers/AuthController.js";
import type { UserController } from "./controllers/UserController.js";
import { createAuthenticateMiddleware } from "./middleware/authenticate.js";
import { authorizeAdmin } from "./middleware/authorize.js";
import {
  userSchema,
  authResponseSchema,
  errorSchema,
  messageSchema,
} from "./schemas/index.js";

export async function registerUserRoutes(
  fastify: FastifyInstance,
  authController: AuthController,
  userController: UserController,
  prisma: PrismaClient
): Promise<void> {
  // Create authenticate middleware with blacklist checking
  const authenticate = createAuthenticateMiddleware(prisma);

  // Note: Using Fastify route shorthand syntax (compatible with v4 & v5)
  // TypeScript incorrectly expects 3 arguments, but 2-argument syntax is still valid
  const app = fastify as any;

  // ==================== AUTH ROUTES ====================

  app.post("/auth/register", {
    schema: {
      tags: ["Auth"],
      summary: "Register a new user",
      body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 128 },
          role: {
            type: "string",
            enum: ["staff", "manager", "finance", "admin"],
          },
        },
      },
      response: {
        201: authResponseSchema,
        400: errorSchema,
      },
    },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "15 minutes",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.register(request as any, reply),
  });

  app.post("/auth/login", {
    schema: {
      tags: ["Auth"],
      summary: "Login user",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      response: {
        200: authResponseSchema,
        401: errorSchema,
      },
    },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "15 minutes",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.login(request as any, reply),
  });

  app.post("/auth/refresh-token", {
    schema: {
      tags: ["Auth"],
      summary: "Refresh access token (uses HTTP-only cookie or body)",
      description:
        "Refresh token can be sent via HTTP-only cookie (recommended) or in request body",
      body: {
        type: "object",
        properties: {
          refreshToken: {
            type: "string",
            description: "Optional: only needed if not using cookies",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
          },
        },
        401: errorSchema,
      },
    },
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "15 minutes",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.refreshToken(request as any, reply),
  });

  app.post("/auth/logout", {
    schema: {
      tags: ["Auth"],
      summary: "Logout user (requires authentication)",
      security: [{ bearerAuth: [] }],
      response: {
        200: messageSchema,
        401: errorSchema,
      },
    },
    onRequest: [authenticate],
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "15 minutes",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.logout(request as any, reply),
  });

  app.put("/auth/change-password", {
    schema: {
      tags: ["Auth"],
      summary: "Change user password",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 8, maxLength: 128 },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        400: errorSchema,
      },
    },
    onRequest: [authenticate],
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.changePassword(request as any, reply),
  });

  app.put("/auth/profile", {
    schema: {
      tags: ["Auth"],
      summary: "Update own profile (name and email)",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
        },
      },
      response: {
        200: messageSchema,
        400: errorSchema,
        401: errorSchema,
      },
    },
    onRequest: [authenticate],
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      authController.updateProfile(request as any, reply),
  });

  // ==================== USER QUERY ROUTES ====================

  app.get("/users/:userId", {
    schema: {
      tags: ["Users"],
      summary: "Get user by ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      response: {
        200: userSchema,
        404: errorSchema,
        401: errorSchema,
      },
    },
    onRequest: [authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.getUserById(request as any, reply),
  });

  app.get("/users", {
    schema: {
      tags: ["Users"],
      summary: "Get all users",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 100 },
          offset: { type: "integer", minimum: 0 },
          role: {
            type: "string",
            enum: ["staff", "manager", "finance", "admin"],
          },
          isActive: { type: "boolean" },
          searchTerm: { type: "string", minLength: 1, maxLength: 100 },
        },
      },
      response: {
        200: {
          type: "array",
          items: userSchema,
        },
        401: errorSchema,
      },
    },
    onRequest: [authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.getAllUsers(request as any, reply),
  });

  // ==================== USER MANAGEMENT ROUTES ====================

  app.put("/users/:userId", {
    schema: {
      tags: ["Users"],
      summary: "Update user profile (Admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      body: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
    },
    onRequest: [authenticate, authorizeAdmin],
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.updateProfile(request as any, reply),
  });

  app.put("/users/:userId/role", {
    schema: {
      tags: ["Users"],
      summary: "Update user role (Admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      body: {
        type: "object",
        required: ["role"],
        properties: {
          role: {
            type: "string",
            enum: ["staff", "manager", "finance", "admin"],
          },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
    },
    onRequest: [authenticate, authorizeAdmin],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.updateRole(request as any, reply),
  });

  app.put("/users/:userId/activate", {
    schema: {
      tags: ["Users"],
      summary: "Activate user (Admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
    },
    onRequest: [authenticate, authorizeAdmin],
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.activateUser(request as any, reply),
  });

  app.put("/users/:userId/deactivate", {
    schema: {
      tags: ["Users"],
      summary: "Deactivate user (Admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
    },
    onRequest: [authenticate, authorizeAdmin],
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.deactivateUser(request as any, reply),
  });

  app.delete("/users/:userId", {
    schema: {
      tags: ["Users"],
      summary: "Delete user (Admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      response: {
        200: messageSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
    },
    onRequest: [authenticate, authorizeAdmin],
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) =>
      userController.deleteUser(request as any, reply),
  });
}
