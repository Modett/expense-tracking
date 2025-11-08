import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { CreateBudgetCommandHandler } from "../../../application/commands/create-budget/handler.js";
import { CreateBudgetCommand } from "../../../application/commands/create-budget/command.js";
import { UpdateBudgetCommandHandler } from "../../../application/commands/update-budget/handler.js";
import { UpdateBudgetCommand } from "../../../application/commands/update-budget/command.js";
import { DeleteBudgetCommandHandler } from "../../../application/commands/delete-budget/handler.js";
import { DeleteBudgetCommand } from "../../../application/commands/delete-budget/command.js";
import { AdjustBudgetSpentCommandHandler } from "../../../application/commands/adjust-budget-spent/handler.js";
import { AdjustBudgetSpentCommand } from "../../../application/commands/adjust-budget-spent/command.js";
import { ActivateBudgetCommandHandler } from "../../../application/commands/activate-budget/handler.js";
import { ActivateBudgetCommand } from "../../../application/commands/activate-budget/command.js";
import { DeactivateBudgetCommandHandler } from "../../../application/commands/deactivate-budget/handler.js";
import { DeactivateBudgetCommand } from "../../../application/commands/deactivate-budget/command.js";

// Query imports
import { GetBudgetByIdQueryHandler } from "../../../application/queries/get-budget-by-id/handler.js";
import { GetBudgetByIdQuery } from "../../../application/queries/get-budget-by-id/query.js";
import { GetAllBudgetsQueryHandler } from "../../../application/queries/get-all-budgets/handler.js";
import { GetAllBudgetsQuery as GetAllBudgetsQueryClass } from "../../../application/queries/get-all-budgets/query.js";
import { GetBudgetsByDepartmentQueryHandler } from "../../../application/queries/get-budgets-by-department/handler.js";
import { GetBudgetsByDepartmentQuery as GetBudgetsByDepartmentQueryClass } from "../../../application/queries/get-budgets-by-department/query.js";
import { GetBudgetStatusQueryHandler } from "../../../application/queries/get-budget-status/handler.js";
import { GetBudgetStatusQuery as GetBudgetStatusQueryClass } from "../../../application/queries/get-budget-status/query.js";

// Validators
import {
  createBudgetBodySchema,
  type CreateBudgetBody,
} from "../validators/create-budget.validator.js";
import {
  updateBudgetParamsSchema,
  updateBudgetBodySchema,
  type UpdateBudgetParams,
  type UpdateBudgetBody,
} from "../validators/update-budget.validator.js";
import {
  adjustBudgetSpentParamsSchema,
  adjustBudgetSpentBodySchema,
  type AdjustBudgetSpentParams,
  type AdjustBudgetSpentBody,
} from "../validators/adjust-budget-spent.validator.js";
import {
  deleteBudgetParamsSchema,
  type DeleteBudgetParams,
} from "../validators/delete-budget.validator.js";
import {
  getBudgetByIdParamsSchema,
  type GetBudgetByIdParams,
} from "../validators/get-budget-by-id.validator.js";
import {
  getAllBudgetsQuerySchema,
  type GetAllBudgetsQuery,
} from "../validators/get-all-budgets.validator.js";

export class BudgetController {
  constructor(
    private readonly createBudgetHandler: CreateBudgetCommandHandler,
    private readonly updateBudgetHandler: UpdateBudgetCommandHandler,
    private readonly deleteBudgetHandler: DeleteBudgetCommandHandler,
    private readonly adjustBudgetSpentHandler: AdjustBudgetSpentCommandHandler,
    private readonly activateBudgetHandler: ActivateBudgetCommandHandler,
    private readonly deactivateBudgetHandler: DeactivateBudgetCommandHandler,
    private readonly getBudgetByIdHandler: GetBudgetByIdQueryHandler,
    private readonly getAllBudgetsHandler: GetAllBudgetsQueryHandler,
    private readonly getBudgetsByDepartmentHandler: GetBudgetsByDepartmentQueryHandler,
    private readonly getBudgetStatusHandler: GetBudgetStatusQueryHandler
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
    request: FastifyRequest<{ Body: CreateBudgetBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createBudgetBodySchema.parse(request.body);

      const command = new CreateBudgetCommand(
        validatedBody.departmentId,
        validatedBody.categoryId,
        validatedBody.budgetAmount,
        validatedBody.fiscalPeriod,
        new Date(validatedBody.startDate),
        new Date(validatedBody.endDate)
      );

      const result = await this.createBudgetHandler.handle(command);
      reply.code(201).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdateBudgetParams;
      Body: UpdateBudgetBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateBudgetParamsSchema.parse(request.params);
      const validatedBody = updateBudgetBodySchema.parse(request.body);

      const command = new UpdateBudgetCommand(
        validatedParams.budgetId,
        validatedBody.budgetAmount
      );

      const result = await this.updateBudgetHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async adjustSpent(
    request: FastifyRequest<{
      Params: AdjustBudgetSpentParams;
      Body: AdjustBudgetSpentBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = adjustBudgetSpentParamsSchema.parse(request.params);
      const validatedBody = adjustBudgetSpentBodySchema.parse(request.body);

      const command = new AdjustBudgetSpentCommand(
        validatedParams.budgetId,
        validatedBody.amount,
        validatedBody.operation
      );

      const result = await this.adjustBudgetSpentHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: DeleteBudgetParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = deleteBudgetParamsSchema.parse(request.params);

      const command = new DeleteBudgetCommand(validatedParams.budgetId);

      const result = await this.deleteBudgetHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async activate(
    request: FastifyRequest<{ Params: { budgetId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const command = new ActivateBudgetCommand(request.params.budgetId);

      const result = await this.activateBudgetHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async deactivate(
    request: FastifyRequest<{ Params: { budgetId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const command = new DeactivateBudgetCommand(request.params.budgetId);

      const result = await this.deactivateBudgetHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetBudgetByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getBudgetByIdParamsSchema.parse(request.params);

      const query = new GetBudgetByIdQuery(validatedParams.budgetId);
      const result = await this.getBudgetByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Budget not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllBudgetsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllBudgetsQuerySchema.parse(request.query);

      const query = new GetAllBudgetsQueryClass(
        validatedQuery.departmentId,
        validatedQuery.categoryId,
        validatedQuery.fiscalPeriod,
        validatedQuery.isActive,
        validatedQuery.isOverBudget,
        validatedQuery.isNearLimit
      );

      const result = await this.getAllBudgetsHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByDepartment(
    request: FastifyRequest<{ Params: { departmentId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = new GetBudgetsByDepartmentQueryClass(
        request.params.departmentId
      );

      const result = await this.getBudgetsByDepartmentHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getStatus(
    request: FastifyRequest<{
      Querystring: { departmentId: string; categoryId: string; fiscalPeriod: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { departmentId, categoryId, fiscalPeriod } = request.query;

      const query = new GetBudgetStatusQueryClass(
        departmentId,
        categoryId,
        fiscalPeriod
      );

      const result = await this.getBudgetStatusHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
