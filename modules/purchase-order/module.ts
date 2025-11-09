import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaPurchaseOrderCommandRepository,
  PrismaPurchaseOrderQueryRepository,
} from "./infra/persistence/index.js";

// Command Handlers
import { CreatePurchaseOrderCommandHandler } from "./application/commands/create-purchase-order/handler.js";
import { UpdatePurchaseOrderCommandHandler } from "./application/commands/update-purchase-order/handler.js";
import { IssuePurchaseOrderCommandHandler } from "./application/commands/issue-purchase-order/handler.js";
import { CancelPurchaseOrderCommandHandler } from "./application/commands/cancel-purchase-order/handler.js";
import { ReceivePurchaseOrderCommandHandler } from "./application/commands/receive-purchase-order/handler.js";
import { ClosePurchaseOrderCommandHandler } from "./application/commands/close-purchase-order/handler.js";
import { DeletePurchaseOrderCommandHandler } from "./application/commands/delete-purchase-order/handler.js";

// Query Handlers
import { GetPurchaseOrderByIdQueryHandler } from "./application/queries/get-purchase-order-by-id/handler.js";
import { GetAllPurchaseOrdersQueryHandler } from "./application/queries/get-all-purchase-orders/handler.js";
import { GetPurchaseOrdersByVendorQueryHandler } from "./application/queries/get-purchase-orders-by-vendor/handler.js";
import { GetPurchaseOrderByPONumberQueryHandler } from "./application/queries/get-purchase-order-by-po-number/handler.js";

// Controllers
import { PurchaseOrderController } from "./infra/http/controllers/PurchaseOrderController.js";

// Routes
import { registerPurchaseOrderRoutes } from "./infra/http/routes.js";

// Services
import { PurchaseOrderOrchestrationService } from "./application/services/PurchaseOrderOrchestrationService.js";

export interface PurchaseOrderModuleDependencies {
  expenseQueryRepo?: any;
  expenseCommandRepo?: any;
  approvalQueryRepo?: any;
  inventoryOrchestrationService?: any;
}

export async function registerPurchaseOrderModule(
  fastify: FastifyInstance,
  prisma: PrismaClient,
  dependencies?: PurchaseOrderModuleDependencies
): Promise<{
  purchaseOrderQueryRepo: PrismaPurchaseOrderQueryRepository;
  purchaseOrderOrchestrationService: PurchaseOrderOrchestrationService | null;
}> {
  // Initialize Repositories
  const purchaseOrderCommandRepo = new PrismaPurchaseOrderCommandRepository(prisma);
  const purchaseOrderQueryRepo = new PrismaPurchaseOrderQueryRepository(prisma);

  // Initialize Command Handlers
  const createPurchaseOrderHandler = new CreatePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );
  const updatePurchaseOrderHandler = new UpdatePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );
  const issuePurchaseOrderHandler = new IssuePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );
  const cancelPurchaseOrderHandler = new CancelPurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );
  // Initialize Orchestration Service if dependencies provided
  let purchaseOrderOrchestrationService: PurchaseOrderOrchestrationService | null = null;
  if (
    dependencies?.expenseQueryRepo &&
    dependencies?.expenseCommandRepo &&
    dependencies?.approvalQueryRepo
  ) {
    purchaseOrderOrchestrationService = new PurchaseOrderOrchestrationService(
      dependencies.expenseQueryRepo,
      dependencies.expenseCommandRepo,
      purchaseOrderCommandRepo,
      dependencies.approvalQueryRepo
    );
  }

  const receivePurchaseOrderHandler = new ReceivePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo,
    dependencies?.inventoryOrchestrationService
  );
  const closePurchaseOrderHandler = new ClosePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );
  const deletePurchaseOrderHandler = new DeletePurchaseOrderCommandHandler(
    purchaseOrderQueryRepo,
    purchaseOrderCommandRepo
  );

  // Initialize Query Handlers
  const getPurchaseOrderByIdHandler = new GetPurchaseOrderByIdQueryHandler(
    purchaseOrderQueryRepo
  );
  const getAllPurchaseOrdersHandler = new GetAllPurchaseOrdersQueryHandler(
    purchaseOrderQueryRepo
  );
  const getPurchaseOrdersByVendorHandler = new GetPurchaseOrdersByVendorQueryHandler(
    purchaseOrderQueryRepo
  );
  const getPurchaseOrderByPONumberHandler = new GetPurchaseOrderByPONumberQueryHandler(
    purchaseOrderQueryRepo
  );

  // Initialize Controller
  const purchaseOrderController = new PurchaseOrderController(
    createPurchaseOrderHandler,
    updatePurchaseOrderHandler,
    issuePurchaseOrderHandler,
    cancelPurchaseOrderHandler,
    receivePurchaseOrderHandler,
    closePurchaseOrderHandler,
    deletePurchaseOrderHandler,
    getPurchaseOrderByIdHandler,
    getAllPurchaseOrdersHandler,
    getPurchaseOrdersByVendorHandler,
    getPurchaseOrderByPONumberHandler
  );

  // Register Routes
  await registerPurchaseOrderRoutes(fastify, purchaseOrderController);

  // Return repositories and services for cross-module usage
  return {
    purchaseOrderQueryRepo,
    purchaseOrderOrchestrationService,
  };
}
