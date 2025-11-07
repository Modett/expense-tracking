import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

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
  constructor() {
    // TODO: Add command and query handlers when they're implemented
    // private readonly createExpenseHandler: CreateExpenseCommandHandler,
    // private readonly updateExpenseHandler: UpdateExpenseCommandHandler,
    // private readonly deleteExpenseHandler: DeleteExpenseCommandHandler,
    // private readonly getExpenseByIdHandler: GetExpenseByIdQueryHandler,
    // private readonly getAllExpensesHandler: GetAllExpensesQueryHandler,
    // private readonly submitExpenseHandler: SubmitExpenseCommandHandler,
    // private readonly approveExpenseHandler: ApproveExpenseCommandHandler,
    // private readonly rejectExpenseHandler: RejectExpenseCommandHandler,
    // private readonly cancelExpenseHandler: CancelExpenseCommandHandler
  }

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

      // TODO: Implement when CreateExpenseCommandHandler is ready
      // const command = new CreateExpenseCommand(validatedBody);
      // const result = await this.createExpenseHandler.handle(command);

      // Temporary response
      reply.code(201).send({
        success: true,
        message: "Expense creation endpoint ready (implementation pending)",
        data: { id: "temp-uuid", ...validatedBody },
      });
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

      // TODO: Implement when GetExpenseByIdQueryHandler is ready
      // const query = new GetExpenseByIdQuery(validatedParams.expenseId);
      // const result = await this.getExpenseByIdHandler.handle(query);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Get expense by ID endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId },
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

      // TODO: Implement when GetAllExpensesQueryHandler is ready
      // const query = new GetAllExpensesQuery(validatedQuery);
      // const result = await this.getAllExpensesHandler.handle(query);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Get all expenses endpoint ready (implementation pending)",
        data: {
          expenses: [],
          pagination: {
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            total: 0,
          },
        },
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

      // TODO: Implement when UpdateExpenseCommandHandler is ready
      // const command = new UpdateExpenseCommand(validatedParams.expenseId, validatedBody);
      // const result = await this.updateExpenseHandler.handle(command);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Update expense endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId, ...validatedBody },
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

      // TODO: Implement when DeleteExpenseCommandHandler is ready
      // const command = new DeleteExpenseCommand(validatedParams.expenseId);
      // await this.deleteExpenseHandler.handle(command);

      // Temporary response
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

      // TODO: Implement when SubmitExpenseCommandHandler is ready
      // const command = new SubmitExpenseCommand(validatedParams.expenseId);
      // const result = await this.submitExpenseHandler.handle(command);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Submit expense endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId, status: "SUBMITTED" },
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async approve(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      // TODO: Implement when ApproveExpenseCommandHandler is ready
      // const command = new ApproveExpenseCommand(validatedParams.expenseId);
      // const result = await this.approveExpenseHandler.handle(command);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Approve expense endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId, status: "APPROVED" },
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async reject(
    request: FastifyRequest<{ Params: ExpenseIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);

      // TODO: Implement when RejectExpenseCommandHandler is ready
      // const command = new RejectExpenseCommand(validatedParams.expenseId);
      // const result = await this.rejectExpenseHandler.handle(command);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Reject expense endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId, status: "REJECTED" },
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

      // TODO: Implement when CancelExpenseCommandHandler is ready
      // const command = new CancelExpenseCommand(validatedParams.expenseId);
      // const result = await this.cancelExpenseHandler.handle(command);

      // Temporary response
      reply.code(200).send({
        success: true,
        message: "Cancel expense endpoint ready (implementation pending)",
        data: { id: validatedParams.expenseId, status: "CANCELLED" },
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
