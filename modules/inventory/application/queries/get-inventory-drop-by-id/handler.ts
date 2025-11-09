import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import { InventoryDropId } from "../../../domain/index.js";
import type { GetInventoryDropByIdQuery } from "./query.js";

export interface InventoryDropDTO {
  id: string;
  dropNumber: string;
  fabricType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedOn: Date;
  supplier: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetInventoryDropByIdQueryHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository
  ) {}

  async handle(query: GetInventoryDropByIdQuery): Promise<InventoryDropDTO | null> {
    const inventoryDropId = InventoryDropId.fromString(query.inventoryDropId);

    const inventoryDrop = await this.inventoryDropQueryRepo.findById(inventoryDropId);
    if (!inventoryDrop) {
      return null;
    }

    return inventoryDrop.toPlainObject();
  }
}
