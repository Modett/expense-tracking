import type { PrismaClient } from "@prisma/client";
import type { IInventoryDropCommandRepository } from "../../domain/repositories/IInventoryDropCommandRepository.js";
import type { InventoryDrop } from "../../domain/entities/InventoryDrop.js";
import type { InventoryDropId } from "../../domain/value-objects/index.js";

export class PrismaInventoryDropCommandRepository implements IInventoryDropCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(inventoryDrop: InventoryDrop): Promise<InventoryDrop> {
    const plainObject = inventoryDrop.toPlainObject();

    await this.prisma.inventoryDrop.upsert({
      where: { dropId: plainObject.id },
      create: {
        dropId: plainObject.id,
        dropNumber: plainObject.dropNumber,
        fabricType: plainObject.fabricType,
        quantity: plainObject.quantity,
        unitCost: plainObject.unitCost,
        totalCost: plainObject.totalCost,
        receivedOn: plainObject.receivedOn,
        supplier: plainObject.supplier,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        quantity: plainObject.quantity,
        unitCost: plainObject.unitCost,
        totalCost: plainObject.totalCost,
        receivedOn: plainObject.receivedOn,
        supplier: plainObject.supplier,
        updatedAt: plainObject.updatedAt,
      },
    });

    return inventoryDrop;
  }

  async saveMany(inventoryDrops: InventoryDrop[]): Promise<InventoryDrop[]> {
    await this.prisma.$transaction(
      inventoryDrops.map((inventoryDrop) => {
        const plainObject = inventoryDrop.toPlainObject();

        return this.prisma.inventoryDrop.upsert({
          where: { dropId: plainObject.id },
          create: {
            dropId: plainObject.id,
            dropNumber: plainObject.dropNumber,
            fabricType: plainObject.fabricType,
            quantity: plainObject.quantity,
            unitCost: plainObject.unitCost,
            totalCost: plainObject.totalCost,
            receivedOn: plainObject.receivedOn,
            supplier: plainObject.supplier,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            quantity: plainObject.quantity,
            unitCost: plainObject.unitCost,
            totalCost: plainObject.totalCost,
            receivedOn: plainObject.receivedOn,
            supplier: plainObject.supplier,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return inventoryDrops;
  }

  async delete(inventoryDropId: InventoryDropId): Promise<void> {
    await this.prisma.inventoryDrop.delete({
      where: { dropId: inventoryDropId.getValue() },
    });
  }

  async exists(inventoryDropId: InventoryDropId): Promise<boolean> {
    const count = await this.prisma.inventoryDrop.count({
      where: { dropId: inventoryDropId.getValue() },
    });

    return count > 0;
  }
}
