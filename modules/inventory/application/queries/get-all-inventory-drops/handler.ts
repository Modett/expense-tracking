import type { IInventoryDropQueryRepository } from "../../../domain/repositories/IInventoryDropQueryRepository.js";
import type { GetAllInventoryDropsQuery } from "./query.js";

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

export class GetAllInventoryDropsQueryHandler {
  constructor(
    private readonly inventoryDropQueryRepo: IInventoryDropQueryRepository
  ) {}

  async handle(query: GetAllInventoryDropsQuery): Promise<InventoryDropDTO[]> {
    const filters: any = {};

    if (query.fabricType !== undefined) {
      filters.fabricType = query.fabricType;
    }
    if (query.supplier !== undefined) {
      filters.supplier = query.supplier;
    }
    if (query.receivedDateFrom !== undefined) {
      filters.receivedDateFrom = query.receivedDateFrom;
    }
    if (query.receivedDateTo !== undefined) {
      filters.receivedDateTo = query.receivedDateTo;
    }
    if (query.minQuantity !== undefined) {
      filters.minQuantity = query.minQuantity;
    }
    if (query.maxQuantity !== undefined) {
      filters.maxQuantity = query.maxQuantity;
    }
    if (query.minTotalCost !== undefined) {
      filters.minTotalCost = query.minTotalCost;
    }
    if (query.maxTotalCost !== undefined) {
      filters.maxTotalCost = query.maxTotalCost;
    }

    const inventoryDrops = await this.inventoryDropQueryRepo.findAll(filters);

    return inventoryDrops.map((drop) => drop.toPlainObject());
  }
}
