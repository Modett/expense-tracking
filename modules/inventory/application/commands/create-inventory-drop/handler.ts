import type { IInventoryDropCommandRepository } from "../../../domain/repositories/IInventoryDropCommandRepository.js";
import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import {
  InventoryDrop,
  DropNumber,
  FabricType,
  Quantity,
  UnitCost,
} from "../../../domain/index.js";
import type { CreateInventoryDropCommand } from "./command.js";

export interface CreateInventoryDropResponse {
  success: boolean;
  inventoryDropId: string;
  dropNumber: string;
}

export class CreateInventoryDropCommandHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository,
    private readonly inventoryDropCommandRepo: IInventoryDropCommandRepository
  ) {}

  async handle(
    command: CreateInventoryDropCommand
  ): Promise<CreateInventoryDropResponse> {
    const dropNumber = DropNumber.create(command.dropNumber);
    const fabricType = FabricType.create(command.fabricType);
    const quantity = Quantity.create(command.quantity);
    const unitCost = UnitCost.create(command.unitCost);

    // Ensure drop number is unique
    const exists = await this.inventoryDropQueryRepo.existsByDropNumber(dropNumber);
    if (exists) {
      throw new Error(`Inventory drop with drop number ${command.dropNumber} already exists`);
    }

    const createProps: any = {
      dropNumber,
      fabricType,
      quantity,
      unitCost,
      receivedOn: command.receivedOn || new Date(),
    };

    if (command.supplier !== undefined) {
      createProps.supplier = command.supplier;
    }

    const inventoryDrop = InventoryDrop.create(createProps);

    await this.inventoryDropCommandRepo.save(inventoryDrop);

    return {
      success: true,
      inventoryDropId: inventoryDrop.id.getValue(),
      dropNumber: inventoryDrop.dropNumber.getValue(),
    };
  }
}
