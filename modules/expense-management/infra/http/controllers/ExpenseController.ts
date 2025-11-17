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
import { ExpenseCSVImportService } from "../../../application/services/ExpenseCSVImportService.js";
import { ExpenseMonthlyReportService } from "../../../application/services/ExpenseMonthlyReportService.js";
import { ExpenseAIAnalyticsService } from "../../../application/services/ExpenseAIAnalyticsService.js";

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
import {
  submitExpenseBodySchema,
  type SubmitExpenseBody,
} from "../validators/submit-expense.validator.js";

export class ExpenseController {
  constructor(
    private readonly createExpenseHandler: CreateExpenseCommandHandler,
    private readonly updateExpenseHandler: UpdateExpenseCommandHandler,
    private readonly deleteExpenseHandler: DeleteExpenseCommandHandler,
    private readonly getExpenseByIdHandler: GetExpenseByIdQueryHandler,
    private readonly getAllExpensesHandler: GetAllExpensesQueryHandler,
    private readonly submitExpenseHandler: SubmitExpenseCommandHandler,
    private readonly cancelExpenseHandler: CancelExpenseCommandHandler,
    private readonly getExpenseAggregationsHandler: GetExpenseAggregationsQueryHandler,
    private readonly csvExportService: ExpenseCSVExportService,
    private readonly csvImportService: ExpenseCSVImportService,
    private readonly monthlyReportService: ExpenseMonthlyReportService,
    private readonly aiAnalyticsService: ExpenseAIAnalyticsService
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
        validatedBody.departmentId ?? null, // Convert undefined to null
        validatedBody.description,
        validatedBody.netAmount,
        validatedBody.taxAmount,
        validatedBody.totalAmount,
        new Date(validatedBody.expenseDate),
        undefined, // priority
        undefined, // budgetOverride
        undefined, // justification
        validatedBody.receiptUrl ?? undefined, // Convert null to undefined
        validatedBody.tagIds ?? []
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
        validatedQuery.priority,
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
    request: FastifyRequest<{
      Params: ExpenseIdParam;
      Body: SubmitExpenseBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = expenseIdParamSchema.parse(request.params);
      const validatedBody = submitExpenseBodySchema.parse(request.body || {});

      const command = new SubmitExpenseCommand(
        validatedParams.expenseId,
        validatedBody.budgetOverride,
        validatedBody.justification
      );
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

  async exportToCSV(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const queryParams = request.query as any;

      // Build filters with value objects
      const filters: any = {};

      if (queryParams.status) {
        const { ExpenseStatus } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.status = ExpenseStatus.fromString(queryParams.status);
      }
      if (queryParams.userId) {
        const { UserId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.userId = UserId.fromString(queryParams.userId);
      }
      if (queryParams.vendorId) {
        const { VendorId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.vendorId = VendorId.fromString(queryParams.vendorId);
      }
      if (queryParams.categoryId) {
        const { CategoryId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.categoryId = CategoryId.fromString(queryParams.categoryId);
      }
      if (queryParams.departmentId) {
        const { DepartmentId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.departmentId = DepartmentId.fromString(
          queryParams.departmentId
        );
      }

      const filePath = await this.csvExportService.exportToCSV(filters);

      const fs = await import("fs");
      const fileStream = fs.createReadStream(filePath);

      reply.header("Content-Type", "text/csv");
      reply.header(
        "Content-Disposition",
        `attachment; filename="expenses-export.csv"`
      );
      reply.send(fileStream);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async importFromCSV(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const data = await (request as any).file();
      if (!data) {
        reply.code(400).send({ error: "No file uploaded" });
        return;
      }

      const fs = await import("fs");
      const path = await import("path");
      const uploadPath = path.join("./exports", `import-${Date.now()}.csv`);

      await fs.promises.writeFile(uploadPath, await data.toBuffer());

      const result = await this.csvImportService.importFromCSV(uploadPath);

      await fs.promises.unlink(uploadPath);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async generateMonthlyReport(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const queryParams = request.query as any;

      // Validate required parameters
      if (!queryParams.month || !queryParams.year) {
        reply.code(400).send({
          error: "Month and year are required (e.g., ?month=1&year=2025)",
        });
        return;
      }

      const month = parseInt(queryParams.month);
      const year = parseInt(queryParams.year);

      if (month < 1 || month > 12) {
        reply.code(400).send({ error: "Month must be between 1 and 12" });
        return;
      }

      // Parse optional array parameter (tagIds)
      let tagIds: string[] | undefined;
      if (queryParams.tagIds) {
        tagIds = Array.isArray(queryParams.tagIds)
          ? queryParams.tagIds
          : [queryParams.tagIds];
      }

      // Generate the report
      const filePath = await this.monthlyReportService.generateMonthlyReport({
        month,
        year,
        departmentId: queryParams.departmentId,
        userId: queryParams.userId,
        categoryId: queryParams.categoryId,
        vendorId: queryParams.vendorId,
        status: queryParams.status,
        minAmount: queryParams.minAmount
          ? parseFloat(queryParams.minAmount)
          : undefined,
        maxAmount: queryParams.maxAmount
          ? parseFloat(queryParams.maxAmount)
          : undefined,
        tagIds,
      });

      // Stream the file
      const fs = await import("fs");
      const path = await import("path");

      // Verify file exists before streaming
      if (!fs.existsSync(filePath)) {
        reply.code(500).send({
          error: "Report file was generated but could not be found",
          details: filePath
        });
        return;
      }

      const fileStats = fs.statSync(filePath);
      console.log(`Sending report file: ${filePath} (${fileStats.size} bytes)`);

      const fileStream = fs.createReadStream(filePath);

      const monthName = new Date(year, month - 1).toLocaleString("default", {
        month: "long",
      });

      reply.header("Content-Type", "text/csv");
      reply.header("Content-Length", fileStats.size.toString());
      reply.header(
        "Content-Disposition",
        `attachment; filename="monthly-report-${monthName}-${year}.csv"`
      );

      fileStream.on('error', (error) => {
        console.error('Error reading file stream:', error);
        reply.code(500).send({ error: "Failed to stream report file" });
      });

      reply.send(fileStream);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAIAnalytics(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const queryParams = request.query as any;

      // Build filters with value objects
      const filters: any = {};

      if (queryParams.status) {
        const { ExpenseStatus } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.status = ExpenseStatus.fromString(queryParams.status);
      }
      if (queryParams.userId) {
        const { UserId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.userId = UserId.fromString(queryParams.userId);
      }
      if (queryParams.vendorId) {
        const { VendorId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.vendorId = VendorId.fromString(queryParams.vendorId);
      }
      if (queryParams.categoryId) {
        const { CategoryId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.categoryId = CategoryId.fromString(queryParams.categoryId);
      }
      if (queryParams.departmentId) {
        const { DepartmentId } = await import(
          "../../../domain/value-objects/index.js"
        );
        filters.departmentId = DepartmentId.fromString(
          queryParams.departmentId
        );
      }
      if (queryParams.dateFrom) {
        filters.dateFrom = new Date(queryParams.dateFrom);
      }
      if (queryParams.dateTo) {
        filters.dateTo = new Date(queryParams.dateTo);
      }

      const insights = await this.aiAnalyticsService.analyzeExpenses(filters);

      reply.code(200).send({
        success: true,
        data: { insights },
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
