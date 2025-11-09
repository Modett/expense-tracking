import {
  InventoryDropId,
  DropNumber,
  FabricType,
  Quantity,
  UnitCost,
  TotalCost,
} from "../value-objects/index.js";

export interface InventoryDropProps {
  id: InventoryDropId;
  dropNumber: DropNumber;
  fabricType: FabricType;
  quantity: Quantity;
  unitCost: UnitCost;
  totalCost: TotalCost;
  receivedOn: Date;
  supplier: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryDropProps {
  dropNumber: DropNumber;
  fabricType: FabricType;
  quantity: Quantity;
  unitCost: UnitCost;
  receivedOn: Date;
  supplier?: string;
}

export class InventoryDrop {
  private constructor(private props: InventoryDropProps) {
    this.validate();
  }

  static create(props: CreateInventoryDropProps): InventoryDrop {
    const now = new Date();
    const totalCost = TotalCost.calculateFromQuantityAndUnitCost(
      props.quantity.getValue(),
      props.unitCost.getValue()
    );

    return new InventoryDrop({
      id: InventoryDropId.create(),
      dropNumber: props.dropNumber,
      fabricType: props.fabricType,
      quantity: props.quantity,
      unitCost: props.unitCost,
      totalCost,
      receivedOn: props.receivedOn,
      supplier: props.supplier || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: InventoryDropProps): InventoryDrop {
    return new InventoryDrop(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("InventoryDrop must have an ID");
    }
    if (!this.props.dropNumber) {
      throw new Error("InventoryDrop must have a drop number");
    }
    if (!this.props.fabricType) {
      throw new Error("InventoryDrop must have a fabric type");
    }
    if (!this.props.quantity) {
      throw new Error("InventoryDrop must have a quantity");
    }
    if (!this.props.unitCost) {
      throw new Error("InventoryDrop must have a unit cost");
    }
    if (!this.props.totalCost) {
      throw new Error("InventoryDrop must have a total cost");
    }
    if (!this.props.receivedOn) {
      throw new Error("InventoryDrop must have a received date");
    }
  }

  // Business logic methods
  updateQuantityAndCost(quantity: Quantity, unitCost: UnitCost): void {
    this.props.quantity = quantity;
    this.props.unitCost = unitCost;
    this.props.totalCost = TotalCost.calculateFromQuantityAndUnitCost(
      quantity.getValue(),
      unitCost.getValue()
    );
    this.props.updatedAt = new Date();
  }

  updateSupplier(supplier: string | null): void {
    this.props.supplier = supplier;
    this.props.updatedAt = new Date();
  }

  updateReceivedDate(receivedOn: Date): void {
    this.props.receivedOn = receivedOn;
    this.props.updatedAt = new Date();
  }

  // Getters
  get id(): InventoryDropId {
    return this.props.id;
  }

  get dropNumber(): DropNumber {
    return this.props.dropNumber;
  }

  get fabricType(): FabricType {
    return this.props.fabricType;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get unitCost(): UnitCost {
    return this.props.unitCost;
  }

  get totalCost(): TotalCost {
    return this.props.totalCost;
  }

  get receivedOn(): Date {
    return this.props.receivedOn;
  }

  get supplier(): string | null {
    return this.props.supplier;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      dropNumber: this.props.dropNumber.getValue(),
      fabricType: this.props.fabricType.getValue(),
      quantity: this.props.quantity.getValue(),
      unitCost: this.props.unitCost.getValue(),
      totalCost: this.props.totalCost.getValue(),
      receivedOn: this.props.receivedOn,
      supplier: this.props.supplier,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
