import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaInventoryDropCommandRepository,
  PrismaInventoryDropQueryRepository,
} from "./infra/persistence/index.js";

// Command Handlers
import { CreateInventoryDropCommandHandler } from "./application/commands/create-inventory-drop/handler.js";
import { UpdateInventoryDropCommandHandler } from "./application/commands/update-inventory-drop/handler.js";
import { DeleteInventoryDropCommandHandler } from "./application/commands/delete-inventory-drop/handler.js";

// Query Handlers
import { GetInventoryDropByIdQueryHandler } from "./application/queries/get-inventory-drop-by-id/handler.js";
import { GetAllInventoryDropsQueryHandler } from "./application/queries/get-all-inventory-drops/handler.js";
import { GetInventoryDropByDropNumberQueryHandler } from "./application/queries/get-inventory-drop-by-drop-number/handler.js";
import { GetInventoryDropsByFabricTypeQueryHandler } from "./application/queries/get-inventory-drops-by-fabric-type/handler.js";

// Controllers
import { InventoryDropController } from "./infra/http/controllers/InventoryDropController.js";

// Routes
import { registerInventoryRoutes } from "./infra/http/routes.js";

// Services
import { InventoryOrchestrationService } from "./application/services/InventoryOrchestrationService.js";

export interface InventoryModuleDependencies {
  purchaseOrderQueryRepo?: any;
  expenseQueryRepo?: any;
  expenseCommandRepo?: any;
}

export async function registerInventoryModule(
  fastify: FastifyInstance,
  prisma: PrismaClient,
  dependencies?: InventoryModuleDependencies
): Promise<{
  inventoryOrchestrationService: InventoryOrchestrationService | null;
}> {
  // Initialize Repositories
  const inventoryDropCommandRepo = new PrismaInventoryDropCommandRepository(prisma);
  const inventoryDropQueryRepo = new PrismaInventoryDropQueryRepository(prisma);

  // Initialize Command Handlers
  const createInventoryDropHandler = new CreateInventoryDropCommandHandler(
    inventoryDropQueryRepo,
    inventoryDropCommandRepo
  );
  const updateInventoryDropHandler = new UpdateInventoryDropCommandHandler(
    inventoryDropQueryRepo,
    inventoryDropCommandRepo
  );
  const deleteInventoryDropHandler = new DeleteInventoryDropCommandHandler(
    inventoryDropQueryRepo,
    inventoryDropCommandRepo
  );

  // Initialize Query Handlers
  const getInventoryDropByIdHandler = new GetInventoryDropByIdQueryHandler(
    inventoryDropQueryRepo
  );
  const getAllInventoryDropsHandler = new GetAllInventoryDropsQueryHandler(
    inventoryDropQueryRepo
  );
  const getInventoryDropByDropNumberHandler = new GetInventoryDropByDropNumberQueryHandler(
    inventoryDropQueryRepo
  );
  const getInventoryDropsByFabricTypeHandler = new GetInventoryDropsByFabricTypeQueryHandler(
    inventoryDropQueryRepo
  );

  // Initialize Controller
  const inventoryDropController = new InventoryDropController(
    createInventoryDropHandler,
    updateInventoryDropHandler,
    deleteInventoryDropHandler,
    getInventoryDropByIdHandler,
    getAllInventoryDropsHandler,
    getInventoryDropByDropNumberHandler,
    getInventoryDropsByFabricTypeHandler
  );

  // Initialize Orchestration Service if dependencies provided
  let inventoryOrchestrationService: InventoryOrchestrationService | null = null;
  if (
    dependencies?.purchaseOrderQueryRepo &&
    dependencies?.expenseQueryRepo &&
    dependencies?.expenseCommandRepo
  ) {
    inventoryOrchestrationService = new InventoryOrchestrationService(
      inventoryDropCommandRepo,
      dependencies.purchaseOrderQueryRepo,
      dependencies.expenseQueryRepo,
      dependencies.expenseCommandRepo
    );
  }

  // Register Routes
  await registerInventoryRoutes(fastify, inventoryDropController);

  // Return services for cross-module usage
  return {
    inventoryOrchestrationService,
  };
}
