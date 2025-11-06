import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateVendorCommandHandler } from "../../../application/commands/create-vendor/handler.js";
import { CreateVendorCommand } from "../../../application/commands/create-vendor/command.js";
import { UpdateVendorCommandHandler } from "../../../application/commands/update-vendor/handler.js";
import { UpdateVendorCommand } from "../../../application/commands/update-vendor/command.js";
import { DeleteVendorCommandHandler } from "../../../application/commands/delete-vendor/handler.js";
import { DeleteVendorCommand } from "../../../application/commands/delete-vendor/command.js";
import { ActivateVendorCommandHandler } from "../../../application/commands/activate-vendor/handler.js";
import { ActivateVendorCommand } from "../../../application/commands/activate-vendor/command.js";
import { DeactivateVendorCommandHandler } from "../../../application/commands/deactivate-vendor/handler.js";
import { DeactivateVendorCommand } from "../../../application/commands/deactivate-vendor/command.js";
import { GetVendorByIdQueryHandler } from "../../../application/queries/get-vendor-by-id/handler.js";
import { GetVendorByIdQuery } from "../../../application/queries/get-vendor-by-id/query.js";
import { GetAllVendorsQueryHandler } from "../../../application/queries/get-all-vendors/handler.js";
import { GetAllVendorsQuery as GetAllVendorsQueryClass } from "../../../application/queries/get-all-vendors/query.js";
import {
  createVendorBodySchema,
  type CreateVendorBody,
} from "../validators/create-vendor.validator.js";
import {
  updateVendorParamsSchema,
  updateVendorBodySchema,
  type UpdateVendorParams,
  type UpdateVendorBody,
} from "../validators/update-vendor.validator.js";
import {
  getVendorByIdParamsSchema,
  type GetVendorByIdParams,
} from "../validators/get-vendor-by-id.validator.js";
import {
  getAllVendorsQuerySchema,
  type GetAllVendorsQuery as GetAllVendorsQueryType,
} from "../validators/get-all-vendors.validator.js";
import { vendorIdParamSchema, type VendorIdParam } from "../validators/vendor-id-param.validator.js";

export class VendorController {
  constructor(
    private readonly createVendorHandler: CreateVendorCommandHandler,
    private readonly updateVendorHandler: UpdateVendorCommandHandler,
    private readonly deleteVendorHandler: DeleteVendorCommandHandler,
    private readonly activateVendorHandler: ActivateVendorCommandHandler,
    private readonly deactivateVendorHandler: DeactivateVendorCommandHandler,
    private readonly getVendorByIdHandler: GetVendorByIdQueryHandler,
    private readonly getAllVendorsHandler: GetAllVendorsQueryHandler
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateVendorBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createVendorBodySchema.parse(request.body);
      const command = new CreateVendorCommand(
        validatedBody.name,
        validatedBody.gstNumber,
        validatedBody.email,
        validatedBody.phone,
        validatedBody.address
      );
      const result = await this.createVendorHandler.handle(command);
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
    request: FastifyRequest<{ Params: UpdateVendorParams; Body: UpdateVendorBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateVendorParamsSchema.parse(request.params);
      const validatedBody = updateVendorBodySchema.parse(request.body);
      const command = new UpdateVendorCommand(
        validatedParams.id,
        validatedBody.name,
        validatedBody.gstNumber,
        validatedBody.email,
        validatedBody.phone,
        validatedBody.address
      );
      const result = await this.updateVendorHandler.handle(command);
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
    request: FastifyRequest<{ Params: VendorIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = vendorIdParamSchema.parse(request.params);
      const command = new DeleteVendorCommand(validatedParams.id);
      await this.deleteVendorHandler.handle(command);
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
    request: FastifyRequest<{ Params: VendorIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = vendorIdParamSchema.parse(request.params);
      const command = new ActivateVendorCommand(validatedParams.id);
      await this.activateVendorHandler.handle(command);
      reply.code(200).send({ message: "Vendor activated successfully" });
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
    request: FastifyRequest<{ Params: VendorIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = vendorIdParamSchema.parse(request.params);
      const command = new DeactivateVendorCommand(validatedParams.id);
      await this.deactivateVendorHandler.handle(command);
      reply.code(200).send({ message: "Vendor deactivated successfully" });
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
    request: FastifyRequest<{ Params: GetVendorByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getVendorByIdParamsSchema.parse(request.params);
      const query = new GetVendorByIdQuery(validatedParams.id);
      const result = await this.getVendorByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Vendor not found" });
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
    request: FastifyRequest<{ Querystring: GetAllVendorsQueryType }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllVendorsQuerySchema.parse(request.query);
      const query = new GetAllVendorsQueryClass(
        validatedQuery.limit,
        validatedQuery.offset,
        validatedQuery.isActive,
        validatedQuery.searchTerm
      );
      const result = await this.getAllVendorsHandler.handle(query);
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
