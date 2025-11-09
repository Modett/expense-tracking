import type { InventoryDrop } from "../entities/InventoryDrop.js";
import type { InventoryDropId, DropNumber } from "../value-objects/index.js";

export interface InventoryDropFilters {
  fabricType?: string;
  supplier?: string;
  receivedDateFrom?: Date;
  receivedDateTo?: Date;
  minQuantity?: number;
  maxQuantity?: number;
  minTotalCost?: number;
  maxTotalCost?: number;
}

export interface IInventoryDropQueryRepository {
  findById(inventoryDropId: InventoryDropId): Promise<InventoryDrop | null>;
  findByDropNumber(dropNumber: DropNumber): Promise<InventoryDrop | null>;
  findByFabricType(fabricType: string): Promise<InventoryDrop[]>;
  findBySupplier(supplier: string): Promise<InventoryDrop[]>;
  findAll(filters?: InventoryDropFilters): Promise<InventoryDrop[]>;
  count(filters?: InventoryDropFilters): Promise<number>;
  existsByDropNumber(dropNumber: DropNumber): Promise<boolean>;
}
