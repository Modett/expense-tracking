import type { InventoryDrop } from "../entities/InventoryDrop.js";
import type { InventoryDropId } from "../value-objects/index.js";

export interface IInventoryDropCommandRepository {
  save(inventoryDrop: InventoryDrop): Promise<InventoryDrop>;
  saveMany(inventoryDrops: InventoryDrop[]): Promise<InventoryDrop[]>;
  delete(inventoryDropId: InventoryDropId): Promise<void>;
  exists(inventoryDropId: InventoryDropId): Promise<boolean>;
}
