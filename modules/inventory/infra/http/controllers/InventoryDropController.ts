import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { CreateInventoryDropCommandHandler } from "../../../application/commands/create-inventory-drop/handler.js";
import { CreateInventoryDropCommand } from "../../../application/commands/create-inventory-drop/command.js";
import { UpdateInventoryDropCommandHandler } from "../../../application/commands/update-inventory-drop/handler.js";
import { UpdateInventoryDropCommand } from "../../../application/commands/update-inventory-drop/command.js";
import { DeleteInventoryDropCommandHandler } from "../../../application/commands/delete-inventory-drop/handler.js";
import { DeleteInventoryDropCommand } from "../../../application/commands/delete-inventory-drop/command.js";

// Query imports
import { GetInventoryDropByIdQueryHandler } from "../../../application/queries/get-inventory-drop-by-id/handler.js";
import { GetInventoryDropByIdQuery } from "../../../application/queries/get-inventory-drop-by-id/query.js";
import { GetAllInventoryDropsQueryHandler } from "../../../application/queries/get-all-inventory-drops/handler.js";
import { GetAllInventoryDropsQuery as GetAllInventoryDropsQueryClass } from "../../../application/queries/get-all-inventory-drops/query.js";
import { GetInventoryDropByDropNumberQueryHandler } from "../../../application/queries/get-inventory-drop-by-drop-number/handler.js";
import { GetInventoryDropByDropNumberQuery as GetInventoryDropByDropNumberQueryClass } from "../../../application/queries/get-inventory-drop-by-drop-number/query.js";
import { GetInventoryDropsByFabricTypeQueryHandler } from "../../../application/queries/get-inventory-drops-by-fabric-type/handler.js";
import { GetInventoryDropsByFabricTypeQuery as GetInventoryDropsByFabricTypeQueryClass } from "../../../application/queries/get-inventory-drops-by-fabric-type/query.js";

// Validators
import {
  createInventoryDropBodySchema,
  type CreateInventoryDropBody,
} from "../validators/create-inventory-drop.validator.js";
import {
  updateInventoryDropParamsSchema,
  updateInventoryDropBodySchema,
  type UpdateInventoryDropParams,
  type UpdateInventoryDropBody,
} from "../validators/update-inventory-drop.validator.js";
import {
  deleteInventoryDropParamsSchema,
  type DeleteInventoryDropParams,
} from "../validators/delete-inventory-drop.validator.js";
import {
  getInventoryDropByIdParamsSchema,
  type GetInventoryDropByIdParams,
} from "../validators/get-inventory-drop-by-id.validator.js";
import {
  getAllInventoryDropsQuerySchema,
  type GetAllInventoryDropsQuery,
} from "../validators/get-all-inventory-drops.validator.js";
import {
  getInventoryDropByDropNumberParamsSchema,
  type GetInventoryDropByDropNumberParams,
} from "../validators/get-inventory-drop-by-drop-number.validator.js";
import {
  getInventoryDropsByFabricTypeParamsSchema,
  type GetInventoryDropsByFabricTypeParams,
} from "../validators/get-inventory-drops-by-fabric-type.validator.js";

export class InventoryDropController {
  constructor(
    private readonly createInventoryDropHandler: CreateInventoryDropCommandHandler,
    private readonly updateInventoryDropHandler: UpdateInventoryDropCommandHandler,
    private readonly deleteInventoryDropHandler: DeleteInventoryDropCommandHandler,
    private readonly getInventoryDropByIdHandler: GetInventoryDropByIdQueryHandler,
    private readonly getAllInventoryDropsHandler: GetAllInventoryDropsQueryHandler,
    private readonly getInventoryDropByDropNumberHandler: GetInventoryDropByDropNumberQueryHandler,
    private readonly getInventoryDropsByFabricTypeHandler: GetInventoryDropsByFabricTypeQueryHandler
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

  async create(
    request: FastifyRequest<{ Body: CreateInventoryDropBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createInventoryDropBodySchema.parse(request.body);

      const command = new CreateInventoryDropCommand(
        validatedBody.dropNumber,
        validatedBody.fabricType,
        validatedBody.quantity,
        validatedBody.unitCost,
        validatedBody.receivedOn,
        validatedBody.supplier
      );

      const result = await this.createInventoryDropHandler.handle(command);
      reply.code(201).send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdateInventoryDropParams;
      Body: UpdateInventoryDropBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateInventoryDropParamsSchema.parse(request.params);
      const validatedBody = updateInventoryDropBodySchema.parse(request.body);

      const command = new UpdateInventoryDropCommand(
        validatedParams.id,
        validatedBody.quantity,
        validatedBody.unitCost,
        validatedBody.supplier,
        validatedBody.receivedOn
      );

      const result = await this.updateInventoryDropHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: DeleteInventoryDropParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = deleteInventoryDropParamsSchema.parse(request.params);

      const command = new DeleteInventoryDropCommand(validatedParams.id);

      const result = await this.deleteInventoryDropHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetInventoryDropByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getInventoryDropByIdParamsSchema.parse(request.params);

      const query = new GetInventoryDropByIdQuery(validatedParams.id);
      const result = await this.getInventoryDropByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Inventory drop not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllInventoryDropsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllInventoryDropsQuerySchema.parse(request.query);

      const query = new GetAllInventoryDropsQueryClass(
        validatedQuery.fabricType,
        validatedQuery.supplier,
        validatedQuery.receivedDateFrom,
        validatedQuery.receivedDateTo,
        validatedQuery.minQuantity,
        validatedQuery.maxQuantity,
        validatedQuery.minTotalCost,
        validatedQuery.maxTotalCost
      );

      const result = await this.getAllInventoryDropsHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByDropNumber(
    request: FastifyRequest<{ Params: GetInventoryDropByDropNumberParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getInventoryDropByDropNumberParamsSchema.parse(request.params);

      const query = new GetInventoryDropByDropNumberQueryClass(validatedParams.dropNumber);

      const result = await this.getInventoryDropByDropNumberHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Inventory drop not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByFabricType(
    request: FastifyRequest<{ Params: GetInventoryDropsByFabricTypeParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getInventoryDropsByFabricTypeParamsSchema.parse(request.params);

      const query = new GetInventoryDropsByFabricTypeQueryClass(validatedParams.fabricType);

      const result = await this.getInventoryDropsByFabricTypeHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
