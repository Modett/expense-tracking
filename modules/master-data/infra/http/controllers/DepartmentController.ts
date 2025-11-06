import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateDepartmentCommandHandler } from "../../../application/commands/create-department/handler.js";
import { CreateDepartmentCommand } from "../../../application/commands/create-department/command.js";
import { UpdateDepartmentCommandHandler } from "../../../application/commands/update-department/handler.js";
import { UpdateDepartmentCommand } from "../../../application/commands/update-department/command.js";
import { DeleteDepartmentCommandHandler } from "../../../application/commands/delete-department/handler.js";
import { DeleteDepartmentCommand } from "../../../application/commands/delete-department/command.js";
import { ActivateDepartmentCommandHandler } from "../../../application/commands/activate-department/handler.js";
import { ActivateDepartmentCommand } from "../../../application/commands/activate-department/command.js";
import { DeactivateDepartmentCommandHandler } from "../../../application/commands/deactivate-department/handler.js";
import { DeactivateDepartmentCommand } from "../../../application/commands/deactivate-department/command.js";
import { GetDepartmentByIdQueryHandler } from "../../../application/queries/get-department-by-id/handler.js";
import { GetDepartmentByIdQuery } from "../../../application/queries/get-department-by-id/query.js";
import { GetAllDepartmentsQueryHandler } from "../../../application/queries/get-all-departments/handler.js";
import { GetAllDepartmentsQuery as GetAllDepartmentsQueryClass } from "../../../application/queries/get-all-departments/query.js";
import {
  createDepartmentBodySchema,
  type CreateDepartmentBody,
} from "../validators/create-department.validator.js";
import {
  updateDepartmentParamsSchema,
  updateDepartmentBodySchema,
  type UpdateDepartmentParams,
  type UpdateDepartmentBody,
} from "../validators/update-department.validator.js";
import {
  getDepartmentByIdParamsSchema,
  type GetDepartmentByIdParams,
} from "../validators/get-department-by-id.validator.js";
import {
  getAllDepartmentsQuerySchema,
  type GetAllDepartmentsQuery as GetAllDepartmentsQueryType,
} from "../validators/get-all-departments.validator.js";
import { departmentIdParamSchema, type DepartmentIdParam } from "../validators/department-id-param.validator.js";

export class DepartmentController {
  constructor(
    private readonly createDepartmentHandler: CreateDepartmentCommandHandler,
    private readonly updateDepartmentHandler: UpdateDepartmentCommandHandler,
    private readonly deleteDepartmentHandler: DeleteDepartmentCommandHandler,
    private readonly activateDepartmentHandler: ActivateDepartmentCommandHandler,
    private readonly deactivateDepartmentHandler: DeactivateDepartmentCommandHandler,
    private readonly getDepartmentByIdHandler: GetDepartmentByIdQueryHandler,
    private readonly getAllDepartmentsHandler: GetAllDepartmentsQueryHandler
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateDepartmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createDepartmentBodySchema.parse(request.body);
      const command = new CreateDepartmentCommand(validatedBody.name, validatedBody.code);
      const result = await this.createDepartmentHandler.handle(command);
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
    request: FastifyRequest<{ Params: UpdateDepartmentParams; Body: UpdateDepartmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updateDepartmentParamsSchema.parse(request.params);
      const validatedBody = updateDepartmentBodySchema.parse(request.body);
      const command = new UpdateDepartmentCommand(
        validatedParams.id,
        validatedBody.name,
        validatedBody.code
      );
      const result = await this.updateDepartmentHandler.handle(command);
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
    request: FastifyRequest<{ Params: DepartmentIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = departmentIdParamSchema.parse(request.params);
      const command = new DeleteDepartmentCommand(validatedParams.id);
      await this.deleteDepartmentHandler.handle(command);
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
    request: FastifyRequest<{ Params: DepartmentIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = departmentIdParamSchema.parse(request.params);
      const command = new ActivateDepartmentCommand(validatedParams.id);
      await this.activateDepartmentHandler.handle(command);
      reply.code(200).send({ message: "Department activated successfully" });
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
    request: FastifyRequest<{ Params: DepartmentIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = departmentIdParamSchema.parse(request.params);
      const command = new DeactivateDepartmentCommand(validatedParams.id);
      await this.deactivateDepartmentHandler.handle(command);
      reply.code(200).send({ message: "Department deactivated successfully" });
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
    request: FastifyRequest<{ Params: GetDepartmentByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getDepartmentByIdParamsSchema.parse(request.params);
      const query = new GetDepartmentByIdQuery(validatedParams.id);
      const result = await this.getDepartmentByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Department not found" });
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
    request: FastifyRequest<{ Querystring: GetAllDepartmentsQueryType }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllDepartmentsQuerySchema.parse(request.query);
      const query = new GetAllDepartmentsQueryClass(
        validatedQuery.limit,
        validatedQuery.offset,
        validatedQuery.isActive,
        validatedQuery.searchTerm
      );
      const result = await this.getAllDepartmentsHandler.handle(query);
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
