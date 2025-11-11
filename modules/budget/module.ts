import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaBudgetCommandRepository,
  PrismaBudgetQueryRepository,
} from "./infra/persistence/index.js";

// Command Handlers
import { CreateBudgetCommandHandler } from "./application/commands/create-budget/handler.js";
import { UpdateBudgetCommandHandler } from "./application/commands/update-budget/handler.js";
import { DeleteBudgetCommandHandler } from "./application/commands/delete-budget/handler.js";
import { AdjustBudgetSpentCommandHandler } from "./application/commands/adjust-budget-spent/handler.js";
import { ActivateBudgetCommandHandler } from "./application/commands/activate-budget/handler.js";
import { DeactivateBudgetCommandHandler } from "./application/commands/deactivate-budget/handler.js";

// Query Handlers
import { GetBudgetByIdQueryHandler } from "./application/queries/get-budget-by-id/handler.js";
import { GetAllBudgetsQueryHandler } from "./application/queries/get-all-budgets/handler.js";
import { GetBudgetsByDepartmentQueryHandler } from "./application/queries/get-budgets-by-department/handler.js";
import { GetBudgetStatusQueryHandler } from "./application/queries/get-budget-status/handler.js";

// Controllers
import { BudgetController } from "./infra/http/controllers/BudgetController.js";

// Routes
import { registerBudgetRoutes } from "./infra/http/routes.js";

export async function registerBudgetModule(
  fastify: FastifyInstance,
  prisma: PrismaClient
): Promise<{
  budgetQueryRepo: PrismaBudgetQueryRepository;
  budgetCommandRepo: PrismaBudgetCommandRepository;
}> {
  // Initialize Repositories
  const budgetCommandRepo = new PrismaBudgetCommandRepository(prisma);
  const budgetQueryRepo = new PrismaBudgetQueryRepository(prisma);

  // Initialize Command Handlers
  const createBudgetHandler = new CreateBudgetCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );
  const updateBudgetHandler = new UpdateBudgetCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );
  const deleteBudgetHandler = new DeleteBudgetCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );
  const adjustBudgetSpentHandler = new AdjustBudgetSpentCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );
  const activateBudgetHandler = new ActivateBudgetCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );
  const deactivateBudgetHandler = new DeactivateBudgetCommandHandler(
    budgetQueryRepo,
    budgetCommandRepo
  );

  // Initialize Query Handlers
  const getBudgetByIdHandler = new GetBudgetByIdQueryHandler(budgetQueryRepo);
  const getAllBudgetsHandler = new GetAllBudgetsQueryHandler(budgetQueryRepo);
  const getBudgetsByDepartmentHandler = new GetBudgetsByDepartmentQueryHandler(
    budgetQueryRepo
  );
  const getBudgetStatusHandler = new GetBudgetStatusQueryHandler(
    budgetQueryRepo
  );

  // Initialize Controller
  const budgetController = new BudgetController(
    createBudgetHandler,
    updateBudgetHandler,
    deleteBudgetHandler,
    adjustBudgetSpentHandler,
    activateBudgetHandler,
    deactivateBudgetHandler,
    getBudgetByIdHandler,
    getAllBudgetsHandler,
    getBudgetsByDepartmentHandler,
    getBudgetStatusHandler
  );

  // Register Routes
  await registerBudgetRoutes(fastify, budgetController);

  // Return repositories for cross-module usage
  return {
    budgetQueryRepo,
    budgetCommandRepo,
  };
}
