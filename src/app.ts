import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { config } from "./config/index.js";
import { registerUserModule } from "../modules/user/module.js";
import { registerMasterDataModule } from "../modules/master-data/module.js";
import { registerExpenseManagementModule } from "../modules/expense-management/module.js";
import { registerApprovalModule } from "../modules/approval/module.js";
import { registerBudgetModule } from "../modules/budget/module.js";

export async function buildApp() {
  const fastify = Fastify({
    logger:
      process.env.NODE_ENV !== "production"
        ? {
            level: process.env.LOG_LEVEL || "info",
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
              },
            },
          }
        : {
            level: process.env.LOG_LEVEL || "info",
          },
  });

  const prisma = new PrismaClient();

  // Register Swagger
  if (config.swagger.enabled) {
    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Expense Tracker API",
          description: "API documentation for Expense Tracker application",
          version: "1.0.0",
        },
        servers: [
          {
            url: `http://localhost:${config.server.port}`,
            description: "Development server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Users", description: "User management endpoints" },
          { name: "Categories", description: "Category management endpoints" },
          { name: "Vendors", description: "Vendor management endpoints" },
          { name: "Departments", description: "Department management endpoints" },
          { name: "Tags", description: "Tag management endpoints" },
          { name: "Expenses", description: "Expense management endpoints" },
          { name: "Expense Tags", description: "Expense tagging endpoints" },
          { name: "Approvals", description: "Approval management endpoints" },
          { name: "Budgets", description: "Budget management endpoints" },
        ],
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
      },
      staticCSP: true,
    });
  }

  // Register JWT
  await fastify.register(fastifyJwt, {
    secret: config.jwt.secret,
  });

  // Register Rate Limit
  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
    cache: 10000,
  });

  // Global Error Handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error({
      err: error,
      url: request.url,
      method: request.method,
    });

    // Zod validation errors
    if (error.name === "ZodError") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: "Request validation failed",
        details: (error as any).issues || (error as any).errors || [],
      });
    }

    // JWT errors
    if (
      error.name === "UnauthorizedError" ||
      error.message.includes("No Authorization")
    ) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (error.message.includes("jwt") || error.message.includes("token")) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    // Business logic errors based on message patterns
    if (error.message.includes("already exists")) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: error.message,
      });
    }

    if (
      error.message.includes("Invalid credentials") ||
      error.message.includes("Invalid email or password")
    ) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: error.message,
      });
    }

    if (
      error.message.includes("forbidden") ||
      error.message.includes("not authorized") ||
      error.message.includes("permission")
    ) {
      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: error.message,
      });
    }

    // Prisma errors
    if (
      error.message.includes("Prisma") ||
      error.message.includes("PrismaClient")
    ) {
      return reply.code(500).send({
        statusCode: 500,
        error: "Database Error",
        message: "A database error occurred",
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        statusCode: 429,
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      });
    }

    // Default 500 error
    return reply.code(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
    });
  });

  // Health check route
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register User Module
  await registerUserModule(fastify, prisma, {
    jwtSecret: config.jwt.secret,
    jwtAccessTokenExpiry: config.jwt.accessTokenExpiry,
    jwtRefreshTokenExpiry: config.jwt.refreshTokenExpiry,
    bcryptSaltRounds: config.bcrypt.saltRounds,
  });

  // Register Master Data Module
  await registerMasterDataModule(fastify, prisma);

  // Register Expense Management Module
  await registerExpenseManagementModule(fastify, prisma);

  // Register Approval Module
  await registerApprovalModule(fastify, prisma);

  // Register Budget Module
  await registerBudgetModule(fastify, prisma);

  // Graceful shutdown
  const closeGracefully = async (signal: string) => {
    fastify.log.info(`Received signal ${signal}, closing gracefully...`);
    await prisma.$disconnect();
    await fastify.close();
    process.exit(0);
  };

  process.on("SIGINT", () => closeGracefully("SIGINT"));
  process.on("SIGTERM", () => closeGracefully("SIGTERM"));

  return fastify;
}
