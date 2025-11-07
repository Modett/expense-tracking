import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { AddTagToExpenseCommandHandler } from "../../../application/commands/add-tag-to-expense/handler.js";
import { AddTagToExpenseCommand } from "../../../application/commands/add-tag-to-expense/command.js";
import { RemoveTagFromExpenseCommandHandler } from "../../../application/commands/remove-tag-from-expense/handler.js";
import { RemoveTagFromExpenseCommand } from "../../../application/commands/remove-tag-from-expense/command.js";
import { AddTagsToExpenseCommandHandler } from "../../../application/commands/add-tags-to-expense/handler.js";
import { AddTagsToExpenseCommand } from "../../../application/commands/add-tags-to-expense/command.js";
import { AddTagToExpensesCommandHandler } from "../../../application/commands/add-tag-to-expenses/handler.js";
import { AddTagToExpensesCommand } from "../../../application/commands/add-tag-to-expenses/command.js";
import { RemoveTagsFromExpenseCommandHandler } from "../../../application/commands/remove-tags-from-expense/handler.js";
import { RemoveTagsFromExpenseCommand } from "../../../application/commands/remove-tags-from-expense/command.js";
import { RemoveTagFromExpensesCommandHandler } from "../../../application/commands/remove-tag-from-expenses/handler.js";
import { RemoveTagFromExpensesCommand } from "../../../application/commands/remove-tag-from-expenses/command.js";
import { ReplaceExpenseTagsCommandHandler } from "../../../application/commands/replace-expense-tags/handler.js";
import { ReplaceExpenseTagsCommand } from "../../../application/commands/replace-expense-tags/command.js";
import { ClearExpenseTagsCommandHandler } from "../../../application/commands/clear-expense-tags/handler.js";
import { ClearExpenseTagsCommand } from "../../../application/commands/clear-expense-tags/command.js";

// Query imports
import { GetExpenseTagsQueryHandler } from "../../../application/queries/get-expense-tags/handler.js";
import { GetExpenseTagsQuery } from "../../../application/queries/get-expense-tags/query.js";
import { GetExpensesByTagQueryHandler } from "../../../application/queries/get-expenses-by-tag/handler.js";
import { GetExpensesByTagQuery } from "../../../application/queries/get-expenses-by-tag/query.js";
import { GetExpensesByAllTagsQueryHandler } from "../../../application/queries/get-expenses-by-all-tags/handler.js";
import { GetExpensesByAllTagsQuery } from "../../../application/queries/get-expenses-by-all-tags/query.js";
import { GetExpensesByAnyTagsQueryHandler } from "../../../application/queries/get-expenses-by-any-tags/handler.js";
import { GetExpensesByAnyTagsQuery } from "../../../application/queries/get-expenses-by-any-tags/query.js";
import {
  addTagToExpenseParamsSchema,
  addTagToExpenseBodySchema,
  type AddTagToExpenseParams,
  type AddTagToExpenseBody,
} from "../validators/add-tag-to-expense.validator.js";
import {
  addTagsToExpenseParamsSchema,
  addTagsToExpenseBodySchema,
  type AddTagsToExpenseParams,
  type AddTagsToExpenseBody,
} from "../validators/add-tags-to-expense.validator.js";
import {
  addTagToExpensesBodySchema,
  type AddTagToExpensesBody,
} from "../validators/add-tag-to-expenses.validator.js";
import {
  removeTagFromExpenseParamsSchema,
  type RemoveTagFromExpenseParams,
} from "../validators/remove-tag-from-expense.validator.js";
import {
  removeTagsFromExpenseParamsSchema,
  removeTagsFromExpenseBodySchema,
  type RemoveTagsFromExpenseParams,
  type RemoveTagsFromExpenseBody,
} from "../validators/remove-tags-from-expense.validator.js";
import {
  removeTagFromExpensesBodySchema,
  type RemoveTagFromExpensesBody,
} from "../validators/remove-tag-from-expenses.validator.js";
import {
  replaceExpenseTagsParamsSchema,
  replaceExpenseTagsBodySchema,
  type ReplaceExpenseTagsParams,
  type ReplaceExpenseTagsBody,
} from "../validators/replace-expense-tags.validator.js";
import {
  clearExpenseTagsParamsSchema,
  type ClearExpenseTagsParams,
} from "../validators/clear-expense-tags.validator.js";
import {
  getExpenseTagsParamsSchema,
  type GetExpenseTagsParams,
} from "../validators/get-expense-tags.validator.js";
import {
  getExpensesByTagParamsSchema,
  type GetExpensesByTagParams,
} from "../validators/get-expenses-by-tag.validator.js";
import {
  getExpensesByTagsQuerySchema,
  type GetExpensesByTagsQuery,
} from "../validators/get-expenses-by-tags.validator.js";

export class ExpenseTagController {
  constructor(
    private readonly addTagToExpenseHandler: AddTagToExpenseCommandHandler,
    private readonly removeTagFromExpenseHandler: RemoveTagFromExpenseCommandHandler,
    private readonly addTagsToExpenseHandler: AddTagsToExpenseCommandHandler,
    private readonly addTagToExpensesHandler: AddTagToExpensesCommandHandler,
    private readonly removeTagsFromExpenseHandler: RemoveTagsFromExpenseCommandHandler,
    private readonly removeTagFromExpensesHandler: RemoveTagFromExpensesCommandHandler,
    private readonly replaceExpenseTagsHandler: ReplaceExpenseTagsCommandHandler,
    private readonly clearExpenseTagsHandler: ClearExpenseTagsCommandHandler,
    private readonly getExpenseTagsHandler: GetExpenseTagsQueryHandler,
    private readonly getExpensesByTagHandler: GetExpensesByTagQueryHandler,
    private readonly getExpensesByAllTagsHandler: GetExpensesByAllTagsQueryHandler,
    private readonly getExpensesByAnyTagsHandler: GetExpensesByAnyTagsQueryHandler
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
      } else {
        reply.code(400).send({ error: error.message });
      }
    } else {
      reply.code(500).send({ error: "Internal server error" });
    }
  }

  async addTagToExpense(
    request: FastifyRequest<{
      Params: AddTagToExpenseParams;
      Body: AddTagToExpenseBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = addTagToExpenseParamsSchema.parse(request.params);
      const validatedBody = addTagToExpenseBodySchema.parse(request.body);

      const command = new AddTagToExpenseCommand(
        validatedParams.expenseId,
        validatedBody.tagId
      );

      const result = await this.addTagToExpenseHandler.handle(command);
      reply.code(201).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async removeTagFromExpense(
    request: FastifyRequest<{ Params: RemoveTagFromExpenseParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = removeTagFromExpenseParamsSchema.parse(
        request.params
      );

      const command = new RemoveTagFromExpenseCommand(
        validatedParams.expenseId,
        validatedParams.tagId
      );

      const result = await this.removeTagFromExpenseHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async addTagsToExpense(
    request: FastifyRequest<{
      Params: AddTagsToExpenseParams;
      Body: AddTagsToExpenseBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = addTagsToExpenseParamsSchema.parse(
        request.params
      );
      const validatedBody = addTagsToExpenseBodySchema.parse(request.body);

      const command = new AddTagsToExpenseCommand(
        validatedParams.expenseId,
        validatedBody.tagIds
      );

      const result = await this.addTagsToExpenseHandler.handle(command);
      reply.code(201).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async addTagToExpenses(
    request: FastifyRequest<{ Body: AddTagToExpensesBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = addTagToExpensesBodySchema.parse(request.body);

      const command = new AddTagToExpensesCommand(
        validatedBody.expenseIds,
        validatedBody.tagId
      );

      const result = await this.addTagToExpensesHandler.handle(command);
      reply.code(201).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async removeTagsFromExpense(
    request: FastifyRequest<{
      Params: RemoveTagsFromExpenseParams;
      Body: RemoveTagsFromExpenseBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = removeTagsFromExpenseParamsSchema.parse(
        request.params
      );
      const validatedBody = removeTagsFromExpenseBodySchema.parse(request.body);

      const command = new RemoveTagsFromExpenseCommand(
        validatedParams.expenseId,
        validatedBody.tagIds
      );

      const result = await this.removeTagsFromExpenseHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async removeTagFromExpenses(
    request: FastifyRequest<{ Body: RemoveTagFromExpensesBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = removeTagFromExpensesBodySchema.parse(request.body);

      const command = new RemoveTagFromExpensesCommand(
        validatedBody.expenseIds,
        validatedBody.tagId
      );

      const result = await this.removeTagFromExpensesHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async replaceExpenseTags(
    request: FastifyRequest<{
      Params: ReplaceExpenseTagsParams;
      Body: ReplaceExpenseTagsBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = replaceExpenseTagsParamsSchema.parse(
        request.params
      );
      const validatedBody = replaceExpenseTagsBodySchema.parse(request.body);

      const command = new ReplaceExpenseTagsCommand(
        validatedParams.expenseId,
        validatedBody.tagIds
      );

      const result = await this.replaceExpenseTagsHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async clearExpenseTags(
    request: FastifyRequest<{ Params: ClearExpenseTagsParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = clearExpenseTagsParamsSchema.parse(
        request.params
      );

      const command = new ClearExpenseTagsCommand(validatedParams.expenseId);
      const result = await this.clearExpenseTagsHandler.handle(command);
      reply.code(204).send(); // No content for clear operation
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getExpenseTags(
    request: FastifyRequest<{ Params: GetExpenseTagsParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getExpenseTagsParamsSchema.parse(request.params);

      const query = new GetExpenseTagsQuery(validatedParams.expenseId);
      const result = await this.getExpenseTagsHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getExpensesByTag(
    request: FastifyRequest<{ Params: GetExpensesByTagParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getExpensesByTagParamsSchema.parse(
        request.params
      );

      const query = new GetExpensesByTagQuery(validatedParams.tagId);
      const result = await this.getExpensesByTagHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getExpensesByTags(
    request: FastifyRequest<{ Querystring: GetExpensesByTagsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getExpensesByTagsQuerySchema.parse(request.query);

      if (validatedQuery.mode === "all") {
        const query = new GetExpensesByAllTagsQuery(validatedQuery.tagIds);
        const result = await this.getExpensesByAllTagsHandler.handle(query);
        reply.code(200).send({ success: true, data: result });
      } else {
        const query = new GetExpensesByAnyTagsQuery(validatedQuery.tagIds);
        const result = await this.getExpensesByAnyTagsHandler.handle(query);
        reply.code(200).send({ success: true, data: result });
      }
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
