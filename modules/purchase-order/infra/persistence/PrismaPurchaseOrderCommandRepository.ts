import type { PrismaClient } from "@prisma/client";
import type { IPurchaseOrderCommandRepository } from "../../domain/repositories/IPurchaseOrderCommandRepository.js";
import type { PurchaseOrder } from "../../domain/entities/PurchaseOrder.js";
import type { PurchaseOrderId } from "../../domain/value-objects/index.js";

export class PrismaPurchaseOrderCommandRepository implements IPurchaseOrderCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    const plainObject = purchaseOrder.toPlainObject();

    await this.prisma.purchaseOrder.upsert({
      where: { poId: plainObject.id },
      create: {
        poId: plainObject.id,
        poNumber: plainObject.poNumber,
        vendorId: plainObject.vendorId,
        totalValue: plainObject.totalValue,
        status: plainObject.status,
        description: plainObject.description,
        issuedDate: plainObject.issuedDate,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        totalValue: plainObject.totalValue,
        status: plainObject.status,
        description: plainObject.description,
        updatedAt: plainObject.updatedAt,
      },
    });

    return purchaseOrder;
  }

  async saveMany(purchaseOrders: PurchaseOrder[]): Promise<PurchaseOrder[]> {
    await this.prisma.$transaction(
      purchaseOrders.map((purchaseOrder) => {
        const plainObject = purchaseOrder.toPlainObject();

        return this.prisma.purchaseOrder.upsert({
          where: { poId: plainObject.id },
          create: {
            poId: plainObject.id,
            poNumber: plainObject.poNumber,
            vendorId: plainObject.vendorId,
            totalValue: plainObject.totalValue,
            status: plainObject.status,
            description: plainObject.description,
            issuedDate: plainObject.issuedDate,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            totalValue: plainObject.totalValue,
            status: plainObject.status,
            description: plainObject.description,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return purchaseOrders;
  }

  async delete(purchaseOrderId: PurchaseOrderId): Promise<void> {
    await this.prisma.purchaseOrder.delete({
      where: { poId: purchaseOrderId.getValue() },
    });
  }

  async exists(purchaseOrderId: PurchaseOrderId): Promise<boolean> {
    const count = await this.prisma.purchaseOrder.count({
      where: { poId: purchaseOrderId.getValue() },
    });

    return count > 0;
  }
}
