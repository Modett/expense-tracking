import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateTagCommandHandler } from "../../../application/commands/create-tag/handler.js";
import { CreateTagCommand } from "../../../application/commands/create-tag/command.js";
import { UpdateTagCommandHandler } from "../../../application/commands/update-tag/handler.js";
import { UpdateTagCommand } from "../../../application/commands/update-tag/command.js";
import { DeleteTagCommandHandler } from "../../../application/commands/delete-tag/handler.js";
import { DeleteTagCommand } from "../../../application/commands/delete-tag/command.js";
import { ActivateTagCommandHandler } from "../../../application/commands/activate-tag/handler.js";
import { ActivateTagCommand } from "../../../application/commands/activate-tag/command.js";
import { DeactivateTagCommandHandler } from "../../../application/commands/deactivate-tag/handler.js";
import { DeactivateTagCommand } from "../../../application/commands/deactivate-tag/command.js";
import { GetTagByIdQueryHandler } from "../../../application/queries/get-tag-by-id/handler.js";
import { GetTagByIdQuery } from "../../../application/queries/get-tag-by-id/query.js";
import { GetAllTagsQueryHandler } from "../../../application/queries/get-all-tags/handler.js";
import { GetAllTagsQuery } from "../../../application/queries/get-all-tags/query.js";
import {
  createTagBodySchema,
  type CreateTagBody,
} from "../validators/create-tag.validator.js";
import {
  updateTagParamsSchema,
  updateTagBodySchema,
  type UpdateTagParams,
  type UpdateTagBody,
} from "../validators/update-tag.validator.js";
import {
  getTagByIdParamsSchema,
  type GetTagByIdParams,
} from "../validators/get-tag-by-id.validator.js";
import {
  getAllTagsQuerySchema,
  type GetAllTagsQuery as GetAllTagsQueryType,
} from "../validators/get-all-tags.validator.js";
import { tagIdParamSchema, type TagIdParam } from "../validators/tag-id-param.validator.js";

export class TagController {
  constructor(
    private readonly createTagHandler: CreateTagCommandHandler,
    private readonly updateTagHandler: UpdateTagCommandHandler,
    private readonly deleteTagHandler: DeleteTagCommandHandler,
    private readonly activateTagHandler: ActivateTagCommandHandler,
    private readonly deactivateTagHandler: DeactivateTagCommandHandler,
    private readonly getTagByIdHandler: GetTagByIdQueryHandler,
    private readonly getAllTagsHandler: GetAllTagsQueryHandler
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateTagBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createTagBodySchema.parse(request.body);
      const command = new CreateTagCommand(validatedBody.name, validatedBody.type);
      const result = await this.createTagHandler.handle(command);
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
    request: FastifyRequest<{ Params: UpdateTagParams; Body: UpdateTagBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateTagParamsSchema.parse(request.params);
      const validatedBody = updateTagBodySchema.parse(request.body);
      const command = new UpdateTagCommand(
        validatedParams.id,
        validatedBody.name,
        validatedBody.type
      );
      await this.updateTagHandler.handle(command);
      reply.code(200).send({ message: "Tag updated successfully" });
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
    request: FastifyRequest<{ Params: TagIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = tagIdParamSchema.parse(request.params);
      const command = new DeleteTagCommand(validatedParams.id);
      await this.deleteTagHandler.handle(command);
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
    request: FastifyRequest<{ Params: TagIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = tagIdParamSchema.parse(request.params);
      const command = new ActivateTagCommand(validatedParams.id);
      await this.activateTagHandler.handle(command);
      reply.code(200).send({ message: "Tag activated successfully" });
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
    request: FastifyRequest<{ Params: TagIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = tagIdParamSchema.parse(request.params);
      const command = new DeactivateTagCommand(validatedParams.id);
      await this.deactivateTagHandler.handle(command);
      reply.code(200).send({ message: "Tag deactivated successfully" });
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
    request: FastifyRequest<{ Params: GetTagByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getTagByIdParamsSchema.parse(request.params);
      const query = new GetTagByIdQuery(validatedParams.id);
      const result = await this.getTagByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Tag not found" });
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
    request: FastifyRequest<{ Querystring: GetAllTagsQueryType }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllTagsQuerySchema.parse(request.query);
      const query = new GetAllTagsQuery(
        validatedQuery.limit,
        validatedQuery.offset,
        validatedQuery.isActive,
        validatedQuery.type,
        validatedQuery.searchTerm
      );
      const result = await this.getAllTagsHandler.handle(query);
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
