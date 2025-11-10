import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { CreateExpenseCommandHandler } from "../../../application/commands/create-expense/handler.js";
import { CreateExpenseCommand } from "../../../application/commands/create-expense/command.js";
import { UpdateExpenseCommandHandler } from "../../../application/commands/update-expense/handler.js";
import { UpdateExpenseCommand } from "../../../application/commands/update-expense/command.js";
import { DeleteExpenseCommandHandler } from "../../../application/commands/delete-expense/handler.js";
import { DeleteExpenseCommand } from "../../../application/commands/delete-expense/command.js";
import { SubmitExpenseCommandHandler } from "../../../application/commands/submit-expense/handler.js";
import { SubmitExpenseCommand } from "../../../application/commands/submit-expense/command.js";
import { CancelExpenseCommandHandler } from "../../../application/commands/cancel-expense/handler.js";
import { CancelExpenseCommand } from "../../../application/commands/cancel-expense/command.js";

// Query imports
import { GetExpenseByIdQueryHandler } from "../../../application/queries/get-expense-by-id/handler.js";
import { GetExpenseByIdQuery } from "../../../application/queries/get-expense-by-id/query.js";
import { GetAllExpensesQueryHandler } from "../../../application/queries/get-all-expenses/handler.js";
import { GetAllExpensesQuery as GetAllExpensesQueryClass } from "../../../application/queries/get-all-expenses/query.js";
import { GetExpenseAggregationsQueryHandler } from "../../../application/queries/get-expense-aggregations/handler.js";
import { GetExpenseAggregationsQuery } from "../../../application/queries/get-expense-aggregations/query.js";

// Services
import { ExpenseCSVExportService } from "../../../application/services/ExpenseCSVExportService.js";

// Validators
import {
  createExpenseBodySchema,
  type CreateExpenseBody,
} from "../validators/create-expense.validator.js";
import {
  updateExpenseParamsSchema,
  updateExpenseBodySchema,
  type UpdateExpenseParams,
  type UpdateExpenseBody,
} from "../validators/update-expense.validator.js";
import {
  expenseIdParamSchema,
  type ExpenseIdParam,
} from "../validators/expense-id-param.validator.js";
import {
  getAllExpensesQuerySchema,
  type GetAllExpensesQuery,
} from "../validators/get-all-expenses.validator.js";

export class ExpenseController {
  constructor(
    private readonly createExpenseHandler: CreateExpenseCommandHandler,
    private readonly updateExpenseHandler: UpdateExpenseCommandHandler,
    private readonly deleteExpenseHandler: DeleteExpenseCommandHandler,
    private readonly getExpenseByIdHandler: GetExpenseByIdQueryHandler,
    private readonly getAllExpensesHandler: GetAllExpensesQueryHandler,
    private readonly submitExpenseHandler: SubmitExpenseCommandHandler,
    private readonly cancelExpenseHandler: CancelExpenseCommandHandler,
    private readonly getExpenseAggregationsHandler: GetExpenseAggregationsQueryHandler
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
      } else {
        reply.code(400).send({ error: error.message });
      }
    } else {
      reply.code(500).send({ error: "Internal server error" });
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateExpenseBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createExpenseBodySchema.parse(request.body);

      // Get the authenticated user ID from the JWT token (set by authenticate middleware)
      const authenticatedUser = request.user as any;
      if (!authenticatedUser || !authenticatedUser.userId) {
        reply
          .code(401)
          .send({ error: "Unable to identify authenticated user" });
        return;
      }

      const command = new CreateExpenseCommand(
        authenticatedUser.userId, // Use authenticated user's ID instead of request body
        validatedBody.vendorId,
        validatedBody.categoryId,
        validatedBody.departmentId,
        validatedBody.description,
        validatedBody.netAmount,
        validatedBody.taxAmount,
        validatedBody.totalAmount,
        new Date(validatedBody.expenseDate),
        validatedBody.receiptUrl
      );

      const result = await this.createExpenseHandler.handle(command);
      reply.code(201).send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      const query = new GetExpenseByIdQuery(validatedParams.expenseId);
      const result = await this.getExpenseByIdHandler.handle(query);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllExpensesQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllExpensesQuerySchema.parse(request.query);

      const query = new GetAllExpensesQueryClass(
        validatedQuery.userId,
        validatedQuery.status,
        validatedQuery.categoryId,
        validatedQuery.departmentId,
        validatedQuery.vendorId,
        undefined, // fromDate
        undefined, // toDate
        validatedQuery.page,
        validatedQuery.limit
      );

      const result = await this.getAllExpensesHandler.handle(query);
      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdateExpenseParams;
      Body: UpdateExpenseBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateExpenseParamsSchema.parse(request.params);
      const validatedBody = updateExpenseBodySchema.parse(request.body);

      const command = new UpdateExpenseCommand(
        validatedParams.expenseId,
        validatedBody.vendorId,
        validatedBody.categoryId,
        validatedBody.departmentId,
        validatedBody.description,
        validatedBody.netAmount,
        validatedBody.taxAmount,
        validatedBody.totalAmount,
        validatedBody.expenseDate
          ? new Date(validatedBody.expenseDate)
          : undefined,
        validatedBody.receiptUrl
      );

      const result = await this.updateExpenseHandler.handle(command);
      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      const command = new DeleteExpenseCommand(validatedParams.expenseId);
      await this.deleteExpenseHandler.handle(command);

      reply.code(204).send();
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async submit(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      const command = new SubmitExpenseCommand(validatedParams.expenseId);
      const result = await this.submitExpenseHandler.handle(command);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async cancel(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      const command = new CancelExpenseCommand(validatedParams.expenseId);
      const result = await this.cancelExpenseHandler.handle(command);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAggregations(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const queryParams = request.query as any;

      // Parse groupBy as array if it's a string
      let groupBy: string[] | undefined;
      if (queryParams.groupBy) {
        groupBy = Array.isArray(queryParams.groupBy)
          ? queryParams.groupBy
          : queryParams.groupBy.split(",");
      }

      const query = new GetExpenseAggregationsQuery(
        queryParams.status,
        queryParams.userId,
        queryParams.vendorId,
        queryParams.categoryId,
        queryParams.departmentId,
        queryParams.dateFrom,
        queryParams.dateTo,
        groupBy
      );

      const result = await this.getExpenseAggregationsHandler.handle(query);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
