import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaApprovalCommandRepository,
  PrismaApprovalQueryRepository,
} from "./infra/persistence/index.js";

// Command Handlers
import { CreateApprovalCommandHandler } from "./application/commands/create-approval/handler.js";
import { ApproveApprovalCommandHandler } from "./application/commands/approve-approval/handler.js";
import { RejectApprovalCommandHandler } from "./application/commands/reject-approval/handler.js";
import { UpdateApprovalCommandHandler } from "./application/commands/update-approval/handler.js";
import { DeleteApprovalCommandHandler } from "./application/commands/delete-approval/handler.js";

// Query Handlers
import { GetApprovalByIdQueryHandler } from "./application/queries/get-approval-by-id/handler.js";
import { GetAllApprovalsQueryHandler } from "./application/queries/get-all-approvals/handler.js";
import { GetPendingApprovalsQueryHandler } from "./application/queries/get-pending-approvals/handler.js";
import { GetApprovalsByExpenseQueryHandler } from "./application/queries/get-approvals-by-expense/handler.js";
import { GetApprovalsByApproverQueryHandler } from "./application/queries/get-approvals-by-approver/handler.js";

// Controllers
import { ApprovalController } from "./infra/http/controllers/ApprovalController.js";

// Routes
import { registerApprovalRoutes } from "./infra/http/routes.js";

export async function registerApprovalModule(
  fastify: FastifyInstance,
  prisma: PrismaClient
): Promise<void> {
  // Initialize Repositories
  const approvalCommandRepo = new PrismaApprovalCommandRepository(prisma);
  const approvalQueryRepo = new PrismaApprovalQueryRepository(prisma);

  // Initialize Command Handlers
  const createApprovalHandler = new CreateApprovalCommandHandler(
    approvalCommandRepo
  );
  const approveApprovalHandler = new ApproveApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo
  );
  const rejectApprovalHandler = new RejectApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo
  );
  const updateApprovalHandler = new UpdateApprovalCommandHandler(
    approvalQueryRepo,
    approvalCommandRepo
  );
  const deleteApprovalHandler = new DeleteApprovalCommandHandler(
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

  // Initialize Controller
  const approvalController = new ApprovalController(
    createApprovalHandler,
    approveApprovalHandler,
    rejectApprovalHandler,
    updateApprovalHandler,
    deleteApprovalHandler,
    getApprovalByIdHandler,
    getAllApprovalsHandler,
    getPendingApprovalsHandler,
    getApprovalsByExpenseHandler,
    getApprovalsByApproverHandler
  );

  // Register Routes
  await registerApprovalRoutes(fastify, approvalController);
}
