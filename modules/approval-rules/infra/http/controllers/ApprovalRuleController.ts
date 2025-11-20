import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { CreateApprovalRuleCommandHandler } from "../../../application/commands/create-approval-rule/handler.js";
import { CreateApprovalRuleCommand } from "../../../application/commands/create-approval-rule/command.js";
import { UpdateApprovalRuleCommandHandler } from "../../../application/commands/update-approval-rule/handler.js";
import { UpdateApprovalRuleCommand } from "../../../application/commands/update-approval-rule/command.js";
import { DeleteApprovalRuleCommandHandler } from "../../../application/commands/delete-approval-rule/handler.js";
import { DeleteApprovalRuleCommand } from "../../../application/commands/delete-approval-rule/command.js";
import { ActivateApprovalRuleCommandHandler } from "../../../application/commands/activate-approval-rule/handler.js";
import { ActivateApprovalRuleCommand } from "../../../application/commands/activate-approval-rule/command.js";
import { DeactivateApprovalRuleCommandHandler } from "../../../application/commands/deactivate-approval-rule/handler.js";
import { DeactivateApprovalRuleCommand } from "../../../application/commands/deactivate-approval-rule/command.js";

// Query imports
import { GetApprovalRuleByIdQueryHandler } from "../../../application/queries/get-approval-rule-by-id/handler.js";
import { GetApprovalRuleByIdQuery } from "../../../application/queries/get-approval-rule-by-id/query.js";
import { GetAllApprovalRulesQueryHandler } from "../../../application/queries/get-all-approval-rules/handler.js";
import { GetAllApprovalRulesQuery as GetAllApprovalRulesQueryClass } from "../../../application/queries/get-all-approval-rules/query.js";
import { GetApprovalRulesByCategoryQueryHandler } from "../../../application/queries/get-approval-rules-by-category/handler.js";
import { GetApprovalRulesByCategoryQuery } from "../../../application/queries/get-approval-rules-by-category/query.js";
import { GetApprovalRulesByDepartmentQueryHandler } from "../../../application/queries/get-approval-rules-by-department/handler.js";
import { GetApprovalRulesByDepartmentQuery } from "../../../application/queries/get-approval-rules-by-department/query.js";
import { GetApplicableRulesQueryHandler } from "../../../application/queries/get-applicable-rules/handler.js";
import { GetApplicableRulesQuery as GetApplicableRulesQueryClass } from "../../../application/queries/get-applicable-rules/query.js";

// Validators
import {
  createApprovalRuleBodySchema,
  type CreateApprovalRuleBody,
} from "../validators/create-approval-rule.validator.js";
import {
  updateApprovalRuleParamsSchema,
  updateApprovalRuleBodySchema,
  type UpdateApprovalRuleParams,
  type UpdateApprovalRuleBody,
} from "../validators/update-approval-rule.validator.js";
import {
  deleteApprovalRuleParamsSchema,
  type DeleteApprovalRuleParams,
} from "../validators/delete-approval-rule.validator.js";
import {
  activateApprovalRuleParamsSchema,
  type ActivateApprovalRuleParams,
} from "../validators/activate-approval-rule.validator.js";
import {
  deactivateApprovalRuleParamsSchema,
  type DeactivateApprovalRuleParams,
} from "../validators/deactivate-approval-rule.validator.js";
import {
  getApprovalRuleByIdParamsSchema,
  type GetApprovalRuleByIdParams,
} from "../validators/get-approval-rule-by-id.validator.js";
import {
  getAllApprovalRulesQuerySchema,
  type GetAllApprovalRulesQuery,
} from "../validators/get-all-approval-rules.validator.js";
import {
  getApprovalRulesByCategoryParamsSchema,
  type GetApprovalRulesByCategoryParams,
} from "../validators/get-approval-rules-by-category.validator.js";
import {
  getApprovalRulesByDepartmentParamsSchema,
  type GetApprovalRulesByDepartmentParams,
} from "../validators/get-approval-rules-by-department.validator.js";
import {
  getApplicableRulesQuerySchema,
  type GetApplicableRulesQuery,
} from "../validators/get-applicable-rules.validator.js";

export class ApprovalRuleController {
  constructor(
    private readonly createApprovalRuleHandler: CreateApprovalRuleCommandHandler,
    private readonly updateApprovalRuleHandler: UpdateApprovalRuleCommandHandler,
    private readonly deleteApprovalRuleHandler: DeleteApprovalRuleCommandHandler,
    private readonly activateApprovalRuleHandler: ActivateApprovalRuleCommandHandler,
    private readonly deactivateApprovalRuleHandler: DeactivateApprovalRuleCommandHandler,
    private readonly getApprovalRuleByIdHandler: GetApprovalRuleByIdQueryHandler,
    private readonly getAllApprovalRulesHandler: GetAllApprovalRulesQueryHandler,
    private readonly getApprovalRulesByCategoryHandler: GetApprovalRulesByCategoryQueryHandler,
    private readonly getApprovalRulesByDepartmentHandler: GetApprovalRulesByDepartmentQueryHandler,
    private readonly getApplicableRulesHandler: GetApplicableRulesQueryHandler
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
      } else if (error.message.includes("unauthorized")) {
        reply.code(403).send({ error: error.message });
      } else if (error.message.includes("already exists")) {
        reply.code(409).send({ error: error.message });
      } else {
        reply.code(400).send({ error: error.message });
      }
    } else {
      reply.code(500).send({ error: "Internal server error" });
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateApprovalRuleBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createApprovalRuleBodySchema.parse(request.body);

      const command = new CreateApprovalRuleCommand(
        validatedBody.categoryId,
        validatedBody.departmentId,
        validatedBody.minAmount,
        validatedBody.approverRole,
        validatedBody.approvalOrder
      );

      const result = await this.createApprovalRuleHandler.handle(command);
      reply.code(201).send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdateApprovalRuleParams;
      Body: UpdateApprovalRuleBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateApprovalRuleParamsSchema.parse(
        request.params
      );
      const validatedBody = updateApprovalRuleBodySchema.parse(request.body);

      const command = new UpdateApprovalRuleCommand(
        validatedParams.id,
        validatedBody.categoryId,
        validatedBody.departmentId,
        validatedBody.minAmount,
        validatedBody.approverRole,
        validatedBody.approvalOrder
      );

      const result = await this.updateApprovalRuleHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: DeleteApprovalRuleParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      this.ensureAdminAccess(request);
      const validatedParams = deleteApprovalRuleParamsSchema.parse(
        request.params
      );

      const command = new DeleteApprovalRuleCommand(validatedParams.id);

      const result = await this.deleteApprovalRuleHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async activate(
    request: FastifyRequest<{ Params: ActivateApprovalRuleParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = activateApprovalRuleParamsSchema.parse(
        request.params
      );

      const command = new ActivateApprovalRuleCommand(validatedParams.id);

      const result = await this.activateApprovalRuleHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async deactivate(
    request: FastifyRequest<{ Params: DeactivateApprovalRuleParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = deactivateApprovalRuleParamsSchema.parse(
        request.params
      );

      const command = new DeactivateApprovalRuleCommand(validatedParams.id);

      const result = await this.deactivateApprovalRuleHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetApprovalRuleByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getApprovalRuleByIdParamsSchema.parse(
        request.params
      );

      const query = new GetApprovalRuleByIdQuery(validatedParams.id);
      const result = await this.getApprovalRuleByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Approval rule not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllApprovalRulesQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllApprovalRulesQuerySchema.parse(
        request.query
      );

      const query = new GetAllApprovalRulesQueryClass(
        validatedQuery.categoryId,
        validatedQuery.departmentId,
        validatedQuery.approverRole,
        validatedQuery.isActive,
        validatedQuery.minAmountGreaterThan,
        validatedQuery.minAmountLessThan
      );

      const result = await this.getAllApprovalRulesHandler.handle(query);
      console.log("GetAll Handler Result:", result.length, "rules");
      console.log("First rule:", result[0]);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      console.error("GetAll Error:", error);
      this.handleError(error, reply);
    }
  }

  async getByCategory(
    request: FastifyRequest<{ Params: GetApprovalRulesByCategoryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getApprovalRulesByCategoryParamsSchema.parse(
        request.params
      );

      const query = new GetApprovalRulesByCategoryQuery(
        validatedParams.categoryId
      );
      const result = await this.getApprovalRulesByCategoryHandler.handle(query);

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByDepartment(
    request: FastifyRequest<{ Params: GetApprovalRulesByDepartmentParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getApprovalRulesByDepartmentParamsSchema.parse(
        request.params
      );

      const query = new GetApprovalRulesByDepartmentQuery(
        validatedParams.departmentId
      );
      const result = await this.getApprovalRulesByDepartmentHandler.handle(query);

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getApplicableRules(
    request: FastifyRequest<{ Querystring: GetApplicableRulesQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getApplicableRulesQuerySchema.parse(request.query);

      const query = new GetApplicableRulesQueryClass(
        validatedQuery.categoryId,
        validatedQuery.amount
      );

      const result = await this.getApplicableRulesHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private getAuthenticatedUser(request: FastifyRequest) {
    const authUser = (request as any).user;
    if (!authUser || !authUser.userId) {
      throw new Error("unauthorized: authentication required");
    }

    const normalizedRole =
      typeof authUser.role === "string"
        ? authUser.role.toLowerCase()
        : authUser.role;

    return { ...authUser, role: normalizedRole };
  }

  private ensureAdminAccess(request: FastifyRequest): void {
    const user = this.getAuthenticatedUser(request);
    if (user.role !== "admin") {
      throw new Error("unauthorized: admin access required");
    }
  }
}
