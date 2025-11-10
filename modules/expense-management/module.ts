import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaExpenseCommandRepository,
  PrismaExpenseQueryRepository,
  PrismaExpenseTagCommandRepository,
  PrismaExpenseTagQueryRepository,
} from "./infra/persistence/index.js";

// Expense Command Handlers
import { CreateExpenseCommandHandler } from "./application/commands/create-expense/handler.js";
import { UpdateExpenseCommandHandler } from "./application/commands/update-expense/handler.js";
import { DeleteExpenseCommandHandler } from "./application/commands/delete-expense/handler.js";
import { SubmitExpenseCommandHandler } from "./application/commands/submit-expense/handler.js";
import { CancelExpenseCommandHandler } from "./application/commands/cancel-expense/handler.js";

// Expense Tag Command Handlers
import { AddTagToExpenseCommandHandler } from "./application/commands/add-tag-to-expense/handler.js";
import { RemoveTagFromExpenseCommandHandler } from "./application/commands/remove-tag-from-expense/handler.js";
import { AddTagsToExpenseCommandHandler } from "./application/commands/add-tags-to-expense/handler.js";
import { AddTagToExpensesCommandHandler } from "./application/commands/add-tag-to-expenses/handler.js";
import { RemoveTagsFromExpenseCommandHandler } from "./application/commands/remove-tags-from-expense/handler.js";
import { RemoveTagFromExpensesCommandHandler } from "./application/commands/remove-tag-from-expenses/handler.js";
import { ReplaceExpenseTagsCommandHandler } from "./application/commands/replace-expense-tags/handler.js";
import { ClearExpenseTagsCommandHandler } from "./application/commands/clear-expense-tags/handler.js";

// Query Handlers
import { GetExpenseByIdQueryHandler } from "./application/queries/get-expense-by-id/handler.js";
import { GetAllExpensesQueryHandler } from "./application/queries/get-all-expenses/handler.js";
import { GetExpenseAggregationsQueryHandler } from "./application/queries/get-expense-aggregations/handler.js";
import { GetExpenseTagsQueryHandler } from "./application/queries/get-expense-tags/handler.js";
import { GetExpensesByTagQueryHandler } from "./application/queries/get-expenses-by-tag/handler.js";
import { GetExpensesByAllTagsQueryHandler } from "./application/queries/get-expenses-by-all-tags/handler.js";
import { GetExpensesByAnyTagsQueryHandler } from "./application/queries/get-expenses-by-any-tags/handler.js";

// Controllers
import { ExpenseController } from "./infra/http/controllers/ExpenseController.js";
import { ExpenseTagController } from "./infra/http/controllers/ExpenseTagController.js";

// Routes
import {
  registerExpenseRoutes,
  registerExpenseTagRoutes,
} from "./infra/http/routes.js";

// Import ApprovalOrchestrationService type
import type { ApprovalOrchestrationService } from "../approval/application/services/ApprovalOrchestrationService.js";

// Import ExpenseOrchestrationService
import { ExpenseOrchestrationService } from "./application/services/ExpenseOrchestrationService.js";

export interface ExpenseManagementModuleDependencies {
  approvalOrchestrationService?: ApprovalOrchestrationService | null;
  skipRouteRegistration?: boolean;
}

export async function registerExpenseManagementModule(
  fastify: FastifyInstance,
  prisma: PrismaClient,
  dependencies?: ExpenseManagementModuleDependencies
): Promise<{
  expenseQueryRepo: PrismaExpenseQueryRepository;
  expenseCommandRepo: PrismaExpenseCommandRepository;
  expenseOrchestrationService: ExpenseOrchestrationService;
}> {
  // Initialize Repositories
  const expenseCommandRepo = new PrismaExpenseCommandRepository(prisma);
  const expenseQueryRepo = new PrismaExpenseQueryRepository(prisma);
  const expenseTagCommandRepo = new PrismaExpenseTagCommandRepository(prisma);
  const expenseTagQueryRepo = new PrismaExpenseTagQueryRepository(prisma);

  // Initialize Orchestration Service
  const expenseOrchestrationService = new ExpenseOrchestrationService(
    expenseQueryRepo,
    expenseCommandRepo
  );

  // Initialize Expense Command Handlers
  const createExpenseHandler = new CreateExpenseCommandHandler(
    expenseCommandRepo
  );
  const updateExpenseHandler = new UpdateExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo
  );
  const deleteExpenseHandler = new DeleteExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo
  );

  // Create submit handler with or without orchestration service
  const submitExpenseHandler = dependencies?.approvalOrchestrationService
    ? new SubmitExpenseCommandHandler(
        expenseQueryRepo,
        expenseCommandRepo,
        dependencies.approvalOrchestrationService
      )
    : new SubmitExpenseCommandHandler(
        expenseQueryRepo,
        expenseCommandRepo,
        null as any // Temporary - will throw error if used
      );

  const cancelExpenseHandler = new CancelExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo
  );

  // Initialize Expense Tag Command Handlers
  const addTagToExpenseHandler = new AddTagToExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const removeTagFromExpenseHandler = new RemoveTagFromExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const addTagsToExpenseHandler = new AddTagsToExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const addTagToExpensesHandler = new AddTagToExpensesCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const removeTagsFromExpenseHandler = new RemoveTagsFromExpenseCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const removeTagFromExpensesHandler = new RemoveTagFromExpensesCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );
  const replaceExpenseTagsHandler = new ReplaceExpenseTagsCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagQueryRepo,
    expenseTagCommandRepo
  );
  const clearExpenseTagsHandler = new ClearExpenseTagsCommandHandler(
    expenseQueryRepo,
    expenseCommandRepo,
    expenseTagCommandRepo
  );

  // Initialize Query Handlers
  const getExpenseByIdHandler = new GetExpenseByIdQueryHandler(
    expenseQueryRepo
  );
  const getAllExpensesHandler = new GetAllExpensesQueryHandler(
    expenseQueryRepo
  );
  const getExpenseAggregationsHandler = new GetExpenseAggregationsQueryHandler(
    expenseQueryRepo
  );
  const getExpenseTagsHandler = new GetExpenseTagsQueryHandler(
    expenseTagQueryRepo
  );
  const getExpensesByTagHandler = new GetExpensesByTagQueryHandler(
    expenseTagQueryRepo
  );
  const getExpensesByAllTagsHandler = new GetExpensesByAllTagsQueryHandler(
    expenseTagQueryRepo
  );
  const getExpensesByAnyTagsHandler = new GetExpensesByAnyTagsQueryHandler(
    expenseTagQueryRepo
  );

  // Initialize Controllers
  const expenseController = new ExpenseController(
    createExpenseHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
    getExpenseByIdHandler,
    getAllExpensesHandler,
    submitExpenseHandler,
    cancelExpenseHandler,
    getExpenseAggregationsHandler
  );

  const expenseTagController = new ExpenseTagController(
    addTagToExpenseHandler,
    removeTagFromExpenseHandler,
    addTagsToExpenseHandler,
    addTagToExpensesHandler,
    removeTagsFromExpenseHandler,
    removeTagFromExpensesHandler,
    replaceExpenseTagsHandler,
    clearExpenseTagsHandler,
    getExpenseTagsHandler,
    getExpensesByTagHandler,
    getExpensesByAllTagsHandler,
    getExpensesByAnyTagsHandler
  );

  // Register Routes (skip if already registered)
  if (!dependencies?.skipRouteRegistration) {
    await registerExpenseRoutes(fastify, expenseController);
    await registerExpenseTagRoutes(fastify, expenseTagController);
  }

  // Return repositories for cross-module usage
  return {
    expenseQueryRepo,
    expenseCommandRepo,
    expenseOrchestrationService,
  };
}
