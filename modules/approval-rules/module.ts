import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";

// Repositories
import {
  PrismaApprovalRuleCommandRepository,
  PrismaApprovalRuleQueryRepository,
} from "./infra/persistence/index.js";

// Domain Service
import { ApprovalRuleDomainService } from "./application/services/ApprovalRuleDomainService.js";

// Command Handlers
import { CreateApprovalRuleCommandHandler } from "./application/commands/create-approval-rule/handler.js";
import { UpdateApprovalRuleCommandHandler } from "./application/commands/update-approval-rule/handler.js";
import { DeleteApprovalRuleCommandHandler } from "./application/commands/delete-approval-rule/handler.js";
import { ActivateApprovalRuleCommandHandler } from "./application/commands/activate-approval-rule/handler.js";
import { DeactivateApprovalRuleCommandHandler } from "./application/commands/deactivate-approval-rule/handler.js";

// Query Handlers
import { GetApprovalRuleByIdQueryHandler } from "./application/queries/get-approval-rule-by-id/handler.js";
import { GetAllApprovalRulesQueryHandler } from "./application/queries/get-all-approval-rules/handler.js";
import { GetApprovalRulesByCategoryQueryHandler } from "./application/queries/get-approval-rules-by-category/handler.js";
import { GetApplicableRulesQueryHandler } from "./application/queries/get-applicable-rules/handler.js";

// Controllers
import { ApprovalRuleController } from "./infra/http/controllers/ApprovalRuleController.js";

// Routes
import { registerApprovalRulesRoutes } from "./infra/http/routes.js";

export async function registerApprovalRulesModule(
  fastify: FastifyInstance,
  prisma: PrismaClient
): Promise<{ approvalRuleQueryRepo: PrismaApprovalRuleQueryRepository }> {
  // Initialize Repositories
  const approvalRuleCommandRepo = new PrismaApprovalRuleCommandRepository(prisma);
  const approvalRuleQueryRepo = new PrismaApprovalRuleQueryRepository(prisma);

  // Initialize Domain Service
  const approvalRuleDomainService = new ApprovalRuleDomainService(
    approvalRuleQueryRepo
  );

  // Initialize Command Handlers
  const createApprovalRuleHandler = new CreateApprovalRuleCommandHandler(
    approvalRuleQueryRepo,
    approvalRuleCommandRepo,
    approvalRuleDomainService
  );
  const updateApprovalRuleHandler = new UpdateApprovalRuleCommandHandler(
    approvalRuleQueryRepo,
    approvalRuleCommandRepo
  );
  const deleteApprovalRuleHandler = new DeleteApprovalRuleCommandHandler(
    approvalRuleQueryRepo,
    approvalRuleCommandRepo,
    approvalRuleDomainService
  );
  const activateApprovalRuleHandler = new ActivateApprovalRuleCommandHandler(
    approvalRuleQueryRepo,
    approvalRuleCommandRepo
  );
  const deactivateApprovalRuleHandler = new DeactivateApprovalRuleCommandHandler(
    approvalRuleQueryRepo,
    approvalRuleCommandRepo
  );

  // Initialize Query Handlers
  const getApprovalRuleByIdHandler = new GetApprovalRuleByIdQueryHandler(
    approvalRuleQueryRepo
  );
  const getAllApprovalRulesHandler = new GetAllApprovalRulesQueryHandler(
    approvalRuleQueryRepo
  );
  const getApprovalRulesByCategoryHandler = new GetApprovalRulesByCategoryQueryHandler(
    approvalRuleQueryRepo
  );
  const getApplicableRulesHandler = new GetApplicableRulesQueryHandler(
    approvalRuleQueryRepo
  );

  // Initialize Controller
  const approvalRuleController = new ApprovalRuleController(
    createApprovalRuleHandler,
    updateApprovalRuleHandler,
    deleteApprovalRuleHandler,
    activateApprovalRuleHandler,
    deactivateApprovalRuleHandler,
    getApprovalRuleByIdHandler,
    getAllApprovalRulesHandler,
    getApprovalRulesByCategoryHandler,
    getApplicableRulesHandler
  );

  // Register Routes
  await registerApprovalRulesRoutes(fastify, approvalRuleController);

  // Return repository for cross-module usage
  return { approvalRuleQueryRepo };
}
