import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateCategoryCommandHandler } from "../../../application/commands/create-category/handler.js";
import { CreateCategoryCommand } from "../../../application/commands/create-category/command.js";
import { UpdateCategoryCommandHandler } from "../../../application/commands/update-category/handler.js";
import { UpdateCategoryCommand } from "../../../application/commands/update-category/command.js";
import { DeleteCategoryCommandHandler } from "../../../application/commands/delete-category/handler.js";
import { DeleteCategoryCommand } from "../../../application/commands/delete-category/command.js";
import { ActivateCategoryCommandHandler } from "../../../application/commands/activate-category/handler.js";
import { ActivateCategoryCommand } from "../../../application/commands/activate-category/command.js";
import { DeactivateCategoryCommandHandler } from "../../../application/commands/deactivate-category/handler.js";
import { DeactivateCategoryCommand } from "../../../application/commands/deactivate-category/command.js";
import { GetCategoryByIdQueryHandler } from "../../../application/queries/get-category-by-id/handler.js";
import { GetCategoryByIdQuery } from "../../../application/queries/get-category-by-id/query.js";
import { GetAllCategoriesQueryHandler } from "../../../application/queries/get-all-categories/handler.js";
import { GetAllCategoriesQuery } from "../../../application/queries/get-all-categories/query.js";
import {
  createCategoryBodySchema,
  type CreateCategoryBody,
} from "../validators/create-category.validator.js";
import {
  updateCategoryParamsSchema,
  updateCategoryBodySchema,
  type UpdateCategoryParams,
  type UpdateCategoryBody,
} from "../validators/update-category.validator.js";
import {
  getCategoryByIdParamsSchema,
  type GetCategoryByIdParams,
} from "../validators/get-category-by-id.validator.js";
import {
  getAllCategoriesQuerySchema,
  type GetAllCategoriesQuery as GetAllCategoriesQueryType,
} from "../validators/get-all-categories.validator.js";
import { categoryIdParamSchema, type CategoryIdParam } from "../validators/category-id-param.validator.js";

export class CategoryController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryCommandHandler,
    private readonly updateCategoryHandler: UpdateCategoryCommandHandler,
    private readonly deleteCategoryHandler: DeleteCategoryCommandHandler,
    private readonly activateCategoryHandler: ActivateCategoryCommandHandler,
    private readonly deactivateCategoryHandler: DeactivateCategoryCommandHandler,
    private readonly getCategoryByIdHandler: GetCategoryByIdQueryHandler,
    private readonly getAllCategoriesHandler: GetAllCategoriesQueryHandler
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateCategoryBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createCategoryBodySchema.parse(request.body);
      const command = new CreateCategoryCommand(validatedBody.name, validatedBody.description);
      const result = await this.createCategoryHandler.handle(command);
      reply.code(201).send(result);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{ Params: UpdateCategoryParams; Body: UpdateCategoryBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateCategoryParamsSchema.parse(request.params);
      const validatedBody = updateCategoryBodySchema.parse(request.body);
      const command = new UpdateCategoryCommand(
        validatedParams.id,
        validatedBody.name,
        validatedBody.description
      );
      const result = await this.updateCategoryHandler.handle(command);
      reply.code(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          reply.code(404).send({ error: error.message });
        } else {
          reply.code(400).send({ error: error.message });
        }
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async delete(
    request: FastifyRequest<{ Params: CategoryIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = categoryIdParamSchema.parse(request.params);
      const command = new DeleteCategoryCommand(validatedParams.id);
      await this.deleteCategoryHandler.handle(command);
      reply.code(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          reply.code(404).send({ error: error.message });
        } else {
          reply.code(400).send({ error: error.message });
        }
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async activate(
    request: FastifyRequest<{ Params: CategoryIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = categoryIdParamSchema.parse(request.params);
      const command = new ActivateCategoryCommand(validatedParams.id);
      await this.activateCategoryHandler.handle(command);
      reply.code(200).send({ message: "Category activated successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          reply.code(404).send({ error: error.message });
        } else {
          reply.code(400).send({ error: error.message });
        }
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async deactivate(
    request: FastifyRequest<{ Params: CategoryIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = categoryIdParamSchema.parse(request.params);
      const command = new DeactivateCategoryCommand(validatedParams.id);
      await this.deactivateCategoryHandler.handle(command);
      reply.code(200).send({ message: "Category deactivated successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          reply.code(404).send({ error: error.message });
        } else {
          reply.code(400).send({ error: error.message });
        }
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetCategoryByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getCategoryByIdParamsSchema.parse(request.params);
      const query = new GetCategoryByIdQuery(validatedParams.id);
      const result = await this.getCategoryByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Category not found" });
        return;
      }

      reply.code(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllCategoriesQueryType }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllCategoriesQuerySchema.parse(request.query);
      const query = new GetAllCategoriesQuery(
        validatedQuery.limit,
        validatedQuery.offset,
        validatedQuery.isActive,
        validatedQuery.searchTerm
      );
      const result = await this.getAllCategoriesHandler.handle(query);
      reply.code(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }
}
