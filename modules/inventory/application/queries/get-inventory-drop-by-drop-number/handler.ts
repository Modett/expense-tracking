import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import { DropNumber } from "../../../domain/index.js";
import type { GetInventoryDropByDropNumberQuery } from "./query.js";

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

export class GetInventoryDropByDropNumberQueryHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository
  ) {}

  async handle(query: GetInventoryDropByDropNumberQuery): Promise<InventoryDropDTO | null> {
    const dropNumber = DropNumber.create(query.dropNumber);

    const inventoryDrop = await this.inventoryDropQueryRepo.findByDropNumber(dropNumber);
    if (!inventoryDrop) {
      return null;
    }

    return inventoryDrop.toPlainObject();
  }
}
