import type { IInventoryDropCommandRepository } from "../../../domain/repositories/IInventoryDropCommandRepository.js";
import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import { InventoryDropId } from "../../../domain/index.js";
import type { DeleteInventoryDropCommand } from "./command.js";

export interface DeleteInventoryDropResponse {
  success: boolean;
}

export class DeleteInventoryDropCommandHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository,
    private readonly inventoryDropCommandRepo: IInventoryDropCommandRepository
  ) {}

  async handle(
    command: DeleteInventoryDropCommand
  ): Promise<DeleteInventoryDropResponse> {
    const inventoryDropId = InventoryDropId.fromString(command.inventoryDropId);

    const inventoryDrop = await this.inventoryDropQueryRepo.findById(inventoryDropId);
    if (!inventoryDrop) {
      throw new Error(`Inventory drop with ID ${command.inventoryDropId} not found`);
    }

    await this.inventoryDropCommandRepo.delete(inventoryDropId);

    return {
      success: true,
    };
  }
}
