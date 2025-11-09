import type { IInventoryDropCommandRepository } from "../../../domain/repositories/IInventoryDropCommandRepository.js";
import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import {
  InventoryDropId,
  Quantity,
  UnitCost,
} from "../../../domain/index.js";
import type { UpdateInventoryDropCommand } from "./command.js";

export interface UpdateInventoryDropResponse {
  success: boolean;
  inventoryDropId: string;
}

export class UpdateInventoryDropCommandHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository,
    private readonly inventoryDropCommandRepo: IInventoryDropCommandRepository
  ) {}

  async handle(
    command: UpdateInventoryDropCommand
  ): Promise<UpdateInventoryDropResponse> {
    const inventoryDropId = InventoryDropId.fromString(command.inventoryDropId);

    const inventoryDrop = await this.inventoryDropQueryRepo.findById(inventoryDropId);
    if (!inventoryDrop) {
      throw new Error(`Inventory drop with ID ${command.inventoryDropId} not found`);
    }

    // Update quantity and unit cost if provided
    if (command.quantity !== undefined || command.unitCost !== undefined) {
      const newQuantity = command.quantity !== undefined
        ? Quantity.create(command.quantity)
        : inventoryDrop.quantity;

      const newUnitCost = command.unitCost !== undefined
        ? UnitCost.create(command.unitCost)
        : inventoryDrop.unitCost;

      inventoryDrop.updateQuantityAndCost(newQuantity, newUnitCost);
    }

    // Update supplier if provided
    if (command.supplier !== undefined) {
      inventoryDrop.updateSupplier(command.supplier || null);
    }

    // Update received date if provided
    if (command.receivedOn !== undefined) {
      inventoryDrop.updateReceivedDate(command.receivedOn);
    }

    await this.inventoryDropCommandRepo.save(inventoryDrop);

    return {
      success: true,
      inventoryDropId: inventoryDrop.id.getValue(),
    };
  }
}
