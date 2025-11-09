export class UpdateInventoryDropCommand {
  constructor(
    public readonly inventoryDropId: string,
    public readonly quantity: number | undefined,
    public readonly unitCost: number | undefined,
    public readonly supplier: string | undefined,
    public readonly receivedOn: Date | undefined
  ) {}
}
