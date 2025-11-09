import type { PrismaClient, InventoryDrop as PrismaInventoryDrop } from "@prisma/client";
import type {
  IInventoryDropQueryRepository,
  InventoryDropFilters,
} from "../../domain/repositories/IInventoryDropQueryRepository.js";
import { InventoryDrop } from "../../domain/entities/InventoryDrop.js";
import {
  InventoryDropId,
  DropNumber,
  FabricType,
  Quantity,
  UnitCost,
  TotalCost,
} from "../../domain/value-objects/index.js";

export class PrismaInventoryDropQueryRepository implements IInventoryDropQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaInventoryDrop: PrismaInventoryDrop): InventoryDrop {
    return InventoryDrop.reconstitute({
      id: InventoryDropId.fromString(prismaInventoryDrop.dropId),
      dropNumber: DropNumber.create(prismaInventoryDrop.dropNumber),
      fabricType: FabricType.create(prismaInventoryDrop.fabricType),
      quantity: Quantity.create(Number(prismaInventoryDrop.quantity)),
      unitCost: UnitCost.create(Number(prismaInventoryDrop.unitCost)),
      totalCost: TotalCost.create(Number(prismaInventoryDrop.totalCost)),
      receivedOn: prismaInventoryDrop.receivedOn,
      supplier: prismaInventoryDrop.supplier,
      createdAt: prismaInventoryDrop.createdAt,
      updatedAt: prismaInventoryDrop.updatedAt,
    });
  }

  async findById(inventoryDropId: InventoryDropId): Promise<InventoryDrop | null> {
    const inventoryDrop = await this.prisma.inventoryDrop.findUnique({
      where: { dropId: inventoryDropId.getValue() },
    });

    if (!inventoryDrop) {
      return null;
    }

    return this.toDomain(inventoryDrop);
  }

  async findByDropNumber(dropNumber: DropNumber): Promise<InventoryDrop | null> {
    const inventoryDrop = await this.prisma.inventoryDrop.findUnique({
      where: { dropNumber: dropNumber.getValue() },
    });

    if (!inventoryDrop) {
      return null;
    }

    return this.toDomain(inventoryDrop);
  }

  async findByFabricType(fabricType: string): Promise<InventoryDrop[]> {
    const inventoryDrops = await this.prisma.inventoryDrop.findMany({
      where: { fabricType },
      orderBy: { createdAt: "desc" },
    });

    return inventoryDrops.map((drop) => this.toDomain(drop));
  }

  async findBySupplier(supplier: string): Promise<InventoryDrop[]> {
    const inventoryDrops = await this.prisma.inventoryDrop.findMany({
      where: { supplier },
      orderBy: { createdAt: "desc" },
    });

    return inventoryDrops.map((drop) => this.toDomain(drop));
  }

  async findAll(filters?: InventoryDropFilters): Promise<InventoryDrop[]> {
    const where: any = {};

    if (filters?.fabricType) {
      where.fabricType = filters.fabricType;
    }

    if (filters?.supplier) {
      where.supplier = filters.supplier;
    }

    if (filters?.receivedDateFrom || filters?.receivedDateTo) {
      where.receivedOn = {};
      if (filters.receivedDateFrom) {
        where.receivedOn.gte = filters.receivedDateFrom;
      }
      if (filters.receivedDateTo) {
        where.receivedOn.lte = filters.receivedDateTo;
      }
    }

    if (filters?.minQuantity !== undefined || filters?.maxQuantity !== undefined) {
      where.quantity = {};
      if (filters.minQuantity !== undefined) {
        where.quantity.gte = filters.minQuantity;
      }
      if (filters.maxQuantity !== undefined) {
        where.quantity.lte = filters.maxQuantity;
      }
    }

    if (filters?.minTotalCost !== undefined || filters?.maxTotalCost !== undefined) {
      where.totalCost = {};
      if (filters.minTotalCost !== undefined) {
        where.totalCost.gte = filters.minTotalCost;
      }
      if (filters.maxTotalCost !== undefined) {
        where.totalCost.lte = filters.maxTotalCost;
      }
    }

    const inventoryDrops = await this.prisma.inventoryDrop.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return inventoryDrops.map((drop) => this.toDomain(drop));
  }

  async count(filters?: InventoryDropFilters): Promise<number> {
    const where: any = {};

    if (filters?.fabricType) {
      where.fabricType = filters.fabricType;
    }

    if (filters?.supplier) {
      where.supplier = filters.supplier;
    }

    if (filters?.receivedDateFrom || filters?.receivedDateTo) {
      where.receivedOn = {};
      if (filters.receivedDateFrom) {
        where.receivedOn.gte = filters.receivedDateFrom;
      }
      if (filters.receivedDateTo) {
        where.receivedOn.lte = filters.receivedDateTo;
      }
    }

    if (filters?.minQuantity !== undefined || filters?.maxQuantity !== undefined) {
      where.quantity = {};
      if (filters.minQuantity !== undefined) {
        where.quantity.gte = filters.minQuantity;
      }
      if (filters.maxQuantity !== undefined) {
        where.quantity.lte = filters.maxQuantity;
      }
    }

    if (filters?.minTotalCost !== undefined || filters?.maxTotalCost !== undefined) {
      where.totalCost = {};
      if (filters.minTotalCost !== undefined) {
        where.totalCost.gte = filters.minTotalCost;
      }
      if (filters.maxTotalCost !== undefined) {
        where.totalCost.lte = filters.maxTotalCost;
      }
    }

    return await this.prisma.inventoryDrop.count({ where });
  }

  async existsByDropNumber(dropNumber: DropNumber): Promise<boolean> {
    const count = await this.prisma.inventoryDrop.count({
      where: { dropNumber: dropNumber.getValue() },
    });

    return count > 0;
  }
}
