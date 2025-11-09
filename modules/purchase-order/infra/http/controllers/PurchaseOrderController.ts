import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

// Command imports
import { CreatePurchaseOrderCommandHandler } from "../../../application/commands/create-purchase-order/handler.js";
import { CreatePurchaseOrderCommand } from "../../../application/commands/create-purchase-order/command.js";
import { UpdatePurchaseOrderCommandHandler } from "../../../application/commands/update-purchase-order/handler.js";
import { UpdatePurchaseOrderCommand } from "../../../application/commands/update-purchase-order/command.js";
import { IssuePurchaseOrderCommandHandler } from "../../../application/commands/issue-purchase-order/handler.js";
import { IssuePurchaseOrderCommand } from "../../../application/commands/issue-purchase-order/command.js";
import { CancelPurchaseOrderCommandHandler } from "../../../application/commands/cancel-purchase-order/handler.js";
import { CancelPurchaseOrderCommand } from "../../../application/commands/cancel-purchase-order/command.js";
import { ReceivePurchaseOrderCommandHandler } from "../../../application/commands/receive-purchase-order/handler.js";
import { ReceivePurchaseOrderCommand } from "../../../application/commands/receive-purchase-order/command.js";
import { ClosePurchaseOrderCommandHandler } from "../../../application/commands/close-purchase-order/handler.js";
import { ClosePurchaseOrderCommand } from "../../../application/commands/close-purchase-order/command.js";
import { DeletePurchaseOrderCommandHandler } from "../../../application/commands/delete-purchase-order/handler.js";
import { DeletePurchaseOrderCommand } from "../../../application/commands/delete-purchase-order/command.js";

// Query imports
import { GetPurchaseOrderByIdQueryHandler } from "../../../application/queries/get-purchase-order-by-id/handler.js";
import { GetPurchaseOrderByIdQuery } from "../../../application/queries/get-purchase-order-by-id/query.js";
import { GetAllPurchaseOrdersQueryHandler } from "../../../application/queries/get-all-purchase-orders/handler.js";
import { GetAllPurchaseOrdersQuery as GetAllPurchaseOrdersQueryClass } from "../../../application/queries/get-all-purchase-orders/query.js";
import { GetPurchaseOrdersByVendorQueryHandler } from "../../../application/queries/get-purchase-orders-by-vendor/handler.js";
import { GetPurchaseOrdersByVendorQuery as GetPurchaseOrdersByVendorQueryClass } from "../../../application/queries/get-purchase-orders-by-vendor/query.js";
import { GetPurchaseOrderByPONumberQueryHandler } from "../../../application/queries/get-purchase-order-by-po-number/handler.js";
import { GetPurchaseOrderByPONumberQuery as GetPurchaseOrderByPONumberQueryClass } from "../../../application/queries/get-purchase-order-by-po-number/query.js";

// Validators
import {
  createPurchaseOrderBodySchema,
  type CreatePurchaseOrderBody,
} from "../validators/create-purchase-order.validator.js";
import {
  updatePurchaseOrderParamsSchema,
  updatePurchaseOrderBodySchema,
  type UpdatePurchaseOrderParams,
  type UpdatePurchaseOrderBody,
} from "../validators/update-purchase-order.validator.js";
import {
  issuePurchaseOrderParamsSchema,
  type IssuePurchaseOrderParams,
} from "../validators/issue-purchase-order.validator.js";
import {
  cancelPurchaseOrderParamsSchema,
  type CancelPurchaseOrderParams,
} from "../validators/cancel-purchase-order.validator.js";
import {
  receivePurchaseOrderParamsSchema,
  receivePurchaseOrderBodySchema,
  type ReceivePurchaseOrderParams,
  type ReceivePurchaseOrderBody,
} from "../validators/receive-purchase-order.validator.js";
import {
  closePurchaseOrderParamsSchema,
  type ClosePurchaseOrderParams,
} from "../validators/close-purchase-order.validator.js";
import {
  deletePurchaseOrderParamsSchema,
  type DeletePurchaseOrderParams,
} from "../validators/delete-purchase-order.validator.js";
import {
  getPurchaseOrderByIdParamsSchema,
  type GetPurchaseOrderByIdParams,
} from "../validators/get-purchase-order-by-id.validator.js";
import {
  getAllPurchaseOrdersQuerySchema,
  type GetAllPurchaseOrdersQuery,
} from "../validators/get-all-purchase-orders.validator.js";
import {
  getPurchaseOrdersByVendorParamsSchema,
  type GetPurchaseOrdersByVendorParams,
} from "../validators/get-purchase-orders-by-vendor.validator.js";
import {
  getPurchaseOrderByPONumberParamsSchema,
  type GetPurchaseOrderByPONumberParams,
} from "../validators/get-purchase-order-by-po-number.validator.js";

export class PurchaseOrderController {
  constructor(
    private readonly createPurchaseOrderHandler: CreatePurchaseOrderCommandHandler,
    private readonly updatePurchaseOrderHandler: UpdatePurchaseOrderCommandHandler,
    private readonly issuePurchaseOrderHandler: IssuePurchaseOrderCommandHandler,
    private readonly cancelPurchaseOrderHandler: CancelPurchaseOrderCommandHandler,
    private readonly receivePurchaseOrderHandler: ReceivePurchaseOrderCommandHandler,
    private readonly closePurchaseOrderHandler: ClosePurchaseOrderCommandHandler,
    private readonly deletePurchaseOrderHandler: DeletePurchaseOrderCommandHandler,
    private readonly getPurchaseOrderByIdHandler: GetPurchaseOrderByIdQueryHandler,
    private readonly getAllPurchaseOrdersHandler: GetAllPurchaseOrdersQueryHandler,
    private readonly getPurchaseOrdersByVendorHandler: GetPurchaseOrdersByVendorQueryHandler,
    private readonly getPurchaseOrderByPONumberHandler: GetPurchaseOrderByPONumberQueryHandler
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
    request: FastifyRequest<{ Body: CreatePurchaseOrderBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedBody = createPurchaseOrderBodySchema.parse(request.body);

      const command = new CreatePurchaseOrderCommand(
        validatedBody.poNumber,
        validatedBody.vendorId,
        validatedBody.totalValue,
        validatedBody.description,
        validatedBody.issuedDate
      );

      const result = await this.createPurchaseOrderHandler.handle(command);
      reply.code(201).send(result);
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async update(
    request: FastifyRequest<{
      Params: UpdatePurchaseOrderParams;
      Body: UpdatePurchaseOrderBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = updatePurchaseOrderParamsSchema.parse(request.params);
      const validatedBody = updatePurchaseOrderBodySchema.parse(request.body);

      const command = new UpdatePurchaseOrderCommand(
        validatedParams.id,
        validatedBody.totalValue,
        validatedBody.description
      );

      const result = await this.updatePurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async issue(
    request: FastifyRequest<{ Params: IssuePurchaseOrderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = issuePurchaseOrderParamsSchema.parse(request.params);

      const command = new IssuePurchaseOrderCommand(validatedParams.id);

      const result = await this.issuePurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async cancel(
    request: FastifyRequest<{ Params: CancelPurchaseOrderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = cancelPurchaseOrderParamsSchema.parse(request.params);

      const command = new CancelPurchaseOrderCommand(validatedParams.id);

      const result = await this.cancelPurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async receive(
    request: FastifyRequest<{
      Params: ReceivePurchaseOrderParams;
      Body: ReceivePurchaseOrderBody;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = receivePurchaseOrderParamsSchema.parse(request.params);
      const validatedBody = receivePurchaseOrderBodySchema.parse(request.body);

      const command = new ReceivePurchaseOrderCommand(
        validatedParams.id,
        validatedBody.isPartial
      );

      const result = await this.receivePurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async close(
    request: FastifyRequest<{ Params: ClosePurchaseOrderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = closePurchaseOrderParamsSchema.parse(request.params);

      const command = new ClosePurchaseOrderCommand(validatedParams.id);

      const result = await this.closePurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async delete(
    request: FastifyRequest<{ Params: DeletePurchaseOrderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = deletePurchaseOrderParamsSchema.parse(request.params);

      const command = new DeletePurchaseOrderCommand(validatedParams.id);

      const result = await this.deletePurchaseOrderHandler.handle(command);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getById(
    request: FastifyRequest<{ Params: GetPurchaseOrderByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getPurchaseOrderByIdParamsSchema.parse(request.params);

      const query = new GetPurchaseOrderByIdQuery(validatedParams.id);
      const result = await this.getPurchaseOrderByIdHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Purchase order not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getAll(
    request: FastifyRequest<{ Querystring: GetAllPurchaseOrdersQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedQuery = getAllPurchaseOrdersQuerySchema.parse(request.query);

      const query = new GetAllPurchaseOrdersQueryClass(
        validatedQuery.vendorId,
        validatedQuery.status,
        validatedQuery.issuedDateFrom,
        validatedQuery.issuedDateTo,
        validatedQuery.minTotalValue,
        validatedQuery.maxTotalValue
      );

      const result = await this.getAllPurchaseOrdersHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByVendor(
    request: FastifyRequest<{ Params: GetPurchaseOrdersByVendorParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getPurchaseOrdersByVendorParamsSchema.parse(request.params);

      const query = new GetPurchaseOrdersByVendorQueryClass(validatedParams.vendorId);

      const result = await this.getPurchaseOrdersByVendorHandler.handle(query);
      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async getByPONumber(
    request: FastifyRequest<{ Params: GetPurchaseOrderByPONumberParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedParams = getPurchaseOrderByPONumberParamsSchema.parse(request.params);

      const query = new GetPurchaseOrderByPONumberQueryClass(validatedParams.poNumber);

      const result = await this.getPurchaseOrderByPONumberHandler.handle(query);

      if (!result) {
        reply.code(404).send({ error: "Purchase order not found" });
        return;
      }

      reply.code(200).send({ success: true, data: result });
    } catch (error) {
      this.handleError(error, reply);
    }
  }
}
