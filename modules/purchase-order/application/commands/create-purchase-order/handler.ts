import type { IPurchaseOrderCommandRepository } from "../../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { IPurchaseOrderQueryRepository } from "../../../domain/repositories/IPurchaseOrderQueryRepository.js";
import {
  PurchaseOrder,
  PONumber,
  VendorId,
  TotalValue,
} from "../../../domain/index.js";
import type { CreatePurchaseOrderCommand } from "./command.js";

export interface CreatePurchaseOrderResponse {
  success: boolean;
  purchaseOrderId: string;
  poNumber: string;
}

export class CreatePurchaseOrderCommandHandler {
  constructor(
    private readonly purchaseOrderQueryRepo: IPurchaseOrderQueryRepository,
    private readonly purchaseOrderCommandRepo: IPurchaseOrderCommandRepository
  ) {}

  async handle(
    command: CreatePurchaseOrderCommand
  ): Promise<CreatePurchaseOrderResponse> {
    const poNumber = PONumber.create(command.poNumber);
    const vendorId = VendorId.fromString(command.vendorId);
    const totalValue = TotalValue.create(command.totalValue);

    // Ensure PO number is unique
    const exists = await this.purchaseOrderQueryRepo.existsByPONumber(poNumber);
    if (exists) {
      throw new Error(`Purchase order with PO number ${command.poNumber} already exists`);
    }

    const createProps: any = {
      poNumber,
      vendorId,
      totalValue,
      issuedDate: command.issuedDate || new Date(),
    };

    if (command.description !== undefined) {
      createProps.description = command.description;
    }

    const purchaseOrder = PurchaseOrder.create(createProps);

    await this.purchaseOrderCommandRepo.save(purchaseOrder);

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id.getValue(),
      poNumber: purchaseOrder.poNumber.getValue(),
    };
  }
}
