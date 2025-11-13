import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { ApproveApprovalCommandHandler } from "../../../application/commands/approve-approval/handler.js";
import { ApproveApprovalCommand } from "../../../application/commands/approve-approval/command.js";
import { RejectApprovalCommandHandler } from "../../../application/commands/reject-approval/handler.js";
import { RejectApprovalCommand } from "../../../application/commands/reject-approval/command.js";
import { UpdateApprovalCommandHandler } from "../../../application/commands/update-approval/handler.js";
import { UpdateApprovalCommand } from "../../../application/commands/update-approval/command.js";

// Query imports
import { GetApprovalByIdQueryHandler } from "../../../application/queries/get-approval-by-id/handler.js";
import { GetApprovalByIdQuery } from "../../../application/queries/get-approval-by-id/query.js";
import { GetAllApprovalsQueryHandler } from "../../../application/queries/get-all-approvals/handler.js";
import { GetAllApprovalsQuery as GetAllApprovalsQueryClass } from "../../../application/queries/get-all-approvals/query.js";
import { GetPendingApprovalsQueryHandler } from "../../../application/queries/get-pending-approvals/handler.js";
import { GetPendingApprovalsQuery as GetPendingApprovalsQueryClass } from "../../../application/queries/get-pending-approvals/query.js";
import { GetApprovalsByExpenseQueryHandler } from "../../../application/queries/get-approvals-by-expense/handler.js";
import { GetApprovalsByExpenseQuery as GetApprovalsByExpenseQueryClass } from "../../../application/queries/get-approvals-by-expense/query.js";
import { GetApprovalsByApproverQueryHandler } from "../../../application/queries/get-approvals-by-approver/handler.js";
import { GetApprovalsByApproverQuery as GetApprovalsByApproverQueryClass } from "../../../application/queries/get-approvals-by-approver/query.js";
import { GetRejectedApprovalsVisibleToRoleQueryHandler } from "../../../application/queries/get-rejected-approvals-visible-to-role/handler.js";
import { GetRejectedApprovalsVisibleToRoleQuery } from "../../../application/queries/get-rejected-approvals-visible-to-role/query.js";
import { GetRoleBasedDashboardQueryHandler } from "../../../application/queries/get-role-based-dashboard/handler.js";
import { GetRoleBasedDashboardQuery } from "../../../application/queries/get-role-based-dashboard/query.js";

// Validators
import {
  approveApprovalParamsSchema,
  approveApprovalBodySchema,
  type ApproveApprovalParams,
  type ApproveApprovalBody,
} from "../validators/approve-approval.validator.js";
import {
  rejectApprovalParamsSchema,
  rejectApprovalBodySchema,
  type RejectApprovalParams,
  type RejectApprovalBody,
} from "../validators/reject-approval.validator.js";
import {
  updateApprovalParamsSchema,
  updateApprovalBodySchema,
  type UpdateApprovalParams,
  type UpdateApprovalBody,
} from "../validators/update-approval.validator.js";
import {
  getApprovalByIdParamsSchema,
  type GetApprovalByIdParams,
} from "../validators/get-approval-by-id.validator.js";
import {
  getAllApprovalsQuerySchema,
  type GetAllApprovalsQuery,
} from "../validators/get-all-approvals.validator.js";
import {
  getPendingApprovalsQuerySchema,
  type GetPendingApprovalsQuery,
} from "../validators/get-pending-approvals.validator.js";
import {
  getRejectedVisibleQuerySchema,
  type GetRejectedVisibleQuery,
} from "../validators/get-rejected-visible.validator.js";
import {
  getDashboardQuerySchema,
  type GetDashboardQuery,
} from "../validators/get-dashboard.validator.js";

export class ApprovalController {
  constructor(
    private readonly approveApprovalHandler: ApproveApprovalCommandHandler,
    private readonly rejectApprovalHandler: RejectApprovalCommandHandler,
    private readonly updateApprovalHandler: UpdateApprovalCommandHandler,
    private readonly getApprovalByIdHandler: GetApprovalByIdQueryHandler,
    private readonly getAllApprovalsHandler: GetAllApprovalsQueryHandler,
    private readonly getPendingApprovalsHandler: GetPendingApprovalsQueryHandler,
    private readonly getApprovalsByExpenseHandler: GetApprovalsByExpenseQueryHandler,
    private readonly getApprovalsByApproverHandler: GetApprovalsByApproverQueryHandler,
    private readonly getRejectedVisibleHandler: GetRejectedApprovalsVisibleToRoleQueryHandler,
    private readonly getDashboardHandler: GetRoleBasedDashboardQueryHandler
  ) {}

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof ZodError) {
      reply.code(400).send({
        error: "Validation failed",
        details: error.errors,
      });
    } else if (error instanceof Error) {
      if (error.message.includes("not found")) {
        reply.code(404).send({ error: error.message });
      } else if (
        error.message.includes("not authorized") ||
        error.message.includes("unauthorized")
      ) {
        reply.code(403).send({ error: error.message });
      } else {
        reply.code(400).send({ error: error.message });
      }
    } else {
      reply.code(500).send({ error: "Internal server error" });
    }
  }

  async approve(
    request: FastifyRequest<{
      Params: ApproveApprovalParams;
      Body: ApproveApprovalBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = approveApprovalParamsSchema.parse(request.params);
      const validatedBody = approveApprovalBodySchema.parse(request.body);

      // Get authenticated user ID from JWT token
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const command = new ApproveApprovalCommand(
        validatedParams.approvalId,
        authenticatedUser.userId,
        validatedBody.comments
      );

      const result = await this.approveApprovalHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async reject(
    request: FastifyRequest<{
      Params: RejectApprovalParams;
      Body: RejectApprovalBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = rejectApprovalParamsSchema.parse(request.params);
      const validatedBody = rejectApprovalBodySchema.parse(request.body);

      // Get authenticated user ID from JWT token
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const command = new RejectApprovalCommand(
        validatedParams.approvalId,
        authenticatedUser.userId, // Use authenticated user's ID
        validatedBody.comments
      );

      const result = await this.rejectApprovalHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdateApprovalParams;
      Body: UpdateApprovalBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateApprovalParamsSchema.parse(request.params);
      const validatedBody = updateApprovalBodySchema.parse(request.body);

      const command = new UpdateApprovalCommand(
        validatedParams.approvalId,
        validatedBody.comments
      );

      const result = await this.updateApprovalHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetApprovalByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getApprovalByIdParamsSchema.parse(request.params);

      const query = new GetApprovalByIdQuery(validatedParams.approvalId);
      const result = await this.getApprovalByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Approval not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllApprovalsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllApprovalsQuerySchema.parse(request.query);

      const dateFrom = validatedQuery.dateFrom
        ? new Date(validatedQuery.dateFrom)
        : undefined;
      const dateTo = validatedQuery.dateTo
        ? new Date(validatedQuery.dateTo)
        : undefined;

      const query = new GetAllApprovalsQueryClass(
        validatedQuery.expenseId,
        validatedQuery.approverId,
        validatedQuery.status,
        dateFrom,
        dateTo
      );

      const result = await this.getAllApprovalsHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getPending(
    request: FastifyRequest<{ Querystring: GetPendingApprovalsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Get authenticated user ID from JWT token
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const validatedQuery = getPendingApprovalsQuerySchema.parse(
        request.query
      );

      // Use query parameter if provided, otherwise use authenticated user's ID
      const approverId = validatedQuery.approverId || authenticatedUser.userId;

      // If querying for someone else's approvals, verify they match
      if (
        validatedQuery.approverId &&
        validatedQuery.approverId !== authenticatedUser.userId
      ) {
        // TODO: Add role check - only admins/managers should query others' approvals
        // For now, we'll allow it but you should add authorization check
      }

      const query = new GetPendingApprovalsQueryClass(approverId);

      const result = await this.getPendingApprovalsHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByExpense(
    request: FastifyRequest<{ Params: { expenseId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = new GetApprovalsByExpenseQueryClass(
        request.params.expenseId
      );

      const result = await this.getApprovalsByExpenseHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByApprover(
    request: FastifyRequest<{ Params: { approverId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = new GetApprovalsByApproverQueryClass(
        request.params.approverId
      );

      const result = await this.getApprovalsByApproverHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getRejectedVisible(
    request: FastifyRequest<{ Querystring: GetRejectedVisibleQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Get authenticated user ID and role from JWT token
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId || !authenticatedUser.role) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const validatedQuery = getRejectedVisibleQuerySchema.parse(request.query);

      // Build filters object with only defined values
      const filters: any = {};
      if (validatedQuery.departmentId) filters.departmentId = validatedQuery.departmentId;
      if (validatedQuery.categoryId) filters.categoryId = validatedQuery.categoryId;
      if (validatedQuery.dateFrom) filters.dateFrom = new Date(validatedQuery.dateFrom);
      if (validatedQuery.dateTo) filters.dateTo = new Date(validatedQuery.dateTo);
      if (validatedQuery.rejectedByRole) filters.rejectedByRole = validatedQuery.rejectedByRole;
      if (validatedQuery.limit !== undefined) filters.limit = validatedQuery.limit;
      if (validatedQuery.offset !== undefined) filters.offset = validatedQuery.offset;

      const query = new GetRejectedApprovalsVisibleToRoleQuery(
        authenticatedUser.userId,
        authenticatedUser.role,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      const result = await this.getRejectedVisibleHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getDashboard(
    request: FastifyRequest<{ Querystring: GetDashboardQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Get authenticated user ID and role from JWT token
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId || !authenticatedUser.role) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const query = new GetRoleBasedDashboardQuery(
        authenticatedUser.userId,
        authenticatedUser.role
      );

      const result = await this.getDashboardHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
