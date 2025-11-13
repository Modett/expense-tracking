import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaApprovalCommandRepository,
  PrismaApprovalQueryRepository,
} from "./infra/persistence/index.js";

// Command Handlers
import { ApproveApprovalCommandHandler } from "./application/commands/approve-approval/handler.js";
import { RejectApprovalCommandHandler } from "./application/commands/reject-approval/handler.js";
import { UpdateApprovalCommandHandler } from "./application/commands/update-approval/handler.js";

// Query Handlers
import { GetApprovalByIdQueryHandler } from "./application/queries/get-approval-by-id/handler.js";
import { GetAllApprovalsQueryHandler } from "./application/queries/get-all-approvals/handler.js";
import { GetPendingApprovalsQueryHandler } from "./application/queries/get-pending-approvals/handler.js";
import { GetApprovalsByExpenseQueryHandler } from "./application/queries/get-approvals-by-expense/handler.js";
import { GetApprovalsByApproverQueryHandler } from "./application/queries/get-approvals-by-approver/handler.js";
import { GetRejectedApprovalsVisibleToRoleQueryHandler } from "./application/queries/get-rejected-approvals-visible-to-role/handler.js";
import { GetRoleBasedDashboardQueryHandler } from "./application/queries/get-role-based-dashboard/handler.js";

// Services
import { ApprovalOrchestrationService } from "./application/services/ApprovalOrchestrationService.js";

// Controllers
import { ApprovalController } from "./infra/http/controllers/ApprovalController.js";

// Routes
import { registerApprovalRoutes } from "./infra/http/routes.js";

export interface ApprovalModuleDependencies {
  approvalRuleQueryRepo?: any;
  userQueryRepo?: any;
  purchaseOrderOrchestrationService?: any;
  expenseOrchestrationService?: any;
}

export async function registerApprovalModule(
  fastify: FastifyInstance,
  prisma: PrismaClient,
  dependencies?: ApprovalModuleDependencies
): Promise<{
  approvalOrchestrationService: ApprovalOrchestrationService | null;
}> {
  // Initialize Repositories
  const approvalCommandRepo = new PrismaApprovalCommandRepository(prisma);
  const approvalQueryRepo = new PrismaApprovalQueryRepository(prisma);

  // Initialize Orchestration Service if dependencies are provided
  let approvalOrchestrationService: ApprovalOrchestrationService | null = null;
  if (dependencies?.approvalRuleQueryRepo && dependencies?.userQueryRepo) {
    approvalOrchestrationService = new ApprovalOrchestrationService(
      dependencies.approvalRuleQueryRepo,
      dependencies.userQueryRepo,
      approvalCommandRepo
    );
  }

  // Initialize Command Handlers
  const approveApprovalHandler = new ApproveApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo,
    dependencies?.purchaseOrderOrchestrationService,
    dependencies?.expenseOrchestrationService
  );
  const rejectApprovalHandler = new RejectApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo,
    dependencies?.expenseOrchestrationService
  );
  const updateApprovalHandler = new UpdateApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo
  );

  // Initialize Query Handlers
  const getApprovalByIdHandler = new GetApprovalByIdQueryHandler(
    approvalQueryRepo
  );
  const getAllApprovalsHandler = new GetAllApprovalsQueryHandler(
    approvalQueryRepo
  );
  const getPendingApprovalsHandler = new GetPendingApprovalsQueryHandler(
    approvalQueryRepo
  );
  const getApprovalsByExpenseHandler = new GetApprovalsByExpenseQueryHandler(
    approvalQueryRepo
  );
  const getApprovalsByApproverHandler = new GetApprovalsByApproverQueryHandler(
    approvalQueryRepo
  );
  const getRejectedVisibleHandler =
    new GetRejectedApprovalsVisibleToRoleQueryHandler(approvalQueryRepo);
  const getDashboardHandler = new GetRoleBasedDashboardQueryHandler(
    approvalQueryRepo
  );

  // Initialize Controller
  const approvalController = new ApprovalController(
    approveApprovalHandler,
    rejectApprovalHandler,
    updateApprovalHandler,
    getApprovalByIdHandler,
    getAllApprovalsHandler,
    getPendingApprovalsHandler,
    getApprovalsByExpenseHandler,
    getApprovalsByApproverHandler,
    getRejectedVisibleHandler,
    getDashboardHandler
  );

  // Register Routes
  await registerApprovalRoutes(fastify, approvalController);

  // Return the orchestration service for cross-module usage
  return { approvalOrchestrationService };
}
