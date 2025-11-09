import type {
  PrismaClient,
  PurchaseOrder as PrismaPurchaseOrder,
  Prisma,
} from "@prisma/client";
import type {
  IPurchaseOrderQueryRepository,
  PurchaseOrderFilters,
} from "../../domain/repositories/IPurchaseOrderQueryRepository.js";
import { PurchaseOrder } from "../../domain/entities/PurchaseOrder.js";
import {
  PurchaseOrderId,
  PONumber,
  TotalValue,
  POStatus,
  VendorId,
} from "../../domain/value-objects/index.js";

export class PrismaPurchaseOrderQueryRepository
  implements IPurchaseOrderQueryRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaPurchaseOrder: PrismaPurchaseOrder): PurchaseOrder {
    return PurchaseOrder.reconstitute({
      id: PurchaseOrderId.fromString(prismaPurchaseOrder.poId),
      poNumber: PONumber.create(prismaPurchaseOrder.poNumber),
      vendorId: VendorId.fromString(prismaPurchaseOrder.vendorId),
      totalValue: TotalValue.create(Number(prismaPurchaseOrder.totalValue)),
      status: POStatus.fromString(prismaPurchaseOrder.status),
      description: prismaPurchaseOrder.description,
      issuedDate: prismaPurchaseOrder.issuedDate,
      createdAt: prismaPurchaseOrder.createdAt,
      updatedAt: prismaPurchaseOrder.updatedAt,
    });
  }

  async findById(
    purchaseOrderId: PurchaseOrderId
  ): Promise<PurchaseOrder | null> {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { poId: purchaseOrderId.getValue() },
    });

    if (!purchaseOrder) {
      return null;
    }

    return this.toDomain(purchaseOrder);
  }

  async findByPONumber(poNumber: PONumber): Promise<PurchaseOrder | null> {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { poNumber: poNumber.getValue() },
    });

    if (!purchaseOrder) {
      return null;
    }

    return this.toDomain(purchaseOrder);
  }

  async findByVendor(vendorId: VendorId): Promise<PurchaseOrder[]> {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: { vendorId: vendorId.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return purchaseOrders.map((po) => this.toDomain(po));
  }

  async findByStatus(status: POStatus): Promise<PurchaseOrder[]> {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: { status: status.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return purchaseOrders.map((po) => this.toDomain(po));
  }

  async findAll(filters: PurchaseOrderFilters = {}): Promise<PurchaseOrder[]> {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (filters.vendorId) {
      where.vendorId = filters.vendorId.toString();
    }

    if (filters.status) {
      where.status = filters.status.toString();
    }

    if (filters.issuedDateFrom || filters.issuedDateTo) {
      where.issuedDate = {};

      if (filters.issuedDateFrom) {
        where.issuedDate.gte = filters.issuedDateFrom;
      }

      if (filters.issuedDateTo) {
        where.issuedDate.lte = filters.issuedDateTo;
      }
    }

    if (
      filters.minTotalValue !== undefined ||
      filters.maxTotalValue !== undefined
    ) {
      where.totalValue = {};

      if (filters.minTotalValue !== undefined) {
        where.totalValue.gte = filters.minTotalValue;
      }

      if (filters.maxTotalValue !== undefined) {
        where.totalValue.lte = filters.maxTotalValue;
      }
    }

    const prismaPos = await this.prisma.purchaseOrder.findMany({
      where,
      orderBy: { issuedDate: "desc" },
    });

    return prismaPos.map((po) => this.toDomain(po));
  }

  async count(filters?: PurchaseOrderFilters): Promise<number> {
    const where: any = {};

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId.getValue();
    }

    if (filters?.status) {
      where.status = filters.status.getValue();
    }

    if (filters?.issuedDateFrom || filters?.issuedDateTo) {
      where.issuedDate = {};
      if (filters.issuedDateFrom) {
        where.issuedDate.gte = filters.issuedDateFrom;
      }
      if (filters.issuedDateTo) {
        where.issuedDate.lte = filters.issuedDateTo;
      }
    }

    if (
      filters?.minTotalValue !== undefined ||
      filters?.maxTotalValue !== undefined
    ) {
      where.totalValue = {};
      if (filters.minTotalValue !== undefined) {
        where.totalValue.gte = filters.minTotalValue;
      }
      if (filters.maxTotalValue !== undefined) {
        where.totalValue.lte = filters.maxTotalValue;
      }
    }

    return await this.prisma.purchaseOrder.count({ where });
  }

  async existsByPONumber(poNumber: PONumber): Promise<boolean> {
    const count = await this.prisma.purchaseOrder.count({
      where: { poNumber: poNumber.getValue() },
    });

    return count > 0;
  }
}
