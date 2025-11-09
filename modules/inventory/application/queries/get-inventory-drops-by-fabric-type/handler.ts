import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import type { GetInventoryDropsByFabricTypeQuery } from "./query.js";

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

export class GetInventoryDropsByFabricTypeQueryHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository
  ) {}

  async handle(query: GetInventoryDropsByFabricTypeQuery): Promise<InventoryDropDTO[]> {
    const inventoryDrops = await this.inventoryDropQueryRepo.findByFabricType(query.fabricType);

    return inventoryDrops.map((drop) => drop.toPlainObject());
  }
}
